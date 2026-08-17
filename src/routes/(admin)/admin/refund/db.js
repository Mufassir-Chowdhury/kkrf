import { getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { refundsCol, refundDocRef } from '$lib/yearScope';

export async function loadRegistrations(year) {
    try {
      const q = query(refundsCol(year), orderBy('submissionTime', 'desc'));
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      return registrations;
    } catch (err) {
      console.error("Error loading registrations:", err);
      throw err;
    }
  }

export async function loadAllRegistrations(year) {
    try {
      const q = query(refundsCol(year), orderBy('submissionTime', 'desc'));
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      return registrations;
    } catch (err) {
      console.error("Error loading all registrations:", err);
      throw err;
    }
}
export async function deleteRegistration(year, id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        try {
          await deleteDoc(refundDocRef(year, id));
        } catch (err) {
          console.error("Error deleting registration:", err);
          throw err;
        }
      }
}
