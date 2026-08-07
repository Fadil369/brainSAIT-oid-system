import { useState } from 'react';
import { useNavigate } from '../lib/router';

const RegisterBadge = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    oidParent: '1.3.6.1.4.1',
    oidSuffix: '',
    owner: '',
    email: '',
    expiryDate: '',
    status: 'active',
    type: 'access'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  
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
      // Redirect to home page after successful submission
      navigate('/');
    }, 1500);
  };
  
  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsSending(true);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Based on your input "${formData.name}", I recommend using a description that emphasizes secure access control for system administrators. The OID suffix could be structured as .101 to indicate it's part of the admin credential family.`,
        `For "${formData.name}", I suggest setting an expiry date of 12 months from today as this follows security best practices for credential rotation.`,
        `The badge "${formData.name}" appears to be for a temporary access role. Consider setting the status to "pending" until approved by a supervisor, and using an OID suffix pattern of .temp.user.`
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Register New Badge</h1>
        <p className="text-sm text-text-secondary mt-1">Create a new OID badge in the BrainSAIT system</p>
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
                        placeholder="Enter badge name"
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
                      placeholder="Enter badge description"
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
                          placeholder="Additional OID numbers"
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
                        placeholder="Enter owner name"
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
                        placeholder="Enter owner email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expiryDate" className="label">Expiry Date (Optional)</label>
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
                      className="btn btn-outline"
                      onClick={() => navigate('/')}
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
                          Processing...
                        </span>
                      ) : 'Register Badge'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-text-primary">AI Assistant</h2>
                <button
                  onClick={() => setIsAiAssistOpen(!isAiAssistOpen)}
                  className="p-1 rounded-md text-text-secondary hover:text-text-primary"
                >
                  {isAiAssistOpen ? (
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
            
            {isAiAssistOpen && (
              <div className="p-4">
                <p className="text-sm text-text-secondary mb-4">
                  Ask our AI for help with creating your badge
                </p>
                
                {aiResponse && (
                  <div className="chat-message-ai mb-4">
                    <p className="text-sm">{aiResponse}</p>
                  </div>
                )}
                
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Ask for help..."
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
                        setAiPrompt("What's the best OID suffix structure for this badge?");
                        handleAiAssist();
                      }}
                    >
                      What's the best OID suffix structure for this badge?
                    </button>
                    <button
                      className="text-xs p-2 bg-darker-bg rounded-md text-text-secondary hover:text-primary w-full text-left"
                      onClick={() => {
                        setAiPrompt("Suggest a good description for this badge");
                        handleAiAssist();
                      }}
                    >
                      Suggest a good description for this badge
                    </button>
                    <button
                      className="text-xs p-2 bg-darker-bg rounded-md text-text-secondary hover:text-primary w-full text-left"
                      onClick={() => {
                        setAiPrompt("Should this badge have an expiry date?");
                        handleAiAssist();
                      }}
                    >
                      Should this badge have an expiry date?
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-border-color">
              <h3 className="text-sm font-medium text-text-primary mb-3">Badge Guidelines</h3>
              <ul className="text-xs text-text-secondary space-y-2">
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Use descriptive badge names (e.g., "Admin Access Level 2" instead of "Badge A2")</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>OID suffixes should follow the organizational hierarchy</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Always include an expiry date for temporary access badges</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 text-primary mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>High-security badges should use the 1.3.6.1.5 parent OID</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterBadge;
