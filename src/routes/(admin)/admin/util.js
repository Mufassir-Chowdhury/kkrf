
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
        reg.institutionType,
        reg.gender,
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
  