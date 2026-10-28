
import { useState } from "react";
import ArcGISMap from "../components/ArcGISMap";
import "./FacilitiesDashboard.css";

const facilityLayers = [
  { id: "utilities", label: "Utility Networks", icon: "⚡" },
  { id: "connections", label: "Building Connections", icon: "🔗" },
  { id: "issues", label: "Maintenance Issues", icon: "⚠️" },
  { id: "construction", label: "Construction Zones", icon: "🚧" },
  { id: "access", label: "Staff Access Points", icon: "🚪" },
];

function FacilitiesDashboard() {
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);

  const toggleLayer = (id: string) => {
    setSelectedLayers((previous) =>
      previous.includes(id)
        ? previous.filter((layer) => layer !== id)
        : [...previous, id]
    );
  };

  return (
    <div className="facilities-dashboard">
      <header className="facilities-header">
        <div className="facilities-brand">
          <strong>UMBC</strong>
          <span>Facilities Management</span>
        </div>

        <div className="facilities-header-actions">
          <span className="facilities-demo"></span>
          <a href="/" className="facilities-exit">
            Back to Public Map
          </a>
        </div>
      </header>

      <div className="facilities-body">
        <aside className="facilities-sidebar">
          <h2>Facilities Map</h2>
          <p>Campus infrastructure and maintenance management.</p>

          <div className="facilities-section">
            <h3>Private Map Layers</h3>

            {facilityLayers.map((layer) => (
              <label className="facility-layer" key={layer.id}>
                <input
                  type="checkbox"
                  checked={selectedLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span>{layer.icon}</span>
                {layer.label}
              </label>
            ))}
            <p className="facilities-helper">
          
            </p>
          </div>

          <div className="facilities-section">
            <h3>Maintenance Tools</h3>

            <button
              type="button"
              className="facility-primary-button"
              onClick={() => setShowReportForm(!showReportForm)}
            >
              {showReportForm ? "Close Report" : "+ Report an Issue"}
            </button>

            {showReportForm && (
              <div className="facility-report">
                <label htmlFor="facility-issue">Issue Type</label>
                <select id="facility-issue" defaultValue="">
                  <option value="" disabled>Select issue</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>HVAC</option>
                  <option>Other</option>
                </select>

                <label htmlFor="facility-location">Location</label>
                <input
                  id="facility-location"
                  placeholder="Building or location"
                />

                <label htmlFor="facility-description">Description</label>
                <textarea
                  id="facility-description"
                  rows={3}
                  placeholder="Describe the issue"
                />

                <p className="facilities-helper">
                  Demo form only. Reports are not submitted or saved.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="facilities-map-container">
          <ArcGISMap />
          <div className="facilities-map-label">
            Facilities Map Preview
            <span>Private layers not yet connected</span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FacilitiesDashboard;
