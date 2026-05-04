import { useEffect, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Card } from "@/components/ui/card";

import { Shield, Loader2, Mail, ArrowRight, CheckCircle, UserPlus } from "lucide-react";

import { toast } from "sonner";

import { useAuth, dashboardPathFor, AppRole } from "@/contexts/AuthContext";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/components/ui/select";



const signupSchema = z.object({

  full_name: z.string()

    .trim()

    .min(2, "Name must be at least 2 characters")

    .max(100, "Name must be less than 100 characters")

    .regex(/^[A-Za-z\s]+$/, "Name can only contain alphabets and spaces"),

  email: z.string().trim().email().max(255),

  password: z.string()

    .min(8, "Password must be at least 8 characters")

    .max(100, "Password must be less than 100 characters")

    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 

           "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)"),

  phone: z.string().trim().max(20).optional().or(z.literal("")),

  role: z.enum(["user", "guardian", "police", "admin"]),

});



const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1, "Password is required"),
});

export default function Auth() {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "user" as AppRole,
  });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Redirect after successful login
  useEffect(() => {
    if (user) {
      navigate("/?section=sos");
    }
  }, [user, navigate]);

  useEffect(() => {
    // Basic connection check for Firebase
    if (auth) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("error");
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setLoading(false);
          return;
        }

        console.log("Attempting Firebase signup for:", parsed.data.email);
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
        const firebaseUser = userCredential.user;

        // Store additional user data in Firestore
        await setDoc(doc(db, "users", firebaseUser.uid), {
          full_name: parsed.data.full_name,
          email: parsed.data.email,
          phone: parsed.data.phone || "",
          role: parsed.data.role,
          created_at: new Date().toISOString()
        });

        toast.success("Account created successfully! You are now signed in.");
        navigate("/");
        
      } else {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setLoading(false);
          return;
        }

        console.log("Attempting Firebase login for:", parsed.data.email);
        
        try {
          await signInWithEmailAndPassword(auth, parsed.data.email, parsed.data.password);
          toast.success("Login successful! Welcome back.");
          navigate("/?section=sos");
        } catch (error: any) {
          if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            toast.error("Invalid email or password. Please try again.");
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error("Firebase Auth error:", error);
      toast.error(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };



  return (

    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">

      <div className="w-full max-w-md">

        <Link to="/" className="mb-6 flex items-center justify-center gap-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">

            <Shield className="h-5 w-5 text-primary-foreground" />

          </div>

          <span className="text-xl font-bold">SafeHer</span>

        </Link>

        <Card className="p-6 shadow-elegant md:p-8">

          {/* Connection Status */}

          <div className="mb-4 flex items-center gap-2 text-sm">

            {connectionStatus === "checking" && (

              <>

                <Loader2 className="h-4 w-4 animate-spin" />

                <span className="text-muted-foreground">Checking connection...</span>

              </>

            )}

            {connectionStatus === "connected" && (

              <>

                <div className="h-2 w-2 rounded-full bg-green-500"></div>

                <span className="text-green-600">Connected to SafeHer</span>

              </>

            )}

            {connectionStatus === "error" && (

              <>

                <div className="h-2 w-2 rounded-full bg-red-500"></div>

                <span className="text-red-600">Connection error - check internet</span>

              </>

            )}

          </div>



          <h1 className="text-2xl font-bold tracking-tight">

            {mode === "signup" ? "Create your account" : "Welcome back"}

          </h1>

          <p className="mt-1 text-sm text-muted-foreground">

            {mode === "signup"

              ? "Enter your details to create a new account."

              : "Enter your credentials to sign in to your account."}

          </p>



          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {mode === "signup" && (

              <div className="space-y-2">

                <Label htmlFor="full_name">Full name</Label>

                <Input

                  id="full_name"

                  value={form.full_name}

                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}

                  placeholder="John Doe"

                  required

                />

                <p className="text-xs text-muted-foreground">Only alphabets and spaces allowed</p>

              </div>

            )}

            <div className="space-y-2">

              <Label htmlFor="email">Email</Label>

              <Input

                id="email"

                type="email"

                autoComplete="email"

                value={form.email}

                onChange={(e) => setForm({ ...form, email: e.target.value })}

                required

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="password">Password</Label>

              <Input

                id="password"

                type="password"

                autoComplete={mode === "signup" ? "new-password" : "current-password"}

                value={form.password}

                onChange={(e) => setForm({ ...form, password: e.target.value })}

                placeholder="Enter your password"

                required

              />

            </div>

            {mode === "signup" && (

              <div className="space-y-2">

                <Label htmlFor="phone">Phone (optional)</Label>

                <Input

                  id="phone"

                  type="tel"

                  value={form.phone}

                  onChange={(e) => setForm({ ...form, phone: e.target.value })}

                />

              </div>

            )}

            {mode === "signup" && (

              <div className="space-y-2">

                <Label>I am a</Label>

                <Select

                  value={form.role}

                  onValueChange={(v) => setForm({ ...form, role: v as AppRole })}

                >

                  <SelectTrigger><SelectValue /></SelectTrigger>

                  <SelectContent>

                    <SelectItem value="user">User (need safety)</SelectItem>

                    <SelectItem value="guardian">Guardian (family / friend)</SelectItem>

                    <SelectItem value="police">Police (department)</SelectItem>

                    <SelectItem value="admin">Admin (organization)</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            )}

            <Button type="submit" className="w-full" disabled={loading}>

              {loading ? (

                <>

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {mode === "signup" ? "Creating account..." : "Signing in..."}

                </>

              ) : (

                <>

                  <Mail className="mr-2 h-4 w-4" />

                  {mode === "signup" ? "Create account" : "Sign in"}

                </>

              )}

            </Button>

          </form>



          <div className="mt-6 text-center">

            <p className="text-sm text-muted-foreground">

              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}

              <button

                type="button"

                onClick={() => setMode(mode === "signup" ? "login" : "signup")}

                className="font-semibold text-primary hover:underline"

              >

                {mode === "signup" ? "Sign in" : "Create one"}

              </button>

            </p>

            {/* Only show logout button if user is logged in */}

            {!!user && (

              <div className="mt-4 text-center">

                <button

                  type="button"

                  onClick={handleSignOut}

                  className="font-semibold text-red-600 hover:text-red-800"

                >

                  Sign out

                </button>

              </div>

            )}

          </div>

        </Card>

      </div>

    </div>

  );

}