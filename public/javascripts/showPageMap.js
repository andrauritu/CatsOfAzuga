mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: cat.geometry.coordinates, // starting position [lng, lat]
    zoom: 15 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(cat.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${cat.title}</h3><p>${cat.location}</p>`
            )
    )
    .addTo(map)
