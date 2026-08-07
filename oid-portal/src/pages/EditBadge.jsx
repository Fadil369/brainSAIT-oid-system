import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../lib/router';

const EditBadge = () => {
  const { oid } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    oidParent: '',
    oidSuffix: '',
    owner: '',
    email: '',
    expiryDate: '',
    status: '',
    type: ''
  });
  
  const [initialData, setInitialData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    // Simulate fetching badge data
    setTimeout(() => {
      const badgeData = {
        name: 'Admin Access',
        description: 'Provides administrative access to BrainSAIT systems for privileged users.',
        oidParent: '1.3.6.1.4.1',
        oidSuffix: '9999.1',
        owner: 'System Administrator',
        email: 'admin@brainsait.org',
        expiryDate: '2026-04-25',
        status: 'active',
        type: 'access',
        createdAt: '2025-01-15',
        lastModified: '2025-03-20',
        usageCount: 42
      };
      
      setFormData(badgeData);
      setInitialData(badgeData);
      setIsLoading(false);
    }, 1000);
  }, [oid]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.oidSuffix.trim()) newErrors.oidSuffix = 'OID suffix is required';
    if (!/^[0-9.]+$/.test(formData.oidSuffix)) newErrors.oidSuffix = 'OID suffix can only contain numbers and dots';
    if (!formData.owner.trim()) newErrors.owner = 'Owner name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirect to home after successful update
      navigate('/');
    }, 1500);
  };
  
  const handleCancel = () => {
    // Reset form data to initial values
    if (initialData) {
      setFormData(initialData);
    }
    // Or navigate back
    navigate(-1);
  };
  
  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsSending(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `I recommend updating the description to be more specific about access levels. For example: "Provides top-level administrative access to BrainSAIT systems including database management, user administration, and configuration controls."`,
        `Based on the badge usage pattern, this appears to be a critical system badge. Consider adding a more restrictive expiration policy and limiting it to essential personnel only.`,
        `The current usage count of ${formData.usageCount} is quite high for an admin badge. This could indicate shared usage which is a security risk. Consider creating individual admin badges for each authorized user.`
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsSending(false);
    }, 1000);
  };

  // If loading show skeleton
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-pulse">
          <div className="h-8 bg-darker-bg rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-darker-bg rounded w-2/4"></div>
        </div>
        
        <div className="card animate-pulse p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-darker-bg rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-darker-bg rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-darker-bg rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-darker-bg rounded w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="h-4 bg-darker-bg rounded w-1/4 mb-2"></div>
              <div className="h-24 bg-darker-bg rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Edit Badge</h1>
        <p className="text-sm text-text-secondary mt-1">OID: {formData.oidParent}.{formData.oidSuffix}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Badge Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="label">Badge Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className={`input ${errors.name ? 'border-danger focus:ring-danger' : ''}`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="label">Badge Type</label>
                      <select
                        id="type"
                        name="type"
                        className="input"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="access">Access</option>
                        <option value="identity">Identity</option>
                        <option value="certificate">Certificate</option>
                        <option value="license">License</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="label">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className={`input ${errors.description ? 'border-danger focus:ring-danger' : ''}`}
                      value={formData.description}
                      onChange={handleChange}
                    ></textarea>
                    {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="oidParent" className="label">OID Parent</label>
                      <select
                        id="oidParent"
                        name="oidParent"
                        className="input"
                        value={formData.oidParent}
                        onChange={handleChange}
                      >
                        <option value="1.3.6.1.4.1">1.3.6.1.4.1 (Private Enterprise)</option>
                        <option value="1.3.6.1.5">1.3.6.1.5 (Security)</option>
                        <option value="1.3.6.1.6">1.3.6.1.6 (SNMPv2)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="oidSuffix" className="label">OID Suffix</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-text-secondary bg-darker-bg border border-r-0 border-border-color rounded-l-md">
                          {formData.oidParent}.
                        </span>
                        <input
                          type="text"
                          id="oidSuffix"
                          name="oidSuffix"
                          className={`input rounded-l-none ${errors.oidSuffix ? 'border-danger focus:ring-danger' : ''}`}
                          value={formData.oidSuffix}
                          onChange={handleChange}
                        />
                      </div>
                      {errors.oidSuffix && <p className="mt-1 text-xs text-danger">{errors.oidSuffix}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="owner" className="label">Badge Owner</label>
                      <input
                        type="text"
                        id="owner"
                        name="owner"
                        className={`input ${errors.owner ? 'border-danger focus:ring-danger' : ''}`}
                        value={formData.owner}
                        onChange={handleChange}
                      />
                      {errors.owner && <p className="mt-1 text-xs text-danger">{errors.owner}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="label">Owner Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`input ${errors.email ? 'border-danger focus:ring-danger' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expiryDate" className="label">Expiry Date</label>
                      <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        className="input"
                        value={formData.expiryDate}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="label">Status</label>
                      <select
                        id="status"
                        name="status"
                        className="input"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="revoked">Revoked</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        if (confirm('Are you sure you want to revoke this badge?')) {
                          setFormData({
                            ...formData,
                            status: 'revoked'
                          });
                        }
                      }}
                    >
                      Revoke Badge
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="card mb-6">
            <div className="p-4 border-b border-border-color">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-primary">AI Assistant</h2>
                <button
                  onClick={() => setIsAiHelperOpen(!isAiHelperOpen)}
                  className="p-1 rounded-md text-text-secondary hover:text-text-primary"
                >
                  {isAiHelperOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {isAiHelperOpen && (
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-4">
                  Ask our AI for recommendations on this badge
                </p>
                
                {aiResponse && (
                  <div className="chat-message-ai mb-4">
                    <p className="text-sm">{aiResponse}</p>
                  </div>
                )}
                
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="bg-transparent border-0 px-4 py-2 text-text-primary focus:outline-none flex-1"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiAssist()}
                  />
                  <button
                    className="p-2 text-primary hover:text-primary-light bg-transparent border-0 rounded-r-full focus:outline-none"
                    onClick={handleAiAssist}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-text-primary mb-2">Suggested prompts:</h3>
                  <div className="space-y-2">
                    <button
                      className="text-xs p-2 bg-darker-bg rounded-md text-text-secondary hover:text-primary w-full text-left"
                      onClick={() => {
                        setAiPrompt("Is this badge configuration secure?");
                        handleAiAssist();
                      }}
                    >
                      Is this badge configuration secure?
                    </button>
                    <button
                      className="text-xs p-2 bg-darker-bg rounded-md text-text-secondary hover:text-primary w-full text-left"
                      onClick={() => {
                        setAiPrompt("Suggest improvements to the description");
                        handleAiAssist();
                      }}
                    >
                      Suggest improvements to the description
                    </button>
                    <button
                      className="text-xs p-2 bg-darker-bg rounded-md text-text-secondary hover:text-primary w-full text-left"
                      onClick={() => {
                        setAiPrompt("Should this badge have an earlier expiry date?");
                        handleAiAssist();
                      }}
                    >
                      Should this badge have an earlier expiry date?
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Badge Statistics</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Created</p>
                  <p className="text-sm text-text-primary">{initialData?.createdAt}</p>
                </div>
                
                <div>
                  <p className="text-xs text-text-secondary mb-1">Last Modified</p>
                  <p className="text-sm text-text-primary">{initialData?.lastModified}</p>
                </div>
                
                <div>
                  <p className="text-xs text-text-secondary mb-1">Usage Count</p>
                  <p className="text-sm text-text-primary">{initialData?.usageCount} times</p>
                </div>
                
                <div className="pt-2">
                  <div className="text-xs text-text-secondary mb-2">Usage Trend</div>
                  <div className="h-12 flex items-end space-x-1">
                    {[30, 45, 25, 60, 75, 40, 50].map((height, index) => (
                      <div 
                        key={index}
                        className="flex-1 bg-primary rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <span>7 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBadge;
