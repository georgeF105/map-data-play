import {FC, useRef, useState} from "react";
import {
  Layer,
  LayerProps,
  LayerSpecification,
  Source,
} from "react-map-gl/maplibre";

import {FeatureCollection} from "geojson";
import {GEOMETRY_TYPE_TO_LAYER_SPEC} from "./layersConfig";

const LocalGeoJson: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [featureCollectionFiles, setFeatureCollections] =
    useState<{featureCollection: FeatureCollection; fileName: string}[]>();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;
    setIsLoading(true);

    const featureCollectionFiles = (
      await Promise.all(
        Array.from(files).map(async (file) => {
          console.log("file.type: ", file.type);
          if (
            file &&
            ["application/geo+json", "application/json"].includes(file.type)
          ) {
            const text = await file.text();
            const featureCollection = JSON.parse(text) as FeatureCollection;

            // Hack - ensure the type is correct without case sensitivity
            if (
              featureCollection.type.toLocaleLowerCase() !== "featurecollection"
            )
              return;
            featureCollection.type = "FeatureCollection";

            return {featureCollection, fileName: file.name};
          }
        })
      )
    ).filter(
      (
        geojson
      ): geojson is {featureCollection: FeatureCollection; fileName: string} =>
        !!geojson
    );

    setFeatureCollections(featureCollectionFiles);
    setIsLoading(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute top-2 right-2 p-2 rounded bg-white/80">
      <input
        type="file"
        accept=".geojson,application/geo+json,.json"
        className="hidden"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <button onClick={handleButtonClick} disabled={isLoading}>
        {isLoading ? "Loading" : "Upload GeoJson"}
      </button>

      {featureCollectionFiles?.map((featureCollectionFile) => (
        <SourceAndLayer
          key={featureCollectionFile.fileName}
          {...featureCollectionFile}
        />
      ))}
    </div>
  );
};

const SourceAndLayer: FC<{
  featureCollection: FeatureCollection;
  fileName: string;
}> = ({featureCollection, fileName}) => {
  const geomType = featureCollection.features[0].geometry.type;
  const layerSpec = GEOMETRY_TYPE_TO_LAYER_SPEC[geomType] as Omit<
    LayerSpecification,
    "source"
  >;

  if (!layerSpec) {
    return <></>;
  }

  return (
    <Source type="geojson" data={featureCollection} id={fileName}>
      <Layer {...(layerSpec as LayerProps)} />
    </Source>
  );
};

export default LocalGeoJson;
