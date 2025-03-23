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
    },
    data() {
      return {
        map: null,
        markersLayer: null,
      };
    },
    mounted() {
      this.initMap();
      this.addMarkers();
    },
    watch: {
      technicians: {
        handler() {
          this.refreshMarkers();
        },
        deep: true,
      },
    },
    methods: {
      initMap() {
        // Inizializza la mappa centrata su una posizione, ad esempio il centro dell'Italia
        this.map = L.map('map').setView([41.9028, 12.4964], 6);
  
        // Aggiungi il layer delle mappe (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(this.map);
  
        // Crea un layer per i marker
        this.markersLayer = L.layerGroup().addTo(this.map);
      },
      addMarkers() {
        // Rimuovi i marker precedenti, se presenti
        this.markersLayer.clearLayers();
  
        this.technicians.forEach((tech) => {
          if (tech.latitudine && tech.longitudine) {
            const marker = L.marker([tech.latitudine, tech.longitudine])
              .bindPopup(`<strong>${tech.nome}</strong><br/>${tech.specializzazione}`);
            this.markersLayer.addLayer(marker);
          }
        });
      },
      refreshMarkers() {
        this.addMarkers();
      },
    },
  };
  </script>
  
  <style scoped>
  #map {
    width: 100%;
    height: 500px;
  }
  </style>
  