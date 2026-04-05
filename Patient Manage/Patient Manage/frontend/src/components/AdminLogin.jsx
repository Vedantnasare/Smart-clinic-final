import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function AdminLogin({ setView }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === 'admin' && password === 'admin123') {
      setView('ADMIN_DASHBOARD');
    } else {
      alert('Invalid medical credentials. Access denied.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative overflow-hidden">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="flex flex-col items-center text-center space-y-6 mb-12 pt-4">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Admin Access</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Clinic Management Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff ID</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                placeholder="Clinic ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                type="password"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
          >
            Authenticate <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-slate-400">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Session</span>
        </div>
      </div>
      
      <button 
        onClick={() => setView('LANDING')}
        className="w-full mt-6 text-slate-400 hover:text-slate-600 font-bold text-sm text-center transition-colors"
      >
        &larr; Return to Patient Portal
      </button>
    </div>
  );
}
