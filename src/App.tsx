import "./App.css";
import AppMap from "./components/AppMap/AppMap";
import LocalGeoJson from "./components/LocalGeoJson/LocalGeoJson";

function App() {
  return (
    <>
      <AppMap>
        <LocalGeoJson />
      </AppMap>
    </>
  );
}

export default App;
