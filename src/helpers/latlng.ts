/**
 * Check if two positions are equal
 * @param pos1 latlng or latlngliteral
 * @param pos2 latlng or latlngliteral
 */
export const compareLatLng = (
  pos1: google.maps.LatLng | google.maps.LatLngLiteral,
  pos2: google.maps.LatLng | google.maps.LatLngLiteral
): boolean => {
  if (typeof pos1.lat !== "function") {
    pos1 = new google.maps.LatLng({ lat: pos1.lat, lng: pos1.lng as number });
  }
  if (typeof pos2.lat !== "function") {
    // we can safely cast here as if lat is func then 2 is func
    pos2 = new google.maps.LatLng({ lat: pos2.lat, lng: pos2.lng as number });
  }

  return pos1.toString() === pos2.toString();
};
