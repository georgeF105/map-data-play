import "./App.css";
import AppMap from "./components/AppMap/AppMap";
import LocalGeoJson from "./components/LocalGeoJson/LocalGeoJson";
import WaterQualityLayer from "./components/WaterQuality/WaterQualityLayer";

function App() {
  return (
    <>
      <AppMap>
        <WaterQualityLayer />
        <LocalGeoJson />
      </AppMap>
    </>
  );
}

export default App;
