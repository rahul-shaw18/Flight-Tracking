import { afterNextRender, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import L from 'leaflet';
import { FlightService } from '../services/flight-service';
import { Flight } from './models/flight';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
})
export class Map {
  private flightService = inject(FlightService);
  protected mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');
  private map!: L.Map;

  private airportIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  private planeIcon = L.icon({
    iconUrl: 'https://unpkg.com/@fortawesome/fontawesome-free@6.5.1/svgs/solid/plane.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
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
        this.map = L.map(containerElement).setView([22.0, 78.0], 5);

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

    flights.forEach((flight: Flight) => {
      const originMarker = L.marker(flight.route[0], { icon: this.airportIcon }).bindPopup(
        `<b>Origin:</b> ${flight.origin}`,
      );
      this.markerGroup.addLayer(originMarker);

      const destCoordinates = flight.route[flight.route.length - 1];
      const destinationMarker = L.marker(destCoordinates, { icon: this.airportIcon }).bindPopup(
        `<b>Destination:</b> ${flight.destination}`,
      );
      this.markerGroup.addLayer(destinationMarker);

      const planeMarker = L.marker(flight.coordinates, { icon: this.planeIcon });

      const headingAngle = this.calculateBearing(flight.coordinates, destCoordinates);

      planeMarker.on('add', (event) => {
        const markerElement = event.target.getElement();
        if (markerElement) {
          markerElement.style.transform += ` rotate(${headingAngle}deg)`;
          markerElement.style.filter =
            'invert(53%) sepia(91%) saturate(1478%) hue-rotate(170deg) brightness(103%) contrast(97%)';
        }
      });

      const popupHtml = `
      <div class="map-popup text-slate-900 p-1">
        <h3 class="font-bold text-sky-600">${flight.flightNumber}</h3>
        <p><b>Callsign:</b> ${flight.callsign}</p>
        <p><b>Route:</b> ${flight.origin} ➔ ${flight.destination}</p>
        <p><b>Heading:</b> ${Math.round(headingAngle)}°</p>
        <p><b>Status:</b> ${flight.status}</p>
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
