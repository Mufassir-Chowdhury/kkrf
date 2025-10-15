

export function handleExportCSV(registrations) {
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
  