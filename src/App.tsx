import "./App.css";
import Map, {StyleSpecification} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/
const MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19,
    },
    terrainSource: {
      type: "raster-dem",
      url: "https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=Y2QwhDtY02fO9r6p6loF",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
  terrain: {
    source: "terrainSource",
    exaggeration: 1,
  },
  sky: {},
};

function App() {
  return (
    <Map
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
      }}
      style={{width: "100%", height: "100vh"}}
      mapStyle={MAP_STYLE}
    />
  );
}

export default App;
