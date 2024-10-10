

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
  