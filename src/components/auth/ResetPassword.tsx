import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupSession = async () => {
      try {
        // Get the token from the URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || type !== "recovery") {
          setError("Invalid reset password link. Please request a new one.");
          return;
        }

        // Get the session using the token
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          setError("Invalid or expired reset link. Please request a new one.");
        }
      } catch (error) {
        console.error("Setup session error:", error);
        setError("An error occurred while setting up the session.");
      }
    };

    setupSession();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Sign out after successful password reset
        await supabase.auth.signOut();
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/90 rounded-2xl p-8 shadow-2xl border border-cyan-400/20 relative">
          {/* Glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <h2 className="text-3xl font-serif text-center mb-8 text-white">
            Reset Your Password
          </h2>

          {error && (
            <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 mb-6">
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-4 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 text-center">
              <p className="text-sm mb-2">Password successfully reset!</p>
              <p className="text-xs">Redirecting to home page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className="text-cyan-400/50 group-hover:text-cyan-400 transition-colors"
                    />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-3 bg-black/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all text-white placeholder-white/30"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className="text-cyan-400/50 group-hover:text-cyan-400 transition-colors"
                    />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-3 bg-black/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all text-white placeholder-white/30"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 text-black py-3 rounded-xl font-medium shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 hover:bg-cyan-300 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
