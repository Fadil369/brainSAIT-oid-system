/**
 * API service for the BrainSAIT OID System
 * Handles all communication with the backend API
 */

const API_URL = import.meta.env.PROD 
  ? '/api' // In production, use relative path (handled by NGINX)
  : 'http://localhost:8000'; // In development, connect directly to the backend

/**
 * Fetch all OID badges from the server
 * @returns {Promise<Array>} List of OID badges
 */
export const getAllBadges = async () => {
  try {
    const response = await fetch(`${API_URL}/oids`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch badges:', error);
    throw error;
  }
};

/**
 * Register a new OID badge
 * @param {Object} badgeData - Badge data to register
 * @returns {Promise<Object>} Registered badge data with OID
 */
export const registerBadge = async (badgeData) => {
  try {
    const response = await fetch(`${API_URL}/oids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to register badge:', error);
    throw error;
  }
};

/**
 * Update an existing OID badge
 * @param {string} oid - OID of the badge to update
 * @param {Object} badgeData - Updated badge data
 * @returns {Promise<Object>} Update status
 */
export const updateBadge = async (oid, badgeData) => {
  try {
    const response = await fetch(`${API_URL}/oids/${oid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(badgeData),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update badge ${oid}:`, error);
    throw error;
  }
};

/**
 * Delete/revoke an OID badge
 * @param {string} oid - OID of the badge to delete
 * @returns {Promise<Object>} Deletion status
 */
export const deleteBadge = async (oid) => {
  try {
    const response = await fetch(`${API_URL}/oids/${oid}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to delete badge ${oid}:`, error);
    throw error;
  }
};

/**
 * Get details of a specific badge by OID
 * @param {string} oid - OID of the badge to retrieve
 * @returns {Promise<Object>} Badge details
 */
export const getBadgeDetails = async (oid) => {
  try {
    const response = await fetch(`${API_URL}/oids/${oid}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch badge ${oid}:`, error);
    throw error;
  }
};
