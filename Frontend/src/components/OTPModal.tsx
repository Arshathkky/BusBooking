import React, { useState } from "react";

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  onVerify
}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = () => {
    // 🔥 Dummy OTP check
    if (otp === "1234") {
      setError(null);
      onVerify();
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-center">
          Verify Phone Number
        </h3>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter the OTP sent to your phone number
        </p>

        <input
          type="text"
          maxLength={4}
          placeholder="Enter OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg mb-3 text-center tracking-widest text-lg"
        />

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 py-2 rounded-lg bg-[#fdc106] font-bold"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
