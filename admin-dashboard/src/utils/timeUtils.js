/**
 * Format minutes into human-readable time
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted time string
 */
export const formatWaitingTime = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) { // Less than 24 hours
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        if (remainingMins === 0) {
            return `${hours} hr${hours !== 1 ? 's' : ''}`;
        }
        return `${hours}h ${remainingMins}m`;
    } else { // 24 hours or more
        const days = Math.floor(minutes / 1440);
        const remainingHours = Math.floor((minutes % 1440) / 60);
        if (remainingHours === 0) {
            return `${days} day${days !== 1 ? 's' : ''}`;
        }
        return `${days}d ${remainingHours}h`;
    }
};

/**
 * Get urgency color class based on waiting time
 * @param {number} minutes - Minutes waiting
 * @returns {string} Tailwind color classes
 */
export const getUrgencyColor = (minutes) => {
    if (minutes > 1440) return 'text-red-700 bg-red-100'; // > 1 day - Critical
    if (minutes > 120) return 'text-orange-700 bg-orange-100'; // > 2 hours - High
    if (minutes > 20) return 'text-red-600 bg-red-50'; // > 20 mins - Urgent
    if (minutes > 10) return 'text-yellow-700 bg-yellow-100'; // > 10 mins - Warning
    return 'text-emerald-700 bg-emerald-100'; // < 10 mins - Normal
};

/**
 * Get border color for hot orders based on urgency
 * @param {number} minutes - Minutes waiting
 * @returns {string} Tailwind border classes
 */
export const getHotOrderBorderColor = (minutes) => {
    if (minutes > 1440) return 'border-red-600 animate-pulse'; // > 1 day
    if (minutes > 120) return 'border-orange-500 animate-pulse'; // > 2 hours
    if (minutes > 20) return 'border-red-500 animate-pulse'; // > 20 mins
    if (minutes > 10) return 'border-yellow-500'; // > 10 mins
    return 'border-slate-200'; // < 10 mins
};
