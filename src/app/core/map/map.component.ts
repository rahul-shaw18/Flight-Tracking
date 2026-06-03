import { afterNextRender, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import L from 'leaflet';
import { FlightService } from '../flight.service';
import { Flight } from '../flight.model';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
})
export class MapComponent {
  private flightService = inject(FlightService);
  protected readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map!: L.Map;

  private airportIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -28],
    shadowSize: [32, 32],
  });

  private markerGroup!: L.LayerGroup;
  private currentRouteLine!: L.Polyline;

  constructor() {
    effect(() => {
      const flightsToRender = this.flightService.filteredFlights();

      if (this.map && this.markerGroup) {
        this.renderFlightMarkers(flightsToRender);
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
          color: '#38bdf8',
          weight: 3,
          dashArray: '5, 10',
          opacity: 0.8,
        }).addTo(this.map);

        this.map.panTo(selected.coordinates);
      }
    });

    afterNextRender(() => {
      const containerElement = this.mapContainer()?.nativeElement;

      if (containerElement) {
        this.map = L.map(containerElement, { zoomControl: false }).setView([22.0, 78.0], 5);

        // Add standard zoom control at bottom right for cleaner design
        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: undefined,
        }).addTo(this.map);
        
        this.markerGroup = L.layerGroup().addTo(this.map);
        this.renderFlightMarkers(this.flightService.filteredFlights());
      }
    });
  }

  private renderFlightMarkers(flights: Flight[]): void {
    this.markerGroup.clearLayers();

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
        `<div class="text-slate-200 p-1 font-sans">
          <h4 class="font-bold text-sky-400">Airport: ${code}</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">Terminal Operational Hub</p>
         </div>`
      );
      this.markerGroup.addLayer(airportMarker);
    });

    // 3. Render plane markers using L.divIcon to fix rotation zoom/pan bug
    flights.forEach((flight: Flight) => {
      const destCoordinates = flight.route[flight.route.length - 1];
      const headingAngle = this.calculateBearing(flight.coordinates, destCoordinates);

      // Using L.divIcon with inner rotation allows Leaflet to handle position transforms 
      // without overriding our custom CSS plane rotation.
      const planeHtml = `
        <div style="transform: rotate(${headingAngle}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform 0.2s ease;">
          <svg viewBox="0 0 512 512" style="width: 24px; height: 24px; fill: #0ea5e9; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
            <path d="M448 336v-40L288 192V79.2c0-26.1-20.9-47.2-47-47.2s-47 21.1-47 47.2V192L32 296v40l160-48v112l-48 36v28l88-24 88 24v-28l-48-36V288l160 48z"/>
          </svg>
        </div>
      `;

      const planeIcon = L.divIcon({
        html: planeHtml,
        className: 'custom-plane-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      const planeMarker = L.marker(flight.coordinates, { icon: planeIcon });

      const popupHtml = `
        <div class="map-popup text-slate-200 p-1 font-sans">
          <h3 class="font-black text-sky-400 tracking-tight text-sm">${flight.flightNumber}</h3>
          <div class="text-[10px] text-slate-400 mt-1 space-y-0.5">
            <p><b class="text-slate-300">Callsign:</b> ${flight.callsign}</p>
            <p><b class="text-slate-300">Route:</b> ${flight.origin} ➔ ${flight.destination}</p>
            <p><b class="text-slate-300">Heading:</b> ${Math.round(headingAngle)}°</p>
            <p><b class="text-slate-300">Status:</b> 
              <span class="${
                flight.status === 'Active' ? 'text-emerald-400 font-bold' : 
                flight.status === 'Delayed' ? 'text-amber-400 font-bold' : 'text-sky-400 font-bold'
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
    });
  }

  private calculateBearing(start: [number, number], end: [number, number]): number {
    const startLat = this.toRadians(start[0]);
    const startLng = this.toRadians(start[1]);
    const endLat = this.toRadians(end[0]);
    const endLng = this.toRadians(end[1]);

    const dLng = endLng - startLng;

    const y = Math.sin(dLng) * Math.cos(endLat);
    const x =
      Math.cos(startLat) * Math.sin(endLat) -
      Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);

    return (bearing + 360) % 360;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }
}

