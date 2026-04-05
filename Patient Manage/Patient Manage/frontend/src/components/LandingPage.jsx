import React from 'react';
import { Stethoscope, UserRound, ArrowRight, Activity, Calendar, ShieldCheck, HeartPulse, Search } from 'lucide-react';

export default function LandingPage({ setView }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-500">
            <Activity size={14} /> 
            Live Queue Management System
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Healthcare <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed font-semibold max-w-xl mx-auto lg:mx-0">
            SmartClinic provides a seamless digital bridge between patients and care providers. Reduce wait times and improve experience today.
          </p>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row items-center justify-center lg:justify-start">
            <button 
              onClick={() => setView('PATIENT_REGISTER')}
              className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-[0.97] flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-3">
                Register New <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={() => setView('PATIENT_SEARCH')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-[2rem] font-black text-lg shadow-xl hover:border-blue-200 hover:text-blue-600 hover:-translate-y-1 transition-all active:scale-[0.97] flex items-center justify-center gap-3"
            >
              Check My Token <Search size={22} />
            </button>
          </div>
        </div>

        <div className="relative group scale-90">
          {/* Visual Element: Clinic Illustration Concept */}
          <div className="bg-white rounded-[4rem] shadow-2xl p-6 border border-white relative z-10 grid grid-cols-2 gap-4 animate-in zoom-in duration-1000">
            <div className="bg-blue-50/50 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-700 hover:scale-105 hover:-rotate-2 cursor-pointer shadow-sm">
               <Calendar size={48} className="mb-4" />
               <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">Smart Scheduling</span>
            </div>
            <div className="bg-indigo-50/50 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-700 hover:scale-105 hover:rotate-2 cursor-pointer shadow-sm">
               <ShieldCheck size={48} className="mb-4" />
               <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">Secure Data</span>
            </div>
            <div className="bg-rose-50/50 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-700 hover:scale-105 hover:rotate-2 cursor-pointer shadow-sm">
               <HeartPulse size={48} className="mb-4" />
               <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">Vital Alerts</span>
            </div>
            <div className="bg-emerald-50/50 aspect-square rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-700 hover:scale-105 hover:-rotate-2 cursor-pointer shadow-sm">
               <UserRound size={48} className="mb-4" />
               <span className="font-black text-[10px] uppercase tracking-[0.2em] text-center">Patient Care</span>
            </div>
          </div>
          {/* Decorative Blooms */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-[120px] animate-float tracking-widest hidden md:block"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-[120px] animate-float delay-1000 hidden md:block"></div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="py-2 border-y border-slate-100 flex flex-wrap justify-center gap-6 lg:gap-24 opacity-40">
        {['Advanced Diagnostics', '24/7 Monitoring', 'Privacy First', 'AI Enabled'].map(t => (
          <span key={t} className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-slate-400">{t}</span>
        ))}
      </div>
    </div>
  );
}
