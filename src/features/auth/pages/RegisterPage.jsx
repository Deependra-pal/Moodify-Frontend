import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Music, Loader2, AlertCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(''); // UI only at registration (backend register schema doesn't consume this, but it's required in UI specs)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Client side validation
  const validateForm = () => {
    const tempErrors = {};
    if (!username.trim()) {
      tempErrors.username = 'Username is required';
    } else if (username.trim().length < 3) {
      tempErrors.username = 'Username must be at least 3 characters long';
    }

    if (!email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please provide a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Backend registration endpoint only consumes username, email, password
      await register(username, email, password);

      // On success, redirect to login page with email state so the user can easily log in
      navigate('/login', { state: { registeredEmail: email } });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors && Array.isArray(data.errors)) {
          const fieldErrors = {};
          data.errors.forEach((validationErr) => {
            fieldErrors[validationErr.field] = validationErr.message;
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ api: data.message || 'Registration failed. Please check details.' });
        }
      } else {
        setErrors({ api: 'Unable to connect to the server. Please check your connection.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#121212] px-4 py-8 text-white">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-[#181818] p-6 shadow-2xl border border-neutral-900">

        {/* Header/Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] shadow-md shadow-[#1db954]/20">
            <Music className="h-6 w-6 text-black fill-current" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white select-none">
            Create Account
          </h2>
          <p className="mt-0.5 text-xs text-neutral-400">
            Join Moodify to stream music by your expressions.
          </p>
        </div>

        {/* Global API Error */}
        {errors.api && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{errors.api}</p>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">

            {/* Row 1: Full Name & Username in Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 border border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20 outline-none focus:ring-2 transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 border ${errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
                      } outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="johndoe"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.username}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Email Address */}
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
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
                    } outline-none focus:ring-2 transition-all duration-200`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Row 3: Password & Confirm Password in Grid */}
            <div className="grid grid-cols-2 gap-3">
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
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-10 text-xs text-white placeholder-neutral-500 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-neutral-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full rounded-lg bg-[#242424] py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-transparent focus:border-[#1db954] focus:ring-[#1db954]/20'
                      } outline-none focus:ring-2 transition-all duration-200`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

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
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        {/* Navigate to Login */}
        <div className="mt-4 text-center text-xs border-t border-neutral-900 pt-4">
          <span className="text-neutral-400">Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-[#1db954] hover:underline"
          >
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
