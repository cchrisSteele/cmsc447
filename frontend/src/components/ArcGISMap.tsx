import { useCallback, useEffect, useRef } from "react";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import type Map from "@arcgis/core/Map";
import type Layer from "@arcgis/core/layers/Layer";
import {
  FACILITY_LAYERS,
  type FacilityLayerId,
  type FacilityPin,
  type PinLocation,
} from "../types/facilities";
import "./ArcGISMap.css";

type ArcGISMapProps = {
  selectedLayers?: FacilityLayerId[];
  pins?: FacilityPin[];
  draftLocation?: PinLocation | null;
  isPlacingPin?: boolean;
  onPickLocation?: (location: PinLocation) => void;
};

type MapElement = HTMLElement & {
  ready: boolean;
  map: Map;
  viewOnReady: () => Promise<void>;
};

type PublishedLayer = {
  layer: Layer;
  category: FacilityLayerId;
};

type PinLayers = Record<FacilityLayerId, GraphicsLayer> & {
  preview: GraphicsLayer;
};

const PIN_COLORS: Record<FacilityLayerId, string> = {
  construction: "#e87924",
  buildings: "#f5b800",
  parking: "#3478c0",
};

// Small map-pin SVG so markers look like pins rather than plain dots.
function pinSymbol(color: string): PictureMarkerSymbol {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 2C9.2 2 2 9.2 2 18c0 12 16 27.5 16 27.5S34 30 34 18C34 9.2 26.8 2 18 2Z" fill="${color}" stroke="#222222" stroke-width="1.8"/><circle cx="18" cy="18" r="6.5" fill="#ffffff"/></svg>`;
  return new PictureMarkerSymbol({
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width: 27,
    height: 36,
    yoffset: 16,
  });
}

function makePinGraphic(pin: FacilityPin): Graphic {
  return new Graphic({
    geometry: new Point({ longitude: pin.longitude, latitude: pin.latitude }),
    symbol: pinSymbol(PIN_COLORS[pin.layerId]),
    attributes: {
      name: pin.name,
      description: pin.description,
    },
    popupTemplate: {
      title: "{name}",
      content: [
        {
          type: "fields",
          fieldInfos: [{ fieldName: "description", label: "Description" }],
        },
      ],
    },
  });
}

function getOperationalLayers(map: Map): Layer[] {
  const result: Layer[] = [];
  function visit(layer: Layer) {
    result.push(layer);
    if (layer instanceof GroupLayer) layer.layers.forEach(visit);
  }
  map.layers.forEach(visit);
  return result;
}

function publishedCategory(layer: Layer): FacilityLayerId | null {
  const title = (layer.title ?? "").toLowerCase();
  if (/construction|work zones?|road closures?/.test(title)) return "construction";
  if (/\bbuildings?\b|campus structures?/.test(title)) return "buildings";
  if (/\bparking\b/.test(title)) return "parking";
  return null;
}

function ArcGISMap({
  selectedLayers,
  pins,
  draftLocation = null,
  isPlacingPin = false,
  onPickLocation,
}: ArcGISMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinLayersRef = useRef<PinLayers | null>(null);
  const publishedLayersRef = useRef<PublishedLayer[]>([]);
  const selectedLayersRef = useRef(selectedLayers ?? []);
  const pinsRef = useRef(pins ?? []);
  const draftLocationRef = useRef(draftLocation);
  const isPlacingPinRef = useRef(isPlacingPin);
  const onPickLocationRef = useRef(onPickLocation);

  // Always use the latest React state in ArcGIS events and async callbacks.
  selectedLayersRef.current = selectedLayers ?? [];
  pinsRef.current = pins ?? [];
  draftLocationRef.current = draftLocation;
  isPlacingPinRef.current = isPlacingPin;
  onPickLocationRef.current = onPickLocation;

  const updateGraphics = useCallback(() => {
    const layers = pinLayersRef.current;
    if (!layers) return;

    for (const definition of FACILITY_LAYERS) {
      const category = definition.id;
      const layer = layers[category];
      layer.visible = selectedLayersRef.current.includes(category);
      layer.removeAll();
      layer.addMany(
        pinsRef.current
          .filter((pin) => pin.layerId === category)
          .map(makePinGraphic)
      );
    }

    const draft = draftLocationRef.current;
    layers.preview.removeAll();
    if (draft) {
      layers.preview.add(
        new Graphic({
          geometry: new Point({ longitude: draft.longitude, latitude: draft.latitude }),
          symbol: pinSymbol("#f5b800"),
        })
      );
    }

    // Toggle real operational layers too, if this WebMap includes matching ones.
    for (const { layer, category } of publishedLayersRef.current) {
      layer.visible = selectedLayersRef.current.includes(category);
    }
  }, []);

  useEffect(() => {
    updateGraphics();
  }, [pins, selectedLayers, draftLocation, updateGraphics]);

  useEffect(() => {
    // The public map doesn't need the Facilities-only layers or click behavior.
    if (!selectedLayers || !pins) return;

    const mapElement = containerRef.current?.querySelector("arcgis-map") as MapElement | null;
    if (!mapElement) return;

    let disposed = false;
    let activeMap: Map | null = null;
    const handleClick = (event: Event) => {
      if (!isPlacingPinRef.current) return;

      const click = event as CustomEvent<{ mapPoint?: Point }>;
      const point = click.detail?.mapPoint;
      if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return;

      event.preventDefault(); // Do not open the map's regular popup while placing a pin.
      onPickLocationRef.current?.({ latitude: point.latitude, longitude: point.longitude });
    };

    mapElement.addEventListener("arcgisViewClick", handleClick);

    void mapElement.viewOnReady().then(() => {
      if (disposed || !mapElement.map) return;
      activeMap = mapElement.map;

      publishedLayersRef.current = getOperationalLayers(activeMap)
        .map((layer): PublishedLayer | null => {
          const category = publishedCategory(layer);
          return category ? { layer, category } : null;
        })
        .filter((entry): entry is PublishedLayer => entry !== null);

      const newLayers = {} as PinLayers;
      for (const definition of FACILITY_LAYERS) {
        const layer = new GraphicsLayer({ title: `${definition.label} (Facilities Pins)` });
        activeMap.add(layer);
        newLayers[definition.id] = layer;
      }
      newLayers.preview = new GraphicsLayer({ title: "Pin Placement Preview" });
      activeMap.add(newLayers.preview);
      pinLayersRef.current = newLayers;
      updateGraphics();
    }).catch((error: unknown) => {
      if (!disposed) console.error("Unable to initialize Facilities map pins:", error);
    });

    return () => {
      disposed = true;
      mapElement.removeEventListener("arcgisViewClick", handleClick);
      const layers = pinLayersRef.current;
      if (layers && activeMap) {
        for (const definition of FACILITY_LAYERS) activeMap.remove(layers[definition.id]);
        activeMap.remove(layers.preview);
      }
      pinLayersRef.current = null;
      publishedLayersRef.current = [];
    };
    // Set up the ArcGIS view only once. State updates are handled by refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(selectedLayers && pins), updateGraphics]);

  return (
    <div ref={containerRef} className="arcgis-map-wrapper">
      <arcgis-map item-id="134aa0fc4c834006b861503471902e6a">
        <arcgis-zoom slot="top-left" />
      </arcgis-map>
    </div>
  );
}

export default ArcGISMap;
