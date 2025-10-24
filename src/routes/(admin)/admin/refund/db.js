import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';


export async function loadRegistrations() {
    try {
      const q = query(collection(db, 'refund-2025'), orderBy('submissionTime', 'desc'));
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      return registrations;
    } catch (err) {
      console.error("Error loading registrations:", err);
      throw err;
    }
  }

export async function loadAllRegistrations() {
    try {
      const q = query(collection(db, 'refund-2025'), orderBy('submissionTime', 'desc'));
      const querySnapshot = await getDocs(q);
      let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      return registrations;
    } catch (err) {
      console.error("Error loading all registrations:", err);
      throw err;
    }
}
export async function deleteRegistration(id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        try {
          await deleteDoc(doc(db, 'refund-2025', id));
        } catch (err) {
          console.error("Error deleting registration:", err);
          throw err;
        }
      }
}