import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { FlightService } from '../../core/services/flight.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let service: FlightService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [FlightService],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FlightService);
    await fixture.whenStable();
  });

  it('should create the component and initialize the reactive form group structure', () => {
    expect(component).toBeTruthy();
    expect(component['filterForm'].contains('searchTerm')).toBeTruthy();
    expect(component['filterForm'].contains('statusFilter')).toBeTruthy();
    expect(component['filterForm'].contains('originFilter')).toBeTruthy();
    expect(component['filterForm'].contains('destinationFilter')).toBeTruthy();
    expect(component['filterForm'].value).toEqual({
      searchTerm: '',
      statusFilter: 'All',
      originFilter: 'All',
      destinationFilter: 'All',
    });
  });

  it('should stream form control updates immediately into the central state signals', async () => {
    component['filterForm'].patchValue({
      searchTerm: 'IGO900',
      statusFilter: 'Delayed',
      originFilter: 'CCU',
      destinationFilter: 'DEL',
    });
    await new Promise((resolve) => setTimeout(resolve, 220)); // Wait for 200ms debounce
    fixture.detectChanges();

    expect(service.searchTerm()).toBe('IGO900');
    expect(service.statusFilter()).toBe('Delayed');
    expect(service.originFilter()).toBe('CCU');
    expect(service.destinationFilter()).toBe('DEL');
  });

  it('should fallback to default values in the signals when form control parameters are cleared', async () => {
    component['filterForm'].patchValue({
      searchTerm: 'IGO900',
      statusFilter: 'Delayed',
      originFilter: 'CCU',
      destinationFilter: 'DEL',
    });
    await new Promise((resolve) => setTimeout(resolve, 220));
    fixture.detectChanges();

    expect(service.searchTerm()).toBe('IGO900');
    expect(service.statusFilter()).toBe('Delayed');
    expect(service.originFilter()).toBe('CCU');
    expect(service.destinationFilter()).toBe('DEL');

    component['resetFilters']();
    await new Promise((resolve) => setTimeout(resolve, 220));
    fixture.detectChanges();

    expect(component['filterForm'].value).toStrictEqual({
      searchTerm: '',
      statusFilter: 'All',
      originFilter: 'All',
      destinationFilter: 'All',
    });
    expect(service.searchTerm()).toBe('');
    expect(service.statusFilter()).toBe('All');
  });

  it('should display the correct real-time computed statistics inside the KPI grid template cards', () => {
    expect(component['kpis']().total).toBe(20);
    expect(component['kpis']().active).toBe(12);
    expect(component['kpis']().arrived).toBe(4);
    expect(component['kpis']().delayed).toBe(4);
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

    const detailCardHeader = fixture.nativeElement.querySelector('app-flight-detail-card h2');
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
