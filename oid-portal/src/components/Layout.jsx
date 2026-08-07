import { useState, useEffect } from 'react';
import { Link, useLocation } from '../lib/router';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: 'home' },
    { name: 'Register Badge', path: '/register', icon: 'badge-plus' },
    { name: 'OID Tree', path: '/oid-tree', icon: 'hierarchy' },
    { name: 'Chat Assistant', path: '/chat', icon: 'message-circle' }
  ];

  // Icon component
  const Icon = ({ name }) => {
    switch (name) {
      case 'home':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        );
      case 'badge-plus':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="8" y1="10" x2="16" y2="10"/>
          </svg>
        );
      case 'hierarchy':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="6" height="6" rx="1"/>
            <rect x="16" y="7" width="6" height="6" rx="1"/>
            <rect x="9" y="16" width="6" height="6" rx="1"/>
            <path d="M5 13v3h14v-3"/>
            <path d="M12 7v9"/>
          </svg>
        );
      case 'message-circle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-text-primary">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-darker-bg border-r border-border-color transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border-color">
          <h1 className="text-lg font-semibold text-primary">BrainSAIT OID</h1>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-text-secondary hover:text-text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <nav className="mt-4 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-2 text-sm rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-text-primary'
                  : 'text-text-secondary hover:bg-content-bg hover:text-text-primary'
              }`}
            >
              <Icon name={item.icon} />
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-border-color">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium">BS</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text-primary">Admin User</p>
              <p className="text-xs text-text-secondary">Role: Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-darker-bg border-b border-border-color flex items-center justify-between px-4">
          {/* Mobile menu button */}
          {isMobile && (
            <button onClick={toggleSidebar} className="p-1 rounded-md text-text-secondary hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-1.5 pl-10 pr-4 text-sm bg-content-bg border border-border-color rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center">
            <button className="p-1 rounded-md text-text-secondary hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 bg-dark-bg">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
