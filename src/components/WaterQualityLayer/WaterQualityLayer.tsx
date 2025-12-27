import {Layer, LayerProps, MapLayerMouseEvent, Popup, Source} from "react-map-gl/maplibre";
import {useEffect, useMemo, useState} from "react";

import {useAppMapContext} from "../AppMap/AppMapContext";
import {
  WaterQualityCollection,
  WaterQualityFeature,
  fetchWaterQuality,
} from "../../services/waterQualityService";

const WATER_QUALITY_LAYER_ID = "water-quality-layer";

const WaterQualityLayer = () => {
  const {setMapState} = useAppMapContext();
  const [data, setData] = useState<WaterQualityCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<{
    longitude: number;
    latitude: number;
    feature: WaterQualityFeature;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const featureCollection = await fetchWaterQuality();
        setData(featureCollection);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setMapState((prev) => ({
      ...prev,
      interactiveLayerIds: Array.from(
        new Set([WATER_QUALITY_LAYER_ID, ...(prev.interactiveLayerIds ?? [])])
      ),
      onMouseMove: (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0] as WaterQualityFeature | undefined;
        if (feature) {
          setHoveredFeature({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            feature,
          });
        } else {
          setHoveredFeature(null);
        }
      },
    }));
  }, [setMapState]);

  const waterQualityLayer = useMemo<LayerProps>(
    () => ({
      id: WATER_QUALITY_LAYER_ID,
      source: "water-quality-source",
      type: "circle",
      paint: {
        "circle-radius": 9,
        "circle-color": [
          "match",
          ["get", "status"],
          "good",
          "#16a34a",
          "fair",
          "#eab308",
          "poor",
          "#dc2626",
          "#6b7280",
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#0f172a",
      },
    }),
    []
  );

  return (
    <>
      <div className="absolute top-2 left-2 z-10 rounded bg-white/80 px-3 py-2 text-sm shadow">
        {isLoading && <span>Loading water quality…</span>}
        {!isLoading && error && (
          <span className="text-red-700">Failed to load: {error}</span>
        )}
        {!isLoading && !error && data && <span>Water quality loaded</span>}
      </div>

      {data && (
        <Source type="geojson" data={data} id="water-quality-source">
          <Layer {...(waterQualityLayer as LayerProps)} />
        </Source>
      )}

      {hoveredFeature && (
        <Popup
          longitude={hoveredFeature.longitude}
          latitude={hoveredFeature.latitude}
          closeButton={false}
          closeOnMove={true}
          offset={[0, -8]}
        >
          <div className="text-sm">
            <div className="font-semibold">{hoveredFeature.feature.properties.siteName}</div>
            <div>Status: {hoveredFeature.feature.properties.status}</div>
            <div>Latest reading: {hoveredFeature.feature.properties.latestReading}</div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default WaterQualityLayer;
