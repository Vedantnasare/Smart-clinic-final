import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckCircle, Bell, XCircle, Play, RefreshCw, UserCheck, Calendar, Activity, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/tokens';

export default function AdminDashboard({ setView }) {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

  const [doctorAvailable, setDoctorAvailable] = useState(true);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/all?date=${selectedDate}`);
      let foundCalled = false;
      const visuallyClampedTokens = response.data.map(t => {
          if (t.status === 'CALLED') {
              if (foundCalled) return { ...t, status: 'WAITING' };
              foundCalled = true;
          }
          return t;
      });

      const sorted = visuallyClampedTokens.sort((a, b) => {
        if (a.status === 'WAITING' && b.status === 'WAITING') {
          if (a.emergency === b.emergency) {
            return a.tokenNumber - b.tokenNumber;
          }
          return (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0);
        }
        return 0;
      });
      setTokens(sorted);

      const availRes = await axios.get(`${API_BASE_URL}/availability?date=${selectedDate}`);
      setDoctorAvailable(availRes.data.message !== "Doctor is unavailable on this date.");

    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
    setLoading(false);
  };

  const toggleDoctorAvailability = async () => {
    try {
      const newState = !doctorAvailable;
      await axios.post(`${API_BASE_URL}/doctor-availability`, { date: selectedDate, available: newState });
      setDoctorAvailable(newState);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/${id}/status`, { status });
      fetchTokens();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteToken = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
    }
  };

  const addBuffer = async (mins) => {
    try {
      await axios.post(`${API_BASE_URL}/buffer`, {
        date: selectedDate,
        minutes: mins
      });
      alert(`Added ${mins} mins buffer to today's queue.`);
    } catch (error) {
      console.error('Error adding buffer:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'WAITING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CALLED': return 'bg-blue-50 text-blue-600 border-blue-100 ring-4 ring-blue-500/10';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const waitingCount = tokens.filter(t => t.status === 'WAITING').length;
  const servedCount = tokens.filter(t => t.status === 'COMPLETED').length;
  const servingCount = tokens.filter(t => t.status === 'CALLED').length;
  
  const todayStr = new Date().toLocaleDateString('en-CA');

  return (
    <div className="space-y-8">
      {/* Date Selector and Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="w-full lg:w-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Clinic <span className="text-blue-600">Queue</span></h2>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm w-full sm:w-fit">
              <Calendar size={18} className="text-blue-500" />
              <input 
                type="date"
                className="bg-transparent border-none outline-none font-bold text-slate-600 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-2xl border border-slate-100 shadow-sm">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Doctor:</span>
               <button 
                  onClick={toggleDoctorAvailability} 
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-colors border ${doctorAvailable ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                  {doctorAvailable ? 'AVAILABLE' : 'ON LEAVE'}
               </button>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 p-1.5 px-3 rounded-2xl border border-amber-100 shadow-sm">
               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mr-2">Add Delay:</span>
               <button onClick={() => addBuffer(5)} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-black transition-colors border border-amber-200">+5m</button>
               <button onClick={() => addBuffer(10)} className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-black transition-colors border border-amber-200">+10m</button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-auto mt-4 lg:mt-0">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[150px]">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
               <Users size={24} />
             </div>
             <div>
               <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Waiting</span>
               <span className="text-2xl font-black text-slate-800">{waitingCount}</span>
             </div>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[150px]">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
               <UserCheck size={24} />
             </div>
             <div>
               <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Served</span>
               <span className="text-2xl font-black text-slate-800">{servedCount}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
           <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Patient List • Live</h3>
           <button 
             onClick={fetchTokens}
             className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
           >
             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
           </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Token</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">
                    No patients booked for this date
                  </td>
                </tr>
              ) : (
                tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${token.status === 'CALLED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {token.tokenNumber}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           {token.patientName}
                           {token.emergency && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] uppercase font-black border border-red-200 shadow-sm">Emergency</span>}
                        </div>
                        {token.emergencyReason && (
                           <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg w-fit border border-red-100">
                             {token.emergencyReason}
                           </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-2">
                        <span>{token.phoneNumber}</span>
                        {token.slot && <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">• {token.slot}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black border ${getStatusStyle(token.status)}`}>
                         {token.status === 'CALLED' ? 'serving' : token.status === 'COMPLETED' ? 'served' : 'waiting'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex justify-end gap-2">
                        {token.status === 'WAITING' && servingCount === 0 && (
                          <button 
                            disabled={token.bookingDate !== todayStr}
                            onClick={() => updateStatus(token.id, 'CALLED')}
                            className={`p-3 rounded-2xl shadow-sm transition-all ${token.bookingDate !== todayStr ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white active:scale-90'}`}
                            title={token.bookingDate !== todayStr ? "Can only call patients on their booking date" : "Call Patient"}
                          >
                            <Play size={18} fill="currentColor" />
                          </button>
                        )}
                        {(token.status === 'WAITING' || token.status === 'CALLED') && (
                          <button 
                            disabled={token.bookingDate !== todayStr}
                            onClick={() => updateStatus(token.id, 'COMPLETED')}
                            className={`p-3 rounded-2xl shadow-sm transition-all ${token.bookingDate !== todayStr ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white active:scale-90'}`}
                            title={token.bookingDate !== todayStr ? "Can only mark served on their booking date" : "Mark Served"}
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const cleanPhone = token.phoneNumber.replace(/[^\d]/g, '');
                            const msg = token.status === 'COMPLETED' 
                              ? `Thank you for visiting!`
                              : (token.smartMessage ? `${token.smartMessage} (Token #${token.tokenNumber})` : `Hello ${token.patientName}, your token #${token.tokenNumber} is ready.`);
                            const encodedMsg = encodeURIComponent(msg);
                            window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
                          }}
                          className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                          title="WhatsApp"
                        >
                          <Bell size={18} />
                        </button>
                        <button 
                          onClick={() => deleteToken(token.id)}
                          className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90"
                          title="Delete"
                        >
                          <XCircle size={18} />
                        </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {tokens.length === 0 ? (
            <div className="px-8 py-20 text-center text-slate-400 font-bold">
              No patients booked for this date
            </div>
          ) : (
            tokens.map((token) => (
              <div key={token.id} className="p-6 space-y-4 hover:bg-blue-50/10 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 ${token.status === 'CALLED' ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                      {token.tokenNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-slate-800">{token.patientName}</span>
                        {token.emergency && <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] uppercase font-black border border-red-200 shadow-sm">Emergency</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter flex flex-wrap items-center gap-2">
                        <span>{token.phoneNumber}</span>
                        {token.slot && <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">• {token.slot}</span>}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black border tracking-widest shrink-0 ${getStatusStyle(token.status)}`}>
                    {token.status === 'CALLED' ? 'serving' : token.status === 'COMPLETED' ? 'served' : 'waiting'}
                  </span>
                </div>

                {token.emergencyReason && (
                   <div className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100 w-full">
                     <span className="uppercase text-[8px] block mb-1 opacity-60">Emergency Condition</span>
                     {token.emergencyReason}
                   </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex flex-1 gap-2">
                    {token.status === 'WAITING' && servingCount === 0 && (
                      <button 
                        disabled={token.bookingDate !== todayStr}
                        onClick={() => updateStatus(token.id, 'CALLED')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl shadow-sm font-black text-sm transition-all ${token.bookingDate !== todayStr ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'}`}
                      >
                        <Play size={16} fill="currentColor" /> Call
                      </button>
                    )}
                    {(token.status === 'WAITING' || token.status === 'CALLED') && (
                      <button 
                        disabled={token.bookingDate !== todayStr}
                        onClick={() => updateStatus(token.id, 'COMPLETED')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl shadow-sm font-black text-sm transition-all ${token.bookingDate !== todayStr ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-200'}`}
                      >
                        <CheckCircle size={16} /> Serve
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const cleanPhone = token.phoneNumber.replace(/[^\d]/g, '');
                        const msg = token.status === 'COMPLETED' 
                          ? `Thank you for visiting!`
                          : (token.smartMessage ? `${token.smartMessage} (Token #${token.tokenNumber})` : `Hello ${token.patientName}, your token #${token.tokenNumber} is ready.`);
                        const encodedMsg = encodeURIComponent(msg);
                        window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
                      }}
                      className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 border border-slate-100"
                    >
                      <Bell size={20} />
                    </button>
                    <button 
                      onClick={() => deleteToken(token.id)}
                      className="p-3 bg-slate-50 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90 border border-slate-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
