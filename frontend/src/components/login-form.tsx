import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";

const roles = [
  { label: "Clinic", value: "staff" },
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);

    try {
      // Call login API
      const auth = await loginUser({ email, password });

      // Check if returned role matches the selected role
      if (auth.role !== selectedRole) {
        setError(`You are not authorized as a ${selectedRole}.`);
        setLoading(false);
        return;
      }

      // Persist auth + role
      localStorage.setItem("access_token", auth.access_token);
      localStorage.setItem("role", auth.role);
      localStorage.setItem("email", email);

      // Navigate based on role
      switch (auth.role) {
        case "staff":
          navigate("/");
          break;
        case "patient":
          navigate("/patient");
          break;
        case "doctor":
          navigate("/doctor");
          break;
        default:
          navigate("/login");
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Login failed. Please check your credentials and try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login to the Genesis Clinic Application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Select your role
                </span>
              </div>
              <div className="flex justify-center gap-2">
                {roles.map((role) => (
                  <Button
                    key={role.value}
                    type="button"
                    variant={
                      selectedRole === role.value ? "default" : "outline"
                    }
                    onClick={() => setSelectedRole(role.value)}
                  >
                    {role.label}
                  </Button>
                ))}
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
