import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, Building2 } from 'lucide-react';

export function Root() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <GraduationCap className="w-8 h-8" />
              UK Universities
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                to="/universities" 
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Universities
              </Link>
              {/* Admin link intentionally removed — access via /admin URL only */}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <GraduationCap className="w-6 h-6" />
                UK Universities
              </div>
              <p className="text-gray-400">
                Your comprehensive guide to universities in the United Kingdom. Find the perfect institution for your academic journey.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/universities" className="hover:text-white transition-colors">All Universities</Link></li>
                {/* Admin Login removed from public quick links; access via /admin */}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: info@ukuniversities.com<br />
                Phone: +977 9825589931
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 UK Universities. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

