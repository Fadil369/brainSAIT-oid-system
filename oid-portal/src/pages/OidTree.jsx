import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const OidTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  
  useEffect(() => {
    // Simulate fetching OID tree data
    setTimeout(() => {
      const mockTreeData = {
        id: 'root',
        name: 'OID Root',
        oid: '1',
        children: [
          {
            id: 'iso',
            name: 'ISO',
            oid: '1.3',
            children: [
              {
                id: 'identified-organization',
                name: 'Identified Organization',
                oid: '1.3.6',
                children: [
                  {
                    id: 'dod',
                    name: 'DoD',
                    oid: '1.3.6.1',
                    children: [
                      {
                        id: 'internet',
                        name: 'Internet',
                        oid: '1.3.6.1.4',
                        children: [
                          {
                            id: 'private',
                            name: 'Private',
                            oid: '1.3.6.1.4.1',
                            children: [
                              {
                                id: 'brainsait',
                                name: 'BrainSAIT',
                                oid: '1.3.6.1.4.1.9999',
                                children: [
                                  {
                                    id: 'admin',
                                    name: 'Admin Access',
                                    oid: '1.3.6.1.4.1.9999.1',
                                    badgeType: 'access',
                                    owner: 'System Administrator',
                                    status: 'active'
                                  },
                                  {
                                    id: 'developer',
                                    name: 'Developer Access',
                                    oid: '1.3.6.1.4.1.9999.2',
                                    badgeType: 'access',
                                    owner: 'Developer Team',
                                    status: 'active'
                                  },
                                  {
                                    id: 'guest',
                                    name: 'Guest Access',
                                    oid: '1.3.6.1.4.1.9999.3',
                                    badgeType: 'access',
                                    owner: 'Reception',
                                    status: 'pending'
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      },
                      {
                        id: 'security',
                        name: 'Security',
                        oid: '1.3.6.1.5',
                        children: [
                          {
                            id: 'brainsait-security',
                            name: 'BrainSAIT Security',
                            oid: '1.3.6.1.5.9999',
                            children: [
                              {
                                id: 'sec-admin',
                                name: 'Security Admin Badge',
                                oid: '1.3.6.1.5.9999.1',
                                badgeType: 'identity',
                                owner: 'Security Officer',
                                status: 'active'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
      
      // Pre-expand some nodes for better user experience
      const expanded = {
        'root': true,
        'iso': true,
        'identified-organization': true,
        'dod': true,
        'internet': true,
        'private': true,
        'brainsait': true,
      };
      
      setTreeData(mockTreeData);
      setExpandedNodes(expanded);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const toggleNode = (nodeId) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };
  
  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };
  
  const filterTree = (node, query) => {
    if (!query) return true;
    
    const matchesQuery = 
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.oid.toLowerCase().includes(query.toLowerCase());
    
    if (matchesQuery) return true;
    
    if (node.children) {
      return node.children.some(child => filterTree(child, query));
    }
    
    return false;
  };
  
  const renderTreeNode = (node, level = 0) => {
    if (!node) return null;
    
    // Apply search filter
    if (searchQuery && !filterTree(node, searchQuery)) return null;
    
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];
    const showChildren = hasChildren && isExpanded;
    const isLeaf = !hasChildren;
    const isSelected = selectedNode && selectedNode.id === node.id;
    
    const getBadgeStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-success';
        case 'pending': return 'bg-primary';
        case 'revoked': return 'bg-danger';
        default: return 'bg-border-color';
      }
    };
    
    return (
      <div key={node.id} className="tree-node">
        <div 
          className={`flex items-center py-2 px-3 rounded-md transition-colors ${isSelected ? 'bg-primary bg-opacity-20' : 'hover:bg-content-bg'}`}
          style={{ paddingLeft: `${(level * 20) + 8}px` }}
        >
          {hasChildren ? (
            <button 
              onClick={() => toggleNode(node.id)}
              className="w-5 h-5 mr-2 flex items-center justify-center text-text-secondary hover:text-text-primary"
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-5 h-5 mr-2"></div>
          )}
          
          <div 
            className="flex-1 flex items-center cursor-pointer"
            onClick={() => handleNodeSelect(node)}
          >
            {isLeaf ? (
              <div className="h-3 w-3 rounded-full bg-secondary mr-2"></div>
            ) : (
              <div className="h-3 w-3 rounded-sm bg-primary mr-2"></div>
            )}
            
            <div>
              <div className="text-sm font-medium text-text-primary">{node.name}</div>
              <div className="text-xs text-text-secondary">{node.oid}</div>
            </div>
            
            {node.badgeType && (
              <div className="ml-3 flex items-center">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>
            )}
            
            {node.badgeType && (
              <Link 
                to={`/edit/${node.oid}`} 
                className="ml-auto text-primary hover:text-primary-light text-sm"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
        
        {showChildren && (
          <div className="pl-2">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">OID Tree</h1>
        <p className="text-sm text-text-secondary mt-1">Browse the hierarchical structure of registered OIDs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card">
            <div className="p-4 border-b border-border-color">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-text-primary">OID Hierarchy</h2>
                <div className="ml-auto relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Search OIDs..."
                    className="w-full py-1.5 pl-8 pr-4 text-sm bg-darker-bg border border-border-color rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2 overflow-auto max-h-[calc(100vh-250px)]">
              {isLoading ? (
                <div className="p-4 animate-pulse space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-5 h-5 bg-darker-bg rounded mr-2"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-darker-bg rounded w-2/3 mb-1"></div>
                        <div className="h-3 bg-darker-bg rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tree">
                  {treeData && renderTreeNode(treeData)}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="card sticky top-4">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-lg font-semibold text-text-primary">Node Details</h2>
            </div>
            
            {selectedNode ? (
              <div className="p-4">
                <h3 className="text-lg font-medium text-text-primary mb-1">{selectedNode.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{selectedNode.oid}</p>
                
                <div className="space-y-4">
                  {selectedNode.badgeType && (
                    <>
                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Badge Type</h4>
                        <p className="text-sm text-text-primary capitalize">{selectedNode.badgeType}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Owner</h4>
                        <p className="text-sm text-text-primary">{selectedNode.owner}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Status</h4>
                        <p className="text-sm">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            selectedNode.status === 'active' ? 'bg-success' :
                            selectedNode.status === 'pending' ? 'bg-primary' :
                            'bg-danger'
                          }`}>
                            {selectedNode.status}
                          </span>
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <Link 
                          to={`/edit/${selectedNode.oid}`}
                          className="btn btn-primary w-full"
                        >
                          Edit Badge
                        </Link>
                      </div>
                    </>
                  )}
                  
                  {!selectedNode.badgeType && selectedNode.id !== 'root' && (
                    <div className="pt-4">
                      <Link 
                        to="/register"
                        className="btn btn-outline w-full"
                        state={{ parentOid: selectedNode.oid }}
                      >
                        Register Badge at This Node
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-darker-bg p-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm">
                  Select a node from the tree to view its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OidTree;
