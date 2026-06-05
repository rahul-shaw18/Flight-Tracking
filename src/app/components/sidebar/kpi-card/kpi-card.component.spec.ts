import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardComponent } from './kpi-card.component';

describe('KpiCardComponent', () => {
  let component: KpiCardComponent;
  let fixture: ComponentFixture<KpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.componentRef.setInput('title', 'Total Flights');
    fixture.componentRef.setInput('value', 150);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the title and value inputs correctly', () => {
    fixture.componentRef.setInput('title', 'Active Flights');
    fixture.componentRef.setInput('value', '42');
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('span.uppercase');
    const valueEl = fixture.nativeElement.querySelector('span.text-2xl');

    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent.trim()).toBe('Active Flights');
    expect(valueEl).toBeTruthy();
    expect(valueEl.textContent.trim()).toBe('42');
  });

  it('should compute classes based on total status', () => {
    fixture.componentRef.setInput('title', 'Total');
    fixture.componentRef.setInput('value', 100);
    fixture.componentRef.setInput('status', 'total');
    fixture.detectChanges();

    expect(component.borderClass()).toContain('border-graphite');
    expect(component.labelClass()).toContain('text-slate');

    // Total status should render the total/globe SVG (first if-branch)
    const svgEl = fixture.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
    expect(svgEl.classList.contains('text-slate') || svgEl.classList.contains('dark:text-fog')).toBeTruthy();
  });

  it('should compute classes and render correct SVG for active status', () => {
    fixture.componentRef.setInput('title', 'Active');
    fixture.componentRef.setInput('value', 42);
    fixture.componentRef.setInput('status', 'active');
    fixture.detectChanges();

    expect(component.borderClass()).toContain('border-emerald');
    expect(component.labelClass()).toContain('text-emerald');

    const svgEl = fixture.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
    expect(svgEl.classList.contains('text-emerald')).toBeTruthy();
  });

  it('should compute classes and render correct SVG for delayed status', () => {
    fixture.componentRef.setInput('title', 'Delayed');
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('status', 'delayed');
    fixture.detectChanges();

    expect(component.borderClass()).toContain('border-crimson');
    expect(component.labelClass()).toContain('text-crimson');

    const svgEl = fixture.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
    expect(svgEl.classList.contains('text-crimson')).toBeTruthy();
  });

  it('should compute classes and render correct SVG for arrived status', () => {
    fixture.componentRef.setInput('title', 'Arrived');
    fixture.componentRef.setInput('value', 20);
    fixture.componentRef.setInput('status', 'arrived');
    fixture.detectChanges();

    expect(component.borderClass()).toContain('border-cyan');
    expect(component.labelClass()).toContain('text-cyan');

    const svgEl = fixture.nativeElement.querySelector('svg');
    expect(svgEl).toBeTruthy();
    expect(svgEl.classList.contains('text-cyan')).toBeTruthy();
  });
});
