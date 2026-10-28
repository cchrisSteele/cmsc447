
import { useState } from "react";
import "./FacilitiesLogin.css";

function FacilitiesLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Backend authentication will be added later
    alert("Login functionality coming soon!");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>UMBC</h1>
          <div className="login-divider"></div>

          <h2>Facilities Login</h2>
          <p>UMBC Facilities Management Portal</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit">
            Log In
          </button>
        </form>

        <p className="login-footer">
          Authorized facilities personnel only
        </p>
      </div>
    </div>
  );
}

export default FacilitiesLogin;
