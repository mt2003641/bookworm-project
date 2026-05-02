"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // (stores the username and password)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // (tracks dark mode on/off state)
  const [darkMode, setDarkMode] = useState(false);

  const [toast, setToast] = useState(null);


  // ============================
  // Dark Mode
  // ============================

  // (checks if the user had dark mode on when the user revisit this page)
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "enabled") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  // (toggles dark mode on/off and saves preference to localStorage)
  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
    localStorage.setItem("darkMode", next ? "enabled" : "disabled");
  }


  // ============================
  // Toast
  // ============================

  // (displays temporary notification message)
  function showToast(message, type = "info") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }


  // ============================
  // Login
  // ============================

  // (fetches all users and checks if the entered credentials match any user in the database)
  async function handleLogin(e) {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) return;

    const res = await fetch("/api/users");
    const users = await res.json();

    const user = users.find(
      u => u.username === trimmedUsername && u.password === password
    );

    if (user) {
      router.push(`/profile?user=${user.username}`);
    } else {
      showToast("Invalid username or password.", "error");
    }
  }


  // ============================
  // Render
  // ============================

  return (
    <>
      {toast && (
        <div className={`custom-toast ${toast.type} show`}>
          {toast.message}
        </div>
      )}

      <header>
        <div className="nav-container">
          <div className="logo-section">
            <img src="/logo.png" className="logo" alt="Logo" />
            <h1 className="site-name">Bookworms</h1>
          </div>
          <nav className="nav">
            <ul className="nav-links">
              <li className="divider">|</li>
              <li>
                <button id="dark-mode-toggle" onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="signup-container">

        <h2>Welcome back to Bookworms✨</h2>

        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="enter your username" value={username} 
            onChange={e => setUsername(e.target.value)} required/>

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="enter your password" value={password}
            onChange={e => setPassword(e.target.value)} required/>

          <button type="submit">Log In</button>
        </form>

        <p className="signup-link">Don't have an account? <a href="/signup">Sign up</a></p>

      </main>

      <footer>
        <p>&copy; 2026 Bookworms. All rights reserved.</p>
      </footer>
    </>
  );
}