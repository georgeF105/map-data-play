import {FC, useCallback, useEffect, useMemo, useState} from "react";
import {FeatureCollection as GeoJSONFeatureCollection, Geometry} from "geojson";
import {Layer, LayerProps, Source} from "react-map-gl/maplibre";

import {
  WaterQualityFetchState,
  WaterQualityFeature,
  clearWaterQualityCache,
  fetchWaterQualityFeatures,
  getWaterQualityState,
} from "../../services/waterQuality";

const STATUS_COLORS: Record<string, string> = {
  open: "#22c55e",
  good: "#22c55e",
  opena: "#22c55e",
  excellent: "#22c55e",
  ok: "#22c55e",
  caution: "#eab308",
  warning: "#eab308",
  alert: "#eab308",
  poor: "#ef4444",
  closed: "#ef4444",
  unsafe: "#ef4444",
};

const circleLayer: LayerProps = {
  id: "water-quality-circles",
  type: "circle",
  source: "water-quality",
  paint: {
    "circle-radius": 7,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1.5,
    "circle-color": [
      "match",
      ["downcase", ["coalesce", ["get", "status"], ""]],
      "open",
      STATUS_COLORS.open,
      "good",
      STATUS_COLORS.good,
      "opena",
      STATUS_COLORS.opena,
      "excellent",
      STATUS_COLORS.excellent,
      "ok",
      STATUS_COLORS.ok,
      "caution",
      STATUS_COLORS.caution,
      "warning",
      STATUS_COLORS.warning,
      "alert",
      STATUS_COLORS.alert,
      "poor",
      STATUS_COLORS.poor,
      "closed",
      STATUS_COLORS.closed,
      "unsafe",
      STATUS_COLORS.unsafe,
      "#3b82f6",
    ],
  },
};

const labelLayer: LayerProps = {
  id: "water-quality-labels",
  type: "symbol",
  source: "water-quality",
  layout: {
    "text-field": [
      "coalesce",
      ["get", "siteName"],
      ["get", "SiteName"],
      ["get", "Site"],
      "Unknown site",
    ],
    "text-size": 11,
    "text-offset": [0, 1],
  },
  paint: {
    "text-color": "#0f172a",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1,
  },
};

const WaterQualityLayer: FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [fetchState, setFetchState] = useState<WaterQualityFetchState>(
    getWaterQualityState()
  );

  const fetchData = useCallback(async () => {
    setFetchState({status: "loading"});
    try {
      const data = await fetchWaterQualityFeatures();
      setFetchState({status: "success", data});
    } catch (error) {
      const normalized =
        error instanceof Error
          ? error
          : new Error("Failed to load water quality data");
      setFetchState({status: "error", error: normalized});
    }
  }, []);

  useEffect(() => {
    if (fetchState.status === "idle") {
      void fetchData();
    }
  }, [fetchData, fetchState.status]);

  const handleRefresh = useCallback(() => {
    clearWaterQualityCache();
    setFetchState({status: "idle"});
  }, []);

  const legendItems = useMemo(
    () => [
      {label: "Open / Good", color: STATUS_COLORS.open},
      {label: "Caution / Warning", color: STATUS_COLORS.caution},
      {label: "Poor / Closed", color: STATUS_COLORS.closed},
      {label: "Other", color: "#3b82f6"},
    ],
    []
  );

  const dataForMap: GeoJSONFeatureCollection<
    Geometry,
    WaterQualityFeature["properties"]
  > | null = useMemo(() => {
    if (fetchState.status !== "success") return null;

    const filteredFeatures = fetchState.data.features.filter(
      (
        feature
      ): feature is WaterQualityFeature & {geometry: Geometry} =>
        Boolean(feature.geometry)
    );

    return {type: "FeatureCollection", features: filteredFeatures};
  }, [fetchState]);

  const statusMessage = useMemo(() => {
    if (fetchState.status === "error") {
      return fetchState.error.message;
    }
    if (fetchState.status === "loading") {
      return "Loading water quality sites...";
    }
    if (fetchState.status === "success") {
      const count = fetchState.data.features.length;
      return `${count} sites loaded`;
    }
    return "Ready to load water quality sites";
  }, [fetchState]);

  return (
    <>
      <div className="absolute top-2 left-2 max-w-xs rounded bg-white/90 p-3 shadow-md space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold">Water quality</div>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(event) => setIsVisible(event.target.checked)}
            />
            Show
          </label>
        </div>
        <div className="space-y-1">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full border border-slate-200"
                style={{backgroundColor: item.color}}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <span>{statusMessage}</span>
          <div className="flex gap-2">
            <button
              className="rounded bg-slate-100 px-2 py-1 hover:bg-slate-200"
              onClick={fetchData}
              disabled={fetchState.status === "loading"}
            >
              Refresh
            </button>
            <button
              className="rounded bg-slate-100 px-2 py-1 hover:bg-slate-200"
              onClick={handleRefresh}
              disabled={fetchState.status === "loading"}
            >
              Clear cache
            </button>
          </div>
        </div>
        <a
          className="block text-xs text-blue-700 underline"
          href="https://hbrcopendata-hbrc.opendata.arcgis.com/datasets/efb39c99dd51425889da308d3f3b134e_0/about"
          target="_blank"
          rel="noreferrer"
        >
          Data source: Hawke's Bay swim water quality
        </a>
        {fetchState.status === "error" && (
          <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {fetchState.error.message}
          </div>
        )}
      </div>
      {isVisible && dataForMap && (
        <Source id="water-quality" type="geojson" data={dataForMap}>
          <Layer {...circleLayer} />
          <Layer {...labelLayer} />
        </Source>
      )}
    </>
  );
};

export default WaterQualityLayer;
