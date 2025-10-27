import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '$lib/firebase';

/**
 * Search registrations across all branches
 * @param {string} searchTerm - The term to search for
 * @param {string} searchType - Type of search: 'all', 'mobile', 'name', 'institution'
 * @returns {Promise<Array>} - Array of matching registrations
 */
export async function searchAllRegistrations(searchTerm, searchType = 'all') {
  try {
    const collectionRef = collection(db, 'offline-2025');
    let results = [];

    // For mobile number search, we can use exact match query (most efficient)
    if (searchType === 'mobile' && /^\d+$/.test(searchTerm)) {
      const q = query(collectionRef, where('mobile', '==', searchTerm));
      const querySnapshot = await getDocs(q);
      results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    // For other searches, we need to fetch and filter client-side
    else {
      const querySnapshot = await getDocs(collectionRef);
      const searchLower = searchTerm.toLowerCase();
      
      results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(reg => {
          switch (searchType) {
            case 'name':
              return reg.name?.toLowerCase().includes(searchLower);
            
            case 'institution':
              return reg.institution?.toLowerCase().includes(searchLower);
            
            case 'mobile':
              return reg.mobile?.includes(searchTerm);
            
            case 'all':
            default:
              return (
                reg.name?.toLowerCase().includes(searchLower) ||
                reg.institution?.toLowerCase().includes(searchLower) ||
                reg.mobile?.includes(searchTerm)
              );
          }
        });
    }

    // Sort by branch, then by serial
    results.sort((a, b) => {
      if (a.branch !== b.branch) {
        return a.branch.localeCompare(b.branch);
      }
      return (a.serial || '').localeCompare(b.serial || '');
    });

    return results;
  } catch (err) {
    console.error("Error searching registrations:", err);
    throw err;
  }
}

/**
 * Search for a specific registration by mobile number (optimized)
 * @param {string} mobile - The mobile number to search for
 * @returns {Promise<Object|null>} - The registration object or null if not found
 */
export async function searchByMobile(mobile) {
  try {
    const q = query(
      collection(db, 'offline-2025'),
      where('mobile', '==', mobile)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first match (should be unique)
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error searching by mobile:", err);
    throw err;
  }
}

/**
 * Get statistics about search results
 * @param {Array} results - Array of registration results
 * @returns {Object} - Statistics object
 */
export function getSearchStats(results) {
  const stats = {
    total: results.length,
    confirmed: 0,
    withRoll: 0,
    byBranch: {},
    byClass: {}
  };

  results.forEach(reg => {
    if (reg.confirm) stats.confirmed++;
    if (reg.roll) stats.withRoll++;
    
    // Count by branch
    stats.byBranch[reg.branch] = (stats.byBranch[reg.branch] || 0) + 1;
    
    // Count by class
    stats.byClass[reg.class] = (stats.byClass[reg.class] || 0) + 1;
  });

  return stats;
}