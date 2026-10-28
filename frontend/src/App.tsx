
import Navbar from "./components/NavBar";
import MapLayout from "./components/MapLayout";
import FacilitiesLogin from "./pages/FacilitiesLogin";
import FacilitiesDashboard from "./pages/FacilitiesDashboard";
import "./App.css";

function App() {
  const path = window.location.pathname;

  // Facilities Login Page
  if (path === "/facilities/login") {
    return <FacilitiesLogin />;
  }

  // Facilities Private Dashboard
  if (path === "/facilities/dashboard") {
    return <FacilitiesDashboard />;
  }

  // Public Campus Map
  return (
    <div className="app">
      <Navbar />

      <main>
        <MapLayout />
      </main>
    </div>
  );
}

export default App;
