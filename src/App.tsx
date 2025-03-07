import "./App.css";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/
// const MAP_STYLE: MapLib = {
//   version: 8,
//   sources: {
//     osm: {
//       type: "raster",
//       tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
//       tileSize: 256,
//       attribution: "&copy; OpenStreetMap Contributors",
//       maxzoom: 19,
//     },
//     terrainSource: {
//       type: "raster-dem",
//       url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
//       tileSize: 256,
//     },
//   },
//   layers: [
//     {
//       id: "osm",
//       type: "raster",
//       source: "osm",
//     },
//   ],
//   terrain: {
//     source: "terrainSource",
//     exaggeration: 1,
//   },
//   sky: {},
// };

function App() {
  return (
    // <div className="flex min-h-screen items-center justify-center">
    <Map
      initialViewState={{
        longitude: -100,
        latitude: 40,
        zoom: 3.5,
      }}
      style={{width: "100%", height: 400}}
      mapStyle="https://demotiles.maplibre.org/style.json"
    />
  );
}

export default App;
