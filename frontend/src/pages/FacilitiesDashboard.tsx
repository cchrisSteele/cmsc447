import { useEffect, useState, type FormEvent } from "react";
import ArcGISMap from "../components/ArcGISMap";
import {
  FACILITY_LAYERS,
  type FacilityLayerId,
  type FacilityPin,
  type PinLocation,
} from "../types/facilities";
import "./FacilitiesDashboard.css";

const PIN_STORAGE_KEY = "umbc-facilities-pins-v1";

function isFacilityPin(value: unknown): value is FacilityPin {
  if (typeof value !== "object" || value === null) return false;

  const pin = value as Partial<FacilityPin>;
  return (
    typeof pin.id === "string" &&
    typeof pin.name === "string" &&
    typeof pin.description === "string" &&
    typeof pin.latitude === "number" &&
    Number.isFinite(pin.latitude) &&
    pin.latitude >= -90 &&
    pin.latitude <= 90 &&
    typeof pin.longitude === "number" &&
    Number.isFinite(pin.longitude) &&
    pin.longitude >= -180 &&
    pin.longitude <= 180 &&
    FACILITY_LAYERS.some((layer) => layer.id === pin.layerId)
  );
}

function loadPins(): FacilityPin[] {
  try {
    const saved = localStorage.getItem(PIN_STORAGE_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isFacilityPin) : [];
  } catch {
    return [];
  }
}

function FacilitiesDashboard() {
  const [selectedLayers, setSelectedLayers] = useState<FacilityLayerId[]>(
    FACILITY_LAYERS.map((layer) => layer.id)
  );
  const [pins, setPins] = useState<FacilityPin[]>(loadPins);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [draftLocation, setDraftLocation] = useState<PinLocation | null>(null);
  const [pinName, setPinName] = useState("");
  const [pinDescription, setPinDescription] = useState("");
  const [pinLayer, setPinLayer] = useState<FacilityLayerId>("buildings");

  useEffect(() => {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
    } catch {
      // Pins still work during this visit if browser storage is unavailable.
    }
  }, [pins]);

  const toggleLayer = (id: FacilityLayerId) => {
    setSelectedLayers((previous) =>
      previous.includes(id)
        ? previous.filter((layerId) => layerId !== id)
        : [...previous, id]
    );
  };

  const startPlacingPin = () => {
    setDraftLocation(null);
    setIsPlacingPin(true);
  };

  const cancelPin = () => {
    setIsPlacingPin(false);
    setDraftLocation(null);
    setPinName("");
    setPinDescription("");
  };

  const savePin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draftLocation || !pinName.trim() || !pinDescription.trim()) return;

    const newPin: FacilityPin = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...draftLocation,
      layerId: pinLayer,
      name: pinName.trim(),
      description: pinDescription.trim(),
    };

    setPins((previous) => [...previous, newPin]);
    // Always show the newly-created pin, even if its layer was hidden.
    setSelectedLayers((previous) =>
      previous.includes(pinLayer) ? previous : [...previous, pinLayer]
    );
    cancelPin();
  };

  const deletePin = (id: string) => {
    setPins((previous) => previous.filter((pin) => pin.id !== id));
  };

  return (
    <div className="facilities-dashboard">
      <header className="facilities-header">
        <div className="facilities-brand">
          <strong>UMBC</strong>
          <span>Facilities Management</span>
        </div>
        <a href="/" className="facilities-exit">
          Back to Public Map
        </a>
      </header>

      <div className="facilities-body">
        <aside className="facilities-sidebar">
          <h2>Facilities Map</h2>
          <p>Explore campus locations and add your own map pins.</p>

          <section className="facilities-section" aria-labelledby="facility-layers-heading">
            <h3 id="facility-layers-heading">Map Layers</h3>
            {FACILITY_LAYERS.map((layer) => (
              <label className="facility-layer" key={layer.id}>
                <input
                  type="checkbox"
                  checked={selectedLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span className="facility-layer-icon" aria-hidden="true">
                  {layer.icon}
                </span>
                <span>{layer.label}</span>
              </label>
            ))}
          </section>

          <section className="facilities-section" aria-labelledby="facility-pin-heading">
            <h3 id="facility-pin-heading">Map Pins</h3>
            {!draftLocation && (
              <>
                <button
                  type="button"
                  className={isPlacingPin ? "facility-secondary-button" : "facility-primary-button"}
                  onClick={isPlacingPin ? cancelPin : startPlacingPin}
                >
                  {isPlacingPin ? "Cancel Pin Placement" : "+ Add a Pin"}
                </button>
                <p className="facilities-helper" role="status">
                  {isPlacingPin
                    ? "📍 Click a location on the map to choose where the pin goes."
                    : "Choose Add a Pin, click the map, then enter a name and description."}
                </p>
              </>
            )}

            {draftLocation && (
              <form className="facility-pin-form" onSubmit={savePin}>
                <div className="facility-location-picked" role="status">
                  <strong>✓ Location selected</strong>
                  <span>
                    {draftLocation.latitude.toFixed(5)}, {draftLocation.longitude.toFixed(5)}
                  </span>
                  <button type="button" onClick={startPlacingPin}>
                    Choose another location
                  </button>
                </div>

                <label htmlFor="facility-pin-name">Pin Name</label>
                <input
                  id="facility-pin-name"
                  value={pinName}
                  onChange={(event) => setPinName(event.target.value)}
                  placeholder="e.g. Library entrance"
                  maxLength={80}
                  required
                  autoFocus
                />

                <label htmlFor="facility-pin-description">Description</label>
                <textarea
                  id="facility-pin-description"
                  value={pinDescription}
                  onChange={(event) => setPinDescription(event.target.value)}
                  rows={3}
                  placeholder="Enter details about this place"
                  maxLength={500}
                  required
                />

                <label htmlFor="facility-pin-layer">Map Layer</label>
                <select
                  id="facility-pin-layer"
                  value={pinLayer}
                  onChange={(event) => setPinLayer(event.target.value as FacilityLayerId)}
                >
                  {FACILITY_LAYERS.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.label}
                    </option>
                  ))}
                </select>

                <div className="facility-form-actions">
                  <button type="submit" className="facility-primary-button">
                    Save Pin
                  </button>
                  <button type="button" className="facility-secondary-button" onClick={cancelPin}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {pins.length > 0 && (
            <section className="facilities-section" aria-labelledby="saved-pins-heading">
              <h3 id="saved-pins-heading">Saved Pins ({pins.length})</h3>
              <div className="facility-saved-pins">
                {pins.map((pin) => (
                  <article className="facility-saved-pin" key={pin.id}>
                    <div className="facility-saved-pin-header">
                      <strong>{pin.name}</strong>
                      <button
                        type="button"
                        onClick={() => deletePin(pin.id)}
                        aria-label={`Delete ${pin.name}`}
                        title="Delete pin"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="facility-pin-category">
                      {FACILITY_LAYERS.find((layer) => layer.id === pin.layerId)?.label}
                    </span>
                    <p>{pin.description}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          <p className="facilities-storage-note">
            Pins are stored in this browser only, not sent to a shared database.
          </p>
        </aside>

        <main className={`facilities-map-container${isPlacingPin ? " is-placing-pin" : ""}`}>
          <ArcGISMap
            selectedLayers={selectedLayers}
            pins={pins}
            draftLocation={draftLocation}
            isPlacingPin={isPlacingPin}
            onPickLocation={(location) => {
              setDraftLocation(location);
              setIsPlacingPin(false);
            }}
          />
          <div className="facilities-map-label" role="status">
            {isPlacingPin ? "📍 Click to place a pin" : "Facilities Map"}
            <span>
              {isPlacingPin
                ? "Select a point anywhere on the map"
                : `${pins.length} saved ${pins.length === 1 ? "pin" : "pins"}`}
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FacilitiesDashboard;
