// function to create the leaflet map by setting up base and overlay maps

function createMap(quakesLayer, faultLayer) {

  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
  {
    maxZoom: 18, 
    id: "satellite-streets-v11",
    accessToken: API_KEY,
  }
  )
  
  var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
  {
  maxZoom: 18, 
  id: "dark-v10",
  accessToken: API_KEY,
  }
  )
  
  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
  {
  maxZoom: 18, 
  id: "outdoors-v11",
  accessToken: API_KEY,
  }
  )
  
  var baseMaps = {
   'Satellite': satellite,
   "Dark": darkmap,
   "Outdoors": outdoors,
  }
  
  var overlayMaps = {
    "Earthquakes": quakesLayer,
    "Fault Layer": faultLayer

  }

  var myMap = L.map("map", {
    center: [40.3226, -98.7169],
    zoom: 4,
    layers: [satellite, quakesLayer, faultLayer],
  })

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  })
  .addTo(myMap)

// creating the magnitude legend and adding to myMap

  var legend = L.control({
    position: 'bottomright',
  })
  
  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'legend')
    mags = [0, 1, 2, 3, 4, 5]
    div.innerHTML += "<h4>Magnitude</h4>";
    for (var i = 0; i < mags.length; i++) {
      div.innerHTML += `<i style="background-color:${getColor(i+1)}; color:${getColor(i+1)}">--</i> ${mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+')}`;
    }
    return div
  };
    legend.addTo(myMap)
}


// Choose color according to the magnitude of the earthquake
function getColor(mag){
  // console.log(mag)
  switch (true) {
  case mag > 5.0:
      return "#fc3003";
  case mag >= 4.0:
      return "#eb6c0c";
  case mag >= 3.0:
      return "#e89f0e";
  case mag >= 2.0:
      return "#ebda23";
  case mag >= 1.0:
      return "#cced0e";
  case mag >= 0.0:
      return "#82c213";
  }
}

// URL of json earthquake and faultline data
var url =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var faults_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// creating the new overlay layergroup of faultline polylines
faultLayer = new L.LayerGroup()
fetch(faults_url).then(function(response){
    return response.json()
  }).then(function(data) {
    L.geoJSON(data, {
      color: "orange"
    }).addTo(faultLayer)
})

// getting the response/data of earthquake data
d3.json(url).then(response => {
  console.log(response)
  var quakes = response.features

 // Creating variables to call and collect metadata for creating earthquake markers
  var markers = quakes.map(quake => {
    var lat = quake.geometry.coordinates[1]
    var lon = quake.geometry.coordinates[0]
    var mag = quake.properties.mag
    var place = quake.properties.place
    var id = quake.id

    var marker = L.circleMarker([lat, lon], {
      fillOpacity: 1,
      color: "black",
      weight: 1,
      fillColor: getColor(mag),
      radius:  mag * 4
    }).bindPopup(`
    <h3>ID: ${id}</h3>
    <h3>Place: ${place}</h3>
    <h3>Magnitude: ${mag}</h3> 
    `)

    return marker
  })
  console.log(markers)

  var quakesLayer = L.layerGroup(markers)
 
  createMap(quakesLayer, faultLayer)

})