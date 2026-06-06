import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightDetailCardComponent } from './flight-detail-card.component';
import { FlightService } from '../../../core/services/flight.service';
import { Flight } from '../../../core/models/flight.model';

describe('FlightDetailCardComponent', () => {
  let component: FlightDetailCardComponent;
  let fixture: ComponentFixture<FlightDetailCardComponent>;
  let flightService: FlightService;

  const mockFlight: Flight = {
    id: 'FL001',
    flightNumber: 'AI101',
    callsign: 'AIC101',
    aircraftType: 'Boeing 777-300ER',
    origin: 'BOM',
    destination: 'DEL',
    status: 'Active',
    coordinates: [22.5, 74.0],
    route: [
      [19.076, 72.8777],
      [22.5, 74.0],
      [28.5562, 77.1003],
    ],
    estimatedDeparture: '2026-06-03T06:00:00Z',
    estimatedArrival: '2026-06-03T08:30:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightDetailCardComponent],
      providers: [FlightService],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightDetailCardComponent);
    component = fixture.componentInstance;
    flightService = TestBed.inject(FlightService);
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render flight details like flight number, callsign, and origin/destination', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const rootEl = fixture.nativeElement;
    expect(rootEl.textContent).toContain('AI101');
    expect(rootEl.textContent).toContain('AIC101');
    expect(rootEl.textContent).toContain('Boeing 777-300ER');
    expect(rootEl.textContent).toContain('BOM');
    expect(rootEl.textContent).toContain('DEL');
  });

  it('should compute status classes and styling classes based on flight status', () => {
    fixture.componentRef.setInput('flight', mockFlight); // 'Active'
    fixture.detectChanges();
    expect(component.statusColor()).toContain('text-emerald');
    expect(component.statusTextClass()).toContain('text-emerald');
    expect(component.progressColorClass()).toContain('bg-emerald');
    expect(component.sectionClass()).toContain('border-emerald');

    const delayedFlight = { ...mockFlight, status: 'Delayed' as const };
    fixture.componentRef.setInput('flight', delayedFlight);
    fixture.detectChanges();
    expect(component.statusColor()).toContain('text-crimson');
    expect(component.statusTextClass()).toContain('text-crimson');
    expect(component.progressColorClass()).toContain('bg-crimson');
    expect(component.sectionClass()).toContain('border-crimson');

    const arrivedFlight = { ...mockFlight, status: 'Arrived' as const };
    fixture.componentRef.setInput('flight', arrivedFlight);
    fixture.detectChanges();
    expect(component.statusColor()).toContain('text-cyan');
    expect(component.statusTextClass()).toContain('text-cyan');
    expect(component.progressColorClass()).toContain('bg-cyan');
    expect(component.sectionClass()).toContain('border-cyan');
  });

  it('should toggle playback on service when togglePlayback is called', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const startSpy = vi.spyOn(flightService, 'startPlayback');
    const stopSpy = vi.spyOn(flightService, 'stopPlayback');

    // When isAnimating is false
    flightService.isAnimating.set(false);
    component['togglePlayback']();
    expect(startSpy).toHaveBeenCalled();

    // When isAnimating is true
    flightService.isAnimating.set(true);
    component['togglePlayback']();
    expect(stopSpy).toHaveBeenCalled();
  });

  it('should stop and reset playback progress when resetPlayback is called', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const stopSpy = vi.spyOn(flightService, 'stopPlayback');
    const progressSpy = vi.spyOn(flightService, 'setPlaybackProgress');

    component['resetPlayback']();
    expect(stopSpy).toHaveBeenCalled();
    expect(progressSpy).toHaveBeenCalledWith(0);
  });

  it('should update animation speed on service when onSpeedChange is triggered', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const selectEl = document.createElement('select');
    const optionEl = document.createElement('option');
    optionEl.value = '10';
    selectEl.appendChild(optionEl);
    selectEl.value = '10';

    const event = { target: selectEl } as unknown as Event;
    component['onSpeedChange'](event);

    expect(flightService.animationSpeed()).toBe(10);
  });

  it('should update playback progress on service when onProgressChange is triggered', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const progressSpy = vi.spyOn(flightService, 'setPlaybackProgress');

    const inputEl = document.createElement('input');
    inputEl.type = 'range';
    inputEl.value = '45.5';

    const event = { target: inputEl } as unknown as Event;
    component['onProgressChange'](event);

    expect(progressSpy).toHaveBeenCalledWith(45.5);
  });

  it('should emit clear output when clear button is clicked', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    let clearEmitted = false;
    component.clear.subscribe(() => {
      clearEmitted = true;
    });

    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Close Filters"]');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();

    expect(clearEmitted).toBe(true);
  });
});
