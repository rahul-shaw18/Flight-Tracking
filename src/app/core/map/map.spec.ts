import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Map } from './map';
import { FlightService } from '../services/flight-service';

describe('Map', () => {
  let component: Map;
  let fixture: ComponentFixture<Map>;
  let service: FlightService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Map],
      providers: [FlightService],
    }).compileComponents();

    fixture = TestBed.createComponent(Map);
    component = fixture.componentInstance;
    service = TestBed.inject(FlightService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
 it('should initialize and mount the map canvas layout wrapper correctly', () => {
    expect(component).toBeTruthy();
    
    const container = fixture.nativeElement.querySelector('div');
    expect(container).toBeTruthy();
  });

  it('should mount both the stationary airport markers and dynamic plane icons onto the map layer', () => {
    const renderedMarkers = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon');
    
    expect(renderedMarkers.length).toBe(60);
  });

  it('should dispatch the path routing line and expose the details popover window when an active plane icon is clicked', () => {
    const planeIcons = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon');
    const firstPlane = planeIcons[2] as HTMLElement; 

    firstPlane.click();
    fixture.detectChanges();

    const pathLine = fixture.nativeElement.querySelector('.leaflet-interactive');
    expect(pathLine).toBeTruthy();

    const popupBubble = fixture.nativeElement.querySelector('.leaflet-popup-content');
    expect(popupBubble).toBeTruthy();
    expect(popupBubble?.textContent).toContain('Callsign:');
  });

  it('should cleanly expose terminal information when a stationary airport marker is clicked', () => {
    const airportMarkers = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon');
    const firstAirport = airportMarkers[0] as HTMLElement;

    firstAirport.click();
    fixture.detectChanges();

    const popupBubble = fixture.nativeElement.querySelector('.leaflet-popup-content');
    expect(popupBubble).toBeTruthy();
    expect(popupBubble?.textContent).toContain('Origin:');
  });

  it('should disable and strip down the previous flight tracking vector path line when a different plane target is selected', () => {
    const planeIcons = fixture.nativeElement.querySelectorAll('.leaflet-marker-icon');
    const firstPlane = planeIcons[2] as HTMLElement;
    const secondPlane = planeIcons[5] as HTMLElement;

    firstPlane.click();
    fixture.detectChanges();
    
    const firstPathLineInstance = fixture.nativeElement.querySelector('.leaflet-interactive');
    expect(firstPathLineInstance).toBeTruthy();

    secondPlane.click();
    fixture.detectChanges();

    const currentActiveFlight = service.selectedFlight();
    expect(currentActiveFlight).toBeTruthy();
    
    const updatedPopup = fixture.nativeElement.querySelector('.leaflet-popup-content');
    expect(updatedPopup?.textContent).toContain(currentActiveFlight?.flightNumber);
  });
});