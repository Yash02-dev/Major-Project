
maptilersdk.config.apiKey =mapApi;
    
const map = new maptilersdk.Map({
    container: "map", // div id
    style: maptilersdk.MapStyle.STREETS,
    center: coordinates, // lng, lat
    zoom: 14,
});

console.log(coordinates);

const marker = new maptilersdk.Marker({color:"red"})
    .setLngLat(coordinates)
    .addTo(map);

const popup = new maptilersdk.Popup({offset:25})
  .setHTML("<h4>Exact location provided after booking<h4>")

marker.setPopup(popup);