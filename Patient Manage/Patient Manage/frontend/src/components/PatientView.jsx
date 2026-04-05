import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Users, ArrowLeft, RefreshCw, Sparkles, Activity, ShieldCheck, Heart, CheckCircle, Calendar } from 'lucide-react';

const API_BASE_URL = 'https://smart-clinic-final.onrender.com/api/tokens';

export default function PatientView({ token: initialToken, setView }) {
  const [token, setToken] = useState(initialToken);
  const [currentlyServing, setCurrentlyServing] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [dismissAlert, setDismissAlert] = useState(false);
  const [patientsAhead, setPatientsAhead] = useState(0);

  const fetchTracking = async () => {
    if (!token?.id) return;
    try {
      const statusResp = await axios.get(`${API_BASE_URL}/${token.id}`);
      setToken(statusResp.data);

      const servingResp = await axios.get(`${API_BASE_URL}/currently-serving?date=${token.bookingDate}`);
      setCurrentlyServing(servingResp.data);

      const timeResp = await axios.get(`${API_BASE_URL}/estimate/${token.tokenNumber}?date=${token.bookingDate}`);
      if (timeResp.data.estimatedArrival) {
        setEstimatedArrival(timeResp.data.estimatedArrival);
      }
      setWaitTime(timeResp.data.secondsToGo);
      if (timeResp.data.patientsAhead !== undefined) {
        setPatientsAhead(timeResp.data.patientsAhead);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [token?.id]);

  useEffect(() => {
    if (!estimatedArrival) return;
    const timer = setInterval(() => {
      const diff = Math.floor((new Date(estimatedArrival) - new Date()) / 1000);
      setTotalSeconds(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [estimatedArrival]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!token) return (
    <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
      <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
         <Users size={40} />
      </div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No Active Token Session</p>
      <button onClick={() => setView('LANDING')} className="mt-6 text-blue-600 font-black hover:underline px-6 py-2">Back to Registration</button>
    </div>
  );

  const isServed = token.status === 'COMPLETED';
  const isServing = token.status === 'CALLED';

  const todayStr = new Date().toLocaleDateString('en-CA');
  const isFutureDate = token?.bookingDate && token.bookingDate > todayStr;
  
  let daysRemaining = 0;
  if (isFutureDate) {
    const tDay = new Date(todayStr);
    const bDay = new Date(token.bookingDate);
    daysRemaining = Math.max(1, Math.ceil((bDay - tDay) / (1000 * 60 * 60 * 24)));
  }
  
  // Calculate real patients ahead based on the 12-minute backend block
  const isUpNext = token.status === 'CALLED' || (token.status === 'WAITING' && waitTime === 0);
  
  // Popup when they are up next, 1 patient ahead, or 2 patients ahead
  const showProximityAlert = (patientsAhead <= 2 || isUpNext) && (token.status === 'WAITING' || token.status === 'CALLED') && !dismissAlert && !isFutureDate;

  return (
    <div className="max-w-5xl mx-auto min-h-[60vh] flex flex-col justify-center animate-in fade-in duration-700 py-12">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Main Info Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className={`flex-1 relative overflow-hidden rounded-[3rem] shadow-2xl p-12 border transition-all duration-700 ${isServed ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-white text-slate-800'}`}>
              {isServed ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in">
                    <div className="w-32 h-32 bg-white/20 rounded-[2.5rem] flex items-center justify-center ring-8 ring-white/10">
                       <CheckCircle color="white" size={64} />
                    </div>
                    <div>
                      <h2 className="text-5xl font-black tracking-tight mb-3">Visit Completed</h2>
                      <p className="text-emerald-50 font-bold uppercase tracking-[0.3em] text-sm">Hope you feel better soon!</p>
                    </div>
                 </div>
              ) : (
                <div className="flex flex-col gap-10 justify-center h-full">
                   <div className="flex justify-between items-start">
                      <div>
                        <span className="text-blue-500 font-black uppercase tracking-widest text-[10px] mb-2 block font-bold">Patient Digital Token</span>
                        <h2 className="text-7xl font-black tracking-tighter">Token <span className="text-blue-600">#{token.tokenNumber}</span></h2>
                      </div>
                      <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] border shadow-sm ${isServing ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                         {isServing ? 'Serving Now' : 'In Queue'}
                      </div>
                   </div>

                   <div className="mt-8 space-y-4">
                      <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2 font-bold">
                        <Sparkles className="text-blue-500" size={14} /> Clinical Advice
                      </h3>
                      <p className="text-2xl font-black text-slate-700 leading-tight border-l-8 border-blue-100 pl-8 py-2 max-w-2xl">
                        "{token.smartMessage || 'Your token has been generated. Please wait for your turn.'}"
                      </p>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Status Metrics Column */}
        {!isServed && !isFutureDate && (
          <div className="lg:col-span-4 flex flex-col gap-6">
             {/* Now Serving Card */}
             <div className="flex-1 bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                   <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md">
                      <Users size={32} />
                   </div>
                   <div>
                     <span className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-2 block">Doctor is Seeing</span>
                     <div className="text-6xl font-black flex items-center justify-center gap-4">
                        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
                        {currentlyServing > 0 ? `#${currentlyServing}` : '--'}
                     </div>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             </div>

             {/* Wait Time Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl flex flex-col items-center justify-center text-center relative group overflow-hidden">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110">
                   <Clock size={32} className="animate-pulse" />
                </div>
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2 block relative z-10 font-bold">Estimated Arrival</span>
                <div className="text-6xl font-black text-slate-900 relative z-10 tracking-tight">
                   {formatTime(totalSeconds)} 
                   <span className="text-sm font-black text-slate-300 uppercase ml-2 block mt-1">Min : Sec</span>
                </div>
                {/* Background glow when time is low */}
                {totalSeconds <= 300 && totalSeconds > 0 && (
                  <div className="absolute inset-0 bg-blue-400/5 animate-pulse"></div>
                )}
             </div>
          </div>
        )}

        {/* Future Date Status Metrics Alternative */}
        {!isServed && isFutureDate && (
          <div className="lg:col-span-4 flex flex-col gap-6">
             {/* Upcoming Date Card */}
             <div className="flex-1 bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                   <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md">
                      <Calendar size={32} />
                   </div>
                   <div>
                     <span className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-2 block">Confirmed For</span>
                     <div className="text-3xl font-black mt-4 tracking-tighter">
                        {token.bookingDate}
                     </div>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             </div>

             {/* Days Remaining Card */}
             <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 border border-white shadow-2xl flex flex-col items-center justify-center text-center relative group overflow-hidden">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110">
                   <Clock size={32} className="animate-pulse" />
                </div>
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2 block relative z-10 font-bold">Time Until Visit</span>
                <div className="text-6xl font-black text-slate-900 relative z-10 tracking-tight">
                   {daysRemaining} 
                   <span className="text-sm font-black text-slate-300 uppercase ml-2 block mt-1">Days Left</span>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Proximity Alert Modal */}
      {showProximityAlert && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
           <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-blue-50 text-center space-y-6 animate-in zoom-in duration-500 relative overflow-hidden">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 animate-bounce">
                 <Sparkles size={40} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">Turn Nearby!</h3>
                 <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Be ready, your turn is next.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-3">
                 {isUpNext ? (
                   <span className="text-[14px] font-black text-blue-600 uppercase tracking-widest text-center">It's your turn!</span>
                 ) : patientsAhead === 1 ? (
                   <span className="text-[14px] font-black text-blue-600 uppercase tracking-widest text-center">Next is your turn</span>
                 ) : (
                   <span className="text-[14px] font-black text-blue-600 uppercase tracking-widest text-center">Your turn comes after one patient</span>
                 )}
              </div>
              <button 
                onClick={() => setDismissAlert(true)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all active:scale-95 shadow-xl"
              >
                I am Ready
              </button>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
           </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-12 flex justify-end">
         <button 
          onClick={() => setView('LANDING')}
          className="group flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-2xl hover:bg-black transition-all active:scale-95 hover:shadow-slate-400/50"
         >
           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
           Back to Home
         </button>
      </div>
    </div>
  );
}
