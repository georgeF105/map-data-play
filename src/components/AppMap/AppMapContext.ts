import {Dispatch, SetStateAction, createContext, useContext} from "react";
import {MapProps} from "react-map-gl/maplibre";

export type MapContextValue = {
  mapState: MapProps;
  setMapState: Dispatch<SetStateAction<MapProps>>;
};

export const AppMapContext = createContext<MapContextValue>(null!);

export const useAppMapContext = () => useContext(AppMapContext);
