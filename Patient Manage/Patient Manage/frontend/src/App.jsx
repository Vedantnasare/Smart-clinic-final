import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import PatientRegister from './components/PatientRegister';
import PatientView from './components/PatientView';
import AdminDashboard from './components/AdminDashboard';
import PatientSearch from './components/PatientSearch';
import { Stethoscope, Lock, X, LogIn, Eye, EyeOff } from 'lucide-react';

function App() {
  const [view, setView] = useState('LANDING'); 
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminId === 'admin' && adminPass === 'admin123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setView('ADMIN_DASHBOARD');
      setAdminId('');
      setAdminPass('');
    } else {
      alert('Invalid Credentials');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'LANDING': return <LandingPage setView={setView} />;
      case 'ADMIN_DASHBOARD': return isAdmin ? <AdminDashboard setView={setView} /> : <LandingPage setView={setView} />;
      case 'PATIENT_REGISTER': return <PatientRegister setView={setView} setToken={setToken} />;
      case 'PATIENT_SEARCH': return <PatientSearch setView={setView} setToken={setToken} />;
      case 'PATIENT_VIEW': return <PatientView token={token} setView={setView} />;
      default: return <LandingPage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 w-full font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      {/* Premium Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100/50">
        <div className="w-full px-4 h-16 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('LANDING')}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
              <Stethoscope className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 leading-none">SmartClinic</h1>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] ml-0.5">Premium Care</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {isAdmin && view === 'ADMIN_DASHBOARD' ? (
               <button 
                onClick={() => { setIsAdmin(false); if (token) setView('PATIENT_VIEW'); else setView('LANDING'); }}
                className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2"
               >
                 Logout
               </button>
             ) : (
               <button 
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 flex items-center gap-2"
               >
                 <Lock size={16} /> <span className="hidden sm:inline">Admin Login</span>
               </button>
             )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex justify-center py-2 px-4 md:px-6 relative z-10">
        <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {renderView()}
        </div>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 relative w-full max-w-md animate-in zoom-in duration-300">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4 mb-10 pt-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Lock size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Authentication</h2>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Staff ID</label>
                <input 
                  required
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                  placeholder="Enter Staff ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
                    placeholder="••••••••"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Login to Dashboard <LogIn size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Footer */}
      <footer className="py-3 border-t border-blue-100/30 text-center relative z-10 bg-[#F8FAFC]">
        <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">© 2026 SmartClinic Systems • Secure Healthcare</p>
      </footer>
    </div>
  );
}

export default App;
