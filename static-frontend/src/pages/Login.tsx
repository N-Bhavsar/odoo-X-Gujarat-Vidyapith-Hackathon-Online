import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import racingBg from "@/assets/racing-bg.jpg";
import { authService } from "@/services";

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("manager");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roleMap: Record<string, string> = {
    manager: "fleet_manager",
    dispatcher: "dispatcher",
    officer: "admin",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authService.login(email, password);
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      } else {
        const parts = fullName.trim().split(" ").filter(Boolean);
        const firstName = parts[0] || "Fleet";
        const lastName = parts.slice(1).join(" ") || "User";
        const response = await authService.register({
          email,
          password,
          firstName,
          lastName,
          role: roleMap[role] || "fleet_manager",
          phone: phone || undefined,
        });
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={racingBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Race-Ready Operations</span>
          </div>
          <h2 className="font-racing text-4xl text-foreground leading-tight tracking-wider">
            Command Your<br />
            <span className="text-primary">Fleet</span> Like a Pit Crew
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
            Real-time vehicle tracking, intelligent dispatching, and financial analytics — all from one cockpit.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 carbon-bg relative">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url(${racingBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-background/95" />

        <div className="relative w-full max-w-md z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="relative">
                <Flag className="h-10 w-10 text-primary" />
                <div className="absolute inset-0 blur-lg bg-primary/30" />
              </div>
              <h1 className="font-racing text-3xl text-foreground tracking-wider">
                Fleet<span className="text-primary">Flow</span>
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Secure Access</p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-8 shadow-2xl shadow-primary/5">
            {/* Toggle */}
            <div className="flex mb-6 bg-secondary/60 rounded-lg p-1 border border-border/50">
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-300 ${
                  isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-300 ${
                  !isLogin ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role selector */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Role</Label>
                <div className="flex gap-2 mt-2">
                  {["manager", "dispatcher", "officer"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`flex-1 py-2.5 text-xs font-semibold rounded-lg border-2 transition-all duration-300 capitalize ${
                        role === r
                          ? "border-primary bg-primary/10 text-primary shadow-inner shadow-primary/10"
                          : "border-border/50 text-muted-foreground hover:border-muted-foreground/50"
                      }`}
                      onClick={() => setRole(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {!isLogin && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input
                    className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11 focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email</Label>
                <Input
                  className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11 focus:border-primary focus:ring-1 focus:ring-primary/30"
                  type="email"
                  placeholder="driver@fleetflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    className="bg-secondary/50 border-border/50 text-foreground pr-10 h-11 focus:border-primary focus:ring-1 focus:ring-primary/30"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Phone</Label>
                    <Input
                      className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11 focus:border-primary focus:ring-1 focus:ring-primary/30"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">License Number</Label>
                    <Input className="mt-1.5 bg-secondary/50 border-border/50 text-foreground h-11 focus:border-primary focus:ring-1 focus:ring-primary/30" placeholder="DL-XXXXXXXXX" />
                  </div>
                </>
              )}

                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}

                <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-racing tracking-wider h-12 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01]">
                  {loading ? "Please wait..." : isLogin ? "🏁 Start Engine" : "Register"}
              </Button>

              {isLogin && (
                <p className="text-center text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                  Forgot Password?
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
