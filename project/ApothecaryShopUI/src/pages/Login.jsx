import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
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
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, formData);
      
      const token = res.data.token;
      // Set Bearer token in localStorage with proper format
      localStorage.setItem('token', `Bearer ${token}`);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      console.log('Login successful, stored user:', res.data.user);
      
      // Set default Authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuth({
        token: `Bearer ${token}`,
        isAuthenticated: true,
        user: res.data.user,
        loading: false
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-6 px-4 sm:px-6 lg:px-8"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </motion.div>
            <motion.p variants={itemVariants} className="text-lg font-medium text-emerald-100 mb-2">Welcome To</motion.p>
            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">ApothecaryShop</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-emerald-100 leading-relaxed">Streamline your pharmaceutical inventory management with our comprehensive platform</motion.p>
            
            {/* Feature highlights */}
            <motion.div variants={itemVariants} className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Real-time inventory tracking</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Automated stock alerts</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Secure data management</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl border border-white/20 p-6 md:p-8"
        >
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Welcome Back</h1>
            </div>
            <p className="text-gray-600 text-base">
              New to our platform? <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200">Create your account</Link>
            </p>
          </div>

          {error && (
            <motion.div
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

          <motion.form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
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
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
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
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200">
                Forgot password?
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In to Dashboard
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;