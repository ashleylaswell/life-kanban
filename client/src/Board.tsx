import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

type CardStatus = "INBOX" | "TODAY" | "WAITING" | "DONE";

type Card = {
  id: string;
  title: string;
  notes?: string | null;
  tag?: string | null;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
};

const COLUMNS: { key: CardStatus; label: string }[] = [
  { key: "INBOX", label: "Inbox" },
  { key: "TODAY", label: "Today" },
  { key: "WAITING", label: "Waiting" },
  { key: "DONE", label: "Done" },
];

export default function Board() {
  const [cards, setCards] = useState<Card[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const data = await api<Card[]>("/cards");
      setCards(data);
    } catch (e: any) {
      setErr(e.message || "Error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<CardStatus, Card[]> = { INBOX: [], TODAY: [], WAITING: [], DONE: [] };
    for (const c of cards) map[c.status].push(c);
    return map;
  }, [cards]);

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    const created = await api<Card>("/cards", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    setCards((prev) => [created, ...prev]);
  }

  async function move(card: Card, status: CardStatus) {
    const updated = await api<Card>(`/cards/${card.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setCards((prev) => prev.map((c) => (c.id === card.id ? updated : c)));
  }

  async function remove(card: Card) {
    await api<{ ok: true }>(`/cards/${card.id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== card.id));
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Life Kanban</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={addCard} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          placeholder="Add to Inbox..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          alignItems: "start",
        }}
      >
        {COLUMNS.map((col) => (
          <div key={col.key} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
            <h2 style={{ marginTop: 0 }}>{col.label}</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {grouped[col.key].map((card) => (
                <div
                  key={card.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 10,
                    background: "white",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{card.title}</div>

                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {col.key !== "INBOX" && <button onClick={() => move(card, "INBOX")}>To Inbox</button>}
                    {col.key !== "TODAY" && <button onClick={() => move(card, "TODAY")}>To Today</button>}
                    {col.key !== "WAITING" && (
                      <button onClick={() => move(card, "WAITING")}>To Waiting</button>
                    )}
                    {col.key !== "DONE" && <button onClick={() => move(card, "DONE")}>Done</button>}
                    <button onClick={() => remove(card)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
