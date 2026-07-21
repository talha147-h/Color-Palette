import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

// Regex constants hoisted to module scope for readability and to avoid
// re-creating them on every keystroke.
const RE_UPPER = /[A-Z]/;
const RE_LOWER = /[a-z]/;
const RE_DIGIT = /\d/;
const RE_SPECIAL = /[@$!%*?&]/;
const RE_ALLOWED = /^[A-Za-z\d@$!%*?&]+$/;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'distribution_staff'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    allowedChars: false
  });

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const panelLeftVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } }
  };

  const onChange = e => {
    const { name: fieldName, value } = e.target;

    // If user edits password, run quick client-side checks
    if (fieldName === 'password') {
      const { checks } = validatePassword(value);
      setPasswordChecks(checks);
    }

    // Clear any error when user starts correcting password/confirmPassword
    if ((fieldName === 'password' || fieldName === 'confirmPassword') && error) {
      setError('');
    }

    // Use functional setState to avoid stale state
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Validate password rules client-side and return failed rule messages
  const validatePassword = (pwd) => {
    const checks = {
      minLength: pwd.length >= 8,
      uppercase: RE_UPPER.test(pwd),
      lowercase: RE_LOWER.test(pwd),
      number: RE_DIGIT.test(pwd),
      special: RE_SPECIAL.test(pwd),
      // Ensure password contains only allowed characters (match backend charset)
      allowedChars: RE_ALLOWED.test(pwd)
    };

    const failed = [];
    if (!checks.minLength) failed.push('Password must be at least 8 characters long.');
    if (!checks.uppercase) failed.push('Password must contain at least one uppercase letter (A-Z).');
    if (!checks.lowercase) failed.push('Password must contain at least one lowercase letter (a-z).');
    if (!checks.number) failed.push('Password must contain at least one number (0-9).');
    if (!checks.special) failed.push('Password must contain at least one special character (@$!%*?&).');
    if (!checks.allowedChars) failed.push('Password contains invalid characters; only A-Z, a-z, 0-9 and @$!%*?& are allowed.');

    return { checks, failed };
  };

  // If the browser auto-fills the password field (or there's an initial value),
  // run the password checks on mount so the UI reflects the real state.
  // Run once on mount to handle browser autofill edge-cases. Live typing
  // updates `passwordChecks` via onChange, so re-running on every password
  // change would be redundant.
  useEffect(() => {
    // 1) Validate current state
    setPasswordChecks(validatePassword(password).checks);
    // 2) If the DOM input was autofilled post-mount, update checks only.
    // Avoid writing autofilled passwords into React state to reduce the
    // chance of accidental secret leakage being flagged by scanners.
    const domVal = passwordRef.current?.value ?? '';
    if (domVal && domVal !== password) {
      setPasswordChecks(validatePassword(domVal).checks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async e => {
    e.preventDefault();

    // Validate passwords match
    // If browser autofilled but React state didn't update, read values from DOM refs.
    const effectivePassword = password || passwordRef.current?.value || '';
    const effectiveConfirm = confirmPassword || confirmRef.current?.value || '';

    if (effectivePassword !== effectiveConfirm) {
      setError('Passwords do not match');
      return;
    }

    // Client-side validate password rules and show the first failed rule (specific)
    const { failed } = validatePassword(effectivePassword);
    if (failed.length > 0) {
      setError(failed[0]);
      return;
    }

    try {
      setLoading(true);
      // Remove confirmPassword from data sent to API. Use effectivePassword to
      // read the DOM value if React state is stale (autofill case). We avoid
      // writing the autofilled password into state to reduce secret exposure.
      const registerData = {
        name,
        email,
        password: effectivePassword,
        role // User-selected role
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/register`, registerData);

      // Redirect to login page on successful registration
      navigate('/');
    } catch (err) {
      // Prepare to show validation message(s) at the top alert
      if (!err.response) {
        setError('Network error. Please try again.');
        return;
      }

      const resp = err.response?.data;
      // If backend returned structured validation errors, map them to fieldErrors
      if (resp?.errors && Array.isArray(resp.errors)) {
        const newFieldErrors = {};
        resp.errors.forEach(group => {
          (group.details || []).forEach(detail => {
            const f = detail.field || 'unknown';
            // Accumulate messages per field
            if (!newFieldErrors[f]) newFieldErrors[f] = [];
            // strip quotes from Joi messages for cleaner UI
            const msg = (detail.message || '').replace(/"/g, '');
            newFieldErrors[f].push(msg);
          });
        });
        if (newFieldErrors.password && newFieldErrors.password.length > 0) {
          // Prefer backend-provided password message(s)
          setError(newFieldErrors.password.join('; '));
        } else if (resp.message) {
          setError(resp.message);
        } else {
          setError('Registration failed');
        }
      } else {
        setError(resp?.message || resp?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-4 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Welcome Panel */}
        <motion.div
          variants={panelLeftVariants}
          className="hidden lg:flex flex-col justify-center relative overflow-hidden rounded-l-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white px-12 py-20 shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 left-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 right-10 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 mx-auto text-center max-w-sm">
            <motion.div variants={itemVariants} className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </motion.div>
            <motion.p variants={itemVariants} className="text-lg font-medium text-emerald-100 mb-2">Join Us Today</motion.p>
            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">ApothecaryShop</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-emerald-100 leading-relaxed">Start managing your pharmaceutical inventory with our advanced platform</motion.p>
            
            {/* Feature highlights */}
            <motion.div variants={itemVariants} className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Multi-location support</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">24/7 customer support</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl border border-white/20 p-4 md:p-6"
        >
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Create Account</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Already have an account? <Link to="/" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200">Sign in here</Link>
            </p>
          </div>

          {error && (
            <motion.div
              id="form-error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm"
              role="alert"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="block sm:inline font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          <motion.form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="distribution_staff">Distribution Staff</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="procurement_staff">Procurement Staff</option>
                  <option value="staff">Staff</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Select your role in the organization</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                    ref={passwordRef}
                  value={password}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                  aria-describedby="password-rules"
                  aria-invalid={Boolean(error)}
                  aria-errormessage="form-error"
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password rules shown below the input */}
              <div id="password-rules" className="mt-2 text-xs text-gray-500" aria-live="polite" aria-atomic="false">
                <ul className="list-inside space-y-2">
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.minLength ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.minLength ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.minLength ? 'Met' : 'Not met'}: </span>
                    <span>At least 8 characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.uppercase ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.uppercase ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.uppercase ? 'Met' : 'Not met'}: </span>
                    <span>One uppercase letter (A-Z)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.lowercase ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.lowercase ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.lowercase ? 'Met' : 'Not met'}: </span>
                    <span>One lowercase letter (a-z)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.number ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.number ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.number ? 'Met' : 'Not met'}: </span>
                    <span>One number (0-9)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.special ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.special ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.special ? 'Met' : 'Not met'}: </span>
                    <span>One special character (@$!%*?&)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span aria-hidden="true" className={passwordChecks.allowedChars ? 'text-green-600' : 'text-gray-300'}>{passwordChecks.allowedChars ? '✔' : '•'}</span>
                    <span className="sr-only">{passwordChecks.allowedChars ? 'Met' : 'Not met'}: </span>
                    <span>Only allowed characters (A-Z, a-z, 0-9, @$!%*?&)</span>
                  </li>
                </ul>
              </div>

              {/* Validation warnings are shown in the top alert only */}
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    ref={confirmRef}
                    value={confirmPassword}
                    onChange={onChange}
                    required
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating…' : 'Create Account'}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;