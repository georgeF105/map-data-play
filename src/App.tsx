import "./App.css";
import "maplibre-gl/dist/maplibre-gl.css";
import {Map} from "@vis.gl/react-maplibre";

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
