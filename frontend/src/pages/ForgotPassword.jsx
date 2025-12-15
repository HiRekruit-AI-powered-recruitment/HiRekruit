import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Steps: 'email' -> 'verification' -> 'reset'
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Step 1: Request password reset
  const handleRequestReset = async (e) => {
    e?.preventDefault();

    if (!email) {
      setErrors([{ message: "Please enter your email address" }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Failed to send reset code" }]);
        return;
      }

      // Move to verification step
      setStep("verification");
    } catch (err) {
      console.error("Request reset error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify code and reset password
  const handleResetPassword = async (e) => {
    e?.preventDefault();

    if (!code || !newPassword || !confirmPassword) {
      setErrors([{ message: "Please fill in all fields" }]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors([{ message: "Passwords do not match" }]);
      return;
    }

    if (newPassword.length < 8) {
      setErrors([{ message: "Password must be at least 8 characters long" }]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Failed to reset password" }]);
        return;
      }

      // Password reset successful - redirect to login
      setStep("success");
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Failed to resend code" }]);
        return;
      }

      setErrors([{ message: "Verification code sent successfully!" }]);
    } catch (err) {
      console.error("Resend code error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      callback();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-200 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/20">
          {/* Back to Sign In */}
          {step !== "success" && (
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="flex items-center text-sm text-gray-600 hover:text-black transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </button>
          )}

          {step === "email" && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              errors={errors}
              onSubmit={handleRequestReset}
              onKeyPress={handleKeyPress}
            />
          )}

          {step === "verification" && (
            <VerificationStep
              email={email}
              code={code}
              setCode={setCode}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              isLoading={isLoading}
              errors={errors}
              onSubmit={handleResetPassword}
              onResend={handleResendCode}
              onKeyPress={handleKeyPress}
            />
          )}

          {step === "success" && <SuccessStep />}
        </div>
      </div>
    </div>
  );
}

// Step 1: Email Input
function EmailStep({
  email,
  setEmail,
  isLoading,
  errors,
  onSubmit,
  onKeyPress,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
          Forgot Password?
        </h2>
        <p className="text-gray-600 mt-2">
          Enter your email and we'll send you a verification code
        </p>
      </div>

      {/* Error Messages */}
      <ErrorDisplay errors={errors} />

      {/* Email Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          placeholder="Email Address"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50/50 backdrop-blur-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
          autoComplete="email"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Sending...
          </span>
        ) : (
          "Send Verification Code"
        )}
      </button>
    </form>
  );
}

// Step 2: Verification & Reset
function VerificationStep({
  email,
  code,
  setCode,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  errors,
  onSubmit,
  onResend,
  onKeyPress,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
          Reset Password
        </h2>
        <p className="text-gray-600 mt-2">
          Enter the code sent to
          <br />
          <span className="font-medium text-gray-800">{email}</span>
        </p>
      </div>

      {/* Error Messages */}
      <ErrorDisplay errors={errors} />

      {/* Code Input */}
      <input
        type="text"
        placeholder="Enter 6-digit code"
        className="block w-full px-4 py-3 text-center text-2xl font-mono tracking-wider border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={isLoading}
        maxLength={6}
        autoComplete="one-time-code"
        inputMode="numeric"
        pattern="[0-9]*"
        required
      />

      {/* New Password */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50/50 backdrop-blur-sm"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          )}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50/50 backdrop-blur-sm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={isLoading}
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Password must be at least 8 characters long
      </p>

      {/* Reset Button */}
      <button
        type="submit"
        disabled={isLoading || !code || !newPassword || !confirmPassword}
        className="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Resetting Password...
          </span>
        ) : (
          "Reset Password"
        )}
      </button>

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            className="font-medium text-black hover:text-gray-700 transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend
          </button>
        </p>
      </div>
    </form>
  );
}

// Success Step
function SuccessStep() {
  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-black">Password Reset!</h2>
      <p className="text-gray-600">
        Your password has been reset successfully.
        <br />
        Redirecting to sign in...
      </p>

      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    </div>
  );
}

// Error Display Component
function ErrorDisplay({ errors }) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-gray-700">
          {errors.map((error, index) => (
            <div key={index} className="mb-1 last:mb-0">
              {error.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
