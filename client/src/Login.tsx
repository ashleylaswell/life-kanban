import { useState } from "react";
import { api } from "./api";

type Props = { onAuthed: () => void };

export default function Login({ onAuthed }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api(mode === "register" ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (mode === "register") {
        // auto-login after register
        await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      }
      onAuthed();
    } catch (e: any) {
      setErr(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Life Kanban</h1>
      <p>{mode === "register" ? "Create an account" : "Log in"}</p>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          placeholder="Password (min 8 chars)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />

        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button disabled={busy} type="submit">
          {busy ? "..." : mode === "register" ? "Register + Login" : "Login"}
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
        >
          Switch to {mode === "register" ? "Login" : "Register"}
        </button>
      </div>
    </div>
  );
}
