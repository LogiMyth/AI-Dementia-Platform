import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { LoginResponse, Role } from "@dementia/contracts";
import "./styles.css";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";
function RoleShell({ role, name, onSignOut }: { role: Role; name: string; onSignOut(): void }) {
  const patient = role === "PATIENT";
  return <main className={patient ? "patient-shell" : "dashboard-shell"}>
    <header><p className="eyebrow">SIH 2026 · Fictional demo data</p><h1>{patient ? `Hello, ${name}` : `${role.replace("_", " ")} workspace`}</h1><button className="secondary" onClick={onSignOut}>Sign out</button></header>
    <section className="card"><h2>{patient ? "Your next small step" : "Foundation ready"}</h2><p>{patient ? "Your routines and reminders will appear here. You are in a safe demo environment." : "Role routing, access control and an accessible design foundation are connected to the API."}</p><button>{patient ? "Hear instructions" : "View linked patients"}</button></section>
    <p className="safety">This platform supports routines and engagement. It does not diagnose dementia or replace medical care.</p>
  </main>;
}
function Login({ onLogin }: { onLogin(session: LoginResponse): void }) {
  const [email, setEmail] = useState("caregiver.asha@example.test"); const [password, setPassword] = useState("DemoPass123!"); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const r = await fetch(`${apiBase}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) }); const payload = await r.json(); if (!r.ok) throw new Error(payload.message ?? "Sign-in failed."); onLogin(payload.data); } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); } finally { setBusy(false); } }
  return <main className="login-shell"><section className="login-card"><p className="eyebrow">AI Dementia Platform · SIH 2026</p><h1>Welcome</h1><p>Sign in to the fictional demonstration.</p><form onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" /></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" /></label>{error && <p role="alert" className="error">{error}</p>}<button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form></section></main>;
}
function App() { const [session, setSession] = useState<LoginResponse | null>(null); return session ? <RoleShell role={session.user.role} name={session.user.displayName} onSignOut={()=>setSession(null)} /> : <Login onLogin={setSession} />; }
createRoot(document.getElementById("root")!).render(<App />);
