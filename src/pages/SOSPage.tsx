import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X, Shield, MapPin, Users, Phone } from "lucide-react";
import { toast } from "sonner";

export default function SOSPage() {
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(3);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (counting && count > 0) {
      interval = setInterval(() => {
        setCount((c) => {
          if (c <= 1) {
            setCounting(false);
            fireAlert();
            return 3;
          }
          return c - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [counting, count]);

  const startCountdown = () => {
    if (counting || sending) return;
    setCounting(true);
    setCount(3);
  };

  const cancel = () => {
    setCounting(false);
    setCount(3);
    toast.info("SOS cancelled");
  };

  const fireAlert = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("SOS sent! Guardians and police have been alerted.", {
        description: "Live location attached. Help is on the way!",
        duration: 5000,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafeHer</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
            <Link to="/#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</Link>
            <Link to="/#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground">For who</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* SOS Demo Section */}
      <section className="container mx-auto py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              SOS Emergency Demo
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Experience how SafeHer's one-click SOS works. Press the SOS button to start the countdown.
            </p>
          </div>

          {/* SOS Button */}
          <div className="flex flex-col items-center gap-8">
            <button
              type="button"
              onClick={counting ? cancel : startCountdown}
              disabled={sending}
              aria-label={counting ? "Cancel SOS" : "Send SOS"}
              className={`relative flex h-48 w-48 items-center justify-center rounded-full text-sos-foreground transition-transform active:scale-95 sos-pulse ${
                counting ? "bg-warning" : "bg-gradient-sos"
              } ${sending ? "opacity-60" : ""}`}
            >
              {counting ? (
                <div className="text-center">
                  <div className="text-6xl font-extrabold">{count}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider">Tap to cancel</div>
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="mx-auto h-10 w-10" />
                  <div className="mt-2 text-3xl font-extrabold">SOS</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider">Press for help</div>
                </div>
              )}
            </button>

            {counting && (
              <Button variant="outline" onClick={cancel} className="gap-2">
                <X className="h-4 w-4" /> Cancel SOS
              </Button>
            )}

            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Press SOS to start a 3-second countdown. Your live location will be shared with your guardians and police.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Info */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary" />
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your GPS coordinates are shared in real-time with guardians and police when you trigger SOS.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Guardian Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All your trusted guardians receive instant notifications with your location and emergency status.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="h-8 w-8 text-primary" />
                <CardTitle>Police Notified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Local police departments are automatically notified with your exact location for immediate response.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Ready to Stay Safe?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join SafeHer today and get instant access to emergency protection whenever you need it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link to="/auth?mode=signup">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link to="/features">Try More Features</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
