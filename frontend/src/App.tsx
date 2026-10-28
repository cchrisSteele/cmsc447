import Navbar from "./components/NavBar";
import MapLayout from "./components/MapLayout";
import "./App.css";

function App() {
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