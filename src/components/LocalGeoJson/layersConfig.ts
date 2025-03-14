import {LayerSpecification} from "maplibre-gl";

export const GEOMETRY_TYPE_TO_LAYER_SPEC: Record<
  string,
  Omit<LayerSpecification, "source">
> = {
  Point: {
    id: "points",
    type: "circle",
    paint: {
      "circle-radius": 10,
      "circle-color": "#007cbf",
    },
  },
  LineString: {
    id: "lines",
    type: "line",
    paint: {
      "line-color": "#f00",
      "line-width": 2,
    },
  },
  Polygon: {
    id: "polygons",
    type: "fill",
    paint: {
      "fill-color": "#f00",
      "fill-opacity": 0.5,
    },
  },
};
