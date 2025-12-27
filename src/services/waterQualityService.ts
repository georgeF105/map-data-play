import {Feature, FeatureCollection, Point} from "geojson";

export type WaterQualityStatus = "good" | "fair" | "poor";

export type WaterQualityProperties = {
  siteName: string;
  status: WaterQualityStatus;
  latestReading: string;
};

export type WaterQualityFeature = Feature<Point, WaterQualityProperties>;

export type WaterQualityCollection = FeatureCollection<Point, WaterQualityProperties>;

export const fetchWaterQuality = async (): Promise<WaterQualityCollection> => {
  const response = await fetch("/water-quality.json");

  if (!response.ok) {
    throw new Error(`Failed to fetch water quality data: ${response.statusText}`);
  }

  return (await response.json()) as WaterQualityCollection;
};
