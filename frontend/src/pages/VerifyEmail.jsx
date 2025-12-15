import { useState } from "react";
import { Mail, AlertCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);

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

      // Success → Dashboard
      window.location.href = "/";
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
        Didn’t receive code?{" "}
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
