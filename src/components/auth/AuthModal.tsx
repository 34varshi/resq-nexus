import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { X, Shield, Lock, Mail, User, Phone, Building, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginAs } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('s.jenkins@resqnexus.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('EMERGENCY_COORDINATOR');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
    loginAs(matched);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs({
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: regName || 'Registered Responder',
      email: regEmail || 'responder@relief.org',
      role: regRole,
      organization: regOrg || 'Disaster Relief Alliance',
      phone: regPhone || '+1 (555) 999-0000',
      badgeNumber: `REG-${Math.floor(100 + Math.random() * 900)}`
    });
    onClose();
  };

  const handleQuickDemoLogin = (user: typeof DEMO_USERS[0]) => {
    loginAs(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Portal Authentication</h3>
              <p className="text-[11px] text-slate-400">ResQ Nexus Mission Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 text-xs font-medium">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors ${
              tab === 'login' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-center rounded-lg transition-colors ${
              tab === 'register' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Personnel
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {tab === 'login' ? (
            <>
              {/* Quick 1-Click Role Login Panel */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Quick Demo Access (Select Role Profile)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {DEMO_USERS.slice(0, 4).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleQuickDemoLogin(user)}
                      className="flex flex-col p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-left group"
                    >
                      <span className="font-semibold text-slate-200 group-hover:text-rose-400 transition-colors truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                        {user.role.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-mono text-slate-400 uppercase">
                  Or Credentials
                </span>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Access Key / Password</label>
                    <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-rose-400 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-0"
                    />
                    <span>Remember terminal token</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition-colors cursor-pointer mt-2"
                >
                  Sign In to Command Center
                </button>
              </form>
            </>
          ) : (
            /* Personnel Registration */
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="EMERGENCY_COORDINATOR">Emergency Coordinator</option>
                    <option value="FIELD_RESPONDER">Field Responder</option>
                    <option value="SHELTER_MANAGER">Shelter Manager</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="RELIEF_ORGANIZATION">Relief Organization</option>
                    <option value="DONOR_PROVIDER">Resource Provider</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Red Crescent / NDRF"
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="name@agency.gov"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition-colors cursor-pointer mt-2"
              >
                Register & Initialize Credential
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
