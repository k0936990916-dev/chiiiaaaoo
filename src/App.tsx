import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Frontend from './pages/Frontend';
import Backend from './pages/Backend';
import { useEffect, useState } from 'react';
import { auth, signIn, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { cn } from './lib/utils';
import { Store } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  return (
    <BrowserRouter>
      {/* Background with a subtle paper texture feel */ }
      <div className="min-h-screen bg-[#F4EFE6] text-[#5C3D2E] font-serif flex flex-col relative overflow-hidden selection:bg-[#A73C3C] selection:text-white">
        
        {/* American Country Style Gingham / Plaid Top Border */}
        <div className="absolute top-0 left-0 w-full h-3 z-0" style={{
          backgroundImage: 'linear-gradient(45deg, #A73C3C 25%, transparent 25%, transparent 75%, #A73C3C 75%, #A73C3C), linear-gradient(45deg, #A73C3C 25%, transparent 25%, transparent 75%, #A73C3C 75%, #A73C3C)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px',
          opacity: 0.8
        }}></div>

        <header className="relative z-50 pt-10 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center max-w-7xl w-full mx-auto gap-6 border-b-2 border-dashed border-[#5C3D2E]/20 pb-6">
          <Link text-center to="/" className="flex flex-col items-center group">
            <div className="flex items-center gap-3 text-[#A73C3C]">
               <Store className="w-5 h-5" />
               <span className="text-xs tracking-[0.3em] font-bold uppercase">Rustic Tea Co.</span>
               <Store className="w-5 h-5" />
            </div>
            <span className="text-4xl md:text-5xl font-serif tracking-widest text-[#5C3D2E] mt-2 group-hover:text-[#A73C3C] transition-colors">KEBUKE</span>
            <span className="text-sm tracking-widest text-[#5C3D2E]/70 mt-1 font-sans">可不可熟成紅茶</span>
          </Link>
          
          <div className="flex items-center gap-6 font-sans">
            {user ? (
              <>
                <Link to="/admin" className="text-sm font-bold text-[#5C3D2E] hover:text-[#A73C3C] transition-colors tracking-wider underline underline-offset-4 decoration-[#A73C3C]/30 decoration-2">後台管理 (Backend)</Link>
                <button onClick={logOut} className="text-sm border-2 border-[#5C3D2E] text-[#5C3D2E] px-4 py-1.5 hover:bg-[#5C3D2E] hover:text-[#F4EFE6] transition-colors font-bold tracking-wider rounded-sm shadow-[2px_2px_0px_#5C3D2E]">登出</button>
              </>
            ) : (
              <button onClick={signIn} className="text-sm bg-transparent border-2 border-[#5C3D2E] text-[#5C3D2E] px-4 py-1.5 hover:bg-[#5C3D2E] hover:text-[#F4EFE6] transition-all font-bold tracking-wider rounded-sm shadow-[2px_2px_0px_#5C3D2E]">登入 (Sign In)</button>
            )}
          </div>
        </header>

        <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto mt-8 pb-24">
          <Routes>
            <Route path="/" element={<Frontend user={user} />} />
            <Route path="/admin" element={<Backend user={user} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
