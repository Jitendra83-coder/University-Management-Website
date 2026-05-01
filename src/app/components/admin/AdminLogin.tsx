import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL, supabase } from '../../lib/supabase';

const DEFAULT_SUPERADMIN_EMAIL = 'js129476@gmail.com';
const DEFAULT_SUPERADMIN_PASSWORD = 'Jitendra@83';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');

  const handleBackendAdminLogin = async () => {
    let response: Response;
    try {
      response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    } catch (err) {
      console.error('Network error contacting backend auth endpoint:', err);
      throw new Error('Unable to reach authentication server');
    }

    const loginData = await response.json();

    if (!response.ok || loginData.error) {
      throw new Error(loginData.error || 'Admin login failed');
    }

    localStorage.setItem('admin_token', loginData.access_token);
    localStorage.setItem('admin_user', JSON.stringify(loginData.user));
    toast.success('Login successful!');
    navigate('/admin/dashboard');
  };

  const handleDefaultAdminRecovery = async () => {
    try {
      await handleBackendAdminLogin();
      return;
    } catch (backendError) {
      console.warn('Backend admin login recovery failed:', backendError);
    }

    try {
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'admin', name: 'Super Admin' } },
      });

      if (signupError && !signupError.message.toLowerCase().includes('already')) {
        throw signupError;
      }
    } catch (signupError) {
      console.warn('Direct admin signup fallback failed:', signupError);
    }

    const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (retryError || !retryData.session?.access_token) {
      throw new Error(retryError?.message || 'Admin login failed');
    }

    localStorage.setItem('admin_token', retryData.session.access_token);
    localStorage.setItem('admin_user', JSON.stringify(retryData.user));
    toast.success('Login successful!');
    navigate('/admin/dashboard');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      try {
        await handleBackendAdminLogin();
        return;
      } catch (backendError) {
        console.warn('Backend admin login failed:', backendError);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session?.access_token) {
        console.error('Login error:', error);

        if (email === DEFAULT_SUPERADMIN_EMAIL && password === DEFAULT_SUPERADMIN_PASSWORD) {
          try {
            await handleDefaultAdminRecovery();
            return;
          } catch (recoveryError) {
            console.error('Default admin recovery failed:', recoveryError);
            const msg = recoveryError instanceof Error ? recoveryError.message : 'Invalid login credentials';
            if (msg === 'Failed to fetch' || msg.includes('reach authentication')) {
              toast.error('Unable to reach authentication server. Please try again later.');
            } else {
              toast.error(msg);
            }
            return;
          }
        }

        toast.error(error?.message || 'Invalid login credentials');
        return;
      }

      const role = (data.user?.user_metadata as any)?.role;
      if (role && role !== 'admin') {
        toast.error('Unauthorized: admin access required');
        return;
      }

      localStorage.setItem('admin_token', data.session.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const signupData = await response.json();

      if (!response.ok || signupData.error) {
        console.error('Signup error:', signupData);
        toast.error(signupData.error || 'Signup failed');
        return;
      }

      toast.success('Account created! Please log in.');
      setIsSignup(false);
      setPassword('');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
          <GraduationCap className="w-6 h-6" />
          <span className="font-semibold">Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-blue-100">
            {isSignup ? 'Create your admin account' : 'Manage UK Universities'}
          </p>
        </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="p-8">
          {isSignup && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600 border-t">
          Secure admin access only
        </div>
      </div>
    </div>
  );
}

