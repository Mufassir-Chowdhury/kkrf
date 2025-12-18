import { algoliasearch } from 'algoliasearch';

const ALGOLIA_APP_ID = 'KXWYAU0VCS';
const ALGOLIA_SEARCH_KEY = 'a27f6a1224c89a11b692f60edaa32d71';
const INDEX_NAME = 'search';

export const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);

export async function searchAllRegistrations(searchTerm, searchType = 'all') {
  try {
    const searchRequest = {
      indexName: INDEX_NAME,
      query: searchTerm,
      hitsPerPage: 100,
    };

    // If the searchType is not 'all', we tell Algolia to
    // only search within that specific attribute for better results.
    if (searchType !== 'all') {
      searchRequest.restrictSearchableAttributes = [searchType];
    }

    const { results } = await client.search({
      requests: [searchRequest],
    });

    // Get hits from the first result
    const hits = results[0]?.hits || [];

    return hits;
  } catch (err) {
    console.error("Error searching registrations with Algolia:", err);
    throw err;
  }
}

export async function searchByMobile(mobile) {
  try {
    const q = query(
      collection(db, 'offline-2025'),
      where('mobile', '==', mobile),
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    console.error("Error searching by mobile:", err);
    throw err;
  }
}

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