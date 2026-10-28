
import Navbar from "./components/NavBar";
import MapLayout from "./components/MapLayout";
import FacilitiesLogin from "./pages/FacilitiesLogin";
import "./App.css";

function App() {
  const isLoginPage =
    window.location.pathname === "/facilities/login";

  if (isLoginPage) {
    return <FacilitiesLogin />;
  }

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
