import React, { useState } from 'react';
import { X, ShieldCheck, Wallet, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onTopup: (amount: number) => void;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onTopup
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');

  if (!isOpen) return null;

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (amount > 0) {
      onTopup(amount);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-['Cinzel',serif]">
                Prepaid GPU Compute Wallet
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium">
                Strict Shariah-Compliant Debit Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleTopup} className="p-6 space-y-5">
          
          {/* Current Balance Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Available Balance:</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              ${currentBalance.toFixed(2)}
            </span>
          </div>

          {/* Shariah Rule Callout */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 leading-relaxed space-y-1">
            <div className="font-bold flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Zero-Debt Guarantee</span>
            </div>
            <p className="text-slate-300">
              Enforced by database constraint <code className="text-emerald-300 font-mono">CHECK (wallet_balance &gt;= 0.00)</code>. No credit lines, no interest charges, no overdraft fees. Compute is rendered strictly against pre-funded credits.
            </p>
          </div>

          {/* Preset Top-up amounts */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Top-Up Amount (USD)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +${amt}.00
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Or Custom Amount:
            </label>
            <input
              type="number"
              min="5"
              max="5000"
              placeholder="e.g. 75"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>Add ${customAmount || selectedAmount}.00 Credits</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
