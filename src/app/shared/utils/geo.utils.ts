export function getDistance(p1: [number, number], p2: [number, number]): number {
  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export function calculateBearing(start: [number, number], end: [number, number]): number {
  const startLat = start[0] * (Math.PI / 180);
  const startLng = start[1] * (Math.PI / 180);
  const endLat = end[0] * (Math.PI / 180);
  const endLng = end[1] * (Math.PI / 180);

  const dLng = endLng - startLng;

  const y = Math.sin(dLng) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI);

  return (bearing + 360) % 360;
}

export function interpolateRoute(route: [number, number][], fraction: number): { lat: number; lng: number; bearing: number } {
  if (!route || route.length === 0) return { lat: 0, lng: 0, bearing: 0 };
  if (route.length === 1) return { lat: route[0][0], lng: route[0][1], bearing: 0 };
  if (fraction <= 0) return { lat: route[0][0], lng: route[0][1], bearing: calculateBearing(route[0], route[1]) };
  if (fraction >= 1) return { lat: route[route.length - 1][0], lng: route[route.length - 1][1], bearing: calculateBearing(route[route.length - 2], route[route.length - 1]) };

  // Calculate segment distances
  const distances: number[] = [];
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const dist = getDistance(route[i], route[i + 1]);
    distances.push(dist);
    totalDistance += dist;
  }

  const targetDistance = fraction * totalDistance;
  let accumulatedDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const segmentDist = distances[i];
    if (accumulatedDistance + segmentDist >= targetDistance) {
      const segmentFraction = (targetDistance - accumulatedDistance) / segmentDist;
      const start = route[i];
      const end = route[i + 1];
      const lat = start[0] + (end[0] - start[0]) * segmentFraction;
      const lng = start[1] + (end[1] - start[1]) * segmentFraction;
      const bearing = calculateBearing(start, end);
      return { lat, lng, bearing };
    }
    accumulatedDistance += segmentDist;
  }

  const last = route[route.length - 1];
  return { lat: last[0], lng: last[1], bearing: calculateBearing(route[route.length - 2], last) };
}
