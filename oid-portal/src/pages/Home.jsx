import { useState, useEffect } from 'react';
import { Link } from '../lib/router';

const Home = () => {
  const [stats, setStats] = useState({
    totalBadges: 0,
    activeBadges: 0,
    pendingBadges: 0,
    revokedBadges: 0
  });
  
  const [recentBadges, setRecentBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setStats({
        totalBadges: 126,
        activeBadges: 98,
        pendingBadges: 18,
        revokedBadges: 10
      });
      
      setRecentBadges([
        { id: 'OID.1.3.6.1.4.1.0001', name: 'Admin Access', status: 'active', issueDate: '2025-04-20', owner: 'John Smith' },
        { id: 'OID.1.3.6.1.4.1.0002', name: 'Developer Access', status: 'active', issueDate: '2025-04-19', owner: 'Jane Doe' },
        { id: 'OID.1.3.6.1.4.1.0003', name: 'Guest Access', status: 'pending', issueDate: '2025-04-22', owner: 'Alex Johnson' },
        { id: 'OID.1.3.6.1.4.1.0004', name: 'Revoked Badge', status: 'revoked', issueDate: '2025-03-15', owner: 'Michael Brown' }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-success';
      case 'pending': return 'bg-primary';
      case 'revoked': return 'bg-danger';
      default: return 'bg-border-color';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Welcome to the BrainSAIT OID Badge Management System</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card p-5 animate-pulse-slow">
              <div className="h-4 bg-darker-bg rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-darker-bg rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Total Badges</p>
                <h3 className="text-3xl font-bold text-text-primary mt-1">{stats.totalBadges}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Active Badges</p>
                <h3 className="text-3xl font-bold text-success mt-1">{stats.activeBadges}</h3>
              </div>
              <div className="p-3 rounded-full bg-success/10 text-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Pending Badges</p>
                <h3 className="text-3xl font-bold text-primary mt-1">{stats.pendingBadges}</h3>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">Revoked Badges</p>
                <h3 className="text-3xl font-bold text-danger mt-1">{stats.revokedBadges}</h3>
              </div>
              <div className="p-3 rounded-full bg-danger/10 text-danger">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Recent Badges</h2>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4 animate-pulse-slow">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="mb-4">
                      <div className="h-4 bg-darker-bg rounded w-full mb-2"></div>
                      <div className="h-4 bg-darker-bg rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-border-color">
                  <thead className="bg-darker-bg">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        OID/Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Issue Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {recentBadges.map((badge) => (
                      <tr key={badge.id} className="hover:bg-darker-bg transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">{badge.name}</div>
                          <div className="text-xs text-text-secondary">{badge.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-primary">{badge.owner}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(badge.status)}`}>
                            {badge.status.charAt(0).toUpperCase() + badge.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {badge.issueDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link to={`/edit/${badge.id}`} className="text-primary hover:text-primary-light">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-border-color">
              <Link to="/register" className="text-sm text-primary hover:text-primary-light font-medium">
                Register New Badge
              </Link>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link to="/register" className="flex items-center p-3 hover:bg-darker-bg rounded-md transition-colors">
                    <div className="p-2 rounded-md bg-primary/10 text-primary mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-text-primary font-medium">Register New Badge</h3>
                      <p className="text-xs text-text-secondary">Create a new OID badge in the system</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/oid-tree" className="flex items-center p-3 hover:bg-darker-bg rounded-md transition-colors">
                    <div className="p-2 rounded-md bg-secondary/10 text-secondary mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-text-primary font-medium">View OID Tree</h3>
                      <p className="text-xs text-text-secondary">Explore the hierarchical OID structure</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="flex items-center p-3 hover:bg-darker-bg rounded-md transition-colors">
                    <div className="p-2 rounded-md bg-primary/10 text-primary mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-text-primary font-medium">Chat Assistant</h3>
                      <p className="text-xs text-text-secondary">Get help from our AI Assistant</p>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="card mt-6">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">System Status</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-text-primary">API Server</span>
                  </div>
                  <span className="text-xs text-text-secondary">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-text-primary">Database</span>
                  </div>
                  <span className="text-xs text-text-secondary">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-text-primary">Authentication</span>
                  </div>
                  <span className="text-xs text-text-secondary">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-text-primary">LLM Integration</span>
                  </div>
                  <span className="text-xs text-text-secondary">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
