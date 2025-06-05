import React, { useState } from "react";
import { X, Mail, Lock, Check, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    login,
    signup,
    user,
    connectWallet,
    isWalletConnected,
    resetPassword,
  } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error: resetError } = await resetPassword(email);
        if (resetError) {
          setError(resetError.message || "Password reset failed");
        } else {
          setSuccess("Password reset email sent! Please check your inbox.");
          setTimeout(() => {
            setIsForgotPassword(false);
            setSuccess(null);
          }, 5000);
        }
      } else {
        const { error: authError } = isSignUp
          ? await signup(email, password)
          : await login(email, password);

        if (authError) {
          setError(authError.message || "Authentication failed");
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPassword = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setIsForgotPassword(false);
          setError(null);
          setSuccess(null);
        }}
        className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to login
      </button>

      <h3 className="text-xl text-white mb-4">Reset Your Password</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail
                size={18}
                className="text-cyan-400/50 group-hover:text-cyan-400 transition-colors"
              />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 px-4 py-3 bg-black/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all text-white placeholder-white/30"
              placeholder="your@email.com"
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
            "Send Reset Link"
          )}
        </button>
      </form>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-black/90 rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl border border-cyan-400/20">
          {/* Glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/30" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/30" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {isForgotPassword ? (
              renderForgotPassword()
            ) : (
              <>
                <h2 className="text-3xl font-serif text-center mb-8 text-white">
                  {!user
                    ? isSignUp
                      ? "Create Your Account"
                      : "Welcome Back"
                    : "Connect Your Wallet"}
                </h2>

                {!user ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 flex items-start">
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail
                            size={18}
                            className="text-cyan-400/50 group-hover:text-cyan-400 transition-colors"
                          />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 px-4 py-3 bg-black/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all text-white placeholder-white/30"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Password
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
                          placeholder={
                            isSignUp ? "Create password" : "Enter password"
                          }
                          required
                        />
                      </div>
                      {!isSignUp && (
                        <div className="text-right mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setError(null);
                            }}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-cyan-400 text-black py-3 rounded-xl font-medium shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 hover:bg-cyan-300 transition-all disabled:opacity-70 mt-6"
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
                      ) : isSignUp ? (
                        "Create Account"
                      ) : (
                        "Login"
                      )}
                    </button>

                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setError(null);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                      >
                        {isSignUp
                          ? "Already have an account? Login"
                          : "Don't have an account? Sign Up"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-black/50 rounded-xl border border-cyan-400/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0">
                          <Check size={20} className="text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            Step 1 Complete
                          </h3>
                          <p className="text-sm text-white/60">
                            Logged in as{" "}
                            <span className="font-medium text-white/80">
                              {user.email}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-cyan-400/20 my-4" />

                      <p className="text-sm text-white/70 leading-relaxed">
                        Now connect your wallet to access all features and
                        complete your purchases. Your wallet is required for
                        blockchain transactions.
                      </p>
                    </div>

                    <button
                      onClick={connectWallet}
                      disabled={isWalletConnected}
                      className="w-full bg-cyan-400 text-black py-3 rounded-xl font-medium shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/30 hover:bg-cyan-300 transition-all disabled:opacity-70"
                    >
                      {isWalletConnected
                        ? "Wallet Connected"
                        : "Connect Wallet"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
