/**
 * Geo Utilities
 * GPS distance and ETA calculations
 */

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Validate inputs
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return 0;
    }

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calculate ETA based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} avgSpeed - Average speed in km/h (default: 20)
 * @returns {number} ETA in minutes
 */
function calculateETA(distanceKm, avgSpeed = 20) {
    if (!distanceKm || distanceKm <= 0) {
        return 5; // Default 5 minutes for very short distances
    }
    return Math.ceil((distanceKm / avgSpeed) * 60);
}

module.exports = {
    calculateDistance,
    calculateETA,
    toRad
};
