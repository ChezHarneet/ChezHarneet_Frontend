"use client";

import { apiFetch } from "../lib/api";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  X,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminUsers from "./admin-users";
import SpeakingCms from "./speaking-cms";

type Resource =
  | "courses"
  | "modules"
  | "tasks"
  | "themes"
  | "topics"
  | "practice-sets"
  | "practice-questions"
  | "essays"
  | "vocabulary"
  | "grammar"
  | "exam-criteria";
type CmsItem = Record<string, unknown> & { id: string; status?: string };
type ListResult = {
  items: CmsItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};
type Dashboard = {
  totals: Record<string, number>;
  publication: { published: number; draft: number; review: number; archived: number };
  requiringAttention: number;
  recentlyUpdated: Array<{
    id: string;
    resource: string;
    resourceId: string;
    action: string;
    actorId: string;
    snapshot: unknown;
    createdAt: string;
  }>;
};
type ImportPreview = {
  total: number;
  newCount: number;
  existingCount: number;
  invalidCount: number;
  conflictCount: number;
  rows: Array<{ index: number; status: string; message?: string }>;
};
type Field = {
  name: string;
  label: string;
  kind?: "text" | "long" | "number" | "select" | "boolean" | "json";
  required?: boolean;
  choices?: string[];
  relation?: Resource;
};

const resources: { id: Resource; label: string }[] = [
  { id: "courses", label: "Courses" },
  { id: "modules", label: "Modules" },
  { id: "tasks", label: "Tasks" },
  { id: "themes", label: "Themes & scenarios" },
  { id: "topics", label: "Topics" },
  { id: "practice-sets", label: "Practice sets" },
  { id: "practice-questions", label: "Practice questions" },
  { id: "essays", label: "Writing prompts & essays" },
  { id: "vocabulary", label: "Vocabulary" },
  { id: "grammar", label: "Grammar notes" },
  { id: "exam-criteria", label: "Exam criteria" },
];

const fields: Record<Resource, Field[]> = {
  courses: [
    { name: "slug", label: "Slug", required: true },
    { name: "title", label: "Course title", required: true },
    { name: "description", label: "Description", kind: "long" },
    { name: "priceMinor", label: "Price (minor units)", kind: "number" },
    { name: "currency", label: "Currency", required: true },
    { name: "isFree", label: "Free course", kind: "boolean" },
  ],
  modules: [
    { name: "courseId", label: "Course", kind: "select", relation: "courses", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "title", label: "Module title", required: true },
    { name: "description", label: "Description", kind: "long" },
    { name: "skill", label: "Skill", kind: "select", choices: ["SPEAKING", "LISTENING", "WRITING", "READING"], required: true },
    { name: "examLabel", label: "Exam label" },
    { name: "durationMinutes", label: "Duration (minutes)", kind: "number" },
    { name: "questionCount", label: "Question count", kind: "number" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  tasks: [
    { name: "moduleId", label: "Module", kind: "select", relation: "modules", required: true },
    { name: "type", label: "Task", kind: "select", choices: ["TASK1", "TASK2", "TASK3"], required: true },
    { name: "format", label: "Format", kind: "select", choices: ["SPEAKING_INTERVIEW", "SPEAKING_INTERACTION", "SPEAKING_VIEWPOINT", "LISTENING_MESSAGES", "LISTENING_CONVERSATIONS", "LISTENING_INTERVIEWS", "WRITING_MESSAGE", "WRITING_ARTICLE", "WRITING_OPINION", "READING_TEXTS", "READING_DOCUMENTS", "READING_OPINIONS"], required: true },
    { name: "title", label: "Task title", required: true },
    { name: "description", label: "Description", kind: "long" },
    { name: "instructions", label: "Instructions", kind: "long" },
    { name: "durationMinutes", label: "Duration (minutes)", kind: "number" },
    { name: "questionCount", label: "Question count", kind: "number" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  themes: [
    { name: "moduleId", label: "Module", kind: "select", relation: "modules", required: true },
    { name: "taskId", label: "Associated task", kind: "select", relation: "tasks" },
    { name: "slug", label: "Slug", required: true },
    { name: "name", label: "Theme / scenario", required: true },
    { name: "description", label: "Description", kind: "long" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  topics: [
    { name: "themeId", label: "Theme / scenario", kind: "select", relation: "themes", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "title", label: "Topic title", required: true },
    { name: "situation", label: "Situation", kind: "long" },
    { name: "question", label: "Question / prompt", kind: "long" },
    { name: "modelAnswer", label: "Model answer", kind: "long" },
    { name: "extraInformation", label: "Useful notes", kind: "long" },
    { name: "conclusion", label: "Conclusion", kind: "long" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  "practice-sets": [
    { name: "moduleId", label: "Module", kind: "select", relation: "modules", required: true },
    { name: "taskId", label: "Task", kind: "select", relation: "tasks" },
    { name: "slug", label: "Slug", required: true },
    { name: "title", label: "Set title", required: true },
    { name: "description", label: "Description", kind: "long" },
    { name: "mode", label: "Mode", kind: "select", choices: ["PRACTICE", "SIMULATION", "RECENT_SUBJECT"] },
    { name: "durationMinutes", label: "Duration (minutes)", kind: "number" },
    { name: "questionCount", label: "Question count", kind: "number" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  "practice-questions": [
    { name: "practiceSetId", label: "Practice set", kind: "select", relation: "practice-sets", required: true },
    { name: "prompt", label: "Prompt", kind: "long", required: true },
    { name: "options", label: "Options (JSON)", kind: "json" },
    { name: "answer", label: "Answer", kind: "long" },
    { name: "explanation", label: "Explanation", kind: "long" },
    { name: "audioMediaId", label: "Audio media ID" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  essays: [
    { name: "taskId", label: "Writing task", kind: "select", relation: "tasks", required: true },
    { name: "slug", label: "Slug", required: true },
    { name: "title", label: "Title", required: true },
    { name: "prompt", label: "Prompt / instructions", kind: "long" },
    { name: "content", label: "Model response / source text", kind: "long" },
    { name: "summary", label: "Summary", kind: "long" },
    { name: "extraInformation", label: "Additional information", kind: "long" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  vocabulary: [
    { name: "topicId", label: "Topic", kind: "select", relation: "topics", required: true },
    { name: "term", label: "French term", required: true },
    { name: "meaning", label: "Meaning / translation", kind: "long" },
    { name: "example", label: "Example sentence", kind: "long" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  grammar: [
    { name: "topicId", label: "Topic", kind: "select", relation: "topics", required: true },
    { name: "rule", label: "Rule / title", required: true },
    { name: "explanation", label: "Explanation", kind: "long" },
    { name: "example", label: "Example", kind: "long" },
    { name: "sortOrder", label: "Position", kind: "number" },
  ],
  "exam-criteria": [
    { name: "topicId", label: "Topic", kind: "select", relation: "topics", required: true },
    { name: "lexicalResources", label: "Lexical resources", kind: "long" },
    { name: "grammar", label: "Grammar", kind: "long" },
    { name: "coherence", label: "Coherence", kind: "long" },
    { name: "taskFulfillment", label: "Task fulfillment", kind: "long" },
    { name: "relevance", label: "Relevance", kind: "long" },
  ],
};

function titleOf(item: CmsItem) {
  for (const key of ["title", "name", "term", "rule", "prompt", "slug"]) {
    if (typeof item[key] === "string" && item[key]) return item[key] as string;
  }
  return item.id;
}

async function api<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : Array.isArray(payload?.message)
          ? payload.message.join(", ")
          : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

export default function CmsApp() {
  const pathname = usePathname();
  const router = useRouter();
  const isUsersPage = pathname === "/admin/users";
  const isSpeakingPage = pathname === "/admin/speaking";
  const selected = pathname.split("/")[2] as Resource | undefined;
  const selectedResource = resources.find(({ id }) => id === selected)?.id;
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionRole, setSessionRole] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [result, setResult] = useState<ListResult | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CmsItem | null | false>(false);
  const [relations, setRelations] = useState<Partial<Record<Resource, CmsItem[]>>>({});
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [titleSort, setTitleSort] = useState<"asc" | "desc">("asc");

  const loadDashboard = useCallback(async (accessToken: string) => {
    const data = await api<Dashboard>("/admin/cms/dashboard", accessToken);
    setDashboard(data);
  }, []);

  const loadList = useCallback(
    async (accessToken: string, resource: Resource) => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
        ...(query.trim() ? { search: query.trim() } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const data = await api<ListResult>(
        `/admin/cms/${resource}?${params.toString()}`,
        accessToken,
      );
      setResult(data);
    },
    [page, query, statusFilter],
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      await loadDashboard(token);
      if (selectedResource) await loadList(token, selectedResource);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load CMS data");
    } finally {
      setLoading(false);
    }
  }, [loadDashboard, loadList, selectedResource, token]);

  useEffect(() => {
    const existingToken = window.sessionStorage.getItem("cms-access-token") ?? window.sessionStorage.getItem("learner-access-token");
    if (!existingToken) return;
    void (async () => {
      try {
        const response = await apiFetch(`/auth/me`, { headers: { Authorization: `Bearer ${existingToken}` } });
        const profile = await response.json();
        if (!response.ok || !["ADMIN", "SUPER_ADMIN"].includes(profile.role)) throw new Error("This account does not have administrator access");
        window.sessionStorage.setItem("cms-access-token", existingToken);
        window.sessionStorage.setItem("cms-account-email", profile.email);
        setSessionEmail(profile.email);
        setSessionRole(profile.role);
        setToken(existingToken);
      } catch {
        window.sessionStorage.removeItem("cms-access-token");
        window.sessionStorage.removeItem("cms-account-email");
        setToken("");
        setSessionRole("");
        if (window.sessionStorage.getItem("learner-access-token")) router.replace("/dashboard");
      }
    })();
  }, [pathname, router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
    setStatusFilter("");
    setResult(null);
  }, [selectedResource]);

  useEffect(() => {
    if (!otpSent) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otpSent]);

  const loadRelations = useCallback(
    async (definitions: Field[]) => {
      if (!token) return;
      const needed = [...new Set(definitions.flatMap((field) => field.relation ? [field.relation] : []))];
      const values = await Promise.all(
        needed.map(async (resource) => {
          const response = await api<ListResult>(
            `/admin/cms/${resource}?page=1&pageSize=100`,
            token,
          );
          return [resource, response.items] as const;
        }),
      );
      setRelations((current) => ({ ...current, ...Object.fromEntries(values) }));
    },
    [token],
  );

  const requestCode = async (event?: FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "LOGIN" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Could not request a code");
      setDevCode(typeof payload.devCode === "string" ? payload.devCode : "");
      const requestTime = Date.now();
      setOtpExpiresAt(typeof payload.expiresAt === "string" ? Date.parse(payload.expiresAt) : null);
      setResendAvailableAt(requestTime + Number(payload.resendAfterSeconds ?? payload.retryAfterSeconds ?? 60) * 1000);
      setClockNow(requestTime);
      setOtpSent(true);
      setNotice(payload.retryAfterSeconds
        ? `A code was requested recently. Check your inbox or wait ${payload.retryAfterSeconds} seconds before requesting another.`
        : "If this email belongs to an account, a sign-in code has been sent.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not request a code");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch(`/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose: "LOGIN" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Code verification failed");
      if (typeof payload.accessToken !== "string") throw new Error("The API did not return an access token");
      const profileResponse = await apiFetch(`/auth/me`, { headers: { Authorization: `Bearer ${payload.accessToken}` } });
      const profile = await profileResponse.json();
      if (!profileResponse.ok) throw new Error(profile.message ?? "Could not load your account");
      if (!["ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
        setError("This account is for the learner area. Sign in to the customer panel instead.");
        router.replace("/dashboard");
        return;
      }
      window.sessionStorage.setItem("cms-access-token", payload.accessToken);
      window.sessionStorage.setItem("cms-account-email", profile.email ?? email);
      setSessionEmail(profile.email ?? email);
      setSessionRole(profile.role);
      setToken(payload.accessToken);
      setOtpSent(false);
      setCode("");
      setDevCode("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Code verification failed");
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    window.sessionStorage.removeItem("cms-access-token");
    window.sessionStorage.removeItem("cms-account-email");
    setToken("");
    setSessionEmail("");
    setSessionRole("");
    setDashboard(null);
    setResult(null);
    setError("");
  };

  const openEditor = async (item: CmsItem | null) => {
    if (!selectedResource) return;
    setError("");
    setNotice("");
    try {
      await loadRelations(fields[selectedResource]);
      setEditing(item);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load related records");
    }
  };

  const submitEditor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedResource || !token) return;
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    try {
      for (const field of fields[selectedResource]) {
        if (field.kind === "boolean") {
          payload[field.name] = form.get(field.name) === "on";
          continue;
        }
        const value = form.get(field.name)?.toString() ?? "";
        if (!value && !field.required) continue;
        if (field.kind === "number") {
          payload[field.name] = value === "" ? null : Number(value);
        } else if (field.kind === "json") {
          payload[field.name] = value ? JSON.parse(value) : null;
        } else {
          payload[field.name] = value;
        }
      }
      setBusy(true);
      setError("");
      const endpoint = editing
        ? `/admin/cms/${selectedResource}/${editing.id}`
        : `/admin/cms/${selectedResource}`;
      await api(endpoint, token, {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      setEditing(false);
      setNotice(editing ? "Changes saved." : "Draft created.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save content");
    } finally {
      setBusy(false);
    }
  };

  const mutate = async (
    resource: Resource,
    item: CmsItem,
    action: "publish" | "archive" | "delete",
  ) => {
    if (action === "delete" && !window.confirm(`Delete “${titleOf(item)}”? This cannot be undone.`)) return;
    if (action === "archive" && !window.confirm(`Archive “${titleOf(item)}”?`)) return;
    setError("");
    setNotice("");
    try {
      await api(`/admin/cms/${resource}/${item.id}${action === "delete" ? "" : `/${action}`}`, token, {
        method: action === "delete" ? "DELETE" : "POST",
      });
      setNotice(action === "delete" ? "Content deleted." : `Content ${action}d.`);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Unable to ${action} content`);
    }
  };

  const parseImportPayload = () => {
    if (!selectedResource) throw new Error("Choose a content collection first");
    const parsed: unknown = JSON.parse(importText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Import file must be a JSON object");
    }
    const document = parsed as { resource?: unknown; records?: unknown };
    if (document.resource !== selectedResource || !Array.isArray(document.records)) {
      throw new Error(`Expected { "resource": "${selectedResource}", "records": [...] }`);
    }
    return { resource: selectedResource, records: document.records };
  };

  const previewImport = async () => {
    setBusy(true);
    setError("");
    setImportPreview(null);
    try {
      const payload = parseImportPayload();
      const preview = await api<ImportPreview>("/admin/cms/import/preview", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setImportPreview(preview);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to preview import");
    } finally {
      setBusy(false);
    }
  };

  const applyImport = async () => {
    setBusy(true);
    setError("");
    try {
      const payload = parseImportPayload();
      const result = await api<{ imported: number; skipped: number }>("/admin/cms/import", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setImportOpen(false);
      setImportPreview(null);
      setImportText("");
      setNotice(`Import complete: ${result.imported} added, ${result.skipped} already existed.`);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to import content");
    } finally {
      setBusy(false);
    }
  };

  const downloadExport = async () => {
    if (!selectedResource) return;
    setBusy(true);
    setError("");
    try {
      const records: unknown[] = [];
      let offset = 0;
      let total = 0;
      do {
        const params = new URLSearchParams({
          resource: selectedResource,
          offset: String(offset),
          limit: "1000",
        });
        const page = await api<{
          records: unknown[];
          total: number;
        }>(`/admin/cms/export?${params.toString()}`, token);
        if (page.records.length === 0 && offset < page.total) {
          throw new Error("Export changed while downloading. Please retry.");
        }
        records.push(...page.records);
        offset += page.records.length;
        total = page.total;
      } while (offset < total);

      const blob = new Blob(
        [JSON.stringify({ resource: selectedResource, records }, null, 2)],
        { type: "application/json;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `chez-harneet-${selectedResource}-export.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("JSON export downloaded.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to export content");
    } finally {
      setBusy(false);
    }
  };

  const readImportFile = async (file?: File) => {
    if (!file) return;
    try {
      setImportText(await file.text());
      setImportPreview(null);
      setError("");
    } catch {
      setError("Unable to read the selected JSON file");
    }
  };

  const activeTitle = useMemo(
    () => isUsersPage ? "User management" : isSpeakingPage ? "Speaking content" : resources.find(({ id }) => id === selectedResource)?.label ?? "Overview",
    [isSpeakingPage, isUsersPage, selectedResource],
  );
  const visibleItems = useMemo(() => {
    if (!result) return [];
    return [...result.items].sort((left, right) => {
      const comparison = titleOf(left).localeCompare(titleOf(right));
      return titleSort === "asc" ? comparison : -comparison;
    });
  }, [result, titleSort]);

  if (!token) {
    return (
      <div className="cms-login-page">
        <section className="cms-login-card">
          <div className="cms-brand-mark"><BookOpen size={21} /></div>
          <p className="cms-eyebrow">CHEZ HARNEET · CONTENT STUDIO</p>
          <h1>Sign in to your CMS</h1>
          <p className="cms-muted">
            Use your administrator account. Only ADMIN and SUPER_ADMIN roles can access content tools.
          </p>
          {!otpSent ? (
            <form onSubmit={requestCode} className="cms-form">
              <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
              <button className="cms-button cms-primary" disabled={busy}>{busy ? <LoaderCircle className="cms-spin" size={16} /> : <Send size={16} />} Send sign-in code</button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="cms-form">
              <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} minLength={6} maxLength={6} required /></label>
              {otpExpiresAt !== null && <p className={`cms-otp-timer ${otpExpiresAt <= clockNow ? "expired" : ""}`}>{otpExpiresAt <= clockNow ? "This code has expired." : `Code expires in ${Math.floor((otpExpiresAt - clockNow) / 60000).toString().padStart(2, "0")}:${(Math.floor((otpExpiresAt - clockNow) / 1000) % 60).toString().padStart(2, "0")}.`}</p>}
              {devCode && <p className="cms-dev-code">Development code: <strong>{devCode}</strong></p>}
              <button className="cms-button cms-primary" disabled={busy || (otpExpiresAt !== null && otpExpiresAt <= clockNow)}>{busy ? <LoaderCircle className="cms-spin" size={16} /> : <ShieldCheck size={16} />} Verify and continue</button>
              <button type="button" className="cms-text-button" disabled={busy || (resendAvailableAt !== null && resendAvailableAt > clockNow)} onClick={() => void requestCode()}>{resendAvailableAt !== null && resendAvailableAt > clockNow ? `Resend code in ${Math.ceil((resendAvailableAt - clockNow) / 1000)}s` : "Resend code"}</button>
              <button type="button" className="cms-text-button" onClick={() => { setOtpSent(false); setDevCode(""); setCode(""); setOtpExpiresAt(null); setResendAvailableAt(null); }}>Use another email</button>
            </form>
          )}
          {error && <div className="cms-alert cms-error"><CircleAlert size={17} />{error}</div>}
          {notice && <div className="cms-alert cms-success"><Check size={17} />{notice}</div>}
          <p className="cms-login-foot">Access is checked by the API against your current account role.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="cms-shell">
      <aside className="cms-sidebar">
        <div className="cms-brand">
          <div className="cms-brand-mark"><BookOpen size={19} /></div>
          <div><strong>Chez Harneet</strong><span>CONTENT STUDIO</span></div>
        </div>
        <button className={`cms-nav-link ${!selectedResource ? "active" : ""}`} onClick={() => router.push("/admin")}>
          <LayoutDashboard size={18} /> Overview
        </button>
        <p className="cms-nav-caption">LEARNING CONTENT</p>
        <nav className="cms-nav-list">
          <button className={`cms-nav-link ${isSpeakingPage ? "active" : ""}`} onClick={() => router.push("/admin/speaking")}>
            <BookOpen size={17} /><span>Speaking content</span>
          </button>
          {resources.map((resource, index) => (
            <button key={resource.id} className={`cms-nav-link ${selectedResource === resource.id ? "active" : ""}`} onClick={() => router.push(`/admin/${resource.id}`)}>
              {index < 4 ? <GraduationCap size={17} /> : index < 8 ? <FileText size={17} /> : <BookOpen size={17} />}
              <span>{resource.label}</span>
            </button>
          ))}
        </nav>
        <p className="cms-nav-caption">ACCOUNTS</p>
        <button className={`cms-nav-link ${isUsersPage ? "active" : ""}`} onClick={() => router.push("/admin/users")}>
          <Users size={17} /><span>User management</span>
        </button>
        <div className="cms-sidebar-bottom">
          <button className="cms-nav-link" onClick={() => router.push("/")}><ArrowLeft size={17} /> Back to learning site</button>
          <div className="cms-role-note"><ShieldCheck size={16} /><span>Role verified by API on each request</span></div>
        </div>
      </aside>
      <main className="cms-main">
        <header className="cms-topbar">
          <div className="cms-mobile-title">Chez Harneet <span>/ {activeTitle}</span></div>
          <div className="cms-topbar-spacer" />
          <button className="cms-user-chip" onClick={logout}><span className="cms-user-avatar">{sessionEmail.slice(0, 1).toUpperCase() || "CH"}</span><span>{sessionEmail || "Sign out"}<small className="cms-user-role">{sessionRole.replace("_", " ")}</small></span><LogOut size={15} /></button>
        </header>
        <section className="cms-content">
          <div className="cms-page-heading">
            <div>
              <div className="cms-eyebrow">CONTENT MANAGEMENT</div>
              <h1>{activeTitle}</h1>
              <p>Manage your learning content and publishing workflow.</p>
            </div>
            {selectedResource && (
              <button className="cms-button cms-primary" onClick={() => void openEditor(null)}><Plus size={17} /> New {activeTitle.replace(/s$/, "")}</button>
            )}
          </div>

          {error && <div className="cms-alert cms-error"><CircleAlert size={17} />{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
          {notice && <div className="cms-alert cms-success"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button></div>}

          {!selectedResource && !isUsersPage && !isSpeakingPage && dashboard && (
            <>
              <div className="cms-stat-grid">
                {([
                  { label: "Courses", value: dashboard.totals.courses, icon: GraduationCap },
                  { label: "Modules", value: dashboard.totals.modules, icon: LayoutDashboard },
                  { label: "Tasks", value: dashboard.totals.tasks, icon: Activity },
                  { label: "Themes / scenarios", value: dashboard.totals.scenarios, icon: GraduationCap },
                  { label: "Topics", value: dashboard.totals.topics, icon: FileText },
                  { label: "Vocabulary entries", value: dashboard.totals.vocabulary, icon: BookOpen },
                  { label: "Grammar notes", value: dashboard.totals.grammarNotes, icon: BookOpen },
                ] satisfies { label: string; value: number; icon: LucideIcon }[]).map(({ label, value, icon: StatIcon }) => {
                  return <article className="cms-stat-card" key={label}><span className="cms-stat-icon"><StatIcon size={19} /></span><span>{label}</span><strong>{loading ? "—" : Number(value).toLocaleString()}</strong></article>;
                })}
              </div>
              <div className="cms-overview-grid">
                <section className="cms-panel cms-publish-panel">
                  <div className="cms-panel-heading"><div><h2>Publishing overview</h2><p>Current content lifecycle totals</p></div><Archive size={18} /></div>
                  <div className="cms-publish-numbers"><div><strong>{dashboard.publication.published}</strong><span>Published</span></div><div><strong>{dashboard.publication.draft}</strong><span>Draft</span></div><div><strong>{dashboard.publication.review}</strong><span>Review</span></div><div><strong>{dashboard.publication.archived}</strong><span>Archived</span></div></div>
                  <div className="cms-publish-bar"><span style={{ width: `${dashboard.publication.published + dashboard.publication.draft + dashboard.publication.review + dashboard.publication.archived ? (100 * dashboard.publication.published) / (dashboard.publication.published + dashboard.publication.draft + dashboard.publication.review + dashboard.publication.archived) : 0}%` }} /></div>
                </section>
                <section className="cms-panel">
                  <div className="cms-panel-heading"><div><h2>Recently changed</h2><p>Latest audited content actions</p></div><Activity size={18} /></div>
                  {dashboard.recentlyUpdated.length ? <div className="cms-recent-list">{dashboard.recentlyUpdated.map((item) => {
                    const snapshot = item.snapshot as { title?: string; name?: string; slug?: string } | null;
                    const resource = resources.find(({ id }) => id === item.resource);
                    return <button className="cms-recent-row" key={item.id} onClick={() => router.push(`/admin/${item.resource}`)}><span className="cms-recent-dot" /><span><strong>{snapshot?.title ?? snapshot?.name ?? snapshot?.slug ?? item.resourceId}</strong><small>{resource?.label ?? item.resource} · {item.action.toLowerCase()}</small></span><time>{new Date(item.createdAt).toLocaleDateString()}</time></button>;
                  })}</div> : <div className="cms-empty"><Activity size={22} /><strong>No changes recorded yet</strong><span>New edits and publishing actions will appear here.</span></div>}
                </section>
              </div>
              <section className="cms-panel cms-quick-panel">
                <div className="cms-panel-heading"><div><h2>Content library</h2><p>Jump into any learning content area.</p></div></div>
                <div className="cms-quick-links">{resources.map((resource) => <button key={resource.id} onClick={() => router.push(`/admin/${resource.id}`)}><span>{resource.label}</span><ArrowRight size={16} /></button>)}</div>
              </section>
            </>
          )}

          {isUsersPage && token && <AdminUsers token={token} role={sessionRole} />}

          {isSpeakingPage && token && <SpeakingCms token={token} />}

          {selectedResource && (
            <section className="cms-panel cms-list-panel">
              <div className="cms-list-toolbar">
                <label className="cms-search"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${activeTitle.toLowerCase()}…`} /></label>
                {["courses", "modules", "tasks", "themes", "topics", "practice-sets", "essays"].includes(selectedResource) && <select className="cms-filter" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filter by publication status">
                  <option value="">All statuses</option><option value="DRAFT">Draft</option><option value="REVIEW">Review</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
                </select>}
                <button className="cms-button cms-secondary" onClick={() => { setImportOpen(true); setImportPreview(null); setImportText(""); setError(""); }}><Plus size={15} /> Import JSON</button>
                <button className="cms-button cms-secondary" onClick={() => void downloadExport()} disabled={busy}><FileText size={15} /> Export</button>
                <button className="cms-button cms-secondary cms-refresh" onClick={() => void refresh()} disabled={loading}>{loading ? <LoaderCircle className="cms-spin" size={16} /> : <Activity size={16} />} Refresh</button>
              </div>
              {loading && !result ? <div className="cms-skeleton-list">{[0, 1, 2, 3].map((n) => <div key={n} className="cms-skeleton" />)}</div> : result?.items.length ? (
                <>
                  <div className="cms-table-wrap"><table className="cms-table"><thead><tr><th><button className="cms-sort-button" onClick={() => setTitleSort((direction) => direction === "asc" ? "desc" : "asc")}>Content {titleSort === "asc" ? "↑" : "↓"}</button></th><th>Parent / details</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>
                    {visibleItems.map((item) => {
                      const parent = (item.course ?? item.module ?? item.task ?? item.theme ?? item.topic ?? item.practiceSet) as CmsItem | undefined;
                      const status = item.status ?? ((item.topic as CmsItem | undefined)?.status);
                      return <tr key={item.id}>
                        <td><strong>{titleOf(item)}</strong><small>{typeof item.slug === "string" ? item.slug : item.id}</small></td>
                        <td>{parent ? titleOf(parent) : typeof item.skill === "string" ? item.skill : typeof item.type === "string" ? item.type : "—"}</td>
                        <td>{status ? <span className={`cms-status status-${String(status).toLowerCase()}`}>{String(status).toLowerCase()}</span> : <span className="cms-status status-neutral">inherited</span>}</td>
                        <td>{typeof item.updatedAt === "string" ? new Date(item.updatedAt).toLocaleDateString() : "—"}</td>
                        <td><div className="cms-row-actions">
                          <button title="Edit" onClick={() => void openEditor(item)}><FileText size={15} /></button>
                          {status && status !== "PUBLISHED" && status !== "ARCHIVED" && <button title="Publish" onClick={() => void mutate(selectedResource, item, "publish")}><Send size={15} /></button>}
                          {status && status !== "ARCHIVED" && <button title="Archive" onClick={() => void mutate(selectedResource, item, "archive")}><Archive size={15} /></button>}
                          <button className="cms-delete-action" title="Delete" onClick={() => void mutate(selectedResource, item, "delete")}><Trash2 size={15} /></button>
                        </div></td>
                      </tr>;
                    })}
                  </tbody></table></div>
                  <div className="cms-pagination"><span>{result.total ? `${(result.page - 1) * result.pageSize + 1}–${Math.min(result.page * result.pageSize, result.total)} of ${result.total}` : "0 records"}</span><div><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page {page} of {Math.max(1, result.pageCount)}</span><button disabled={page >= result.pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div>
                </>
              ) : <div className="cms-empty"><BookOpen size={26} /><strong>{query ? "No matching content" : "Nothing here yet"}</strong><span>{query ? "Try changing your search or filters." : "Create your first draft to begin building this library."}</span>{!query && <button className="cms-button cms-secondary" onClick={() => void openEditor(null)}><Plus size={16} /> Create draft</button>}</div>}
            </section>
          )}
        </section>
      </main>

      {editing !== false && selectedResource && (
        <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}>
          <section className="cms-editor-modal" role="dialog" aria-modal="true" aria-labelledby="cms-editor-title">
            <div className="cms-modal-heading"><div><div className="cms-eyebrow">{editing ? "EDIT CONTENT" : "NEW DRAFT"}</div><h2 id="cms-editor-title">{editing ? titleOf(editing) : `Create ${activeTitle.toLowerCase()}`}</h2><p>Changes to published content return it to review until it is published again.</p></div><button className="cms-icon-button" onClick={() => setEditing(false)} aria-label="Close editor"><X size={19} /></button></div>
            <form className="cms-form cms-editor-form" onSubmit={submitEditor}>
              {fields[selectedResource].map((field) => {
                const initial = editing ? editing[field.name] : undefined;
                const defaultValue = typeof initial === "string" || typeof initial === "number" ? String(initial) : "";
                const kind = field.kind ?? "text";
                return <label key={field.name} className={kind === "boolean" ? "cms-checkbox-label" : ""}>{field.label}{kind === "boolean" ? <input type="checkbox" name={field.name} defaultChecked={initial === true} /> : kind === "select" ? <select name={field.name} required={field.required} defaultValue={defaultValue}><option value="">Select…</option>{field.choices?.map((choice) => <option key={choice} value={choice}>{choice}</option>)}{field.relation && (relations[field.relation] ?? []).map((record) => <option key={record.id} value={record.id}>{titleOf(record)}</option>)}</select> : kind === "long" || kind === "json" ? <textarea name={field.name} rows={kind === "json" ? 4 : 5} required={field.required} defaultValue={kind === "json" && initial != null ? JSON.stringify(initial, null, 2) : defaultValue} placeholder={kind === "json" ? "Valid JSON" : ""} /> : <input name={field.name} type={kind === "number" ? "number" : "text"} min={kind === "number" ? 0 : undefined} required={field.required} defaultValue={defaultValue} />}</label>;
              })}
              {error && <div className="cms-alert cms-error"><CircleAlert size={17} />{error}</div>}
              <div className="cms-form-actions"><button type="button" className="cms-button cms-secondary" onClick={() => setEditing(false)}>Cancel</button><button className="cms-button cms-primary" disabled={busy}>{busy ? <LoaderCircle className="cms-spin" size={16} /> : <Check size={16} />} {editing ? "Save changes" : "Save draft"}</button></div>
            </form>
          </section>
        </div>
      )}

      {importOpen && selectedResource && (
        <div className="cms-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setImportOpen(false); }}>
          <section className="cms-editor-modal cms-import-modal" role="dialog" aria-modal="true" aria-labelledby="cms-import-title">
            <div className="cms-modal-heading"><div><div className="cms-eyebrow">SAFE JSON IMPORT</div><h2 id="cms-import-title">Import {activeTitle.toLowerCase()}</h2><p>Existing records are left unchanged. Imported records are created as drafts; no content is deleted.</p></div><button className="cms-icon-button" onClick={() => setImportOpen(false)} aria-label="Close importer"><X size={19} /></button></div>
            <div className="cms-import-body">
              <label className="cms-upload-label">Choose a JSON file<input type="file" accept="application/json,.json" onChange={(event) => void readImportFile(event.target.files?.[0])} /></label>
              <label className="cms-import-json-label">Or paste JSON in this format<textarea rows={9} value={importText} onChange={(event) => { setImportText(event.target.value); setImportPreview(null); }} placeholder={`{\n  "resource": "${selectedResource}",\n  "records": []\n}`} /></label>
              {importPreview && <div className="cms-import-summary"><strong>Import preview</strong><div><span>{importPreview.newCount} new</span><span>{importPreview.existingCount} existing</span><span>{importPreview.invalidCount} invalid</span><span>{importPreview.conflictCount} conflicts</span></div>{(importPreview.invalidCount > 0 || importPreview.conflictCount > 0) && <ul>{importPreview.rows.filter((row) => row.status === "invalid" || row.status === "conflict").slice(0, 10).map((row) => <li key={row.index}>Record {row.index + 1}: {row.message}</li>)}</ul>}</div>}
              {error && <div className="cms-alert cms-error"><CircleAlert size={17} />{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
              <div className="cms-form-actions"><button className="cms-button cms-secondary" onClick={() => setImportOpen(false)}>Cancel</button><button className="cms-button cms-secondary" onClick={() => void previewImport()} disabled={busy || !importText.trim()}>{busy ? <LoaderCircle className="cms-spin" size={16} /> : <Search size={15} />} Preview</button><button className="cms-button cms-primary" onClick={() => void applyImport()} disabled={busy || !importPreview || importPreview.invalidCount > 0 || importPreview.conflictCount > 0 || importPreview.newCount === 0}>{busy ? <LoaderCircle className="cms-spin" size={16} /> : <Check size={16} />} Import new drafts</button></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
