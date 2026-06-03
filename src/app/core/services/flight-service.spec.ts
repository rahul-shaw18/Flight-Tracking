import { TestBed } from '@angular/core/testing';

import { FlightService } from './flight-service';
import { MOCK_FLIGHTS } from '../map/mock/flight.mock';

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

  it('should calculate global system KPI metrics accurately from the fleet source', () => {
    const kpis = service.kpis();
    expect(kpis.total).toBe(20);
    expect(kpis.active).toBe(12);
    expect(kpis.arrived).toBe(4);
    expect(kpis.delayed).toBe(4);
  });

  it('should manage flight selection tracking targets cleanly', () => {
    service.selectFlight(MOCK_FLIGHTS[0]);
    expect(service.selectedFlight()).toBe(MOCK_FLIGHTS[0]);
  });
});
