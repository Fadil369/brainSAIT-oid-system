import { useState, useEffect } from 'react';
import { Link } from '../lib/router';
import { getAllBadges } from '../services/api';

const ROOT_OID = '1.3.6.1.4.1.61026';

function toStatus(expires) {
  const raw = typeof expires === 'string' ? expires : '';
  const normalized = raw && !/(Z|[+-]\d\d:\d\d)$/.test(raw) ? `${raw}Z` : raw;
  const parsed = new Date(normalized || expires);
  if (Number.isNaN(parsed.getTime())) {
    return 'unknown';
  }
  return parsed.getTime() < Date.now() ? 'revoked' : 'active';
}

function buildOidTree(badges) {
  const root = {
    id: `oid:${ROOT_OID}`,
    name: 'BrainSAIT LTD Enterprise Root',
    oid: ROOT_OID,
    children: [],
    isBadge: false,
  };

  const nodeMap = new Map();
  nodeMap.set(ROOT_OID, root);

  for (const badge of badges) {
    const fullOid = badge.full_oid || `${ROOT_OID}.${badge.oid}`;
    if (!(fullOid === ROOT_OID || fullOid.startsWith(`${ROOT_OID}.`))) {
      continue;
    }

    let currentPath = '';
    let parent = null;

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}.${part}` : part;

      if (!nodeMap.has(currentPath)) {
        const segmentNode = {
          id: `oid:${currentPath}`,
          name: currentPath === ROOT_OID ? 'BrainSAIT LTD Enterprise Root' : `Node ${part}`,
          oid: currentPath,
          children: [],
          isBadge: false,
        };

        nodeMap.set(currentPath, segmentNode);
        if (parent) {
          parent.children.push(segmentNode);
        }
      }

      parent = nodeMap.get(currentPath);
    }

    if (!parent) {
      continue;
    }

    parent.isBadge = true;
    parent.badgeType = badge.role;
    parent.owner = badge.name;
    parent.userId = badge.user_id;
    parent.accessLevel = badge.access_level;
    parent.expires = badge.expires;
    parent.status = toStatus(badge.expires);
    parent.displayName = badge.name;
    parent.fullOid = fullOid;
  }

  const sortTree = (node) => {
    node.children.sort((a, b) => {
      const aPart = Number(a.oid.split('.').at(-1));
      const bPart = Number(b.oid.split('.').at(-1));
      if (Number.isNaN(aPart) || Number.isNaN(bPart)) {
        return a.oid.localeCompare(b.oid);
      }
      return aPart - bPart;
    });

    for (const child of node.children) {
      sortTree(child);
    }
  };

  sortTree(root);
  return root;
}

const OidTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTree = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const badges = await getAllBadges();
        const tree = buildOidTree(Array.isArray(badges) ? badges : []);

        if (!isMounted) {
          return;
        }

        setTreeData(tree);
        setExpandedNodes({ [tree.id]: true });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError('Unable to load OID tree data from the API.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTree();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNode = (nodeId) => {
    setExpandedNodes((previous) => ({
      ...previous,
      [nodeId]: !previous[nodeId],
    }));
  };

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
  };

  const filterTree = (node, query) => {
    if (!query) return true;

    const normalized = query.toLowerCase();
    const matchesQuery =
      node.name.toLowerCase().includes(normalized)
      || node.oid.toLowerCase().includes(normalized)
      || (node.owner || '').toLowerCase().includes(normalized)
      || (node.userId || '').toLowerCase().includes(normalized);

    if (matchesQuery) return true;

    return node.children?.some((child) => filterTree(child, query));
  };

  const renderTreeNode = (node, level = 0) => {
    if (!node) return null;

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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" loading="lazy">
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
              <div className="text-sm font-medium text-text-primary">{node.displayName || node.name}</div>
              <div className="text-xs text-text-secondary">{node.oid}</div>
            </div>

            {node.isBadge && (
              <div className="ml-3 flex items-center">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>
            )}

            {node.isBadge && (
              <Link
                to={`/edit/${encodeURIComponent(node.fullOid || node.oid)}`}
                className="ml-auto text-primary hover:text-primary-light text-sm"
              >
                Edit
              </Link>
            )}
          </div>
        </div>

        {showChildren && (
          <div className="pl-2">
            {node.children.map((child) => renderTreeNode(child, level + 1))}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" loading="lazy">
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
              ) : loadError ? (
                <div className="p-4 text-sm text-danger">{loadError}</div>
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
                <h3 className="text-lg font-medium text-text-primary mb-1">{selectedNode.displayName || selectedNode.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{selectedNode.oid}</p>

                <div className="space-y-4">
                  {selectedNode.isBadge && (
                    <>
                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Role</h4>
                        <p className="text-sm text-text-primary">{selectedNode.badgeType}</p>
                      </div>

                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Owner</h4>
                        <p className="text-sm text-text-primary">{selectedNode.owner}</p>
                      </div>

                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">User ID</h4>
                        <p className="text-sm text-text-primary">{selectedNode.userId}</p>
                      </div>

                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Access</h4>
                        <p className="text-sm text-text-primary capitalize">{selectedNode.accessLevel}</p>
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

                      <div>
                        <h4 className="text-xs uppercase text-text-secondary mb-1">Expires</h4>
                        <p className="text-sm text-text-primary">{selectedNode.expires || 'N/A'}</p>
                      </div>

                      <div className="pt-4">
                        <Link
                          to={`/edit/${encodeURIComponent(selectedNode.fullOid || selectedNode.oid)}`}
                          className="btn btn-primary w-full"
                        >
                          Edit Badge
                        </Link>
                      </div>
                    </>
                  )}

                  {!selectedNode.isBadge && selectedNode.oid !== ROOT_OID && (
                    <div className="pt-4">
                      <Link
                        to="/register"
                        className="btn btn-outline w-full"
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" loading="lazy">
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
