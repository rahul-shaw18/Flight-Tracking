import { computed, Injectable, signal } from '@angular/core';
import { MOCK_FLIGHTS } from './flight.mock';
import { Flight } from './flight.model';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private allFlights = signal(MOCK_FLIGHTS);
  searchTerm = signal('');
  statusFilter = signal('All');
  originFilter = signal('All');
  destinationFilter = signal('All');
  selectedFlight = signal<Flight | null>(null);

  selectFlight(flight: Flight): void {
    this.selectedFlight.set(flight);
  }

  clearSelection(): void {
    this.selectedFlight.set(null);
  }

  kpis = computed(() => {
    const flights = this.allFlights();
    
    return {
      total: flights.length,
      active: flights.filter(f => f.status === 'Active').length,
      delayed: flights.filter(f => f.status === 'Delayed').length,
      arrived: flights.filter(f => f.status === 'Arrived').length
    };
  });

  originAirports = computed(() => {
    const origins = this.allFlights().map(f => f.origin);
    return Array.from(new Set(origins)).sort();
  });

  destinationAirports = computed(() => {
    const destinations = this.allFlights().map(f => f.destination);
    return Array.from(new Set(destinations)).sort();
  });

  filteredFlights = computed(() => {
    const searchString = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    const origin = this.originFilter();
    const destination = this.destinationFilter();

    return this.allFlights().filter((flight) => {
      const matchesSearch = !searchString || flight.callsign.toLowerCase().includes(searchString);
      const matchesStatus = status === 'All' || flight.status === status;
      const matchesOrigin = origin === 'All' || flight.origin === origin;
      const matchesDestination = destination === 'All' || flight.destination === destination;

      return matchesSearch && matchesStatus && matchesOrigin && matchesDestination;
    });
  });
}

