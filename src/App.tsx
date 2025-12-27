import "./App.css";
import AppMap from "./components/AppMap/AppMap";
import LocalGeoJson from "./components/LocalGeoJson/LocalGeoJson";
import WaterQualityLayer from "./components/WaterQualityLayer/WaterQualityLayer";

function App() {
  return (
    <>
      <AppMap>
        <LocalGeoJson />
        <WaterQualityLayer />
      </AppMap>
    </>
  );
}

export default App;
