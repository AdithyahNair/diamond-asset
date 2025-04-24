import React, { useState } from "react";
import { X } from "lucide-react";
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
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} className="text-gray-700" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            {!user
              ? isSignUp
                ? "Create an Account"
                : "Login"
              : "Connect Your Wallet"}
          </h2>

          {!user ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E9AD3]"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E9AD3]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1E9AD3] text-white py-2 rounded-lg hover:bg-[#1789bd] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
              </button>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#1E9AD3] hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-600 mb-6 text-center">
                Step 1 complete! You're logged in as{" "}
                <span className="font-medium">{user.email}</span>. Now connect
                your wallet to access all features.
              </p>

              {isWalletConnected ? (
                <div className="text-center">
                  <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
                    Wallet connected successfully!
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full bg-[#1E9AD3] text-white py-3 rounded-lg hover:bg-[#1789bd] transition-colors flex items-center justify-center"
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
