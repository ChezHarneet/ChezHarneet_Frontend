"use client";

import { apiFetch } from "../lib/api";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, MailPlus, ShieldCheck, UserRound } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
};


export default function AdminUsers({ token, role }: { token: string; role: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteNotice, setInviteNotice] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch(`/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not load users");
      setUsers(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const updateRole = async (userId: string, nextRole: AdminUser["role"]) => {
    setSavingId(userId);
    setError("");
    try {
      const response = await apiFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not change this user's role");
      setUsers((current) => current.map((user) => user.id === userId ? payload : user));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not change this user's role");
    } finally {
      setSavingId("");
    }
  };

  const inviteTeammate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setInviting(true);
    setError("");
    setInviteNotice("");
    try {
      const response = await apiFetch(`/admin/users/invitations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not invite teammate");
      setInviteNotice(`Invitation email queued for ${payload.email}. Check their inbox and spam folder; delivery requires the notification worker to be running. The link expires in 24 hours.`);
      setInviteOpen(false);
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not invite teammate");
    } finally {
      setInviting(false);
    }
  };

  return (
    <section className="cms-panel cms-users-panel">
      <div className="cms-panel-heading"><div><h2>Accounts</h2><p>View customer accounts and their current access role.</p></div>{role === "SUPER_ADMIN" ? <button className="cms-button cms-secondary" onClick={() => { setInviteOpen((open) => !open); setInviteNotice(""); }}><MailPlus size={15} /> Invite teammate</button> : <UserRound size={18} />}</div>
      {error && <div className="cms-alert cms-error"><AlertCircle size={16} />{error}</div>}
      {inviteNotice && <div className="cms-alert cms-success">{inviteNotice}</div>}
      {inviteOpen && role === "SUPER_ADMIN" && <form className="speaking-cms-form" onSubmit={(event) => void inviteTeammate(event)}>
        <h3>Invite an administrator</h3>
        <p>Invited teammates receive the same full ADMIN access. We’ll email a one-time invitation link; after accepting, they sign in with an email verification code. The link expires in 24 hours.</p>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>First name<input name="firstName" autoComplete="given-name" maxLength={80} required /></label>
        <label>Last name<input name="lastName" autoComplete="family-name" maxLength={80} required /></label>
        <div className="speaking-cms-actions">
          <button className="cms-button cms-primary" type="submit" disabled={inviting}>{inviting ? <LoaderCircle className="cms-spin" size={15} /> : <MailPlus size={15} />} Send invitation</button>
          <button className="cms-button cms-secondary" type="button" onClick={() => setInviteOpen(false)} disabled={inviting}>Cancel</button>
        </div>
      </form>}
      {loading ? <div className="cms-empty"><LoaderCircle className="cms-spin" size={22} /><span>Loading accounts…</span></div> : users.length === 0 ? <div className="cms-empty"><UserRound size={22} /><strong>No accounts yet</strong></div> : (
        <div className="cms-users-table-wrap"><table className="cms-users-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}</strong><small>{user.email}</small></td><td>{role === "SUPER_ADMIN" ? <select aria-label={`Role for ${user.email}`} value={user.role} disabled={savingId === user.id} onChange={(event) => void updateRole(user.id, event.target.value as AdminUser["role"])}><option value="USER">USER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option></select> : <span className="cms-role-pill">{user.role === "SUPER_ADMIN" && <ShieldCheck size={13} />}{user.role}</span>}</td><td><span className={`cms-status-pill ${user.isActive ? "cms-user-active" : "cms-user-inactive"}`}>{user.isActive ? "Active" : "Inactive"}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      )}
      {role !== "SUPER_ADMIN" && <p className="cms-users-note">Only a SUPER_ADMIN can change account roles.</p>}
    </section>
  );
}
