import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Music, Loader2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after successful login
  const from = location.state?.from?.pathname || '/';

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Check if registration redirect carried a success state
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
      setSuccessMessage('Registration successful! Please log in with your credentials.');
      // Clear location state history to prevent message persisting on refresh
      window.history.replaceState({}, document.title);
    }

    // Load remembered email
    const savedEmail = localStorage.getItem('moodify_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [location]);

  // Client side validation
  const validateForm = () => {
    const tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);

      // Handle remember me logic
      if (rememberMe) {
        localStorage.setItem('moodify_remembered_email', email);
      } else {
        localStorage.removeItem('moodify_remembered_email');
      }

      // Redirect user to home
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((validationErr) => {
            fieldErrors[validationErr.field] = validationErr.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ api: data.message || 'Invalid email or password.' });
        }
      } else {
        setErrors({ api: 'Unable to connect to the server. Please check your connection.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot Password flow is UI-only. In a production environment, this would trigger an email password reset.');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#121212] px-4 py-8 text-white">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-[#181818] p-6 shadow-2xl border border-neutral-900">
        
        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] shadow-md shadow-[#1db954]/20 animate-pulse">
            <Music className="h-6 w-6 text-black fill-current" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white select-none">
            Moodify
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            Music tailored to your emotions.
          </p>
        </div>

        {/* Status Messages */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-2.5 text-xs text-green-400 border border-green-500/20">
            <p>{successMessage}</p>
          </div>
        )}

        {errors.api && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{errors.api}</p>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3.5">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 border ${
                    errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
                  } outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-10 text-xs text-white placeholder-neutral-500 border ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
                  } outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center cursor-pointer select-none gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-700 bg-[#242424] text-[#1db954] focus:ring-0 focus:ring-offset-0 accent-[#1db954]"
              />
              <span className="text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors">Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[11px] font-bold text-[#1db954] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-full bg-[#1db954] px-4 py-2.5 text-xs font-bold text-black shadow-lg hover:bg-[#1ed760] active:scale-95 disabled:pointer-events-none disabled:opacity-55 transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </div>
        </form>

        {/* Navigate to Register */}
        <div className="mt-4 text-center text-xs border-t border-neutral-900 pt-4">
          <span className="text-neutral-400">Don't have an account? </span>
          <Link
            to="/register"
            className="font-bold text-[#1db954] hover:underline"
          >
            Sign up for Moodify
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
