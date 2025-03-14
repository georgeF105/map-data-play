import {FC, ReactNode, useState} from "react";
import Map, {MapProps, StyleSpecification} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {useAppMapContext, AppMapContext} from "./AppMapContext";

const AppMap: FC<{children: ReactNode}> = ({children}) => {
  const {mapState, setMapState} = useAppMapContext();
  return (
    <Map
      {...mapState}
      style={{width: "100%", height: "100vh"}}
      onMove={(evt) => setMapState((prev) => ({...prev, ...evt.viewState}))}
    >
      {children}
    </Map>
  );
};

const INITIAL_VIEW_STATE = {
  bearing: 0,
  latitude: -41.27431447448026,
  longitude: 174.77954061440994,
  padding: {top: 0, bottom: 0, left: 0, right: 0},
  pitch: 50,
  zoom: 15.128046141375767,
};
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

const AppMapWrapper: FC<{children: ReactNode}> = (props) => {
  const [mapState, setMapState] = useState<MapProps>({
    mapStyle: MAP_STYLE,
    ...INITIAL_VIEW_STATE,
  });
  return (
    <AppMapContext.Provider
      value={{
        mapState,
        setMapState,
      }}
    >
      <AppMap {...props} />
    </AppMapContext.Provider>
  );
};

export default AppMapWrapper;
