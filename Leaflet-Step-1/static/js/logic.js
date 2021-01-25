// function to create the leaflet map by setting up base and overlay maps

function createMap(quakesLayer) {
  var lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', 
    {
      maxZoom: 18, 
      id: "light-v10",
      accessToken: API_KEY,
    }
  )
  
  var baseMaps = {
    'Light Map': lightmap,
  }
  
  var overlayMaps = {
    "Earthquakes": quakesLayer,
  }

  var myMap = L.map("map", {
    center: [40.3226, -98.7169],
    zoom: 4,
    layers: [lightmap, quakesLayer],
  })

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  })
  .addTo(myMap)

  // creating the legend and adding to myMap
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

// Reading the json data from the earthquake url
var url =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

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

  // adding markers to the earthquake overlay layer
  var quakesLayer = L.layerGroup(markers)

  createMap(quakesLayer)

})

