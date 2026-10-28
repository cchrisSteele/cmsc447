
import "./MapLayout.css";

function MapLayout() {
  return (
    <section id="map" className="map-layout">
      <aside className="map-sidebar">
        <div className="sidebar-header">
          <h2>Explore Campus</h2>
          <p>Find your way around UMBC.</p>
        </div>

        <div className="search-section">
          <label htmlFor="building-search">
            Search Campus
          </label>

          <input
            id="building-search"
            type="search"
            placeholder="Search buildings..."
          />
        </div>

        <div className="layers-section">
          <h3>Map Layers</h3>

          {[
            "Buildings",
            "Parking",
            "Accessibility",
            "Construction",
            "Campus Amenities",
          ].map((layer) => (
            <label key={layer} className="layer-option">
              <input type="checkbox" disabled />
              <span>{layer}</span>
            </label>
          ))}
        </div>
      </aside>

      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-icon">⌖</div>
          <h2>UMBC Campus Map</h2>
          <p>Interactive ArcGIS map coming soon.</p>
        </div>
      </div>
    </section>
  );
}

export default MapLayout;
