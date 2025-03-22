// Format date for display (e.g., "Jan 2025")
export function formatDateForDisplay(date: Date | null): string {
  if (!date) return '';
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Format date as ISO string (YYYY-MM-DD)
export function formatDateISO(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}
