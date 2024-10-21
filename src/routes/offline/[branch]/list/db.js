import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc, getDoc, where } from 'firebase/firestore';
import { db } from '$lib/firebase';

export async function loadRegistrations(branch) {
    try {
      const q = query(
        collection(db, 'offline'),
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
          await deleteDoc(doc(db, 'offline', id));
        } catch (err) {
          console.error("Error deleting registration:", err);
          throw err;
        }
      }
}