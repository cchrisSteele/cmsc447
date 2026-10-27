
import Navbar from "./components/NavBar";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main id="home" className="app-content">
        <h1>Welcome to UMBC Campus Map</h1>
        <p>
          Explore campus buildings, directions, parking,
          and accessibility features.
        </p>
      </main>
    </div>
  );
}

export default App;
