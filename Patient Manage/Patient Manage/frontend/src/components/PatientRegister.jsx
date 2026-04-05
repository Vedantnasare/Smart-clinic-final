import React, { useState } from 'react';
import axios from 'axios';
import { User, Phone, CheckCircle2, Ticket, ArrowRight, ArrowLeft, ShieldCheck, Calendar } from 'lucide-react';

const API_BASE_URL = 'https://smart-clinic-final.onrender.com/api/tokens';

export default function PatientRegister({ setView, setToken }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD format for local date
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [availability, setAvailability] = React.useState(null);
  const [slot, setSlot] = React.useState('');
  const [emergency, setEmergency] = React.useState(false);
  const [selectedEmergencyReason, setSelectedEmergencyReason] = useState('Accident / Trauma');
  const [otherEmergencyReason, setOtherEmergencyReason] = useState('');

  React.useEffect(() => {
    const checkAvailability = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/availability?date=${bookingDate}`);
        setAvailability(response.data);
        if (response.data.available) {
           const slots = response.data.slots;
           if (slots.MORNING) setSlot('MORNING');
           else if (slots.AFTERNOON) setSlot('AFTERNOON');
           else if (slots.EVENING) setSlot('EVENING');
        } else {
           setSlot('');
        }
      } catch (error) {
        console.error('Error checking availability:', error);
      }
    };
    checkAvailability();
  }, [bookingDate]);
 
  const isToday = bookingDate === new Date().toLocaleDateString('en-CA');

  const generateToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalEmergencyReason = selectedEmergencyReason === 'Other' ? otherEmergencyReason : selectedEmergencyReason;

      const response = await axios.post(`${API_BASE_URL}/generate`, { 
        name, 
        phone,
        bookingDate,
        emergency,
        emergencyReason: emergency ? finalEmergencyReason : null,
        slot
      });
      const newToken = response.data;
      setToken(newToken);
      setIsSuccess(true);
      // Wait for success animation before redirect
      setTimeout(() => setView('PATIENT_VIEW'), 3000);
    } catch (error) {
      console.error('Error generating token:', error);
      if (error.response && error.response.status === 400) {
          alert('This does not appear to be a valid medical emergency. Please provide a true medical reason or uncheck the emergency box.');
      } else {
          alert('Failed to connect to clinic server.');
      }
    }
    setLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-12 border border-blue-50 max-w-md mx-auto flex flex-col items-center text-center space-y-8 animate-in zoom-in duration-700 relative overflow-hidden">
        <div className="relative z-10 w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-200 animate-[bounce_1s_infinite]">
          <CheckCircle2 size={48} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Registration Success!</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">Preparing your Digital ID</p>
        </div>
        <div className="relative z-10 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-[progress_3s_linear]"></div>
        </div>
        {/* Background Sparkle Blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/40 rounded-full -ml-16 -mb-16 blur-2xl"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
      <div className="space-y-8 hidden md:block">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-wider">
           <ShieldCheck size={14} /> 
           Verified Clinic Partner
        </div>
        <h2 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tight">
          Skip the <span className="text-blue-600">Waiting Room</span> Stress.
        </h2>
        <p className="text-xl text-slate-500 leading-relaxed font-medium">
          Get your digital token in seconds. Choose your checkup date and track your position in real-time.
        </p>
        <ul className="space-y-4">
          {['Date-wise Appointment Booking', 'Real-time Queue Tracking', 'AI-Generated Tips'].map((f) => (
            <li key={f} className="flex items-center gap-3 font-bold text-slate-700">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative text-left">
        <div className="bg-slate-900 px-10 py-8 mb-8">
          <h3 className="text-2xl font-black text-white">Register Patient</h3>
        </div>
        <div className="px-10 pb-10">
          <form onSubmit={generateToken} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                placeholder="e.g. John Doe"
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
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                required
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            {availability && (
               <div className="text-sm font-bold mt-2 ml-1">
                 {availability.available ? (
                   <span className="text-emerald-500">{availability.message}</span>
                 ) : (
                   <span className="text-red-500">{availability.message}</span>
                 )}
               </div>
            )}
          </div>

          {availability && availability.available && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Slot</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {['MORNING', 'AFTERNOON', 'EVENING'].map(s => (
                  <label key={s} className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${!availability.slots[s] ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-50' : slot === s ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 hover:border-blue-200 bg-white'}`}>
                    <input type="radio" name="slot" className="hidden" disabled={!availability.slots[s]} checked={slot === s} onChange={() => setSlot(s)} />
                    <span className="text-xs font-black uppercase tracking-widest">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isToday && (
           <div className="space-y-2">
            <label className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 rounded-2xl cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded text-red-500 focus:ring-red-500" checked={emergency} 
                     onChange={(e) => {
                       setEmergency(e.target.checked);
                       if (!e.target.checked) {
                         setSelectedEmergencyReason('Accident / Trauma');
                         setOtherEmergencyReason('');
                       }
                     }} />
              <div>
                 <div className="text-sm font-black text-red-700">Emergency Case</div>
                 <div className="text-xs font-bold text-red-400">Skip the queue for urgent medical attention</div>
              </div>
            </label>

            {emergency && (
              <div className="mt-4 p-4 border border-red-100 rounded-2xl bg-white space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Reason</span>
                <div className="grid grid-cols-2 gap-3">
                  {['Accident / Trauma', 'Severe Pain', 'Cardiac / Stroke', 'Other'].map(rsn => (
                    <label key={rsn} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${selectedEmergencyReason === rsn ? 'border-red-400 bg-red-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                       <input type="radio" name="emergencyReason" className="hidden" checked={selectedEmergencyReason === rsn} onChange={() => setSelectedEmergencyReason(rsn)} />
                       <span className={`text-xs font-bold ${selectedEmergencyReason === rsn ? 'text-red-700' : 'text-slate-600'}`}>{rsn}</span>
                    </label>
                  ))}
                </div>
                {selectedEmergencyReason === 'Other' && (
                  <textarea
                    placeholder="Briefly describe the emergency condition..."
                    required
                    className="w-full mt-2 p-3 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-red-400 transition-all outline-none font-bold text-slate-700 text-sm resize-none h-20"
                    value={otherEmergencyReason}
                    onChange={(e) => setOtherEmergencyReason(e.target.value)}
                  />
                )}
              </div>
            )}
          </div>
          )}

          <button 
            disabled={loading || (availability && !availability.available)}
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? 'Processing...' : (
              <>
                Confirm Registration <ArrowRight size={20} />
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
