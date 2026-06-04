import { computed, Injectable, signal } from '@angular/core';
import { MOCK_FLIGHTS, AIRPORT_LOOKUP } from '../constants/flight.mock';
import { Flight } from '../models/flight.model';
import { interpolateRoute } from '../../shared/utils/geo.utils';

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
  selectedAirport = signal<string | null>(null);
  showFilterPanel = signal<boolean>(false);
  showTrafficPanel = signal<boolean>(false);
  showCloudPanel = signal<boolean>(false);
  showKPI = computed(
    () => !this.showFilterPanel() && !this.showTrafficPanel() && !this.showCloudPanel(),
  );
  resetTrigger = signal<number>(0);

  // New Signals for Theme, Weather Overlays, and Playback Animation
  isDarkMode = signal<boolean>(true);
  showCloudOverlay = signal<boolean>(false);
  showRainOverlay = signal<boolean>(false);
  showSunOverlay = signal<boolean>(false);

  isAnimating = signal<boolean>(false);
  animationProgress = signal<number>(0);
  animationSpeed = signal<number>(5);
  animatedCoordinates = signal<[number, number] | null>(null);
  animatedHeading = signal<number | null>(null);

  private animationInterval: number | null = null;

  selectFlight(flight: Flight): void {
    this.selectedAirport.set(null);
    this.showFilterPanel.set(false);
    this.showTrafficPanel.set(false);

    // Reset playback animation state for the newly selected flight
    this.stopPlayback();
    this.animationProgress.set(0);
    this.animatedCoordinates.set(null);
    this.animatedHeading.set(null);

    this.selectedFlight.set(flight);
  }

  clearSelection(): void {
    this.stopPlayback();
    this.animationProgress.set(0);
    this.animatedCoordinates.set(null);
    this.animatedHeading.set(null);
    this.selectedFlight.set(null);
  }

  selectAirport(code: string): void {
    this.stopPlayback();
    this.animationProgress.set(0);
    this.animatedCoordinates.set(null);
    this.animatedHeading.set(null);

    this.selectedFlight.set(null);
    this.showFilterPanel.set(false);
    this.showTrafficPanel.set(false);
    this.selectedAirport.set(code);
  }

  clearAirportSelection(): void {
    this.selectedAirport.set(null);
  }

  // Animation Playback Control Methods
  startPlayback(): void {
    if (this.animationInterval) return;
    this.isAnimating.set(true);

    const step = () => {
      if (!this.isAnimating()) {
        this.stopPlayback();
        return;
      }

      const flight = this.selectedFlight();
      if (!flight) {
        this.stopPlayback();
        return;
      }

      const currentProgress = this.animationProgress();
      const speedMultiplier = this.animationSpeed();

      // Target a smooth update rate (increment per frame)
      const increment = 0.05 * speedMultiplier;
      const nextProgress = Math.min(100, currentProgress + increment);

      this.animationProgress.set(nextProgress);
      this.updateAnimatedPosition(flight, nextProgress / 100);

      if (nextProgress >= 100) {
        this.stopPlayback();
      } else {
        this.animationInterval = requestAnimationFrame(step);
      }
    };

    this.animationInterval = requestAnimationFrame(step);
  }

  stopPlayback(): void {
    this.isAnimating.set(false);
    if (this.animationInterval) {
      cancelAnimationFrame(this.animationInterval);
      this.animationInterval = null;
    }
  }

  setPlaybackProgress(progress: number): void {
    this.animationProgress.set(progress);
    const flight = this.selectedFlight();
    if (flight) {
      this.updateAnimatedPosition(flight, progress / 100);
    }
  }

  private updateAnimatedPosition(flight: Flight, fraction: number): void {
    const route = flight.route;
    if (!route || route.length === 0) return;

    const interpolated = interpolateRoute(route, fraction);
    this.animatedCoordinates.set([interpolated.lat, interpolated.lng]);
    this.animatedHeading.set(interpolated.bearing);
  }

  airportName(code: string): string {
    return AIRPORT_LOOKUP[code]?.name ?? `${code} Airport`;
  }

  airportDetails(code: string) {
    return (
      AIRPORT_LOOKUP[code] ?? {
        name: `${code} Operational Hub`,
        city: code,
        elevation: '50 ft',
        weather: { temp: '25°C', wind: '8 kt', visibility: '10 km', desc: 'Clear' },
      }
    );
  }

  resetAllFilters(): void {
    this.resetTrigger.update((v) => v + 1);
  }

  kpis = computed(() => {
    const flights = this.allFlights();

    return {
      total: flights.length,
      active: flights.filter((f) => f.status === 'Active').length,
      delayed: flights.filter((f) => f.status === 'Delayed').length,
      arrived: flights.filter((f) => f.status === 'Arrived').length,
    };
  });

  originAirports = computed(() => {
    const origins = this.allFlights().map((f) => f.origin);
    return Array.from(new Set(origins)).sort();
  });

  destinationAirports = computed(() => {
    const destinations = this.allFlights().map((f) => f.destination);
    return Array.from(new Set(destinations)).sort();
  });

  departuresForAirport = computed(() => {
    const code = this.selectedAirport();
    if (!code) return [];
    return this.allFlights().filter((f) => f.origin === code);
  });

  arrivalsForAirport = computed(() => {
    const code = this.selectedAirport();
    if (!code) return [];
    return this.allFlights().filter((f) => f.destination === code);
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
