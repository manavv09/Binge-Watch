import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider, appleProvider } from '../utils/firebase';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthSignIn = async (provider) => {
    setError('');
    
    if (auth.app.options.apiKey === 'demo-key') {
      setError('Firebase is in demo mode. Please configure your .env file with real Firebase credentials to use Authentication.');
      return;
    }

    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials.');
      } else {
        setError(err.message.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (auth.app.options.apiKey === 'demo-key') {
      setError('Firebase is in demo mode. Please configure your .env file with real Firebase credentials to use Authentication.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[3000] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div 
          className="w-full max-w-[420px] bg-bg-surface rounded-[24px] p-8 md:p-10 relative text-center backdrop-blur-xl border border-glass-border shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-5 right-5 w-9 h-9 bg-bg-surface-active border border-glass-border text-text-primary rounded-full flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5 hover:bg-bg-surface-hover cursor-pointer shadow-sm" onClick={onClose}>
            <X size={20} />
          </button>
          
          <h2 className="text-3xl mb-2 text-text-primary font-bold tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-text-secondary text-[0.95rem] mb-8 font-medium">
            {isLogin ? 'Log in to access your watchlist and ratings.' : 'Sign up to start saving your favorite movies and series.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-danger/10 text-danger p-3.5 rounded-xl text-[0.85rem] border border-danger/20 mb-2 text-left font-medium">{error}</div>}
            
            <div className="relative flex items-center">
              <Mail className="absolute left-4 text-text-muted" size={18} />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-bg-surface-active border border-glass-border rounded-xl py-3.5 pr-4 pl-12 text-text-primary text-[0.95rem] transition-all duration-150 focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
              />
            </div>
            
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-text-muted" size={18} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                className="w-full bg-bg-surface-active border border-glass-border rounded-xl py-3.5 pr-4 pl-12 text-text-primary text-[0.95rem] transition-all duration-150 focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10"
              />
            </div>

            <button type="submit" className="mt-4 p-4 rounded-xl text-base w-full inline-flex items-center justify-center gap-2 bg-text-primary text-bg-base font-bold transition-all duration-150 hover:bg-accent-primary hover:text-white hover:-translate-y-0.5 hover:shadow-xl active:scale-95 border-none cursor-pointer disabled:opacity-70" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'LOG IN' : 'SIGN UP')}
            </button>
          </form>

          <div className="relative my-8 text-center before:content-[''] before:absolute before:top-1/2 before:left-0 before:w-full before:h-[1px] before:bg-glass-border">
            <span className="relative bg-bg-surface px-4 text-text-muted text-[0.75rem] font-bold uppercase tracking-widest">or continue with</span>
          </div>

          <div className="flex gap-4 justify-center">
            {[
              { provider: googleProvider, title: 'Google', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              )},
              { provider: githubProvider, title: 'GitHub', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              )},
              { provider: appleProvider, title: 'Apple', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
              )}
            ].map((item, idx) => (
              <button 
                key={idx}
                className="flex items-center justify-center w-full p-4 rounded-xl bg-bg-surface-active border border-glass-border text-text-primary transition-all duration-150 hover:bg-bg-surface-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm" 
                onClick={() => handleOAuthSignIn(item.provider)}
                disabled={loading}
                title={`Continue with ${item.title}`}
              >
                {item.icon}
              </button>
            ))}
          </div>

          <div className="mt-8 text-[0.95rem] text-text-secondary font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="text-accent-primary font-bold hover:underline bg-transparent border-none cursor-pointer p-0" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
