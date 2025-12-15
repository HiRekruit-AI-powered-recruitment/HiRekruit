import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Lock,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import Loader from "../components/Loader";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = request, 2 = verify & reset

  // Form state
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <Loader />;
  if (!user) return null;

  // Step 1: Request reset code
  const handleRequestReset = async () => {
    try {
      setResetLoading(true);
      setResetError("");

      const baseUrl = import.meta.env.VITE_BASE_URL;

      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset code");
      }

      // Move to step 2
      setResetStep(2);
    } catch (err) {
      setResetError(
        err.message || "Unable to send reset code. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify code and reset password
  const handleResetPassword = async () => {
    // Validation
    if (!code || code.length !== 6) {
      setResetError("Please enter a valid 6-digit code");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);
      setResetError("");

      const baseUrl = import.meta.env.VITE_BASE_URL;

      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: user.email,
          code: code,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Success!
      setResetSuccess(true);

      // Auto-close after 3 seconds and redirect to signin
      setTimeout(() => {
        handleCloseModal();
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setResetError(err.message || "Password reset failed. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetSuccess(false);
    setResetError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-black to-gray-700 text-white px-8 py-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                <User size={36} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-gray-200 text-sm flex items-center gap-2">
                  <Shield size={16} />
                  <span className="capitalize">{user.role}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Account Information
            </h2>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <ProfileCard icon={<Mail />} label="Email" value={user.email} />
              <ProfileCard
                icon={<Shield />}
                label="Role"
                value={user.role}
                capitalize
              />

              {user.company_id && (
                <ProfileCard
                  icon={<Building2 />}
                  label="Company ID"
                  value={user.company_id}
                />
              )}

              <ProfileCard
                icon={<Calendar />}
                label="Last Login"
                value={
                  user.last_login
                    ? new Date(user.last_login).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never"
                }
              />
            </div>

            {/* Security Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Security Settings
              </h3>

              <button
                onClick={() => setShowResetModal(true)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <Lock size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Change Password
                    </p>
                    <p className="text-sm text-gray-500">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-gray-400 group-hover:text-black transition-colors">
                  ›
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>

            {/* Success State */}
            {resetSuccess ? (
              <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Changed!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your password has been reset successfully.
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting to sign in...
                </p>
              </div>
            ) : (
              <div className="p-6">
                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      resetStep === 1
                        ? "bg-black text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {resetStep === 1 ? "1" : "✓"}
                  </div>
                  <div className="w-12 h-0.5 bg-gray-300"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      resetStep === 2
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    2
                  </div>
                </div>

                {/* Step 1: Request Code */}
                {resetStep === 1 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Reset Password
                    </h2>
                    <p className="text-gray-600 mb-6">
                      We'll send a verification code to your email
                    </p>

                    <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl mb-6">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>

                    {resetError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <AlertCircle
                          className="text-red-600 flex-shrink-0 mt-0.5"
                          size={18}
                        />
                        <p className="text-sm text-red-700">{resetError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleRequestReset}
                      disabled={resetLoading}
                      className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resetLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending Code...
                        </span>
                      ) : (
                        "Send Verification Code"
                      )}
                    </button>
                  </>
                )}

                {/* Step 2: Enter Code & New Password */}
                {resetStep === 2 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Verify & Reset
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Enter the code sent to{" "}
                      <span className="font-medium">{user.email}</span>
                    </p>

                    {resetError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <AlertCircle
                          className="text-red-600 flex-shrink-0 mt-0.5"
                          size={18}
                        />
                        <p className="text-sm text-red-700">{resetError}</p>
                      </div>
                    )}

                    {/* Code Input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        maxLength={6}
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-wider border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* New Password */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <button
                      onClick={handleResetPassword}
                      disabled={
                        resetLoading ||
                        !code ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
                    >
                      {resetLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Resetting Password...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </button>

                    <button
                      onClick={() => setResetStep(1)}
                      className="w-full text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      ← Back to request new code
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* Reusable Profile Card Component */
const ProfileCard = ({ icon, label, value, capitalize }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-gray-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
          {label}
        </p>
        <p
          className={`font-semibold text-gray-900 truncate ${
            capitalize ? "capitalize" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default Profile;
