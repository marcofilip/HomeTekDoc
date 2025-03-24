<template>
  <div id="map" style="height: 500px;"></div>
</template>

<script>
import L from 'leaflet';

export default {
  name: "TechnicianMap",
  props: {
    technicians: {
      type: Array,
      default: () => [],
    },
    clientLocation: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      map: null,
      markersLayer: null,
      clientMarker: null
    };
  },
  mounted() {
    this.initMap();
    this.addMarkers();
    this.addClientMarker();
  },
  watch: {
    technicians: {
      handler() {
        this.addMarkers();
      },
      deep: true,
    },
    clientLocation: {
      handler() {
        this.addClientMarker();
      },
      deep: true,
    }
  },
  methods: {
    initMap() {
      // Inizializza la mappa centrata sull'Italia
      this.map = L.map('map').setView([41.9028, 12.4964], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);

      // Add zoom event listener safely
      this.map.on('zoomend', () => {
        if (!this.map) return;
        console.log("Zoom level:", this.map.getZoom());
      });
    },
    addMarkers() {
      if (!this.map) {
        console.warn("Map instance is not available");
        return;
      }
      // Rimuovi i marker precedenti
      this.markersLayer.clearLayers();
      // Aggiungi marker per ogni tecnico
      this.technicians.forEach((tech) => {
        if (tech.latitudine && tech.longitudine) {
          const marker = L.marker([tech.latitudine, tech.longitudine])
            .bindPopup(`<strong>${tech.nome}</strong><br/>${tech.specializzazione}`);
          this.markersLayer.addLayer(marker);
        }
      });
    },
    addClientMarker() {
      if (!this.map) {
        console.warn("Map instance is not available");
        return;
      }
      if (this.clientMarker) {
        this.map.removeLayer(this.clientMarker);
        this.clientMarker = null;
      }
      if (this.clientLocation && this.clientLocation.lat && this.clientLocation.lng) {
        // Definisci un'icona personalizzata per il cliente
        const clientIcon = L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        this.clientMarker = L.marker([this.clientLocation.lat, this.clientLocation.lng], { icon: clientIcon })
          .bindPopup("La tua posizione");
        this.clientMarker.addTo(this.map);
      }
    }
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
}
</style>
