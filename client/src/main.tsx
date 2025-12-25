import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Board from "./Board";
import { api } from "./api";

function App() {
  const [authed, setAuthed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        await api("/me");
        setAuthed(true);
      } catch {
        setAuthed(false);
      }
    })();
  }, []);

  if (authed === null) return <div style={{ padding: 20, fontFamily: "system-ui" }}>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          authed ? <Navigate to="/board" replace /> : <Login onAuthed={() => setAuthed(true)} />
        }
      />
      <Route path="/board" element={authed ? <Board /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
