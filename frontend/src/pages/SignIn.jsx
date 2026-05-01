import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleSignIn = async (e) => {
    e?.preventDefault();

    if (!email || !password) {
      setErrors([{ message: "Please fill in all fields" }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setIsPendingApproval(false);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requires_approval) {
          setIsPendingApproval(true);
        } else {
          setErrors([{ message: data.message || "Invalid email or password" }]);
        }
        return;
      }

      // ✅ SUCCESS LOGIN
      const user = data.user;

      // store user locally (optional but useful)
      localStorage.setItem("user", JSON.stringify(user));

      // optional admin flag
      localStorage.setItem("isAdmin", user.role === "admin");

      // 🔥 ROLE-BASED REDIRECT
      if (user.role === "admin") {
        navigate("/admin/overview");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("SignIn error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignIn();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-200 p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gray-300 rounded-full blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gray-400 rounded-full blur-xl opacity-70 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to HiRekruit</p>
          </div>

          {/* Pending Approval */}
          {isPendingApproval && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex gap-2">
                <Clock className="text-amber-600" />
                <p className="text-sm text-amber-700">
                  Your account is pending admin approval.
                </p>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-600">
                  {err.message}
                </p>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 p-3 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 p-3 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Remember */}
            <div className="flex justify-between items-center">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2 text-sm">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600"
              >
                Forgot?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Signup */}
          <p className="text-center mt-4 text-sm">
            Don’t have an account?{" "}
            <button onClick={() => navigate("/signup")} className="underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
