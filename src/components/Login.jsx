import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const { login, authError, setAuthError, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const from = location.state?.from || '/profile';
      navigate(from);
    }
  }, [user, navigate, location]);

  useEffect(() => {
    // Clear errors on mount
    setAuthError('');
    setFormError('');
  }, [setAuthError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    setLocalLoading(true);
    const success = await login(email, password);
    setLocalLoading(false);

    if (success) {
      const from = location.state?.from || '/profile';
      navigate(from);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to manage your orders and cart details</p>
        </div>

        {(formError || authError) && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{formError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={localLoading}
          >
            {localLoading ? (
              <span className="spinner-small"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
          <div className="demo-credentials-box">
            <h4>Demo Credentials:</h4>
            <p><strong>User:</strong> user@infinityjewls.com / <code>user123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
