import React, { useState, useEffect } from 'react';
import { account } from '../config/Appwrite';
import { useNavigate, Link } from 'react-router-dom';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signup'); // Default to signup tab
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const navigate = useNavigate();

  // Animation on mount and session check
  useEffect(() => {
    setMounted(true);
    
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const session = await account.get();
        console.log("User already logged in:", session);
        // If user is logged in, redirect to home
        navigate("/home");
      } catch (error) {
        console.log("No active session");
        // User is not logged in, stay on auth page
      }
    };
    
    checkSession();
    
    // Clear form fields on mount to prevent auto-fill
    const clearFields = () => {
      setLoginData({ email: '', password: '' });
      setSignupData({ name: '', email: '', password: '' });
      
      // Force clear any auto-filled values
      setTimeout(() => {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        const textInputs = document.querySelectorAll('input[type="text"]');
        
        emailInputs.forEach(input => {
          input.value = '';
          input.setAttribute('value', '');
        });
        
        passwordInputs.forEach(input => {
          input.value = '';
          input.setAttribute('value', '');
        });
        
        textInputs.forEach(input => {
          if (input.placeholder && !input.placeholder.includes('hidden')) {
            input.value = '';
            input.setAttribute('value', '');
          }
        });
      }, 100);
    };
    
    clearFields();
  }, [navigate]);

  // Clear fields only when switching tabs or on mount
  useEffect(() => {
    if (activeTab === 'login') {
      // Clear fields when login tab becomes active
      setLoginData({ email: '', password: '' });
      
      // Immediate DOM clearing
      const clearFieldsImmediately = () => {
        const emailInput = document.querySelector('input[name="user_email_input"]');
        const passwordInput = document.querySelector('input[name="user_password_input"]');
        
        if (emailInput) {
          emailInput.value = '';
          emailInput.setAttribute('value', '');
        }
        
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.setAttribute('value', '');
        }
      };
      
      // Clear immediately and then once more after a delay
      clearFieldsImmediately();
      setTimeout(clearFieldsImmediately, 100);
    } else if (activeTab === 'signup') {
      // Clear fields when signup tab becomes active
      setSignupData({ name: '', email: '', password: '' });
      
      // Immediate DOM clearing
      const clearFieldsImmediately = () => {
        const nameInput = document.querySelector('input[name="user_name_input"]');
        const emailInput = document.querySelector('input[name="user_signup_email_input"]');
        const passwordInput = document.querySelector('input[name="user_signup_password_input"]');
        
        if (nameInput) {
          nameInput.value = '';
          nameInput.setAttribute('value', '');
        }
        
        if (emailInput) {
          emailInput.value = '';
          emailInput.setAttribute('value', '');
        }
        
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.setAttribute('value', '');
        }
      };
      
      // Clear immediately and then once more after a delay
      clearFieldsImmediately();
      setTimeout(clearFieldsImmediately, 100);
    }
  }, [activeTab]);

  // Continuous anti-auto-fill protection for both tabs
  useEffect(() => {
    if (activeTab === 'login') {
      const interval = setInterval(() => {
        const emailInput = document.querySelector('input[name="user_email_input"]');
        const passwordInput = document.querySelector('input[name="user_password_input"]');
        
        // Only clear if fields have auto-filled values but React state is empty
        if (emailInput && emailInput.value && !loginData.email) {
          emailInput.value = '';
          emailInput.setAttribute('value', '');
        }
        
        if (passwordInput && passwordInput.value && !loginData.password) {
          passwordInput.value = '';
          passwordInput.setAttribute('value', '');
        }
      }, 2000); // Check every 2 seconds to reduce flickering
      
      return () => clearInterval(interval);
    } else if (activeTab === 'signup') {
      const interval = setInterval(() => {
        const nameInput = document.querySelector('input[name="user_name_input"]');
        const emailInput = document.querySelector('input[name="user_signup_email_input"]');
        const passwordInput = document.querySelector('input[name="user_signup_password_input"]');
        
        // Only clear if fields have auto-filled values but React state is empty
        if (nameInput && nameInput.value && !signupData.name) {
          nameInput.value = '';
          nameInput.setAttribute('value', '');
        }
        
        if (emailInput && emailInput.value && !signupData.email) {
          emailInput.value = '';
          emailInput.setAttribute('value', '');
        }
        
        if (passwordInput && passwordInput.value && !signupData.password) {
          passwordInput.value = '';
          passwordInput.setAttribute('value', '');
        }
      }, 2000); // Check every 2 seconds to reduce flickering
      
      return () => clearInterval(interval);
    }
  }, [activeTab, loginData.email, loginData.password, signupData.name, signupData.email, signupData.password]);



  // Signup function
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupData.name || !signupData.email || !signupData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting signup with:", signupData.email);
      const response = await account.create(
        signupData.name,
        signupData.email,
        signupData.password,
        signupData.name,
      );
      console.log("Signup successful!", response);
      alert("SignUp successfully");
      navigate("/home");
    } catch (error) {
      console.log("Signup error:", error);
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", loginData.email);
      
      // First, try to get current session to check if user is already logged in
      try {
        const currentSession = await account.get();
        console.log("User already logged in:", currentSession);
        // If we reach here, user is already logged in, so just navigate
        navigate("/home");
        return;
      } catch (sessionError) {
        // User is not logged in, proceed with login
        console.log("No active session, proceeding with login");
      }
      
      const session = await account.createEmailPasswordSession(loginData.email, loginData.password);
      console.log("Login successful!", session);
      navigate("/home");
    } catch (error) {
      console.log("Login error:", error);
      if (error.message.includes("session is active")) {
        setError("You are already logged in. Redirecting to home...");
        setTimeout(() => navigate("/home"), 2000);
      } else if (error.code === 401) {
        setError("Invalid email or password or Try with a verified email. Please try again.");
      } else if (error.code === 429) {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(error.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth functions
  const handleGoogleAuth = async (type) => {
    try {
      setGoogleLoading(true);
      setError("");
      const successUrl = window.location.origin + "/home";
      const failureUrl = window.location.origin + "/";
      console.log(`Starting Google OAuth for ${type}...`);
      await account.createOAuth2Session('google', successUrl, failureUrl);
    } catch (error) {
      console.log("Google OAuth error:", error);
      setError(`Google ${type} failed. Please try again.`);
    } finally {
      setGoogleLoading(false);
    }
  }

;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white flex items-center justify-center p-6 relative overflow-hidden">
             {/* Enhanced Animated Background Elements */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {/* Multi-colored Floating Blobs */}
         <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-1000"></div>
         <div className="absolute bottom-20 right-40 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
         
         {/* Animated Grid Pattern */}
         <div className="absolute inset-0 opacity-5">
           <div className="absolute inset-0" style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
             backgroundSize: '40px 40px',
             animation: 'float 8s ease-in-out infinite'
           }}></div>
         </div>
         
         {/* Animated Light Rays */}
         <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
         <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-pulse animation-delay-1000"></div>
         <div className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-pulse animation-delay-2000"></div>
         
         {/* Floating Icons */}
         <div className="absolute top-20 right-20 text-blue-400/40 animate-bounce-slow">
           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
             <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
           </svg>
         </div>
         <div className="absolute bottom-20 left-20 text-purple-400/40 animate-bounce-slow animation-delay-2000">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
             <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
           </svg>
         </div>
         <div className="absolute top-1/2 left-10 text-cyan-400/40 animate-bounce-slow animation-delay-4000">
           <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
             <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
             <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
           </svg>
         </div>
         <div className="absolute top-1/4 right-10 text-pink-400/40 animate-bounce-slow animation-delay-3000">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
           </svg>
         </div>
       </div>

             {/* Enhanced Floating Particles */}
       <div className="absolute inset-0 pointer-events-none">
         {[...Array(30)].map((_, i) => (
           <div
             key={i}
             className={`absolute w-1 h-1 rounded-full animate-float ${
               i % 4 === 0 ? 'bg-blue-400/60' : 
               i % 4 === 1 ? 'bg-purple-400/60' : 
               i % 4 === 2 ? 'bg-cyan-400/60' : 'bg-pink-400/60'
             }`}
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animationDelay: `${Math.random() * 4}s`,
               animationDuration: `${3 + Math.random() * 3}s`,
               width: `${1 + Math.random() * 2}px`,
               height: `${1 + Math.random() * 2}px`
             }}
           ></div>
         ))}
       </div>

      <div className={`w-full max-w-5xl relative z-10 transition-all duration-1000 ease-out ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="flex items-center justify-center gap-12">
          {/* Logo/Brand - Left Side */}
          <div className="flex-1 max-w-md animate-fade-in">
            <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4 animate-bounce-slow">
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3 animate-slide-up">
              Dev Seekho
            </h1>
            <p className="text-lg text-blue-600 font-medium animate-slide-up animation-delay-200 mb-4">
              Welcome to your learning journey
            </p>
            <div className="space-y-3 animate-slide-up animation-delay-300">
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Learn from industry experts</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Build real-world projects</span>
              </div>
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Get certified and job-ready</span>
              </div>
            </div>
          </div>

                  {/* Auth Card - Right Side */}
        <div className="flex-1 max-w-md">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 animate-slide-up animation-delay-300">

          {/* Enhanced Tab Navigation */}
          <div className="flex mb-6 bg-blue-50 rounded-xl p-1 relative overflow-hidden">
            {/* Animated background for active tab */}
            <div 
              className={`absolute top-1 bottom-1 bg-white rounded-lg shadow-md transition-all duration-500 ease-out transform ${
                activeTab === 'signup' ? 'left-1 w-1/2 scale-100' : 'left-[calc(50%-2px)] w-1/2 scale-100'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
              }}
            ></div>
            
            {/* Glowing effect for active tab */}
            <div 
              className={`absolute top-1 bottom-1 rounded-lg transition-all duration-500 ease-out ${
                activeTab === 'signup' ? 'left-1 w-1/2' : 'left-[calc(50%-2px)] w-1/2'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                filter: 'blur(8px)',
                 opacity: 0.6
              }}
            ></div>
            
            <button
              onClick={() => {
                setActiveTab('signup');
                setError("");
                // Clear fields when switching tabs
                setLoginData({ email: '', password: '' });
                setSignupData({ name: '', email: '', password: '' });
              }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 transform hover:scale-105 active:scale-95 ${
                activeTab === 'signup'
                  ? 'text-blue-600 drop-shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative">
                Sign Up
                {activeTab === 'signup' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                )}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab('login');
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 transform hover:scale-105 active:scale-95 ${
                activeTab === 'login'
                  ? 'text-blue-600 drop-shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative">
                Login
                {activeTab === 'login' && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></span>
                )}
              </span>
            </button>
          </div>

                     {/* Enhanced Error Message */}
           {error && (
             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake relative overflow-hidden">
               {/* Animated background */}
               <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 animate-pulse"></div>
               
               <div className="flex items-center relative z-10">
                 <div className="relative">
                   <svg className="w-5 h-5 text-red-500 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                   {/* Sparkle effect */}
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-sparkle"></div>
                 </div>
                 <p className="text-red-700 text-sm font-medium">{error}</p>
               </div>
               
               {/* Ripple effect on error */}
               <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-400/30 rounded-full animate-ripple transform -translate-x-1/2 -translate-y-1/2"></div>
             </div>
           )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 animate-fade-in">
                              <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors duration-200">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="user_name_input"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your full name"
                      disabled={loading}
                      required
                      autoComplete="off"
                      autoFill="off"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-testid="name-input"
                    />
                  </div>
                </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors duration-200">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="user_signup_email_input"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                    autoComplete="off"
                    autoFill="off"
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-testid="signup-email-input"
                  />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors duration-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="user_signup_password_input"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Create your password"
                    disabled={loading}
                    required
                    autoComplete="off"
                    autoFill="off"
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bwignore="true"
                    data-testid="signup-password-input"
                  />
                </div>
              </div>

                              <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Floating particles on hover */}
                  <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce transition-all duration-300"></div>
                  <div className="absolute top-3 right-6 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce animation-delay-200 transition-all duration-300"></div>
                  <div className="absolute bottom-3 left-6 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce animation-delay-400 transition-all duration-300"></div>
                  
                  <span className="relative z-10">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Account
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </span>
                </button>
            </form>
          )}

                      {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                {/* Hidden fields to prevent auto-fill */}
                <input type="text" style={{ display: 'none' }} autoComplete="off" />
                <input type="password" style={{ display: 'none' }} autoComplete="off" />
                <input type="email" style={{ display: 'none' }} autoComplete="off" />
                <input type="text" name="username" style={{ display: 'none' }} autoComplete="off" />
                <input type="password" name="password" style={{ display: 'none' }} autoComplete="off" />
                <input type="email" name="email" style={{ display: 'none' }} autoComplete="off" />
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors duration-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="user_email_input"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your email"
                      disabled={loading}
                      required
                      autoComplete="off"
                      autoFill="off"
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-bwignore="true"
                      data-autocomplete="off"
                      data-akamai-gtm="off"
                      data-testid="email-input"
                      style={{
                        WebkitTextFillColor: 'inherit',
                        WebkitBoxShadow: '0 0 0px 1000px transparent inset',
                        transition: 'background-color 5000s ease-in-out 0s'
                      }}
                    />
                  </div>
                </div>
              
                              <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 group-focus-within:text-blue-600 transition-colors duration-200">
                    Password
                  </label>
                  <div className="relative">
                                          <input
                        type="password"
                        name="user_password_input"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your password"
                        disabled={loading}
                        required
                        autoComplete="off"
                        autoFill="off"
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-bwignore="true"
                        data-testid="password-input"
                        style={{
                          WebkitTextFillColor: 'inherit',
                          WebkitBoxShadow: '0 0 0px 1000px transparent inset',
                          transition: 'background-color 5000s ease-in-out 0s'
                        }}
                      />
                  </div>
                </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Floating particles on hover */}
                <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce transition-all duration-300"></div>
                <div className="absolute top-3 right-6 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce animation-delay-200 transition-all duration-300"></div>
                <div className="absolute bottom-3 left-6 w-1 h-1 bg-white/60 rounded-full opacity-0 hover:opacity-100 hover:animate-bounce animation-delay-400 transition-all duration-300"></div>
                
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Sign In
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </span>
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={() => handleGoogleAuth(activeTab)}
            disabled={googleLoading}
            className={`w-full py-3 px-6 border-2 border-gray-200 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 ${
              googleLoading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.938,3.042l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.938,3.042l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.859,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.193l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.541,5.036C9.782,39.556,16.413,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.104,5.591c0.001-0.001,0.001-0.001,0.002-0.001l6.19,5.238C36.95,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            {googleLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Connecting...
              </div>
            ) : (
              `Continue with Google`
            )}
          </button>

          {/* Terms and Privacy */}
          <p className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <Link to="#" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
            {' '}and{' '}
            <Link to="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
          </p>
          

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
