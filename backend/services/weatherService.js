export const weatherMultipliers = {
  clear: 1.0,
  rain: 1.3,
  storm: 1.6
};

/**
 * This service mimics an API call. 
 * In a real scenario, you'd fetch live data here.
 */
export const getMultiplier = (condition) => {
  return weatherMultipliers[condition.toLowerCase()] || 1.0;
};