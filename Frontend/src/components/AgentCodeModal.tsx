import React, { useState } from "react";

interface Props {
  onConfirm: (code: string) => void;
  onClose: () => void;
}

const AgentCodeModal: React.FC<Props> = ({ onConfirm, onClose }) => {
  const [code, setCode] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80">
        <h3 className="text-lg font-bold mb-2">Agent Reserved Seat</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter agent code to book this seat
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          placeholder="Agent Code"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-500">
            Cancel
          </button>
          <button
            disabled={!code}
            onClick={() => onConfirm(code)}
            className="px-4 py-2 bg-[#fdc106] rounded font-semibold disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentCodeModal;
