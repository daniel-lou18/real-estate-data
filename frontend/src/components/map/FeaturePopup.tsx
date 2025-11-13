import { Popup } from "react-map-gl/maplibre";
import "./popup.css";
import type {
  MapFeature,
  CommuneFeatureProperties,
  SectionFeatureProperties,
} from "@/types";
import { formatMetricValue, humanizeMetricName } from "./mapLegendUtils";

interface FeaturePopupProps {
  longitude: number;
  latitude: number;
  feature: MapFeature;
  onClose: () => void;
}

const FeaturePopup = ({
  longitude,
  latitude,
  feature,
  onClose,
}: FeaturePopupProps) => {
  const metricValue = feature.properties.metricValue;
  const metricName = humanizeMetricName(feature.properties.metricName ?? "");

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      className="custom-popup"
      offset={[0, -10]}
      anchor="bottom"
    >
      <div className="p-2">
        {isCommuneFeature(feature) ? (
          <ArrondissementContent
            feature={feature}
            metricName={metricName}
            metricValue={metricValue}
          />
        ) : isSectionFeature(feature) ? (
          <SectionContent
            feature={feature}
            metricName={metricName}
            metricValue={metricValue}
          />
        ) : null}
      </div>
    </Popup>
  );
};

const ArrondissementContent = ({
  feature,
  metricName,
  metricValue,
}: {
  feature: CommuneFeature;
  metricName: string;
  metricValue: number | null;
}) => (
  <>
    <h3 className="font-bold text-lg mb-2">{feature.properties.name}</h3>
    <MetricValue name={metricName} value={metricValue} />
  </>
);

const SectionContent = ({
  feature,
  metricName,
  metricValue,
}: {
  feature: SectionMapFeature;
  metricName: string;
  metricValue: number | null;
}) => (
  <>
    <h3 className="font-semibold mb-2">
      {`Section ${feature.properties.section} (${feature.properties.inseeCode})`}
    </h3>
    <MetricValue name={metricName} value={metricValue} />
  </>
);

const MetricValue = ({
  name,
  value,
}: {
  name: string;
  value: number | null;
}) => (
  <p className="text-sm text-gray-600">
    <strong>{name}:</strong> {` ${formatMetricValue(value)}`}
  </p>
);

export default FeaturePopup;

type CommuneFeature = MapFeature & {
  properties: CommuneFeatureProperties;
};

type SectionMapFeature = MapFeature & {
  properties: SectionFeatureProperties;
};

function isCommuneFeature(feature: MapFeature): feature is CommuneFeature {
  return "name" in feature.properties;
}

function isSectionFeature(feature: MapFeature): feature is SectionMapFeature {
  return "section" in feature.properties;
}
