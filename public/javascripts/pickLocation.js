mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmF1cml0dSIsImEiOiJjbGx3cDl6eXAwMWV4M2RwZ2dhbjNmMXk4In0.gXvIzs8u1OPwLSgx7WQGgA';
const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [25.571631, 45.444228],
    zoom: 14
});
const marker = new mapboxgl.Marker();

// Get the input location element
const locationInput = document.getElementById('location');

function add_marker(event) {
    const coordinates = event.lngLat;
    console.log('Lng:', coordinates.lng, 'Lat:', coordinates.lat);

    // Set the input location value with the coordinates
    locationInput.value = coordinates.lng + ', ' + coordinates.lat;

    marker.setLngLat(coordinates).addTo(map);
}

map.on('click', add_marker);

const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: false,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true
});

map.addControl(geolocate);

geolocate.on('geolocate', function (e) {
    const lon = e.coords.longitude;
    const lat = e.coords.latitude
    locationInput.value = lon + ', ' + lat;
    marker.setLngLat([lon, lat]).addTo(map);
});