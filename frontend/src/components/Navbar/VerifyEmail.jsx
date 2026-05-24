import { useState } from "react";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // VERIFY OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors([{ message: data.message || "Invalid verification code" }]);
        return;
      }

      // Success → show modal
      setShowSuccessModal(true);
    } catch (err) {
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND OTP
  const resendVerificationCode = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;

      const response = await fetch(`${baseUrl}/api/auth/resend-verification`, {
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
      setErrors([
        { message: "Unable to connect to server. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Email not found.</p>
      </div>
    );
  }

  if (showSuccessModal) {
    return <SuccessModal onClose={() => navigate("/signin")} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <VerificationForm
          email={email}
          code={code}
          isLoading={isLoading}
          errors={errors}
          onCodeChange={(e) => setCode(e.target.value)}
          onVerify={handleVerify}
          onResend={resendVerificationCode}
        />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SuccessModal({ onClose }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>

        <h2 className="text-xl font-semibold text-black mb-2">
          Account created!
        </h2>

        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          Your account has been created successfully. Please wait for admin
          approval before you can sign in.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-amber-700 leading-relaxed">
            You'll receive an email once your account has been approved.
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-black to-gray-700 hover:from-gray-800 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Go to sign in
        </button>
      </div>
    </div>
  );
}

function VerificationForm({
  email,
  code,
  isLoading,
  errors,
  onCodeChange,
  onVerify,
  onResend,
}) {
  return (
    <form onSubmit={onVerify} className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Verify Email</h2>
        <p className="text-gray-600 mt-2">
          We sent a code to <br />
          <span className="font-medium">{email}</span>
        </p>
      </div>

      <ErrorDisplay errors={errors} />

      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-xl focus:ring-2 focus:ring-black"
        value={code}
        onChange={onCodeChange}
        maxLength={6}
        disabled={isLoading}
        required
      />

      <button
        type="submit"
        disabled={isLoading || code.length !== 6}
        className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Verify & Continue"}
      </button>

      <p className="text-center text-sm">
        Didn't receive code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="font-medium text-black underline"
        >
          Resend
        </button>
      </p>
    </form>
  );
}

function ErrorDisplay({ errors }) {
  if (!errors.length) return null;

  return (
    <div className="bg-gray-100 border rounded-lg p-3 flex gap-2">
      <AlertCircle className="text-gray-700" />
      <div className="text-sm">
        {errors.map((e, i) => (
          <div key={i}>{e.message}</div>
        ))}
      </div>
    </div>
  );
}
