"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, limit,
} from "firebase/firestore";

export default function FirestoreTest() {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [info, setInfo] = useState<string>("checking...");

  useEffect(() => {
    // 接続先の確認メッセージ（localhostならエミュレータに接続している想定）
    setInfo(`host: ${location.hostname} → emulator mode: ${location.hostname === "localhost"}`);
    const q = query(collection(db, "samples"), orderBy("createdAt", "desc"), limit(10));
    const unsub = onSnapshot(q, (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    await addDoc(collection(db, "samples"), { title, createdAt: serverTimestamp() });
    setTitle("");
  };

  return (
    <main style={{ padding: 24, maxWidth: 640 }}>
      <h1>Firestore Test</h1>
      <p style={{ opacity: 0.8, marginBottom: 12 }}>{info}</p>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={add}>Add</button>
      </div>
      <ul>{items.map(it => <li key={it.id}>{it.title ?? "(no title)"}</li>)}</ul>
    </main>
  );
}
