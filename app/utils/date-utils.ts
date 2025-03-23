// Format date for display (e.g., "Jan 25")
export function formatDateForDisplay(date: Date | null): string {
  if (!date) return '';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Get the last two digits of the year
  const year = date.getFullYear().toString().slice(-2);
  
  return `${months[date.getMonth()]} ${year}`;
}

// Format date as ISO string (YYYY-MM-DD)
export function formatDateISO(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

// Process data for charting with consistent date formatting and ordering
export function processChartData<T extends { date: string }>(data: T[]): (T & { displayDate: string })[] {
  // Create a copy of the data
  const processedData = [...data];
  
  // Add displayDate to each data point
  const dataWithDisplayDates = processedData.map(item => {
    const date = new Date(item.date);
    return {
      ...item,
      displayDate: formatDateForDisplay(date)
    };
  });
  
  // Sort by date (chronological - oldest to newest)
  const sortedData = dataWithDisplayDates.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  return sortedData;
}
