import { useSignUp } from "@clerk/clerk-react";
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

export default function CustomSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("hr");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [verificationErrors, setVerificationErrors] = useState([]);

  if (!isLoaded) return null;

  // Step 1 - create Clerk account
  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      await signUp.create({
        emailAddress: email,
        password, // Clerk validates password strength & breaches
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error("SignUp error:", err.errors || err);
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors([
          { message: "An unexpected error occurred. Please try again." },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 - verify with Clerk and call backend
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setVerificationErrors([]);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });

        // Call backend to save instance in MongoDB
        const BaseUrl = import.meta.env.VITE_BASE_URL;
        try {
          const res = await fetch(`${BaseUrl}/api/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              company_name: companyName,
              role,
            }),
          });

          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

          const data = await res.json();
          console.log("Backend response:", data);

          // Redirect after successful signup
          window.location.href = "/";
        } catch (backendError) {
          console.error("Backend error:", backendError);
          setVerificationErrors([
            {
              message:
                "Account created successfully, but failed to save in database.",
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Verification error:", err.errors || err);
      if (err.errors) {
        setVerificationErrors(err.errors);
      } else {
        setVerificationErrors([
          { message: "Invalid verification code. Please try again." },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") callback();
  };

  const resendVerificationCode = async () => {
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationErrors([]);
    } catch (err) {
      console.error("Resend error:", err);
      setVerificationErrors([
        { message: "Failed to resend code. Please try again." },
      ]);
    }
  };

  const renderErrors = (errorList) => {
    if (!errorList || errorList.length === 0) return null;

    return (
      <div className="mb-4 p-3 bg-gray-50 border border-gray-300 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-2" />
          <div className="text-sm text-gray-700">
            {errorList.map((error, index) => (
              <div key={index} className="mb-1 last:mb-0">
                {error.message || error.longMessage || "An error occurred"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-gray-100 p-4">
      <div className="relative w-full max-w-md">
        {/* CAPTCHA container - required for Clerk */}
        <div id="clerk-captcha" className="mb-4"></div>

        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-gray-200">
          {!pendingVerification ? (
            // Step 1: Sign Up Form
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-black to-gray-700 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">
                  Create Account
                </h2>
                <p className="text-gray-600 mt-2">
                  Join us and get started today
                </p>
              </div>

              {renderErrors(errors)}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
                    required
                  />
                </div>

                <div className="relative">
                  <Building className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
                    required
                  />
                </div>

                <select
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="hr">HR Manager</option>
                  <option value="manager">Team Manager</option>
                  <option value="employee">Employee</option>
                </select>

                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute inset-y-0 left-3 h-5 w-5 text-gray-400 my-auto" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSignUp)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSignUp}
                  disabled={
                    isLoading || !name || !companyName || !email || !password
                  }
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-center text-sm text-gray-600 mt-3">
                  Already have an account?{" "}
                  <a
                    href="/signin"
                    className="text-black font-medium hover:underline"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          ) : (
            // Step 2: Email Verification Form
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-black">Verify Email</h2>
                <p className="text-gray-600 mt-2">
                  We've sent a verification code to <br />
                  <span className="font-medium text-gray-800">{email}</span>
                </p>
              </div>

              {renderErrors(verificationErrors)}

              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="block w-full px-4 py-3 text-center text-2xl font-mono border border-gray-200 rounded-xl focus:ring-2 focus:ring-black bg-gray-50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleVerify)}
                maxLength="6"
                required
              />

              <button
                onClick={handleVerify}
                disabled={isLoading || !code}
                className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <button
                    onClick={resendVerificationCode}
                    className="font-medium text-black hover:text-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    Resend
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
