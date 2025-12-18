import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc, where, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '$lib/firebase';

export async function loadRegistrations(branch) {
    try {
      const q = query(
        collection(db, 'offline-2025'),
        where('branch', '==', branch),
        orderBy('serial', 'desc')
    );
    // orderBy('creationTime', 'desc')
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      return registrations;
    } catch (err) {
      console.error("Error loading registrations:", err);
      throw err;
    }
  }


export async function deleteRegistration(id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        try {
          await deleteDoc(doc(db, 'offline-2025', id));
        } catch (err) {
          console.error("Error deleting registration:", err);
          throw err;
        }
      }
}

// Map Bangla class names to class digits
function getClassDigit(className) {
  const classMap = {
    '৪র্থ': '4',
    '৫ম': '5',
    '৬ষ্ঠ': '6',
    '৭ম': '7',
    '৮ম': '8',
    '৯ম': '9',
    '১০ম': '1'
  };
  return classMap[className] || '0';
}

// Build or update cache for roll number starting points
async function ensureRollCache(registrations, centerNumber) {
  const cacheRef = doc(db, '_cache', 'start_roll');
  let cacheData = {};
  
  try {
    const cacheDoc = await getDoc(cacheRef);
    if (cacheDoc.exists()) {
      cacheData = cacheDoc.data();
    }
  } catch (err) {
    console.log('Cache does not exist, will create new');
  }

  // Group registrations by class and gender
  const groups = {};
  
  registrations.forEach(reg => {
    const classDigit = getClassDigit(reg.class);
    const gender = reg.gender || 'male';
    const key = `${centerNumber}${classDigit}`;
    
    if (!groups[key]) {
      groups[key] = { male: [], female: [] };
    }
    
    if (gender === 'female') {
      groups[key].female.push(reg);
    } else {
      groups[key].male.push(reg);
    }
  });

  // For each group, ensure cache has starting point
  for (const [key, group] of Object.entries(groups)) {
    const maleKey = `${key}_male`;
    const femaleKey = `${key}_female`;
    
    // Initialize male starting point if not exists
    if (!cacheData[maleKey]) {
      cacheData[maleKey] = parseInt(`${key}0001`);
    }
    
    // Initialize female starting point if not exists
    if (!cacheData[femaleKey]) {
      cacheData[femaleKey] = parseInt(`${key}5001`);
    }
  }

  // Save cache
  await setDoc(cacheRef, cacheData);
  return cacheData;
}

export async function assignRollNumbers(registrations, centerNumber) {
  try {
    // Ensure cache exists and is up to date
    const cache = await ensureRollCache(registrations, centerNumber);
    const cacheRef = doc(db, '_cache', 'start_roll');
    
    // Group registrations by class and gender
    const groups = {};
    
    registrations.forEach(reg => {
      const classDigit = getClassDigit(reg.class);
      const gender = reg.gender || 'male';
      const key = `${centerNumber}${classDigit}`;
      
      if (!groups[key]) {
        groups[key] = { male: [], female: [] };
      }
      
      if (gender === 'female') {
        groups[key].female.push(reg);
      } else {
        groups[key].male.push(reg);
      }
    });

    const batch = writeBatch(db);
    const updatedCache = { ...cache };

    // Assign roll numbers
    for (const [key, group] of Object.entries(groups)) {
      // Assign male rolls
      const maleKey = `${key}_male`;
      let maleRoll = updatedCache[maleKey];
      
      for (const reg of group.male) {
        const regRef = doc(db, 'offline-2025', reg.id);
        batch.update(regRef, { roll: maleRoll.toString() });
        maleRoll++;
      }
      updatedCache[maleKey] = maleRoll;

      // Assign female rolls
      const femaleKey = `${key}_female`;
      let femaleRoll = updatedCache[femaleKey];
      
      for (const reg of group.female) {
        const regRef = doc(db, 'offline-2025', reg.id);
        batch.update(regRef, { roll: femaleRoll.toString() });
        femaleRoll++;
      }
      updatedCache[femaleKey] = femaleRoll;
    }

    // Update cache with new starting points
    batch.set(cacheRef, updatedCache);
    
    // Commit all changes
    await batch.commit();
    
  } catch (err) {
    console.error("Error assigning roll numbers:", err);
    throw err;
  }
}