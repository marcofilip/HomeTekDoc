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
      clientMarker: null,
      mapInitialized: false,
      isDestroyed: false  // <-- add this flag
    };
  },
  mounted() {
    // Fix Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    // Use nextTick to ensure the DOM is ready
    this.$nextTick(() => {
      this.initMap();
    });
  },
  beforeUnmount() {
    this.destroyMap();
  },
  watch: {
    technicians: {
      handler() {
        if (this.mapInitialized) {
          this.addMarkers();
        }
      },
      deep: true,
    },
    clientLocation: {
      handler() {
        if (this.mapInitialized) {
          this.addClientMarker();
        }
      },
      deep: true,
    }
  },
  methods: {
    initMap() {
      try {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
          console.warn("Map container not found");
          return;
        }
        if (!this.map) {
          // Disable zoom animation to work around the this._map is null error
          this.map = L.map('map', {
            zoomControl: true,
            scrollWheelZoom: true,
            zoomAnimation: false  
          }).setView([41.9028, 12.4964], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(this.map);

          this.markersLayer = L.layerGroup().addTo(this.map);
          
          this.map.on('zoomend', this.handleZoomEnd);
          
          this.mapInitialized = true;
          this.isDestroyed = false;  // Reset flag in case re-initializing
          
          // Now add markers and client position
          this.addMarkers();
          this.addClientMarker();
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        this.mapInitialized = false;
      }
    },
    
    handleZoomEnd() {
      try {
        if (this.isDestroyed) return;
        if (!this.map || !this.map._container) {
          return;
        }
        console.log("Zoom level:", this.map.getZoom());
      } catch (e) {
        console.error("Error in zoom handler:", e);
      }
    },
    
    addMarkers() {
      if (!this.map || !this.mapInitialized) {
        console.warn("Map not initialized, cannot add markers");
        return;
      }
      
      try {
        // Clear existing markers
        if (this.markersLayer) {
          this.markersLayer.clearLayers();
        } else {
          this.markersLayer = L.layerGroup().addTo(this.map);
        }
        
        // Add markers for each technician
        this.technicians.forEach((tech) => {
          if (tech.latitudine && tech.longitudine) {
            const marker = L.marker([tech.latitudine, tech.longitudine])
              .bindPopup(`<strong>${tech.nome}</strong><br/>${tech.specializzazione}`);
            this.markersLayer.addLayer(marker);
          }
        });
      } catch (error) {
        console.error("Error adding markers:", error);
      }
    },
    
    addClientMarker() {
      if (!this.map || !this.mapInitialized) {
        console.warn("Map not initialized, cannot add client marker");
        return;
      }
      
      try {
        // Remove existing client marker
        if (this.clientMarker) {
          this.map.removeLayer(this.clientMarker);
          this.clientMarker = null;
        }
        
        // Add new client marker if location exists
        if (this.clientLocation && this.clientLocation.lat && this.clientLocation.lng) {
          const clientIcon = L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });
          
          this.clientMarker = L.marker(
            [this.clientLocation.lat, this.clientLocation.lng], 
            { icon: clientIcon }
          ).bindPopup("La tua posizione");
          
          this.clientMarker.addTo(this.map);
        }
      } catch (error) {
        console.error("Error adding client marker:", error);
      }
    },
    
    destroyMap() {
      if (this.map) {
        this.isDestroyed = true; // set flag to prevent event handling
        // Remove event listeners
        this.map.off('zoomend', this.handleZoomEnd);
        
        // Remove layers
        if (this.markersLayer) {
          this.markersLayer.clearLayers();
          this.map.removeLayer(this.markersLayer);
          this.markersLayer = null;
        }
        
        if (this.clientMarker) {
          this.map.removeLayer(this.clientMarker);
          this.clientMarker = null;
        }
        
        // Remove and destroy the map
        this.map.remove();
        this.map = null;
        this.mapInitialized = false;
      }
    }
  },
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  z-index: 1; /* Ensure map displays above other elements */
}
</style>
