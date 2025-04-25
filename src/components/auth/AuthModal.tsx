import React, { useState } from "react";
import { X, Mail, Lock, Check } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, user, connectWallet, isWalletConnected } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: authError } = isSignUp
        ? await signup(email, password)
        : await login(email, password);

      if (authError) {
        setError(authError.message || "Authentication failed");
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1E9AD3] to-[#0056a8]"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-12">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#0B1120]">
            {!user
              ? isSignUp
                ? "Create Your Account"
                : "Welcome Back"
              : "Connect Your Wallet"}
          </h2>

          {!user ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E9AD3] focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E9AD3] focus:border-transparent transition-all text-gray-900 bg-white"
                    placeholder={
                      isSignUp ? "Create password" : "Enter password"
                    }
                    required
                  />
                </div>
                {!isSignUp && (
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      className="text-sm text-[#1E9AD3] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#1E9AD3] to-[#0056a8] text-white py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-[#1789bd] hover:to-[#004e99] transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#1E9AD3] hover:underline text-sm"
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-5 bg-[#F8F9FC] rounded-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      Step 1 Complete
                    </h3>
                    <p className="text-sm text-gray-600">
                      Logged in as{" "}
                      <span className="font-medium">{user.email}</span>
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gray-200 my-4"></div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  Now connect your wallet to access all features and complete
                  your purchases. Your wallet is required for blockchain
                  transactions.
                </p>
              </div>

              {isWalletConnected ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                  <div className="flex items-center gap-3 text-emerald-800">
                    <Check size={20} className="text-emerald-600" />
                    <span className="font-medium">
                      Wallet connected successfully!
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-700 pl-8">
                    You're all set to shop and make purchases.
                  </p>

                  <button
                    onClick={onClose}
                    className="mt-4 w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full bg-gradient-to-r from-[#1E9AD3] to-[#0056a8] text-white py-3.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-[#1789bd] hover:to-[#004e99] transition-all flex items-center justify-center"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
