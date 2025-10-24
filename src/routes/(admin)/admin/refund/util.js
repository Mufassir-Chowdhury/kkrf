
export async function sendConfirmationSMS(phoneNumber) {
    const url = "https://api.bdbulksms.net/api.php?json";
    const t1 = "59702300401725";
    const t2 = "814840c01d5e52";
    const t3 = "79bac7dda539127ec4a9f539";
    const SMS_API_TOKEN = `${t1}${t2}${t3}`;
    const data = new FormData();
    data.set('token', SMS_API_TOKEN);
    data.set('message', 'আপনার রেজিস্ট্রেশন কনফার্ম হয়েছে। কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫');
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

export async function sendIncompleteRegistrationSMS(phoneNumber) {

        const url = "https://api.bdbulksms.net/api.php?json";
        const t1 = "59702300401725";
        const t2 = "814840c01d5e52";
        const t3 = "79bac7dda539127ec4a9f539";
        const SMS_API_TOKEN = `${t1}${t2}${t3}`;
        const data = new FormData();
        data.set('token', SMS_API_TOKEN);
        data.set('message', 'আপনার রেজিস্ট্রেশন সম্পূর্ণ হয়নি। অনুগ্রহ করে পেমেন্ট সম্পন্ন করে আমাদের সাথে যোগাযোগ করুন। - কিশোরকণ্ঠ মেধাবৃত্তি - ২০২৫');
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

    export async function handleExportCSV(registrations) {
  if (!registrations || registrations.length === 0) {
    console.warn('No registrations to export');
    return;
  }

  // Collect all unique field names from all registrations
  const allFields = new Set();
  registrations.forEach(reg => {
    Object.keys(reg).forEach(key => allFields.add(key));
  });
  
  const headers = Array.from(allFields);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...registrations.map(reg => 
      headers.map(field => {
        const value = reg[field];
        // Handle missing fields as empty strings
        const fieldValue = value !== undefined && value !== null ? String(value) : '';
        // Escape quotes and wrap in quotes
        return `"${fieldValue.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  // Add BOM for proper Excel UTF-8 encoding
  const BOM = "\uFEFF";
  const csvContentWithBOM = BOM + csvContent;
  
  // Create and download the file
  const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "scholarship_applications.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  }
}