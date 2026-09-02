import React, { useState } from 'react';
import { CreditCard, X, Plus, ShieldCheck, Zap, Layers, Server, Sparkles } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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
  const [activeTab, setActiveTab] = useState<'topup' | 'subscription'>('topup');
  
  // PayPal Form State
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const getYieldEstimation = (usdAmount: string) => {
    const val = parseFloat(usdAmount);
    if (isNaN(val) || val <= 0) return "Enter an amount to see production yield.";
    const tokens = val * 10;
    
    if (tokens < 250) return "Yields: Character concepts & a few manga pages.";
    if (tokens < 500) return "Yields: 1 Short Manga Chapter (15 pages) or 1 Anime Scene.";
    if (tokens < 1000) return "Yields: 1 Standard Manga Chapter (30 pages) or 2 Anime Scenes.";
    if (tokens < 2500) return "Yields: 1 Extended Manga Chapter (60 pages) or an Anime Teaser Trailer.";
    if (tokens < 5000) return "Yields: 3 Full Manga Chapters or 1 Complete Anime Episode.";
    if (tokens < 10000) return "Yields: 1 Full Manga Volume (10 chapters) or 2 Anime Episodes.";
    return "Yields: Multi-Volume Manga Series or Full Anime Production Season.";
  };

  if (!isOpen) return null;

  const tiers = [
    {
      id: 'STARTER',
      name: 'Starter Creator',
      price: '$99/mo',
      amount: '99.00',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      features: ['1,000 Studio Tokens', 'Produces ~1 Full Manga Chapter (60 pages)', 'Or ~1 Anime Teaser Trailer', '720p Video Exports']
    },
    {
      id: 'PRO',
      name: 'Pro Studio',
      price: '$399/mo',
      amount: '399.00',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      features: ['5,000 Studio Tokens', 'Produces ~1 Full Manga Volume (10 chapters)', 'Or ~2 Complete Anime Episodes', '4K Video Exports']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: '$1299/mo',
      amount: '1299.00',
      icon: <Server className="w-5 h-5 text-rose-400" />,
      features: ['20,000 Studio Tokens', 'Produces ~4 Full Manga Volumes', 'Or a Complete Anime Season', 'Dedicated Server Node']
    }
  ];

  const initialOptions = {
    clientId: "Ad3bl5Pvwph5VergOEbfvAwLX0ZUl0JInBSwYageQ2AWv4RS6xtJY0NYXct_xmf_0vS-__Sx1r286wnL",
    currency: "USD",
    intent: "capture"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        <PayPalScriptProvider options={initialOptions}>
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
          <div className="bg-slate-950 p-6 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Prepaid Balance</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 flex flex-wrap items-center gap-2">
                <span>{(currentBalance * 10).toLocaleString()}</span> 
                <span className="text-sm text-emerald-500/70">Tokens</span>
                <span className="text-[10px] font-sans px-2 py-1 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> No-Debt Balance Guard
                </span>
              </div>
            </div>
            <div className="sm:text-right">
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
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                  Select Top-Up Amount (1 USD = 10 Tokens)
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
                  
                  {/* Dynamic Yield Estimation */}
                  <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-2 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-sm font-bold font-mono text-emerald-300">
                        You Will Receive: {isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 ? 0 : (parseFloat(amount) * 10).toLocaleString()} Studio Tokens
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight font-medium text-emerald-400/80 ml-7">
                      {getYieldEstimation(amount)}
                    </p>
                  </div>
                </div>

                {/* No-Debt Rule Callout */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/10 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Modest Usage Guard Active:</strong> Your wallet operates strictly on a prepaid basis. You will never be billed into debt or negative balances. Render operations are paused safely if funds are depleted.
                  </div>
                </div>

                {/* PayPal Official Button */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Checkout</div>
                  <div className="relative z-0">
                    <PayPalButtons 
                      style={{ layout: "vertical", shape: "rect" }}
                      createOrder={(data, actions) => {
                        const val = parseFloat(amount);
                        if (isNaN(val) || val <= 0) return Promise.reject();
                        return actions.order.create({
                          intent: "CAPTURE",
                          application_context: {
                            shipping_preference: "NO_SHIPPING"
                          },
                          purchase_units: [
                            {
                              amount: {
                                value: val.toFixed(2),
                                currency_code: "USD"
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={(data, actions) => {
                        return actions.order!.capture().then((details) => {
                          const val = parseFloat(amount);
                          onTopup(val);
                          onClose();
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
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

                {/* PayPal Official Integration for Subscriptions */}
                {selectedTier && selectedTier !== currentTier && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">PayPal Secure Subscription</div>
                      <div className="text-xs font-bold text-indigo-400 font-mono">{tiers.find(t => t.id === selectedTier)?.price} / month</div>
                    </div>
                    
                    <div className="relative z-0">
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", color: "white" }}
                        createOrder={(data, actions) => {
                          const tierObj = tiers.find(t => t.id === selectedTier);
                          if (!tierObj) return Promise.reject();
                          return actions.order.create({
                            intent: "CAPTURE",
                            application_context: {
                              shipping_preference: "NO_SHIPPING"
                            },
                            purchase_units: [
                              {
                                description: `${tierObj.name} Subscription`,
                                amount: {
                                  value: tierObj.amount,
                                  currency_code: "USD"
                                },
                              },
                            ],
                          });
                        }}
                        onApprove={(data, actions) => {
                          return actions.order!.capture().then((details) => {
                            onSubscribe(selectedTier);
                            onClose();
                          });
                        }}
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight mt-2 text-center">
                      By confirming, you authorize a monthly charge via PayPal. You can cancel at any time. Our Modest-usage policy ensures you are only billed the flat rate, with no hidden overdraft fees.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </PayPalScriptProvider>
      </div>
    </div>
  );
};
