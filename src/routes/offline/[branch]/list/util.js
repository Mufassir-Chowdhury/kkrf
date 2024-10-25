

export function handleExportCSV(registrations) {
    const headers = [
      'Serial', 'Institute Type', 'Gender', 'Name', 'Father\'s name', 'Institute',
      'Class', 'Section', 'Class Roll', 'Mobile', 'Present Address', 'Creation Time', 'Branch', "Ward"
    ];
  
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
    reg.serial,
    reg.institutionType,
		reg.gender,
		reg.name,
		reg.fatherName,
		reg.institution,
		reg.class,
		reg.section,
		reg.classRoll,
		reg.mobile,
		reg.presentAddress,
		reg.creationTime,
        reg.branch,
        reg.ward
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    const BOM = "\uFEFF";
    const csvContentWithBOM = BOM + csvContent;
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
    }
  }
  