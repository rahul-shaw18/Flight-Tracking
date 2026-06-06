type FlightStatus = 'Active' | 'Delayed' | 'Arrived';

export interface Flight {
  id: string;
  flightNumber: string;
  callsign: string;
  aircraftType: string;
  origin: string;
  destination: string;
  status: FlightStatus;
  coordinates: [number, number];
  route: [number, number][];
  estimatedDeparture: string;
  estimatedArrival: string;
};

