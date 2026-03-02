import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Building,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    role: "hr",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Registration failed" }]);
        return;
      }

      // Redirect to verification page with email
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error("SignUp error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          code: code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Invalid verification code" }]);
        return;
      }

      // Successful verification - redirect to dashboard
      window.location.href = "/";
    } catch (err) {
      console.error("Verification error:", err);
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationCode = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Failed to resend code" }]);
        return;
      }

      // Show success message (optional: you can add a success state)
      setErrors([{ message: "Verification code sent successfully!" }]);
    } catch (err) {
      console.error("Resend error:", err);
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

  const isFormValid = () => {
    const { name, companyName, email, password } = formData;
    return name && companyName && email && password && password.length >= 8;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-gray-100 p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200">
          <SignUpForm
            formData={formData}
            showPassword={showPassword}
            isLoading={isLoading}
            errors={errors}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSignUp}
            onKeyPress={handleKeyPress}
            isFormValid={isFormValid()}
            onNavigateSignIn={() => navigate("/signin")}
          />
        </div>
      </div>
    </div>
  );
}

// Sign Up Form Component
function SignUpForm({
  formData,
  showPassword,
  isLoading,
  errors,
  onInputChange,
  onTogglePassword,
  onSubmit,
  onKeyPress,
  isFormValid,
  onNavigateSignIn,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-black">Create Account</h2>
        <p className="text-gray-600 mt-2">
          Join HiRekruit and get started today
        </p>
      </div>

      {/* Error Messages */}
      <ErrorDisplay errors={errors} />

      {/* Form Fields */}
      <div className="space-y-4">
        <InputField
          icon={User}
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={onInputChange("name")}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
          autoComplete="name"
          required
        />

        <InputField
          icon={Building}
          type="text"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={onInputChange("companyName")}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
          autoComplete="organization"
          required
        />

        <div className="relative">
          <select
            className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            value={formData.role}
            onChange={onInputChange("role")}
            disabled={isLoading}
            aria-label="Select role"
          >
            <option value="hr">HR Manager</option>
            <option value="manager">Team Manager</option>
            <option value="employee">Employee</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <InputField
          icon={Mail}
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={onInputChange("email")}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
          autoComplete="email"
          required
        />

        <PasswordField
          value={formData.password}
          showPassword={showPassword}
          onChange={onInputChange("password")}
          onTogglePassword={onTogglePassword}
          onKeyPress={(e) => onKeyPress(e, onSubmit)}
          disabled={isLoading}
        />

        <p className="text-xs text-gray-500">
          Password must be at least 8 characters long
        </p>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onNavigateSignIn}
            className="text-black font-medium hover:text-gray-700 transition-colors hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
}

// Reusable Input Field Component
function InputField({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  onKeyPress,
  disabled,
  autoComplete,
  required,
}) {
  return (
    <div className="relative">
      <Icon className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
      <input
        type={type}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

// Password Field Component
function PasswordField({
  value,
  showPassword,
  onChange,
  onTogglePassword,
  onKeyPress,
  disabled,
}) {
  return (
    <div className="relative">
      <Lock className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Password (min. 8 characters)"
        // Prevents duplicate password toggle icons by hiding browser default
        className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        disabled={disabled}
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button
        type="button"
        className="absolute inset-y-0 right-3 flex items-center disabled:cursor-not-allowed"
        onClick={onTogglePassword}
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </button>
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
