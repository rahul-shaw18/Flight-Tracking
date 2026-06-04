import { TestBed } from '@angular/core/testing';

import { FlightService } from './flight.service';
import { MOCK_FLIGHTS } from '../constants/flight.mock';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightService);
  });

  it('should initialize with all 20 flights and no active selection', () => {
    const allFlights = service.filteredFlights();
    const selectedFlight = service.selectedFlight();
    expect(allFlights.length).toBe(20);
    expect(selectedFlight).toBeNull();
  });

  it('should filter flights accurately based on callsign search string text', () => {
    service.searchTerm.set('AIC101');
    const results = service.filteredFlights();
    expect(results.length).toBe(1);
    expect(results[0].flightNumber).toBe('AI101');
    expect(results[0].callsign).toBe('AIC101');
  });

  it('should filter flights accurately based on dropdown status parameters', () => {
    service.statusFilter.set('Delayed');
    let results = service.filteredFlights();
    expect(results.length).toBe(4);

    service.statusFilter.set('Active');
    results = service.filteredFlights();
    expect(results.length).toBe(12);

    service.statusFilter.set('Arrived');
    results = service.filteredFlights();
    expect(results.length).toBe(4);
  });

  it('should filter flights accurately based on origin airport', () => {
    service.originFilter.set('BOM');
    const results = service.filteredFlights();
    expect(results.length).toBe(3); // FL001, FL006, FL014
  });

  it('should filter flights accurately based on destination airport', () => {
    service.destinationFilter.set('DEL');
    const results = service.filteredFlights();
    expect(results.length).toBe(5); // FL001, FL008, FL010, FL015, FL017
  });

  it('should calculate global system KPI metrics accurately from the fleet source', () => {
    const kpis = service.kpis();
    expect(kpis.total).toBe(20);
    expect(kpis.active).toBe(12);
    expect(kpis.arrived).toBe(4);
    expect(kpis.delayed).toBe(4);
  });

  it('should manage flight selection tracking targets cleanly and reset animation state', () => {
    service.selectFlight(MOCK_FLIGHTS[0]);
    expect(service.selectedFlight()).toBe(MOCK_FLIGHTS[0]);
    expect(service.isAnimating()).toBeFalsy();
    expect(service.animationProgress()).toBe(0);
    expect(service.animatedCoordinates()).toBeNull();
  });

  it('should manage theme toggling state', () => {
    expect(service.isDarkMode()).toBe(true);
    service.isDarkMode.set(false);
    expect(service.isDarkMode()).toBe(false);
  });

  it('should toggle weather overlay layers state', () => {
    expect(service.showCloudOverlay()).toBe(false);
    expect(service.showRainOverlay()).toBe(false);
    expect(service.showSunOverlay()).toBe(false);

    service.showCloudOverlay.set(true);
    expect(service.showCloudOverlay()).toBe(true);
  });

  it('should animate flight playback coordinates correctly over route path', () => {
    const flight = MOCK_FLIGHTS[0]; // BOM to DEL
    service.selectFlight(flight);

    // Simulate setting progress to 50%
    service.setPlaybackProgress(50);
    expect(service.animationProgress()).toBe(50);

    const animatedCoords = service.animatedCoordinates();
    expect(animatedCoords).not.toBeNull();
    // Route is [[19.076, 72.8777], [22.5, 74.0], [25.0, 76.5], [28.5562, 77.1003]]
    expect(animatedCoords![0]).toBeGreaterThan(19.0);
    expect(animatedCoords![0]).toBeLessThan(29.0);

    service.stopPlayback();
    expect(service.isAnimating()).toBe(false);
  });
});
