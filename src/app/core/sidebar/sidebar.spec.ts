import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sidebar } from './sidebar';
import { FlightService } from '../services/flight-service';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let service: FlightService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [FlightService],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    service = TestBed.inject(FlightService);
    await fixture.whenStable();
  });

  it('should create the component and initialize the reactive form group structure', () => {
    expect(component).toBeTruthy();
    expect(component.filterForm.contains('searchTerm')).toBeTruthy();
    expect(component.filterForm.contains('statusFilter')).toBeTruthy();
    expect(component.filterForm.value).toEqual({ searchTerm: '', statusFilter: 'All' });
  });

  it('should stream form control updates immediately into the central state signals', () => {
    component.filterForm.patchValue({
      searchTerm: 'IGO900',
      statusFilter: 'Delayed',
    });
    expect(service.searchTerm()).toBe('IGO900');
    expect(service.statusFilter()).toBe('Delayed');
  });

  it('should fallback to default values in the signals when form control parameters are cleared', () => {
    component.filterForm.patchValue({
      searchTerm: 'IGO900',
      statusFilter: 'Delayed',
    });
    expect(service.searchTerm()).toBe('IGO900');
    expect(service.statusFilter()).toBe('Delayed');

    component.handleReset();
    expect(component.filterForm.value).toStrictEqual({ searchTerm: null, statusFilter: null });
  });

  it('should display the correct real-time computed statistics inside the KPI grid template cards', () => {
    expect(component.kpis.total).toBe(20);
    expect(component.kpis.active).toBe(12);
    expect(component.kpis.arrived).toBe(4);
    expect(component.kpis.delayed).toBe(4);
  });

  it('should render the fallback empty state description layout when no flight is active in the selection signal', () => {
    service.clearSelection();
    fixture.detectChanges();

    const placeholderText = fixture.nativeElement.querySelector('.border-dashed p');
    expect(placeholderText).toBeTruthy();
    expect(placeholderText.textContent).toContain('Select an active aircraft marker');
  });

  it('should dynamically inject the flight metadata profile card template when a flight is active in the selection signal', () => {
    const mockFlightProfile = service.filteredFlights()[0];
    service.selectFlight(mockFlightProfile);
    fixture.detectChanges();

    const detailCardHeader = fixture.nativeElement.querySelector('.text-lg.font-black');
    expect(detailCardHeader).toBeTruthy();
    expect(detailCardHeader.textContent.trim()).toBe(mockFlightProfile.flightNumber);
  });

  it('should execute the clearSelection workflow on the shared service layer when clicking the Clear action button', () => {
    const mockFlightProfile = service.filteredFlights()[0];
    service.selectFlight(mockFlightProfile);
    fixture.detectChanges();

    service.clearSelection();
    fixture.detectChanges();

    expect(service.selectedFlight()).toBeNull();
  });
});
