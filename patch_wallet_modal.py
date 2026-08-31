import re

with open('src/components/WalletTopupModal.tsx', 'r') as f:
    code = f.read()

replacement = """import React, { useState } from 'react';
import { CreditCard, X, Plus, ShieldCheck, Zap, Layers, Server } from 'lucide-react';

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  currentTier?: string;
  onTopup: (amount: number) => void;
  onSubscribe: (tier: string) => void;
}

export const WalletTopupModal: React.FC<WalletTopupModalProps> = ({ 
  isOpen, 
  onClose, 
  currentBalance, 
  currentTier = 'FREE',
  onTopup,
  onSubscribe
}) => {
  const [amount, setAmount] = useState<string>('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'topup' | 'subscription'>('topup');
  
  // PayPal Form State
  const [paypalEmail, setPaypalEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onTopup(val);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      onSubscribe(selectedTier);
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const tiers = [
    {
      id: 'STARTER',
      name: 'Starter Creator',
      price: '$15/mo',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      features: ['500 AI Generations', '720p Video Exports', 'Standard Queue Priority']
    },
    {
      id: 'PRO',
      name: 'Pro Studio',
      price: '$49/mo',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      features: ['Unlimited Generations', '4K Video Exports', 'High Queue Priority', 'Priority Support']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$199/mo',
      icon: <Server className="w-5 h-5 text-rose-400" />,
      features: ['Dedicated Server Node', 'Custom API Access', 'White-glove Support', 'Team Collaboration']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-['Cinzel',serif]">Billing & Plans</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your prepaid balance or active subscription.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Banner */}
        <div className="bg-slate-950 p-6 border-b border-slate-800/80 flex justify-between items-center">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Prepaid Balance</div>
            <div className="text-3xl font-bold font-mono text-emerald-400 flex items-center gap-3">
              ${currentBalance.toFixed(2)}
              <span className="text-[10px] font-sans px-2 py-1 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> No-Debt Balance Guard
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Plan</div>
            <div className="text-lg font-bold text-indigo-400">
              {currentTier === 'FREE' ? 'Free / Pay-As-You-Go' : `${currentTier} PLAN`}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'topup' 
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            One-Time Top-Up
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'subscription' 
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            Subscription Plans
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'topup' ? (
            <form onSubmit={handleTopupSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Select Top-Up Amount
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['25', '50', '100', '250', '500', '1000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val)}
                      className={`py-3 rounded-xl border font-mono font-bold transition-all ${
                        amount === val
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="Custom amount..."
                  />
                </div>
              </div>

              {/* No-Debt Rule Callout */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Modest Usage Guard Active:</strong> Your wallet operates strictly on a prepaid basis. You will never be billed into debt or negative balances. Render operations are paused safely if funds are depleted.
                </div>
              </div>

              {/* PayPal / Card Mock */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method (PayPal Gateway)</div>
                <input
                  type="email"
                  placeholder="PayPal Email or Credit Card"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !amount}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing Payment...' : `Top-Up $${amount}`}
                  {!isProcessing && <Plus className="w-4 h-4" />}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubscribeSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                  <div 
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedTier === tier.id 
                        ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' 
                        : currentTier === tier.id
                        ? 'border-emerald-500/50 bg-emerald-950/10 opacity-70'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    {currentTier === tier.id && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Current Plan
                      </div>
                    )}
                    <div className="mb-4">
                      {tier.icon}
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm">{tier.name}</h3>
                    <div className="text-xl font-bold font-mono text-indigo-400 my-2">{tier.price}</div>
                    <ul className="space-y-2 mt-4">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-600 mt-1.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* PayPal Integration Mock for Subscriptions */}
              {selectedTier && selectedTier !== currentTier && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">PayPal Subscription Gateway</div>
                    <div className="text-xs font-bold text-indigo-400 font-mono">{tiers.find(t => t.id === selectedTier)?.price} / month</div>
                  </div>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="Enter PayPal Email to Authorize Subscription"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 leading-tight">
                    By confirming, you authorize a recurring monthly charge via PayPal. You can cancel at any time. Our Modest-usage policy ensures you are only billed the flat rate, with no hidden overdraft fees.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedTier || selectedTier === currentTier || !paypalEmail}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'Authorizing PayPal...' : 'Confirm Subscription'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
"""
with open('src/components/WalletTopupModal.tsx', 'w') as f:
    f.write(replacement)

