import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AirportDetailCardComponent } from './airport-detail-card.component';
import { FlightService } from '../../../core/services/flight.service';
import { Flight } from '../../../core/models/flight.model';

describe('AirportDetailCardComponent', () => {
  let component: AirportDetailCardComponent;
  let fixture: ComponentFixture<AirportDetailCardComponent>;
  let flightService: FlightService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportDetailCardComponent],
      providers: [FlightService],
    }).compileComponents();

    fixture = TestBed.createComponent(AirportDetailCardComponent);
    component = fixture.componentInstance;
    flightService = TestBed.inject(FlightService);
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the correct airport name, city, and elevation details', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();

    const rootEl = fixture.nativeElement;
    expect(rootEl.textContent).toContain('Chhatrapati Shivaji Maharaj Intl Airport');
    expect(rootEl.textContent).toContain('BOM / Mumbai');
    expect(rootEl.textContent).toContain('Elevation: 39 ft');
  });

  it('should render weather metrics correctly', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();

    const rootEl = fixture.nativeElement;
    expect(rootEl.textContent).toContain('31°C'); // Temperature
    expect(rootEl.textContent).toContain('10 kt'); // Wind
    expect(rootEl.textContent).toContain('6 km'); // Visibility
  });

  it('should change active tab between departures and arrivals when clicked', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();

    expect(component.activeTab).toBe('departures');

    const tabButtons = fixture.nativeElement.querySelectorAll('button');
    // Closest tab selector: departures is index 1, arrivals is index 2.
    // Close button is index 0.
    const departuresTab = tabButtons[1];
    const arrivalsTab = tabButtons[2];

    arrivalsTab.click();
    fixture.detectChanges();
    expect(component.activeTab).toBe('arrivals');

    departuresTab.click();
    fixture.detectChanges();
    expect(component.activeTab).toBe('departures');
  });

  it('should list departing flights and trigger selectFlight when a flight list item is clicked', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();

    const departures = component['departures']();
    expect(departures.length).toBeGreaterThan(0);

    const flightSelectSpy = vi.spyOn(flightService, 'selectFlight');

    // Query departures list container
    const flightItems = fixture.nativeElement.querySelectorAll('.custom-scrollbar > div');
    expect(flightItems.length).toBe(departures.length);

    // Click on the first departure flight in DOM
    flightItems[0].click();
    expect(flightSelectSpy).toHaveBeenCalledWith(departures[0]);
  });

  it('should list arriving flights when activeTab is arrivals', () => {
    fixture.componentRef.setInput('airportCode', 'DEL');
    flightService.selectedAirport.set('DEL');
    fixture.detectChanges();

    // Switch tab to arrivals by clicking the tab button
    const tabButtons = fixture.nativeElement.querySelectorAll('button');
    const arrivalsTab = tabButtons[2];
    arrivalsTab.click();
    fixture.detectChanges();

    const arrivals = component['arrivals']();
    expect(arrivals.length).toBeGreaterThan(0);

    const flightItems = fixture.nativeElement.querySelectorAll('.custom-scrollbar > div');
    expect(flightItems.length).toBe(arrivals.length);
  });

  it('should emit clear output when Close button is clicked', () => {
    fixture.componentRef.setInput('airportCode', 'BOM');
    flightService.selectedAirport.set('BOM');
    fixture.detectChanges();

    let clearEmitted = false;
    component.clear.subscribe(() => {
      clearEmitted = true;
    });

    const closeBtn = fixture.nativeElement.querySelector('button');
    expect(closeBtn.textContent).toContain('Close');
    closeBtn.click();

    expect(clearEmitted).toBe(true);
  });
});
