import React from "react";
import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
  onValidationChange: (isValid: boolean) => void;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  onValidationChange,
}) => {
  const requirements = [
    {
      text: "At least 8 characters",
      test: () => password.length >= 8,
    },
    {
      text: "One uppercase letter",
      test: () => /[A-Z]/.test(password),
    },
    {
      text: "One lowercase letter",
      test: () => /[a-z]/.test(password),
    },
    {
      text: "One number",
      test: () => /[0-9]/.test(password),
    },
    {
      text: "One special character",
      test: () => /[!@#$%^&*]/.test(password),
    },
  ];

  // Check if all requirements are met
  const allRequirementsMet = requirements.every((req) => req.test());

  // Update parent component when validation status changes
  React.useEffect(() => {
    onValidationChange(allRequirementsMet);
  }, [allRequirementsMet, onValidationChange]);

  return (
    <div className="space-y-2 text-sm">
      {requirements.map((req, index) => {
        const isMet = req.test();
        return (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                isMet
                  ? "bg-green-400/20 text-green-400"
                  : "bg-red-400/20 text-red-400"
              }`}
            >
              {isMet ? <Check size={12} /> : <X size={12} />}
            </div>
            <span
              className={`transition-colors ${
                isMet ? "text-green-400" : "text-white/60"
              }`}
            >
              {req.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordRequirements;
