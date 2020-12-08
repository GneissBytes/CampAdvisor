mapboxgl.accessToken = MAPBOX_TOKEN;
var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10", // stylesheet location
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});
var marker = new mapboxgl.Marker({ color: '#4b8b3b' })
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`))
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');