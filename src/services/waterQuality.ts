import {Feature, FeatureCollection, Geometry} from "geojson";

const DEFAULT_WATER_QUALITY_API_URL =
  "https://services7.arcgis.com/7OoTWJg4unfXxhcT/arcgis/rest/services/Wellington_Water_Quality/FeatureServer/0/query?where=1%3D1&outFields=*&f=json";

const WATER_QUALITY_API_URL =
  import.meta.env.VITE_WATER_QUALITY_API_URL ?? DEFAULT_WATER_QUALITY_API_URL;

type EsriAttributes = Record<string, string | number | null | undefined>;

type EsriPointGeometry = {x: number; y: number};
type EsriMultiPointGeometry = {points?: [number, number][]};
type EsriPolylineGeometry = {paths?: [number, number][][]};
type EsriPolygonGeometry = {rings?: [number, number][][]};

type EsriGeometry =
  | EsriPointGeometry
  | EsriMultiPointGeometry
  | EsriPolylineGeometry
  | EsriPolygonGeometry;

type EsriFeature = {
  attributes: EsriAttributes;
  geometry?: EsriGeometry;
};

type EsriFeatureResponse = {
  features?: EsriFeature[];
  error?: {message?: string};
};

export type WaterQualityProperties = EsriAttributes & {
  siteName?: string;
  status?: string;
  advisory?: string;
  lastUpdated?: string;
};

export type WaterQualityFeature = Feature<Geometry | null, WaterQualityProperties>;
export type WaterQualityFeatureCollection = FeatureCollection<
  Geometry | null,
  WaterQualityProperties
>;

export type WaterQualityFetchState =
  | {status: "idle"}
  | {status: "loading"}
  | {status: "error"; error: Error}
  | {status: "success"; data: WaterQualityFeatureCollection};

let cachedFeatureCollection: WaterQualityFeatureCollection | null = null;
let inFlightPromise: Promise<WaterQualityFeatureCollection> | null = null;
let fetchState: WaterQualityFetchState = {status: "idle"};

const normalizeAttributes = (attributes: EsriAttributes = {}): WaterQualityProperties => {
  const siteName =
    attributes.SiteName ??
    attributes.SITE_NAME ??
    attributes.Site ??
    attributes.name ??
    attributes.Name;

  const status = attributes.Status ?? attributes.STATUS ?? attributes.state;
  const advisory = attributes.Advisory ?? attributes.ADVISORY ?? attributes.Advisories;
  const lastUpdated =
    attributes.LastUpdated ??
    attributes.LASTUPDATED ??
    attributes.SampleDate ??
    attributes.SAMPLED_DATE ??
    attributes.Updated ??
    attributes.UPDATED;

  return {
    ...attributes,
    siteName: typeof siteName === "string" ? siteName : undefined,
    status: typeof status === "string" ? status : undefined,
    advisory: typeof advisory === "string" ? advisory : undefined,
    lastUpdated: typeof lastUpdated === "string" ? lastUpdated : undefined,
  };
};

const mapGeometryToGeoJSON = (geometry?: EsriGeometry): Geometry | null => {
  if (!geometry) return null;

  if ("x" in geometry && "y" in geometry) {
    return {
      type: "Point",
      coordinates: [geometry.x, geometry.y],
    };
  }

  if ("points" in geometry && geometry.points && geometry.points.length > 0) {
    return {
      type: "MultiPoint",
      coordinates: geometry.points,
    };
  }

  if ("paths" in geometry && geometry.paths && geometry.paths.length > 0) {
    return {
      type: "MultiLineString",
      coordinates: geometry.paths,
    };
  }

  if ("rings" in geometry && geometry.rings && geometry.rings.length > 0) {
    return {
      type: "Polygon",
      coordinates: geometry.rings,
    };
  }

  return null;
};

const mapFeatureToGeoJSON = (feature: EsriFeature): WaterQualityFeature | null => {
  const geometry = mapGeometryToGeoJSON(feature.geometry);
  const properties = normalizeAttributes(feature.attributes);

  if (!properties && !geometry) {
    return null;
  }

  const id =
    (typeof feature.attributes.objectId === "number" && feature.attributes.objectId) ||
    (typeof feature.attributes.OBJECTID === "number" && feature.attributes.OBJECTID) ||
    undefined;

  return {
    type: "Feature",
    id,
    geometry,
    properties,
  };
};

const convertToGeoJSON = (
  payload: EsriFeatureResponse
): WaterQualityFeatureCollection => {
  const features = (payload.features ?? [])
    .map(mapFeatureToGeoJSON)
    .filter((feature): feature is WaterQualityFeature => Boolean(feature));

  return {
    type: "FeatureCollection",
    features,
  };
};

const parseArcGisResponse = async (
  response: Response
): Promise<EsriFeatureResponse> => {
  const payload = (await response.json()) as EsriFeatureResponse;

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  return payload;
};

export const getWaterQualityState = () => fetchState;

export const fetchWaterQualityFeatures = async (): Promise<WaterQualityFeatureCollection> => {
  if (cachedFeatureCollection) return cachedFeatureCollection;
  if (inFlightPromise) return inFlightPromise;

  fetchState = {status: "loading"};

  const request = fetch(WATER_QUALITY_API_URL);

  inFlightPromise = request
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch water quality data (${response.status})`);
      }
      return parseArcGisResponse(response);
    })
    .then((payload) => convertToGeoJSON(payload))
    .then((featureCollection) => {
      cachedFeatureCollection = featureCollection;
      fetchState = {status: "success", data: featureCollection};
      return featureCollection;
    })
    .catch((error) => {
      const normalizedError =
        error instanceof Error ? error : new Error("Failed to fetch water quality data");
      fetchState = {status: "error", error: normalizedError};
      throw normalizedError;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
};

export const clearWaterQualityCache = () => {
  cachedFeatureCollection = null;
  inFlightPromise = null;
  fetchState = {status: "idle"};
};
