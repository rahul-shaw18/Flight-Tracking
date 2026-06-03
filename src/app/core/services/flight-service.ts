import { computed, Injectable, signal } from '@angular/core';
import { MOCK_FLIGHTS } from '../map/mock/flight.mock';
import { Flight } from '../map/models/flight';

@Injectable({
  providedIn: 'root',
})
export class FlightService {
  private allFlights = signal(MOCK_FLIGHTS);
  searchTerm = signal('');
  statusFilter = signal('All');
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

  filteredFlights = computed(() => {
    const searchString = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return this.allFlights().filter((flight) => {
      const matchesSearch = !searchString || flight.callsign.toLowerCase().includes(searchString);

      const matchesStatus = status === 'All' || flight.status === status;

      return matchesSearch && matchesStatus;
    });
  });
}
