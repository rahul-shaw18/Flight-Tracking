import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  viewChild,
  untracked,
} from '@angular/core';
import L from 'leaflet';
import { FlightService } from '../../core/services/flight.service';
import { Flight } from '../../core/models/flight.model';
import { calculateBearing } from '../../shared/utils/geo.utils';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
})
export class MapComponent {
  protected readonly flightService = inject(FlightService);
  protected readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map!: L.Map;
  private baseTileLayer!: L.TileLayer;
  private cloudLayerGroup: L.LayerGroup | null = null;
  private rainLayerGroup: L.LayerGroup | null = null;
  private sunLayerGroup: L.LayerGroup | null = null;

  private airportIcon = L.icon({
    iconUrl: 'icons/airport-tower.svg',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -28],
    className: 'custom-airport-icon',
  });

  private markerGroup!: L.LayerGroup;
  private currentRouteLine!: L.Polyline;
  private planeMarkers = new Map<string, L.Marker>();

  constructor() {
    // Theme switching effect
    effect(() => {
      const isDark = this.flightService.isDarkMode();

      // Update HTML class
      const root = document.documentElement;
      if (isDark) {
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
      }

      if (!this.map) return;

      // Update Tile Layer
      if (this.baseTileLayer) {
        this.baseTileLayer.remove();
      }

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      this.baseTileLayer = L.tileLayer(tileUrl, {
        attribution: undefined,
      }).addTo(this.map);
    });

    // Weather overlay effect
    effect(() => {
      const showCloud = this.flightService.showCloudOverlay();
      const showRain = this.flightService.showRainOverlay();
      const showSun = this.flightService.showSunOverlay();

      if (!this.map) return;

      // 1. Cloud Overlay
      if (showCloud) {
        if (!this.cloudLayerGroup) {
          this.cloudLayerGroup = L.layerGroup().addTo(this.map);
          const cloudZones: [number, number, number][] = [
            [13.1986, 77.7066, 120000], // Bengaluru
            [23.18, 89.16, 100000], // Jessore
            [50.0379, 8.5622, 180000], // Frankfurt
          ];

          cloudZones.forEach(([lat, lng, radius]) => {
            L.circle([lat, lng], {
              radius: radius,
              color: '#cbd5e1',
              fillColor: '#cbd5e1',
              fillOpacity: 0.15,
              weight: 1.5,
              className: 'weather-pulse-zone',
            }).addTo(this.cloudLayerGroup!);

            const cloudHtml = `
              <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #cbd5e1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                  <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>
                </svg>
              </div>
            `;
            const icon = L.divIcon({
              html: cloudHtml,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });
            L.marker([lat, lng], { icon })
              .addTo(this.cloudLayerGroup!)
              .bindPopup(
                `<div class="text-snow p-1 font-sans"><h4 class="font-w590 text-indigo text-xs">Cloud Cover</h4><p class="text-[10px] text-fog mt-0.5">Partly cloudy sky layer.</p></div>`,
              );
          });
        }
      } else {
        if (this.cloudLayerGroup) {
          this.cloudLayerGroup.remove();
          this.cloudLayerGroup = null;
        }
      }

      // 2. Rain Overlay
      if (showRain) {
        if (!this.rainLayerGroup) {
          this.rainLayerGroup = L.layerGroup().addTo(this.map);
          const rainZones: [number, number, number][] = [
            [19.076, 72.8777, 150000], // Mumbai
            [22.6547, 88.4467, 130000], // Kolkata
            [49.0097, 2.5479, 160000], // Paris/CDG
          ];

          rainZones.forEach(([lat, lng, radius]) => {
            L.circle([lat, lng], {
              radius: radius,
              color: '#60a5fa',
              fillColor: '#60a5fa',
              fillOpacity: 0.18,
              weight: 1.5,
              className: 'weather-pulse-zone',
            }).addTo(this.rainLayerGroup!);

            const rainHtml = `
              <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #60a5fa; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                  <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>
                  <path d="M8 20v2m4-2v2m4-2v2" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            `;
            const icon = L.divIcon({
              html: rainHtml,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });
            L.marker([lat, lng], { icon })
              .addTo(this.rainLayerGroup!)
              .bindPopup(
                `<div class="text-snow p-1 font-sans"><h4 class="font-w590 text-indigo text-xs">Precipitation</h4><p class="text-[10px] text-fog mt-0.5">Active rain shower radar zone.</p></div>`,
              );
          });
        }
      } else {
        if (this.rainLayerGroup) {
          this.rainLayerGroup.remove();
          this.rainLayerGroup = null;
        }
      }

      // 3. Sun Overlay
      if (showSun) {
        if (!this.sunLayerGroup) {
          this.sunLayerGroup = L.layerGroup().addTo(this.map);
          const sunZones: [number, number, number][] = [
            [28.5562, 77.1003, 140000], // Delhi
            [17.2403, 78.4294, 110000], // Hyderabad
            [25.2532, 55.3657, 200000], // Dubai
          ];

          sunZones.forEach(([lat, lng, radius]) => {
            L.circle([lat, lng], {
              radius: radius,
              color: '#fbbf24',
              fillColor: '#fbbf24',
              fillOpacity: 0.12,
              weight: 1.5,
              className: 'weather-pulse-zone',
            }).addTo(this.sunLayerGroup!);

            const sunHtml = `
              <div style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: #fbbf24; filter: drop-shadow(0 0 6px #fbbf24);">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            `;
            const icon = L.divIcon({
              html: sunHtml,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 18],
            });
            L.marker([lat, lng], { icon })
              .addTo(this.sunLayerGroup!)
              .bindPopup(
                `<div class="text-snow p-1 font-sans"><h4 class="font-w590 text-indigo text-xs">Clear Sky</h4><p class="text-[10px] text-fog mt-0.5">High visibility clear weather region.</p></div>`,
              );
          });
        }
      } else {
        if (this.sunLayerGroup) {
          this.sunLayerGroup.remove();
          this.sunLayerGroup = null;
        }
      }
    });

    // Playback coordinates animation effect
    effect(() => {
      const selected = this.flightService.selectedFlight();
      const animatedCoords = this.flightService.animatedCoordinates();
      const animatedHeading = this.flightService.animatedHeading();

      if (!this.map || !selected) return;

      const marker = this.planeMarkers.get(selected.id);
      if (!marker) return;

      const currentCoords = animatedCoords ? animatedCoords : selected.coordinates;
      const currentHeading =
        animatedHeading !== null
          ? animatedHeading
          : calculateBearing(selected.coordinates, selected.route[selected.route.length - 1]);

      // Move marker to the animated coordinate
      marker.setLatLng(currentCoords);

      const planeHtml = `
        <div style="transform: rotate(${currentHeading}deg) scale(1.15); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform 0.1s linear;">
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; fill: #e4f222; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)) drop-shadow(0 0 4px #e4f222);">
            <path d="M448 336v-40L288 192V79.2c0-26.1-20.9-47.2-47-47.2s-47 21.1-47 47.2V192L32 296v40l160-48v112l-48 36v28l88-24 88 24v-28l-48-36V288l160 48z"/>
          </svg>
        </div>
      `;

      const planeIcon = L.divIcon({
        html: planeHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      marker.setIcon(planeIcon);

      if (this.flightService.isAnimating()) {
        this.map.panTo(currentCoords, { animate: true, duration: 0.1 });
      }
    });

    effect(() => {
      const flightsToRender = this.flightService.filteredFlights();

      if (this.map && this.markerGroup) {
        // Read selected flight non-reactively to prevent redrawing all markers when selection changes
        const selected = untracked(() => this.flightService.selectedFlight());
        this.renderFlightMarkers(flightsToRender, selected);
      }
    });

    effect(() => {
      const selected = this.flightService.selectedFlight();

      if (!this.map) return;

      if (this.currentRouteLine) {
        this.currentRouteLine.remove();
      }

      if (selected) {
        this.currentRouteLine = L.polyline(selected.route, {
          color: '#5e6ad2',
          weight: 3,
          dashArray: '5, 10',
          opacity: 0.8,
        }).addTo(this.map);

        this.map.panTo(selected.coordinates);
      }

      this.updatePlaneIcons(selected);
    });

    afterNextRender(() => {
      const containerElement = this.mapContainer()?.nativeElement;

      if (containerElement) {
        this.map = L.map(containerElement, {
          zoomControl: false,
          minZoom: 2,
          maxZoom: 18,
          worldCopyJump: true,
          maxBounds: L.latLngBounds([-85, -180], [85, 180]),
          maxBoundsViscosity: 1.0,
        }).setView([22.0, 78.0], 5);

        // Add standard zoom control at bottom right for cleaner design
        L.control.zoom({ position: 'topright' }).addTo(this.map);

        const isDark = this.flightService.isDarkMode();
        const tileUrl = isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        this.baseTileLayer = L.tileLayer(tileUrl, {
          attribution: undefined,
        }).addTo(this.map);

        this.markerGroup = L.layerGroup().addTo(this.map);
        this.renderFlightMarkers(
          this.flightService.filteredFlights(),
          this.flightService.selectedFlight(),
        );
      }
    });
  }

  protected toggleTheme(): void {
    this.flightService.isDarkMode.update((v) => !v);
  }

  protected toggleFilters(): void {
    this.flightService.selectedFlight.set(null);
    this.flightService.selectedAirport.set(null);
    this.flightService.showTrafficPanel.set(false);
    this.flightService.showCloudPanel.set(false);
    this.flightService.showFilterPanel.set(!this.flightService.showFilterPanel());
  }

  protected toggleTraffic(): void {
    this.flightService.selectedFlight.set(null);
    this.flightService.selectedAirport.set(null);
    this.flightService.showFilterPanel.set(false);
    this.flightService.showCloudPanel.set(false);
    this.flightService.showTrafficPanel.set(!this.flightService.showTrafficPanel());
  }

  protected toggleKPI(): void {
    this.flightService.selectedFlight.set(null);
    this.flightService.selectedAirport.set(null);
    this.flightService.showFilterPanel.set(false);
    this.flightService.showTrafficPanel.set(false);
    this.flightService.showCloudPanel.set(false);
  }

  protected toggleCloud(): void {
    this.flightService.selectedFlight.set(null);
    this.flightService.selectedAirport.set(null);
    this.flightService.showFilterPanel.set(false);
    this.flightService.showTrafficPanel.set(false);
    this.flightService.showCloudPanel.set(!this.flightService.showCloudPanel());
  }

  protected resetAllFilters(): void {
    this.flightService.resetAllFilters();
  }

  private renderFlightMarkers(flights: Flight[], selectedFlight: Flight | null): void {
    this.markerGroup.clearLayers();
    this.planeMarkers.clear();

    // 1. Gather unique airport coordinates to avoid overlapping duplicate markers
    const uniqueAirports = new Map<string, [number, number]>();
    flights.forEach((flight) => {
      if (flight.route && flight.route.length > 0) {
        uniqueAirports.set(flight.origin, flight.route[0]);
        uniqueAirports.set(flight.destination, flight.route[flight.route.length - 1]);
      }
    });

    // 2. Render airport markers once per unique airport
    uniqueAirports.forEach((coords, code) => {
      const airportMarker = L.marker(coords, { icon: this.airportIcon }).bindPopup(
        `<div class="text-snow p-1 font-sans">
          <h4 class="font-w590 text-indigo text-xs uppercase tracking-wider">Airport: ${code}</h4>
          <p class="text-[10px] text-fog mt-0.5 font-sans">Terminal Operational Hub</p>
         </div>`,
      );

      airportMarker.on('click', () => {
        this.flightService.selectAirport(code);
      });

      this.markerGroup.addLayer(airportMarker);
    });

    // 3. Render plane markers using L.divIcon to fix rotation zoom/pan bug
    flights.forEach((flight: Flight) => {
      const destCoordinates = flight.route[flight.route.length - 1];
      const headingAngle = calculateBearing(flight.coordinates, destCoordinates);
      const isSelected = selectedFlight?.id === flight.id;

      // Using L.divIcon with inner rotation allows Leaflet to handle position transforms
      // without overriding our custom CSS plane rotation.
      const planeHtml = `
        <div style="transform: rotate(${headingAngle}deg) ${isSelected ? 'scale(1.15)' : ''}; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform 0.2s ease;">
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; fill: ${isSelected ? '#e4f222' : '#5e6ad2'}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)) ${isSelected ? 'drop-shadow(0 0 4px #e4f222)' : ''};">
            <path d="M448 336v-40L288 192V79.2c0-26.1-20.9-47.2-47-47.2s-47 21.1-47 47.2V192L32 296v40l160-48v112l-48 36v28l88-24 88 24v-28l-48-36V288l160 48z"/>
          </svg>
        </div>
      `;

      const planeIcon = L.divIcon({
        html: planeHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const planeMarker = L.marker(flight.coordinates, { icon: planeIcon });

      const popupHtml = `
        <div class="map-popup text-snow p-1 font-sans">
          <h3 class="font-w590 text-indigo tracking-tight text-sm">${flight.flightNumber}</h3>
          <div class="text-[10px] text-fog mt-1 space-y-0.5 font-sans">
            <p><span class="text-mist font-w510">Callsign:</span> <span class="font-mono">${flight.callsign}</span></p>
            <p><span class="text-mist font-w510">Route:</span> <span class="font-mono">${flight.origin} ➔ ${flight.destination}</span></p>
            <p><span class="text-mist font-w510">Heading:</span> <span class="font-mono">${Math.round(headingAngle)}°</span></p>
            <p><span class="text-mist font-w510">Status:</span> 
              <span class="${
                flight.status === 'Active'
                  ? 'text-emerald font-w590'
                  : flight.status === 'Delayed'
                    ? 'text-crimson font-w590'
                    : 'text-cyan font-w590'
              }">${flight.status}</span>
            </p>
          </div>
        </div>
      `;

      planeMarker.bindPopup(popupHtml);

      planeMarker.on('click', () => {
        this.flightService.selectFlight(flight);
      });

      this.markerGroup.addLayer(planeMarker);
      this.planeMarkers.set(flight.id, planeMarker);
    });
  }

  private updatePlaneIcons(selected: Flight | null): void {
    this.planeMarkers.forEach((marker, flightId) => {
      const flight = this.flightService.filteredFlights().find((f) => f.id === flightId);
      if (!flight) return;

      const destCoordinates = flight.route[flight.route.length - 1];
      const headingAngle = calculateBearing(flight.coordinates, destCoordinates);
      const isSelected = selected?.id === flightId;

      const planeHtml = `
        <div style="transform: rotate(${headingAngle}deg) ${isSelected ? 'scale(1.15)' : ''}; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform 0.2s ease;">
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; fill: ${isSelected ? '#e4f222' : '#5e6ad2'}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)) ${isSelected ? 'drop-shadow(0 0 4px #e4f222)' : ''};">
            <path d="M448 336v-40L288 192V79.2c0-26.1-20.9-47.2-47-47.2s-47 21.1-47 47.2V192L32 296v40l160-48v112l-48 36v28l88-24 88 24v-28l-48-36V288l160 48z"/>
          </svg>
        </div>
      `;

      const planeIcon = L.divIcon({
        html: planeHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      marker.setIcon(planeIcon);
    });
  }
}
