import React, { useState } from 'react';
import axios from 'axios';
import { User, Phone, Search, ArrowRight, ArrowLeft, ShieldCheck, Ticket, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/tokens';

export default function PatientSearch({ setView, setToken }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/find`, {
        params: { name, phone, date }
      });
      if (response.data) {
        setToken(response.data);
        setView('PATIENT_VIEW');
      } else {
        setError('No active token found for these details.');
      }
    } catch (error) {
      console.error('Error finding token:', error);
      setError('System error. Please try again or visit our help desk.');
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
      <div className="space-y-8 hidden md:block">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
           <Search size={14} /> 
           Token Recovery Portal
        </div>
        <h2 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tight">
          Already <span className="text-blue-600">Registered?</span>
        </h2>
        <p className="text-xl text-slate-500 leading-relaxed font-medium">
          Enter your details to retrieve your generated token and track your position in the queue.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative">
        <div className="bg-slate-900 px-10 py-8 mb-8">
           <h3 className="text-2xl font-black text-white">Find My Token</h3>
        </div>
        <div className="px-10 pb-10">
          <form onSubmit={handleSearch} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black border border-red-100 animate-in shake duration-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                placeholder="Name used during registration"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Appointment Date</label>
            <div className="relative group">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={20} />
               <input 
                 type="date"
                 required
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700 uppercase"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
               />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? 'Searching...' : (
              <>
                Recover My Token <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <button 
          onClick={() => setView('LANDING')}
          className="mt-4 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.97] flex items-center justify-center gap-3"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
        </div>
      </div>
    </div>
  );
}
