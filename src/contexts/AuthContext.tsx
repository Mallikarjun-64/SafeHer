import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type AppRole = "admin" | "police" | "guardian" | "user";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: AppRole;
  phone: string;
}

interface AuthCtx {
  session: any; // Keep for compatibility if needed
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  login: (userData: User) => void;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch user metadata from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const mappedUser: User = {
              id: firebaseUser.uid,
              full_name: userData.full_name || "",
              email: firebaseUser.email || "",
              role: userData.role || "user",
              phone: userData.phone || ""
            };
            setUser(mappedUser);
            setRoles([mappedUser.role]);
          } else {
            console.error("User document does not exist in Firestore");
            setUser(null);
            setRoles([]);
          }
        } catch (error) {
          console.error("Error fetching user metadata:", error);
          setUser(null);
          setRoles([]);
        }
      } else {
        setUser(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setRoles([userData.role]);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRoles([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshRoles = async () => {
    if (user) {
      setRoles([user.role]);
    }
  };

  return (
    <Ctx.Provider value={{ session: null, user, roles, loading, signOut, refreshRoles, login }}>
      {children}
    </Ctx.Provider>
  );
}



export const useAuth = () => useContext(Ctx);



export function primaryRole(roles: AppRole[]): AppRole {

  if (roles.includes("admin")) return "admin";

  if (roles.includes("police")) return "police";

  if (roles.includes("guardian")) return "guardian";

  return "user";

}



export function dashboardPathFor(roles: AppRole[]): string {

  const r = primaryRole(roles);

  return `/dashboard/${r}`;

}