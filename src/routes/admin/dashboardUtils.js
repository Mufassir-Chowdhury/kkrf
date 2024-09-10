import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { auth, db } from '$lib/firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { goto } from '$app/navigation';

export async function loadRegistrations() {
  try {
    const q = query(collection(db, 'scholarshipApplications'), orderBy('creationTime', 'desc'));
    const querySnapshot = await getDocs(q);
    let registrations = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    return registrations;
  } catch (err) {
    console.error("Error loading registrations:", err);
    let error = "Failed to load registrations. Please try again.";
    return error;
  }
}

export function filterRegistrations(registrations, searchTerm) {
  let filteredRegistrations = registrations.filter(reg => 
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobile.includes(searchTerm)
  );
  return filteredRegistrations;
}

export async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this registration?')) {
    try {
      await deleteDoc(doc(db, 'scholarshipApplications', id));
      await loadRegistrations();
    } catch (err) {
      console.error("Error deleting registration:", err);
      // Handle error (e.g., show a notification)
    }
  }
}

export function handleEdit(id) {
  goto(`/edit-registration/${id}`);
}

export async function handleLogout() {
  try {
    await auth.signOut();
    goto('/login');
  } catch (err) {
    console.error("Error signing out:", err);
    // Handle error (e.g., show a notification)
  }
}

export function handleExportCSV(registrations) {
    const headers = [
      'Name', 'Name (English)', 'Father\'s Name', 'Mother\'s Name', 'Institution', 'Class',
      'Section', 'Class Roll', 'Birth Date', 'Religion', 'Mobile', 'Village', 'Post Office',
      'Upazila', 'District', 'Present Address', 'Guardian Name', 'Relation', 'Guardian Mobile',
      'Transaction ID', 'Creation Time'
    ];
  
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.name,
        reg.nameEnglish,
        reg.fatherName,
        reg.motherName,
        reg.institution,
        reg.class,
        reg.section,
        reg.classRoll,
        reg.birthDate,
        reg.religion,
        reg.mobile,
        reg.permanentAddress.village,
        reg.permanentAddress.postOffice,
        reg.permanentAddress.upazila,
        reg.permanentAddress.district,
        reg.presentAddress,
        reg.guardianName,
        reg.relation,
        reg.guardianMobile,
        reg.transactionID,
        reg.creationTime
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "scholarship_applications.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  
  export function handleExportPDF(filteredRegistrations) {
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.text("Scholarship Applications", 14, 22);
  
    const headers = [['Name', 'Institution', 'Class', 'Mobile']];
    const data = filteredRegistrations.map(reg => [
      reg.name,
      reg.institution,
      reg.class,
      reg.mobile
    ]);
  
    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [242, 242, 242] },
    });
  
    doc.save("scholarship_applications.pdf");
  }

  export async function sendConfirmationSMS(phoneNumber) {
    const url = "https://api.bdbulksms.net/api.php?json";
    const t1 = "59702300401725";
    const t2 = "814840c01d5e52";
    const t3 = "79bac7dda539127ec4a9f539";
    const SMS_API_TOKEN = `${t1}${t2}${t3}`;
    const data = new FormData();
    data.set('token', SMS_API_TOKEN);
    data.set('message', 'আপনার রেজিস্ট্রেশন কনফার্ম হয়েছে। কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৪');
    data.set('to', phoneNumber);

    try {
        const response = await fetch(url, {
            method: "POST",
            body: data
        });
        const result = await response.json();
        console.log('SMS sent successfully:', result);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

export async function confirmRegistration(id) {
  try {
    await updateDoc(doc(db, 'scholarshipApplications', id), { confirmed: true });
    const registrationDoc = await getDoc(doc(db, 'scholarshipApplications', id));
    const registrationData = registrationDoc.data();
    await sendConfirmationSMS(registrationData.mobile);
  } catch (err) {
    console.error("Error confirming registration:", err);
    // Handle error (e.g., show a notification)
  }
}

export async function cancelConfirmation(id) {
  try {
    await updateDoc(doc(db, 'scholarshipApplications', id), { confirmed: false });
  } catch (err) {
    console.error("Error canceling confirmation:", err);
    // Handle error (e.g., show a notification)
  }
}