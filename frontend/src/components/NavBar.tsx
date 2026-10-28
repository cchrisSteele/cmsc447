
import "./NavBar.css";

function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">UMBC</span>
        <span className="navbar-title">Campus Map</span>
      </div>

      <nav className="navbar-links" aria-label="Main navigation">
        <a href="/#home">Home</a>
        <a href="/#map">Explore Map</a>
        <a href="/#about">About</a>
      </nav>

      <a href="/facilities/login" className="navbar-login">
        Facilities Login
      </a>
    </header>
  );
}

export default NavBar;
