import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightListItemComponent } from './flight-list-item.component';
import { Flight } from '../../../core/models/flight.model';

describe('FlightListItemComponent', () => {
  let component: FlightListItemComponent;
  let fixture: ComponentFixture<FlightListItemComponent>;

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
      imports: [FlightListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightListItemComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display flight details correctly', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    const rootEl = fixture.nativeElement;
    expect(rootEl.textContent).toContain('AI101');
    expect(rootEl.textContent).toContain('AIC101');
    expect(rootEl.textContent).toContain('BOM');
    expect(rootEl.textContent).toContain('DEL');
  });

  it('should apply selection styling classes when isSelected is true', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.componentRef.setInput('isSelected', true);
    fixture.detectChanges();

    expect(component.cardClass()).toContain('border-acid-lime');
    const container = fixture.nativeElement.querySelector('.group');
    expect(container.className).toContain('border-acid-lime');
  });

  it('should apply active status classes when not selected', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.componentRef.setInput('isSelected', false);
    fixture.detectChanges();

    expect(component.cardClass()).toContain('border-emerald');
    expect(component.statusColor()).toContain('text-emerald');
  });

  it('should apply delayed status classes when not selected', () => {
    const delayedFlight = { ...mockFlight, status: 'Delayed' as const };
    fixture.componentRef.setInput('flight', delayedFlight);
    fixture.componentRef.setInput('isSelected', false);
    fixture.detectChanges();

    expect(component.cardClass()).toContain('border-crimson');
    expect(component.statusColor()).toContain('text-crimson');
  });

  it('should apply arrived status classes when not selected', () => {
    const arrivedFlight = { ...mockFlight, status: 'Arrived' as const };
    fixture.componentRef.setInput('flight', arrivedFlight);
    fixture.componentRef.setInput('isSelected', false);
    fixture.detectChanges();

    expect(component.cardClass()).toContain('border-cyan');
    expect(component.statusColor()).toContain('text-cyan');
  });

  it('should emit select event when clicked', () => {
    fixture.componentRef.setInput('flight', mockFlight);
    fixture.detectChanges();

    let selectEmitted = false;
    component.select.subscribe(() => {
      selectEmitted = true;
    });

    const card = fixture.nativeElement.querySelector('.group');
    card.click();

    expect(selectEmitted).toBe(true);
  });
});
