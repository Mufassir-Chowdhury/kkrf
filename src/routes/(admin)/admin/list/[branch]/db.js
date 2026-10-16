import { getDocs, deleteDoc, query, orderBy, getDoc, where, setDoc, writeBatch, runTransaction, deleteField } from 'firebase/firestore';
import { offlineCol, offlineDocRef, cacheDocRef } from '$lib/yearScope';
import { db } from '$lib/firebase';

export async function loadRegistrations(branch, year) {
    try {
      const q = query(
        offlineCol(year),
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


export async function deleteRegistration(year, id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        try {
          await deleteDoc(offlineDocRef(year, id));
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
async function ensureRollCache(registrations, centerNumber, year) {
  const cacheRef = cacheDocRef(year, 'start_roll');
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

export async function assignRollNumbers(registrations, centerNumber, year) {
  try {
    // Ensure cache exists and is up to date
    const cache = await ensureRollCache(registrations, centerNumber, year);
    const cacheRef = cacheDocRef(year, 'start_roll');

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

    // Assign roll numbers, filling freed rolls first, then continuing from the starting roll
    for (const [key, group] of Object.entries(groups)) {
      for (const gender of ['male', 'female']) {
        const poolKey = `${key}_${gender}`;
        const freeKey = `${poolKey}_free`;
        const free = [...(updatedCache[freeKey] || [])].sort((a, b) => a - b);
        let nextRoll = updatedCache[poolKey];

        for (const reg of group[gender]) {
          const roll = free.length > 0 ? free.shift() : nextRoll++;
          batch.update(offlineDocRef(year, reg.id), { roll: roll.toString() });
        }
        updatedCache[poolKey] = nextRoll;
        if (free.length > 0) updatedCache[freeKey] = free;
        else delete updatedCache[freeKey];
      }
    }

    // Update cache with new starting points and remaining free rolls
    batch.set(cacheRef, updatedCache);

    // Commit all changes
    await batch.commit();

  } catch (err) {
    console.error("Error assigning roll numbers:", err);
    throw err;
  }
}

export async function loadRollCache(year) {
  const cacheDoc = await getDoc(cacheDocRef(year, 'start_roll'));
  return cacheDoc.exists() ? cacheDoc.data() : {};
}

// Roll format: {center}{classDigit}{4-digit seq}; male seq 0001-5000, female seq 5001+
function parseRoll(roll) {
  const str = String(roll ?? '').trim();
  if (!/^\d{5,}$/.test(str)) return null;
  const seq = parseInt(str.slice(-4));
  const gender = seq >= 5001 ? 'female' : 'male';
  const prefix = str.slice(0, -4);
  return {
    value: parseInt(str),
    poolKey: `${prefix}_${gender}`,
    base: parseInt(`${prefix}${gender === 'female' ? '5001' : '0001'}`)
  };
}

// Work out how releasing the rolls of `regs` changes the start_roll cache.
// `heldElsewhere` is a set of roll strings still used by registrations that are not being released.
// Returns the new cache plus a per-pool summary and the rolls that were cleared but not freed.
export function planRollRelease(cache, regs, heldElsewhere = new Set()) {
  const newCache = { ...cache };
  const freedByPool = {};
  const skipped = [];

  for (const reg of regs) {
    const parsed = parseRoll(reg.roll);
    if (!parsed) {
      skipped.push({ reg, reason: 'invalid roll format' });
      continue;
    }
    const next = cache[parsed.poolKey];
    const free = cache[`${parsed.poolKey}_free`] || [];
    if (typeof next !== 'number') {
      skipped.push({ reg, reason: 'no starting roll in cache for this pool' });
    } else if (parsed.value >= next) {
      skipped.push({ reg, reason: 'not yet issued according to cache' });
    } else if (free.includes(parsed.value)) {
      skipped.push({ reg, reason: 'already in free list' });
    } else if (heldElsewhere.has(String(reg.roll))) {
      skipped.push({ reg, reason: 'still held by another registration' });
    } else if (freedByPool[parsed.poolKey]?.rolls.has(parsed.value)) {
      skipped.push({ reg, reason: 'duplicate roll in selection' });
    } else {
      freedByPool[parsed.poolKey] ??= { base: parsed.base, rolls: new Set() };
      freedByPool[parsed.poolKey].rolls.add(parsed.value);
    }
  }

  const pools = [];
  for (const [poolKey, { base, rolls }] of Object.entries(freedByPool)) {
    const freeKey = `${poolKey}_free`;
    const nextBefore = cache[poolKey];
    const freeBefore = [...(cache[freeKey] || [])].sort((a, b) => a - b);
    const all = new Set([...freeBefore, ...rolls]);

    // If the top of the issued range is free, pull the starting roll back instead of listing it
    let nextAfter = nextBefore;
    while (nextAfter - 1 >= base && all.has(nextAfter - 1)) {
      all.delete(nextAfter - 1);
      nextAfter--;
    }
    const freeAfter = [...all].sort((a, b) => a - b);

    newCache[poolKey] = nextAfter;
    if (freeAfter.length > 0) newCache[freeKey] = freeAfter;
    else delete newCache[freeKey];

    pools.push({
      poolKey,
      freed: [...rolls].sort((a, b) => a - b),
      nextBefore,
      nextAfter,
      freeBefore,
      freeAfter
    });
  }
  pools.sort((a, b) => a.poolKey.localeCompare(b.poolKey));

  return { newCache, pools, skipped };
}

// Clear roll numbers from `regs` and return them to the cache's free pool atomically.
export async function releaseRollNumbers(regs, year, heldElsewhere = new Set()) {
  const cacheRef = cacheDocRef(year, 'start_roll');
  return runTransaction(db, async (tx) => {
    const cacheDoc = await tx.get(cacheRef);
    const cache = cacheDoc.exists() ? cacheDoc.data() : {};
    const plan = planRollRelease(cache, regs, heldElsewhere);

    for (const reg of regs) {
      tx.update(offlineDocRef(year, reg.id), { roll: deleteField() });
    }
    tx.set(cacheRef, plan.newCache);
    return plan;
  });
}
