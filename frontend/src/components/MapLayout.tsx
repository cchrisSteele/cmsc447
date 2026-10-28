
import ArcGISMap from "./ArcGISMap";
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
        <ArcGISMap />
      </div>
    </section>
  );
}

export default MapLayout;
