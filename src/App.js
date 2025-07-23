import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [balance, setBalance] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [prize, setPrize] = useState("");
  const [page, setPage] = useState("login");

  // Register
  const handleRegister = async () => {
    await axios.post(`${API}/register`, { username, password });
    alert("Register success! Please login.");
    setPage("login");
  };

  // Login
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      setToken(res.data.token);
      setPage("dashboard");
      fetchBalance(res.data.token);
      fetchTickets(res.data.token);
    } catch {
      alert("Login failed!");
    }
  };

  // Topup
  const handleTopup = async () => {
    const res = await axios.post(
      `${API}/topup`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setBalance(res.data.balance);
  };

  // Buy ticket
  const handleBuyTicket = async () => {
    const res = await axios.post(
      `${API}/ticket`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPrize("");
    fetchTickets(token);
    fetchBalance(token);
  };

  // Fetch tickets
  const fetchTickets = async (tkn) => {
    const res = await axios.get(`${API}/mytickets`, {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    setTickets(res.data);
  };

  // Fetch balance
  const fetchBalance = async (tkn) => {
    setBalance(0);
    const res = await axios.get(`${API}/mytickets`, {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.data.length > 0) {
      setBalance(res.data[0].balance || 0);
    }
  };

  // Scratch ticket
  const handleScratch = async (id) => {
    const res = await axios.post(
      `${API}/scratch/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPrize(res.data.prize);
    fetchTickets(token);
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>Scratchcard App</h1>
      {page === "login" && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setPage("register")}>Register</button>
        </>
      )}

      {page === "register" && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleRegister}>Register</button>
          <button onClick={() => setPage("login")}>Back to Login</button>
        </>
      )}

      {page === "dashboard" && (
        <>
          <div>
            <b>Balance:</b> {balance}
          </div>
          <button onClick={handleTopup}>Top Up Saldo (+100)</button>
          <button onClick={handleBuyTicket}>Beli Tiket (10)</button>
          <h2>Tickets</h2>
          {tickets.map((t) => (
            <div key={t._id} style={{ marginBottom: 10 }}>
              <span>
                {t.isScratched ? (
                  <b>{t.prize}</b>
                ) : (
                  <button onClick={() => handleScratch(t._id)}>
                    Scratch
                  </button>
                )}
              </span>
            </div>
          ))}
          {prize && <div style={{ fontSize: 24 }}>🎉 Prize: {prize} 🎉</div>}
        </>
      )}
    </div>
  );
}

export default App;