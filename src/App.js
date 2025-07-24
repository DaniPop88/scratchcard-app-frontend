import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://<RAILWAY_BACKEND_URL>/api"; // GANTI dengan domain backend Railway lo!

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [balance, setBalance] = useState(0);
  const [tickets, setTickets] = useState([]);

  // Ambil data saldo & tiket user
  async function loadData(tok) {
    try {
      const res = await axios.get(`${API}/mytickets`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      setTickets(res.data);

      // Ambil balance (pakai endpoint topup, tapi jangan tambahin saldo)
      const balRes = await axios.post(`${API}/topup`, {}, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      setBalance(balRes.data.balance - 100); // Karena topup +100, jadi dikurangin 100
    } catch (err) {
      // Error biasanya token expired, logout otomatis
      setToken("");
      setBalance(0);
      setTickets([]);
    }
  }

  async function handleRegister() {
    try {
      await axios.post(`${API}/register`, { username, password });
      alert("Register sukses! Silakan login.");
    } catch (err) {
      alert("Register gagal!");
    }
  }

  async function handleLogin() {
    try {
      const res = await axios.post(`${API}/login`, { username, password });
      setToken(res.data.token);
      loadData(res.data.token);
    } catch (err) {
      alert("Login gagal!");
    }
  }

  async function handleTopup() {
    await axios.post(`${API}/topup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData(token);
  }

  async function handleBuyTicket() {
    await axios.post(`${API}/ticket`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData(token);
  }

  async function handleScratch(id) {
    await axios.post(`${API}/scratch/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadData(token);
  }

  // Auto-load data kalau token berubah
  useEffect(() => {
    if (token) loadData(token);
  }, [token]);

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>Scratchcard App</h1>
      {!token ? (
        <div>
          <h2>Register</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button onClick={handleRegister}>Register</button>
          <hr />
          <h2>Login</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Dashboard</h2>
          <div>Balance: <b>{balance}</b></div>
          <button onClick={handleTopup} style={{ margin: "10px 5px" }}>
            Top Up Saldo (+100)
          </button>
          <button onClick={handleBuyTicket} style={{ margin: "10px 5px" }}>
            Beli Tiket (10)
          </button>
          <hr />
          <h3>Tickets:</h3>
          {tickets.length === 0 && <div>Kamu belum punya tiket.</div>}
          {tickets.map(t =>
            <div key={t._id} style={{
              margin: "10px 0",
              border: "1px solid #ccc",
              padding: 10,
              borderRadius: 8,
              background: "#fafafa"
            }}>
              <div>Prize: <b>{t.isScratched ? t.prize : "???"}</b></div>
              <div>Scratched: {t.isScratched ? "Yes" : "No"}</div>
              {!t.isScratched &&
                <button onClick={() => handleScratch(t._id)}>
                  Scratch!
                </button>
              }
            </div>
          )}
          <button onClick={() => setToken("")} style={{ marginTop: 20 }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
