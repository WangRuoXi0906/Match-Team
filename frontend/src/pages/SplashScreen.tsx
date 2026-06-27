import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 每次启动都清除登录状态，强制重新登录
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
          <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/20 rounded-full blur-xl" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-3 tracking-wide">竞赛组队</h1>
      <p className="text-blue-100 text-lg mb-12">携手同行 · 共创辉煌</p>
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-white/60 animate-pulse ${i === 0 ? 'w-6' : ''}`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
