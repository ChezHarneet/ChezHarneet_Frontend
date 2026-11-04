"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { API_BASE_URL, apiFetch } from "../lib/api";
import { ArrowDown, ArrowUp, Eye, EyeOff, FileUp, LoaderCircle, Plus, Save, Send, Trash2, X } from "lucide-react";

type Status = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED";
type Topic = {
  id: string;
  slug: string;
  title: string;
  situation: string | null;
  question: string | null;
  modelAnswer: string | null;
  extraInformation: string | null;
  conclusion: string | null;
  sortOrder: number;
  status: Status;
};
type Theme = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: Status;
  taskId: string | null;
  topics: Topic[];
};
type EssaySection = {
  id: string;
  sectionType: string;
  heading: string | null;
  content: string;
  sortOrder: number;
};
type EssayVersion = {
  id: string;
  versionLabel: string;
  sortOrder: number;
  status: Status;
  sections: EssaySection[];
};
type EssayVocabulary = {
  id: string;
  frenchTerm: string;
  englishMeaning: string | null;
  example: string | null;
  sortOrder: number;
};
type EssayGrammarNote = {
  id: string;
  structure: string;
  example: string | null;
  purpose: string | null;
  explanation: string | null;
  sortOrder: number;
};
type Essay = {
  id: string;
  slug: string;
  title: string;
  prompt: string | null;
  content: string | null;
  summary: string | null;
  extraInformation: string | null;
  status: Status;
  versions: EssayVersion[];
  vocabulary: EssayVocabulary[];
  grammarNotes: EssayGrammarNote[];
};
type ImportedSection = {
  sectionType: string;
  heading: string;
  content: string;
  sortOrder: number;
};
type ImportedTopic = {
  title: string;
  category: string;
  sourceText: string;
  sections: ImportedSection[];
  warnings: string[];
  fingerprint: string;
  included: boolean;
};
type PdfExtraction = {
  fileName: string;
  sizeBytes: number;
  topics: ImportedTopic[];
  warnings: string[];
};
type PdfImportResult = {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  published?: number;
  results: Array<{ title: string; status: "SUCCESS" | "FAILED" | "SKIPPED"; essayId?: string; published?: boolean; reason?: string }>;
};
type Task = {
  id: string;
  type: "TASK1" | "TASK2" | "TASK3";
  title: string;
  status: Status;
  themes: Theme[];
  essays: Essay[];
};
type SpeakingModule = {
  id: string;
  title: string;
  course: { id: string; slug: string; title: string };
  tasks: Task[];
  themes: Theme[];
};

const taskLabels = {
  TASK1: "Task 1 · Présentation",
  TASK2: "Task 2 · Interaction orale",
  TASK3: "Task 3 · Argumentation",
} as const;

const topicCategoryLabels = [
  { slug: "daily-life", name: "Daily life" },
  { slug: "studies", name: "Studies" },
  { slug: "work", name: "Work" },
  { slug: "society", name: "Society" },
  { slug: "leisure", name: "Leisure" },
  { slug: "travel", name: "Travel" },
] as const;

function isSourceCollection(theme: Theme) {
  return /^a88(?:-|\s)/i.test(theme.slug) || /^a88(?:\s|\b)/i.test(theme.name);
}

function topicDisplayCategory(topic: Topic, theme: Theme) {
  if (!isSourceCollection(theme)) {
    return { id: theme.id, slug: theme.slug, name: theme.name };
  }
  const text = `${topic.title} ${topic.situation ?? ""}`.toLowerCase();
  const slug =
    /école|étud|cours|formation|langue/.test(text) ? "studies" :
    /emploi|travaill|collègue|cuisinier|secrétaire|embauche|domicile/.test(text) ? "work" :
    /voyage|vacances|hôtel|chalet|mer|tourisme|séjour|bateau|week-end|ville/.test(text) ? "travel" :
    /guitare|danse|sport|festival|randonnée|fête|spectacle|zoo|musée|ludothèque|livre|film|émission/.test(text) ? "leisure" :
    /voisin|bénévolat|protection animale|rencontrer|mariage|nouvel an|végétarien|garder un enfant|garder le chien|déménagement/.test(text) ? "society" :
    "daily-life";
  const category = topicCategoryLabels.find((item) => item.slug === slug)!;
  return { ...category, id: category.slug };
}

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await apiFetch(path, { ...init, headers });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload && typeof payload.message === "string"
      ? payload.message
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload as T;
}

function formValues(form: HTMLFormElement) {
  return Object.fromEntries(new FormData(form).entries());
}

function contentSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uploadPdf(path: string, token: string, file: File, onProgress: (progress: number) => void) {
  if (!API_BASE_URL) return Promise.reject(new Error("NEXT_PUBLIC_API_URL is required to upload a PDF."));
  return new Promise<PdfExtraction>((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    xhr.onerror = () => reject(new Error("Could not reach the server while uploading the PDF."));
    xhr.onload = () => {
      let payload: unknown;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error(`The server returned an invalid response (${xhr.status}).`));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : `PDF extraction failed (${xhr.status}).`;
        reject(new Error(message));
        return;
      }
      resolve(payload as PdfExtraction);
    };
    xhr.send(form);
  });
}

function formatFileSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SpeakingCms({ token }: { token: string }) {
  const [modules, setModules] = useState<SpeakingModule[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<Task["type"]>("TASK2");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [selectedThemeCategoryId, setSelectedThemeCategoryId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedEssayId, setSelectedEssayId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [topicSlug, setTopicSlug] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfExtraction, setPdfExtraction] = useState<PdfExtraction | null>(null);
  const [pdfTopics, setPdfTopics] = useState<ImportedTopic[]>([]);
  const [pdfWarnings, setPdfWarnings] = useState<string[]>([]);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStep, setPdfStep] = useState<1 | 2 | 3>(1);
  const [pdfImportResult, setPdfImportResult] = useState<PdfImportResult | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfRemovedCount, setPdfRemovedCount] = useState(0);

  const refresh = useCallback(async () => {
    const data = await request<SpeakingModule[]>(token, "/admin/cms/speaking/content");
    setModules(data);
    setSelectedTaskType((current) => current);
    setSelectedThemeId((current) => {
      const currentExists = data.some((module) =>
        module.tasks.some((task) => task.type === selectedTaskType && task.themes.some((theme) => theme.id === current)),
      );
      return currentExists ? current : "";
    });
    setSelectedTopicId("");
    setSelectedEssayId("");
    setSelectedVersionId("");
  }, [selectedTaskType, token]);

  useEffect(() => {
    let active = true;
    request<SpeakingModule[]>(token, "/admin/cms/speaking/content")
      .then((data) => { if (active) setModules(data); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load speaking content");
      });
    return () => { active = false; };
  }, [token]);

  const tasks = useMemo(
    () => modules.flatMap((module) => module.tasks.map((task) => ({ ...task, moduleId: module.id, moduleTitle: module.title }))),
    [modules],
  );
  const taskOptions = tasks.filter((task) => task.type === selectedTaskType);
  const selectedTask = taskOptions.find((task) => task.moduleId === selectedModuleId) ?? taskOptions[0];
  const themes = selectedTask?.themes ?? [];
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) ?? null;
  const selectedTopic = themes.flatMap((theme) => theme.topics).find((topic) => topic.id === selectedTopicId) ?? null;
  const taskTwoTopicCategories = themes.flatMap((theme) =>
    theme.topics.map((topic) => ({ topic, theme, category: topicDisplayCategory(topic, theme) })),
  );
  const taskTwoCategoryGroups = taskTwoTopicCategories.reduce<Array<{
    id: string;
    slug: string;
    name: string;
    topics: Array<{ topic: Topic; theme: Theme }>;
  }>>((groups, item) => {
    let group = groups.find((candidate) => candidate.id === item.category.id);
    if (!group) {
      group = { ...item.category, topics: [] };
      groups.push(group);
    }
    group.topics.push({ topic: item.topic, theme: item.theme });
    return groups;
  }, []).sort((left, right) => {
    const leftOrder = topicCategoryLabels.findIndex((item) => item.slug === left.slug);
    const rightOrder = topicCategoryLabels.findIndex((item) => item.slug === right.slug);
    if (leftOrder === -1 && rightOrder === -1) return left.name.localeCompare(right.name);
    return (leftOrder === -1 ? topicCategoryLabels.length : leftOrder)
      - (rightOrder === -1 ? topicCategoryLabels.length : rightOrder);
  });
  const selectedCategoryGroup = taskTwoCategoryGroups.find((group) => group.id === selectedThemeCategoryId)
    ?? taskTwoCategoryGroups[0]
    ?? null;
  const selectedCategoryTopics = selectedCategoryGroup?.topics ?? [];
  const essays = selectedTask?.essays ?? [];
  const selectedEssay = essays.find((essay) => essay.id === selectedEssayId) ?? null;
  const selectedVersion = selectedEssay?.versions.find((version) => version.id === selectedVersionId) ?? null;

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      await refresh();
      setNotice(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save speaking content");
    } finally {
      setBusy(false);
    }
  };

  const clearPdfWorkflow = () => {
    setPdfFile(null);
    setPdfExtraction(null);
    setPdfTopics([]);
    setPdfWarnings([]);
    setPdfProgress(0);
    setPdfStep(1);
    setPdfImportResult(null);
    setPdfRemovedCount(0);
  };

  const extractPdf = async () => {
    if (!selectedTask || !pdfFile) return;
    setPdfBusy(true);
    setError("");
    setNotice("");
    setPdfProgress(0);
    try {
      const extraction = await uploadPdf(
        `/admin/cms/speaking/tasks/${selectedTask.id}/pdf/extract`,
        token,
        pdfFile,
        setPdfProgress,
      );
      setPdfExtraction(extraction);
      setPdfTopics(extraction.topics.map((topic) => ({ ...topic, included: true })));
      setPdfWarnings(extraction.warnings);
      setPdfStep(2);
      setPdfImportResult(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not extract topics from the PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  const submitPdfTopics = async (topics: ImportedTopic[], publishDetectedVersions: boolean) => {
    if (!selectedTask) return;
    const result = await request<PdfImportResult>(
      token,
      `/admin/cms/speaking/tasks/${selectedTask.id}/pdf/import`,
      {
        method: "POST",
        body: JSON.stringify({
          publishDetectedVersions,
          topics: topics.map((topic) => ({
            title: topic.title,
            category: topic.category,
            sourceText: topic.sourceText || topic.sections.map((section) => `${section.heading}\n${section.content}`).join("\n\n"),
            sections: topic.sections.map((section, sortOrder) => ({ ...section, sortOrder })),
          })),
        }),
      },
    );
    setPdfImportResult(result);
    setPdfStep(3);
    await refresh();
  };

  const quickImportPdf = async () => {
    if (!selectedTask || !pdfFile) return;
    setPdfBusy(true);
    setError("");
    setNotice("");
    setPdfProgress(0);
    try {
      const extraction = await uploadPdf(
        `/admin/cms/speaking/tasks/${selectedTask.id}/pdf/extract`,
        token,
        pdfFile,
        setPdfProgress,
      );
      setPdfExtraction(extraction);
      setPdfTopics(extraction.topics.map((topic) => ({ ...topic, included: true })));
      setPdfWarnings(extraction.warnings);
      setPdfProgress(100);

      if (!extraction.topics.length) {
        setPdfStep(2);
        setError("No topics were detected. Review the PDF extraction before importing.");
        return;
      }
      if (extraction.topics.length > 10) {
        setPdfStep(2);
        setError("This PDF has more than 10 topics. Review it and import in smaller batches.");
        return;
      }
      if (extraction.topics.some((topic) => !topic.title.trim() || !topic.sections.some((section) => section.content.trim()))) {
        setPdfStep(2);
        setError("Some topics need a title or content. Review the extraction before importing.");
        return;
      }
      await submitPdfTopics(extraction.topics, true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import topics from the PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  const updatePdfTopic = (index: number, patch: Partial<ImportedTopic>) => {
    setPdfTopics((current) => current.map((topic, topicIndex) =>
      topicIndex === index ? { ...topic, ...patch } : topic,
    ));
  };

  const updatePdfSection = (topicIndex: number, sectionIndex: number, patch: Partial<ImportedSection>) => {
    setPdfTopics((current) => current.map((topic, index) => {
      if (index !== topicIndex) return topic;
      return {
        ...topic,
        sections: topic.sections.map((section, indexInTopic) =>
          indexInTopic === sectionIndex ? { ...section, ...patch } : section,
        ),
      };
    }));
  };

  const addPdfTopic = () => {
    setPdfTopics((current) => [...current, {
      title: "",
      category: "",
      sourceText: "",
      sections: [{ sectionType: "UNCLASSIFIED", heading: "Content needs review", content: "", sortOrder: 0 }],
      warnings: ["This topic was added manually. Enter a title and content before importing."],
      fingerprint: "",
      included: true,
    }]);
  };

  const removePdfTopic = (index: number) => {
    const topic = pdfTopics[index];
    if (!window.confirm(`Remove "${topic.title || "untitled topic"}" from this import? Its content will not be sent.`)) return;
    setPdfTopics((current) => current.filter((_, topicIndex) => topicIndex !== index));
    setPdfRemovedCount((count) => count + 1);
  };

  const importPdfTopics = async () => {
    if (!selectedTask) return;
    const included = pdfTopics.filter((topic) => topic.included);
    if (!included.length || included.length > 10) {
      setError("Keep between 1 and 10 topics selected before importing.");
      return;
    }
    if (included.some((topic) => !topic.title.trim() || !topic.sections.some((section) => section.content.trim()))) {
      setError("Every included topic needs a title and at least one section with content.");
      return;
    }
    setPdfBusy(true);
    setError("");
    setNotice("");
    try {
      await submitPdfTopics(included, false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not import topics");
    } finally {
      setPdfBusy(false);
    }
  };

  const reviewPdfImport = () => {
    const included = pdfTopics.filter((topic) => topic.included);
    if (!included.length || included.length > 10) {
      setError("Keep between 1 and 10 topics selected before continuing.");
      return;
    }
    if (included.some((topic) => !topic.title.trim() || !topic.sections.some((section) => section.content.trim()))) {
      setError("Every topic needs a title and at least one section with content.");
      return;
    }
    setError("");
    setPdfStep(3);
  };

  const createCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask) return;
    void run(async () => {
      await request(token, "/admin/cms/themes", {
        method: "POST",
        body: JSON.stringify({
          moduleId: selectedTask.moduleId,
          taskId: selectedTask.id,
          slug: categorySlug,
          name: categoryName,
          sortOrder: themes.length,
        }),
      });
      setCategoryName("");
      setCategorySlug("");
    }, "Category created as a draft. Assign or review existing situations before publishing.");
  };

  const createTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    const themeId = selectedTaskType === "TASK2" ? selectedThemeId : String(values.themeId ?? "");
    if (!themeId) {
      setError("Select the existing topic collection or Task 2 category before creating a topic.");
      return;
    }
    void run(async () => {
      await request(token, "/admin/cms/topics", {
        method: "POST",
        body: JSON.stringify({
          themeId,
          slug: topicSlug,
          title: values.title,
          situation: values.situation || null,
          question: values.question || null,
          sortOrder: Number(values.sortOrder),
          status: "DRAFT",
        }),
      });
      setTopicSlug("");
    }, "Topic created as a draft. Its new ID and audit record are retained.");
  };

  const saveTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTopic) return;
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/topics/${selectedTopic.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
          themeId: selectedThemeId,
          sortOrder: Number(values.sortOrder),
        }),
      });
    }, "Situation saved. Existing topic ID and its other relationships were retained.");
  };

  const publishContent = (resource: "topics" | "themes", id: string) => {
    void run(async () => {
      await request(token, `/admin/cms/${resource}/${id}/publish`, { method: "POST" });
    }, `${resource === "themes" ? "Category" : "Topic"} published.`);
  };

  const createVersion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEssay) return;
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/speaking/essays/${selectedEssay.id}/versions`, {
        method: "POST",
        body: JSON.stringify({ versionLabel: values.versionLabel, sortOrder: selectedEssay.versions.length }),
      });
    }, "Version created as a draft.");
  };

  const createSection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVersion) return;
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/speaking/versions/${selectedVersion.id}/sections`, {
        method: "POST",
        body: JSON.stringify({
          sectionType: values.sectionType,
          heading: values.heading || null,
          content: values.content,
          sortOrder: selectedVersion.sections.length,
        }),
      });
    }, "Section added.");
  };

  const saveSection = (event: FormEvent<HTMLFormElement>, section: EssaySection) => {
    event.preventDefault();
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/speaking/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          sectionType: values.sectionType,
          heading: values.heading || null,
          content: values.content,
          sortOrder: Number(values.sortOrder),
        }),
      });
    }, "Section saved.");
  };

  const moveSection = (section: EssaySection, offset: -1 | 1) => {
    if (!selectedVersion) return;
    const ordered = [...selectedVersion.sections].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    const index = ordered.findIndex((item) => item.id === section.id);
    const neighbor = ordered[index + offset];
    if (!neighbor) return;
    void run(async () => {
      await request(token, `/admin/cms/speaking/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: neighbor.sortOrder }),
      });
      await request(token, `/admin/cms/speaking/sections/${neighbor.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: section.sortOrder }),
      });
    }, "Section order updated.");
  };

  const publishVersion = () => {
    if (!selectedVersion) return;
    void run(async () => {
      await request(token, `/admin/cms/speaking/versions/${selectedVersion.id}/publish`, { method: "POST" });
    }, "Version published.");
  };

  const addEssayVocabulary = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEssay) return;
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/speaking/essays/${selectedEssay.id}/vocabulary`, {
        method: "POST",
        body: JSON.stringify({
          frenchTerm: values.frenchTerm,
          englishMeaning: values.englishMeaning || null,
          example: values.example || null,
          sortOrder: selectedEssay.vocabulary.length,
        }),
      });
    }, "Vocabulary entry added.");
  };

  const addEssayGrammar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEssay) return;
    const values = formValues(event.currentTarget);
    void run(async () => {
      await request(token, `/admin/cms/speaking/essays/${selectedEssay.id}/grammar`, {
        method: "POST",
        body: JSON.stringify({
          structure: values.structure,
          example: values.example || null,
          purpose: values.purpose || null,
          explanation: values.explanation || null,
          sortOrder: selectedEssay.grammarNotes.length,
        }),
      });
    }, "Grammar note added.");
  };

  return (
    <section className="speaking-cms">
      <div className="speaking-cms-intro">
        <div>
          <span className="cms-eyebrow">TASK-BASED EDITOR</span>
          <h2>Speaking content</h2>
          <p>Manage Task 1 topics, Task 2 categories and situations, and structured Task 3 answer versions.</p>
        </div>
        <div className="speaking-cms-actions">
          <button type="button" className="cms-button cms-secondary" onClick={() => setPreview((value) => !value)}>
            {preview ? <EyeOff size={16} /> : <Eye size={16} />}{preview ? "Close preview" : "Preview"}
          </button>
          <button type="button" className="cms-button cms-secondary" onClick={() => void run(refresh, "Speaking content refreshed.")} disabled={busy}>Refresh</button>
        </div>
      </div>
      {error && <div className="cms-alert cms-error" role="alert">{error}</div>}
      {notice && <div className="cms-alert cms-success" role="status">{notice}</div>}

      <div className="speaking-cms-task-tabs" role="tablist" aria-label="Speaking task">
        {(Object.keys(taskLabels) as Task["type"][]).map((type) => (
          <button
            type="button"
            role="tab"
            aria-selected={selectedTaskType === type}
            className={selectedTaskType === type ? "is-active" : ""}
            key={type}
            onClick={() => {
              setSelectedTaskType(type);
              setSelectedThemeId("");
              setSelectedThemeCategoryId("");
              setSelectedTopicId("");
              setSelectedEssayId("");
              setSelectedVersionId("");
            }}
          >
            {taskLabels[type]}
          </button>
        ))}
      </div>

      {taskOptions.length > 1 && <label className="speaking-cms-module-select">Course module
        <select value={selectedTask?.moduleId ?? ""} onChange={(event) => {
          setSelectedModuleId(event.target.value);
          setSelectedThemeId("");
          setSelectedTopicId("");
          setSelectedEssayId("");
          setSelectedVersionId("");
        }}>
          {taskOptions.map((task) => <option value={task.moduleId} key={task.id}>{task.moduleTitle}</option>)}
        </select>
      </label>}
      {!selectedTask && <div className="cms-empty">No speaking task is configured in the selected module yet. Create it from Tasks, then return here.</div>}

      {selectedTaskType === "TASK1" && selectedTask && (
        <div className="speaking-cms-grid">
          <section className="cms-panel speaking-cms-list">
            <h3>Individual topics</h3>
            <p>Topics stay independent; categories are not required for Task 1.</p>
            {themes.length > 0 ? <form className="speaking-cms-form speaking-category-form" onSubmit={createTopic}>
              <h4><Plus size={15} /> Add individual topic</h4>
              <label>Topic collection required by the existing Theme relationship<select name="themeId" required>{themes.map((theme) => <option value={theme.id} key={theme.id}>{theme.name}</option>)}</select></label>
              <label>Title<input name="title" required onChange={(event) => setTopicSlug(contentSlug(event.target.value))} /></label>
              <label>Slug<input value={topicSlug} onChange={(event) => setTopicSlug(contentSlug(event.target.value))} required /></label>
              <label>Situation<textarea name="situation" rows={2} /></label>
              <label>Prompt / questions<textarea name="question" rows={4} /></label>
              <label>Order<input name="sortOrder" type="number" min={0} defaultValue={themes.reduce((total, theme) => total + theme.topics.length, 0)} /></label>
              <button className="cms-button cms-secondary" disabled={busy || !topicSlug}>Create draft topic</button>
            </form> : <div className="cms-empty">The current schema requires every topic to reference a Theme. Create a Task 1 topic collection in Themes before adding individual topics.</div>}
            {themes.flatMap((theme) => theme.topics.map((topic) => ({ theme, topic }))).map(({ theme, topic }) => (
              <button type="button" key={topic.id} className={selectedTopicId === topic.id ? "is-selected" : ""} onClick={() => { setSelectedThemeId(theme.id); setSelectedTopicId(topic.id); }}>
                <strong>{topic.title}</strong><small>{topic.status.toLowerCase()} · {theme.name}</small>
              </button>
            ))}
            {themes.every((theme) => theme.topics.length === 0) && <div className="cms-empty">No Task 1 topics are associated yet.</div>}
          </section>
          <section className="cms-panel speaking-cms-editor">
            <h3>{selectedTopic ? "Edit topic" : "Select a topic"}</h3>
            {selectedTopic && <form className="speaking-cms-form" onSubmit={saveTopic} key={selectedTopic.id}>
              <label>Title<input name="title" defaultValue={selectedTopic.title} required /></label>
              <label>Situation<textarea name="situation" defaultValue={selectedTopic.situation ?? ""} rows={3} /></label>
              <label>Prompt / questions<textarea name="question" defaultValue={selectedTopic.question ?? ""} rows={8} /></label>
              <label>Model answer<textarea name="modelAnswer" defaultValue={selectedTopic.modelAnswer ?? ""} rows={5} /></label>
              <label>Learning notes<textarea name="extraInformation" defaultValue={selectedTopic.extraInformation ?? ""} rows={5} /></label>
              <label>Closing<textarea name="conclusion" defaultValue={selectedTopic.conclusion ?? ""} rows={3} /></label>
              <label>Order<input name="sortOrder" type="number" min={0} defaultValue={selectedTopic.sortOrder} /></label>
              <div className="speaking-cms-actions">
                <button className="cms-button cms-primary" disabled={busy}><Save size={16} /> Save topic</button>
                <button type="button" className="cms-button cms-secondary" disabled={busy || !preview || selectedTopic.status === "PUBLISHED"} onClick={() => publishContent("topics", selectedTopic.id)}><Send size={15} /> Publish</button>
              </div>
            </form>}
            {preview && selectedTopic && <article className="speaking-cms-preview"><h4>{selectedTopic.title}</h4><p>{selectedTopic.situation}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.question}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.modelAnswer}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.extraInformation}</p><p>{selectedTopic.conclusion}</p></article>}
          </section>
        </div>
      )}

      {selectedTaskType === "TASK2" && selectedTask && (
        <div className="speaking-cms-grid">
          <section className="cms-panel speaking-cms-list">
            <h3>Categories</h3>
            <p>Browse situations by topic category. Existing topic IDs and content are preserved.</p>
            {taskTwoCategoryGroups.map((group) => (
              <button
                type="button"
                key={group.id}
                className={selectedCategoryGroup?.id === group.id ? "is-selected" : ""}
                onClick={() => {
                  setSelectedThemeCategoryId(group.id);
                  setSelectedThemeId(group.topics[0]?.theme.id ?? "");
                  setSelectedTopicId("");
                }}
              >
                <strong>{group.name}</strong><small>{group.topics.length} situations</small>
              </button>
            ))}
            {!taskTwoCategoryGroups.length && <div className="cms-empty">No Task 2 situations are available.</div>}
            <form className="speaking-cms-form speaking-category-form" onSubmit={createCategory}>
              <h4><Plus size={15} /> Add category</h4>
              <label>Category name<input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required /></label>
              <label>Slug<input value={categorySlug} onChange={(event) => setCategorySlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))} required /></label>
              <button className="cms-button cms-secondary" disabled={busy || !categorySlug}>Create draft category</button>
            </form>
          </section>
          <section className="cms-panel speaking-cms-editor">
            <div className="speaking-cms-heading-row">
              <h3>{selectedCategoryGroup ? `${selectedCategoryGroup.name} · situations` : "Select a category"}</h3>
              {selectedTheme && !isSourceCollection(selectedTheme) && <button type="button" className="cms-button cms-secondary" disabled={busy || !preview || selectedTheme.status === "PUBLISHED"} onClick={() => publishContent("themes", selectedTheme.id)}><Send size={15} /> Publish category</button>}
            </div>
            {selectedCategoryGroup && (
              <>
                <form className="speaking-cms-form speaking-category-form" onSubmit={createTopic}>
                  <h4><Plus size={15} /> Add a situation to {selectedCategoryGroup.name}</h4>
                  <label>Title<input name="title" required onChange={(event) => setTopicSlug(contentSlug(event.target.value))} /></label>
                  <label>Slug<input value={topicSlug} onChange={(event) => setTopicSlug(contentSlug(event.target.value))} required /></label>
                  <label>Situation<textarea name="situation" rows={2} /></label>
                  <label>Questions / dialogue<textarea name="question" rows={4} /></label>
                  <label>Order<input name="sortOrder" type="number" min={0} defaultValue={selectedCategoryGroup.topics.length} /></label>
                  <button className="cms-button cms-secondary" disabled={busy || !topicSlug}>Create draft situation</button>
                </form>
                <div className="speaking-cms-topic-list">
                  {selectedCategoryTopics.map(({ topic, theme }) => (
                    <button type="button" key={topic.id} className={selectedTopicId === topic.id ? "is-selected" : ""} onClick={() => { setSelectedThemeId(theme.id); setSelectedTopicId(topic.id); }}>
                      <strong>{topic.title}</strong><small>{topic.status.toLowerCase()} · #{topic.sortOrder + 1}</small>
                    </button>
                  ))}
                  {!selectedCategoryTopics.length && <div className="cms-empty">No situations are assigned to this category yet.</div>}
                </div>
                {selectedTopic && <form className="speaking-cms-form" onSubmit={saveTopic} key={selectedTopic.id}>
                  <h4>Edit situation</h4>
                  <label>Category<input value={selectedCategoryGroup?.name ?? ""} readOnly /></label>
                  <label>Title<input name="title" defaultValue={selectedTopic.title} required /></label>
                  <label>Situation<textarea name="situation" defaultValue={selectedTopic.situation ?? ""} rows={3} /></label>
                  <label>Questions / dialogue<textarea name="question" defaultValue={selectedTopic.question ?? ""} rows={10} /></label>
                  <label>Model answer<textarea name="modelAnswer" defaultValue={selectedTopic.modelAnswer ?? ""} rows={4} /></label>
                  <label>Vocabulary and grammar notes<textarea name="extraInformation" defaultValue={selectedTopic.extraInformation ?? ""} rows={8} /></label>
                  <label>Closing<textarea name="conclusion" defaultValue={selectedTopic.conclusion ?? ""} rows={3} /></label>
                  <label>Order in category<input name="sortOrder" type="number" min={0} defaultValue={selectedTopic.sortOrder} /></label>
                  <div className="speaking-cms-actions"><button className="cms-button cms-primary" disabled={busy}><Save size={16} /> Save situation</button><button type="button" className="cms-button cms-secondary" disabled={busy || !preview || selectedTopic.status === "PUBLISHED"} onClick={() => publishContent("topics", selectedTopic.id)}><Send size={15} /> Publish</button><span>Topic ID: {selectedTopic.id}</span></div>
                </form>}
                {preview && selectedTopic && <article className="speaking-cms-preview"><h4>{selectedTopic.title}</h4><p>{selectedTopic.situation}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.question}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.modelAnswer}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedTopic.extraInformation}</p><p>{selectedTopic.conclusion}</p></article>}
              </>
            )}
          </section>
        </div>
      )}

      {selectedTaskType === "TASK3" && selectedTask && (
        <div className="speaking-cms-task3">
          <section className="cms-panel task3-pdf-workflow">
            <div className="task3-pdf-heading">
              <div>
                <span className="cms-eyebrow">BULK TOPIC IMPORT</span>
                <h3>Import Task 3 topics from one PDF</h3>
                <p>Choose a PDF, then click Import PDF once. Clear topics are published automatically; uncertain content stays in drafts for review.</p>
              </div>
            </div>
            {pdfStep === 1 && (
              <div className="task3-pdf-upload">
                {!pdfFile ? (
                  <label className="task3-pdf-dropzone">
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      aria-label="Choose a Task 3 PDF"
                      onChange={(event) => {
                        const nextFile = event.currentTarget.files?.[0] ?? null;
                        if (!nextFile) return;
                        if (nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) {
                          setError("Choose a PDF file.");
                          event.currentTarget.value = "";
                          return;
                        }
                        if (nextFile.size > 15 * 1024 * 1024) {
                          setError("PDF files must be 15 MB or smaller.");
                          event.currentTarget.value = "";
                          return;
                        }
                        setError("");
                        setPdfFile(nextFile);
                        setPdfExtraction(null);
                        setPdfTopics([]);
                        setPdfWarnings([]);
                        setPdfImportResult(null);
                      }}
                    />
                    <FileUp size={28} />
                    <b>Choose a PDF to get started</b>
                    <span>PDF only · Up to 15 MB · Maximum 10 topics per import</span>
                    <span className="cms-button cms-primary"><FileUp size={15} /> Select PDF</span>
                  </label>
                ) : (
                  <div className="task3-pdf-file">
                    <div className="task3-pdf-file-icon"><FileUp size={20} /></div>
                    <div className="task3-pdf-file-info"><b>{pdfFile.name}</b><span>{formatFileSize(pdfFile.size)}</span></div>
                    <label className="cms-button cms-secondary task3-pdf-replace">
                      Replace
                      <input type="file" accept="application/pdf,.pdf" onChange={(event) => {
                        const nextFile = event.currentTarget.files?.[0] ?? null;
                        if (!nextFile) return;
                        if ((nextFile.type !== "application/pdf" && !nextFile.name.toLowerCase().endsWith(".pdf")) || nextFile.size > 15 * 1024 * 1024) {
                          setError("Choose a PDF file that is 15 MB or smaller.");
                          event.currentTarget.value = "";
                          return;
                        }
                        setError("");
                        setPdfFile(nextFile);
                        setPdfExtraction(null);
                        setPdfTopics([]);
                        setPdfWarnings([]);
                        setPdfProgress(0);
                        setPdfImportResult(null);
                      }} />
                    </label>
                    <button className="task3-pdf-icon-button" type="button" aria-label="Remove PDF" onClick={clearPdfWorkflow}><X size={17} /></button>
                  </div>
                )}
                {pdfBusy && <div className="task3-pdf-progress" role="status">
                  <div><span>Uploading and importing topics</span><b>{pdfProgress}%</b></div>
                  <progress max={100} value={pdfProgress} />
                </div>}
                <div className="task3-pdf-actions">
                  <button type="button" className="cms-button cms-primary" disabled={!pdfFile || pdfBusy} onClick={() => void quickImportPdf()}>
                    {pdfBusy ? <LoaderCircle size={16} className="is-spinning" /> : <Send size={16} />}
                    {pdfBusy ? "Importing topics…" : "Import PDF"}
                  </button>
                  <button type="button" className="cms-button cms-secondary" disabled={!pdfFile || pdfBusy} onClick={() => void extractPdf()}>
                    Review topics first
                  </button>
                </div>
              </div>
            )}

            {pdfStep === 2 && pdfExtraction && (
              <div className="task3-pdf-review">
                <div className="task3-pdf-review-header">
                  <div><h4>Review extracted topics</h4><p>{pdfExtraction.fileName} · {formatFileSize(pdfExtraction.sizeBytes)} · {pdfTopics.length} detected</p></div>
                  <button type="button" className="cms-button cms-secondary" onClick={clearPdfWorkflow}><X size={15} /> Replace PDF</button>
                </div>
                {pdfWarnings.map((warning) => <div className="task3-pdf-warning" role="status" key={warning}>{warning}</div>)}
                {pdfTopics.length > 10 && <div className="task3-pdf-warning" role="alert">This PDF contains more than 10 topics. Remove some topics or upload smaller batches before importing.</div>}
                {pdfTopics.map((topic, topicIndex) => (
                  <details className="task3-pdf-topic" key={`${topic.fingerprint}-${topicIndex}`} open={topicIndex === 0}>
                    <summary>
                      <span className="task3-pdf-topic-number">{String(topicIndex + 1).padStart(2, "0")}</span>
                      <span className="task3-pdf-topic-summary"><b>{topic.title || "Untitled topic"}</b><small>{topic.sections.length} content sections</small></span>
                    </summary>
                    <div className="task3-pdf-topic-fields">
                      <div className="task3-pdf-topic-controls">
                        <span>Topic {topicIndex + 1}</span>
                        <button type="button" className="task3-pdf-remove-topic" onClick={() => removePdfTopic(topicIndex)}><Trash2 size={14} /> Remove topic</button>
                      </div>
                      <label>Topic title<input value={topic.title} onChange={(event) => updatePdfTopic(topicIndex, { title: event.target.value })} /></label>
                      <label>Category<input value={topic.category} placeholder="Optional topic category" onChange={(event) => updatePdfTopic(topicIndex, { category: event.target.value })} /></label>
                      {topic.warnings.map((warning) => <div className="task3-pdf-warning" key={warning}>{warning}</div>)}
                      {topic.sections.map((section, sectionIndex) => (
                        <section className="task3-pdf-section" key={`${section.sectionType}-${sectionIndex}`}>
                          <label>Section heading<input value={section.heading} onChange={(event) => updatePdfSection(topicIndex, sectionIndex, { heading: event.target.value })} /></label>
                          <textarea aria-label={`Content for ${section.heading}`} value={section.content} rows={Math.min(14, Math.max(4, section.content.split("\n").length))} onChange={(event) => updatePdfSection(topicIndex, sectionIndex, { content: event.target.value })} />
                        </section>
                      ))}
                    </div>
                  </details>
                ))}
                <div className="task3-pdf-review-actions">
                  <button type="button" className="cms-button cms-secondary" onClick={addPdfTopic} disabled={pdfTopics.length >= 10}><Plus size={15} /> Add topic</button>
                  <span>{pdfTopics.length} topic{pdfTopics.length === 1 ? "" : "s"} · {pdfTopics.filter((topic) => topic.included).length} will be imported</span>
                  <button type="button" className="cms-button cms-primary" disabled={!pdfTopics.length || pdfTopics.length > 10 || pdfBusy} onClick={reviewPdfImport}>
                    Review import <Send size={15} />
                  </button>
                </div>
              </div>
            )}

            {pdfStep === 3 && (
              <div className="task3-pdf-import">
                {pdfImportResult ? (
                  <>
                  {pdfWarnings.map((warning) => <div className="task3-pdf-warning" role="status" key={warning}>{warning}</div>)}
                  <div className="task3-pdf-summary">
                      <div><b>{pdfImportResult.published ?? 0}</b><span>Published</span></div>
                      <div><b>{pdfImportResult.successful - (pdfImportResult.published ?? 0)}</b><span>Saved as drafts</span></div>
                      <div><b>{pdfImportResult.failed}</b><span>Failed</span></div>
                      <div><b>{pdfImportResult.skipped + pdfRemovedCount}</b><span>Skipped</span></div>
                    </div>
                    {pdfRemovedCount > 0 && <p>{pdfRemovedCount} topic{pdfRemovedCount === 1 ? " was" : "s were"} removed before import.</p>}
                    <div className="task3-pdf-result-list">
                      {pdfImportResult.results.map((result, index) => <div className={`task3-pdf-result is-${result.status.toLowerCase()}`} key={`${result.essayId ?? result.title}-${index}`}>
                        <b>{result.title}</b><span>{result.status === "SUCCESS" ? result.published ? "Imported and published" : "Imported as draft for review" : result.status === "SKIPPED" ? "Already imported" : "Import failed"}{result.reason ? ` · ${result.reason}` : ""}</span>
                      </div>)}
                    </div>
                    <button type="button" className="cms-button cms-secondary" onClick={clearPdfWorkflow}><Plus size={15} /> Import another PDF</button>
                  </>
                ) : (
                  <>
                    <div className="task3-pdf-review-header"><div><h4>Confirm topic import</h4><p>Each selected topic will create a separate Task 3 record. Clear, classified content is published when its course is live; uncertain content stays in drafts. Existing content is never overwritten.</p></div><button type="button" className="cms-button cms-secondary" onClick={() => setPdfStep(2)}><ArrowUp size={15} /> Back to review</button></div>
                    <div className="task3-pdf-summary">
                      <div><b>{pdfTopics.filter((topic) => topic.included).length}</b><span>Topics to import</span></div>
                      <div><b>{pdfTopics.filter((topic) => topic.included).reduce((total, topic) => total + topic.sections.length, 0)}</b><span>Content sections</span></div>
                      <div><b>{pdfRemovedCount}</b><span>Removed before import</span></div>
                    </div>
                    <button type="button" className="cms-button cms-primary" disabled={pdfBusy} onClick={() => void importPdfTopics()}>
                      {pdfBusy ? <LoaderCircle size={16} className="is-spinning" /> : <Send size={16} />}
                      {pdfBusy ? "Importing topics…" : "Import as drafts"}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="cms-panel">
            <div className="speaking-cms-heading-row"><div><h3>Existing topics</h3><p>Review and edit one topic at a time as an alternative to PDF import.</p></div><a className="cms-button cms-secondary" href="/admin/essays">Open single-topic editor</a></div>
            <div className="speaking-cms-essay-list">
              {essays.map((essay) => <button type="button" key={essay.id} className={selectedEssayId === essay.id ? "is-selected" : ""} onClick={() => { setSelectedEssayId(essay.id); setSelectedVersionId(""); }}>
                <strong>{essay.title}</strong><small>{essay.status.toLowerCase()} · {essay.versions.length} versions</small>
              </button>)}
              {!essays.length && <div className="cms-empty">No Task 3 essays are configured yet. Use “Manage essay records” to create a draft linked to this task.</div>}
            </div>
          </section>
          {selectedEssay && (
            <section className="cms-panel speaking-cms-editor">
              <div className="speaking-cms-heading-row">
                <div><h3>{selectedEssay.title}</h3><p>{selectedEssay.prompt || "No prompt recorded."}</p></div>
                <button type="button" className="cms-button cms-secondary" onClick={() => setPreview((value) => !value)}>{preview ? <EyeOff size={16} /> : <Eye size={16} />} Preview</button>
              </div>
              {preview && <article className="speaking-cms-preview"><h4>{selectedEssay.title}</h4><p>{selectedEssay.prompt}</p><p style={{ whiteSpace: "pre-wrap" }}>{selectedEssay.content}</p></article>}
              <div className="speaking-cms-version-tabs">
                {selectedEssay.versions.map((version) => <button type="button" key={version.id} className={(selectedVersion?.id ?? "") === version.id ? "is-selected" : ""} onClick={() => setSelectedVersionId(version.id)}>{version.versionLabel}<small>{version.status.toLowerCase()}</small></button>)}
              </div>
              <form className="speaking-cms-inline-form" onSubmit={createVersion}>
                <label>New version<select name="versionLabel" defaultValue="CLB 7"><option>CLB 7</option><option>CLB 5-6</option><option>Plan du discours</option><option>Other / manual review</option></select></label>
                <button className="cms-button cms-secondary" disabled={busy}><Plus size={15} /> Add version</button>
              </form>
              {selectedVersion && (
                <>
                  <div className="speaking-cms-heading-row"><h4>{selectedVersion.versionLabel} · ordered sections</h4><button type="button" className="cms-button cms-primary" disabled={busy || !preview || selectedVersion.status === "PUBLISHED"} onClick={publishVersion}><Send size={15} /> Publish version</button></div>
                  {selectedVersion.sections.map((section, index) => <form className="speaking-cms-section-form" key={section.id} onSubmit={(event) => saveSection(event, section)}>
                    <div className="speaking-cms-section-top"><strong>Section {index + 1}</strong><div><button type="button" aria-label="Move section up" disabled={busy || index === 0} onClick={() => moveSection(section, -1)}><ArrowUp size={15} /></button><button type="button" aria-label="Move section down" disabled={busy || index === selectedVersion.sections.length - 1} onClick={() => moveSection(section, 1)}><ArrowDown size={15} /></button></div></div>
                    <label>Section type<input name="sectionType" defaultValue={section.sectionType} required /></label>
                    <label>Heading<input name="heading" defaultValue={section.heading ?? ""} /></label>
                    <label>Content<textarea name="content" defaultValue={section.content} rows={6} required /></label>
                    <label>Order<input name="sortOrder" type="number" min={0} defaultValue={section.sortOrder} /></label>
                    <button className="cms-button cms-secondary" disabled={busy}><Save size={15} /> Save section</button>
                    {preview && <p className="speaking-cms-preview-section"><b>{section.heading || section.sectionType}</b><span>{section.content}</span></p>}
                  </form>)}
                  <form className="speaking-cms-section-form" onSubmit={createSection}>
                    <h4>Add ordered section</h4>
                    <label>Section type<input name="sectionType" placeholder="INTRODUCTION, ARGUMENT, CONCLUSION…" required /></label>
                    <label>Heading<input name="heading" /></label>
                    <label>Content<textarea name="content" rows={5} required /></label>
                    <button className="cms-button cms-primary" disabled={busy}><Plus size={15} /> Add section</button>
                  </form>
                </>
              )}
              {selectedEssay && <div className="speaking-cms-child-editors">
                <section>
                  <h4>Vocabulary</h4>
                  {selectedEssay.vocabulary.map((entry) => <form key={entry.id} className="speaking-cms-mini-form" onSubmit={(event) => {
                    event.preventDefault();
                    const values = formValues(event.currentTarget);
                    void run(async () => {
                      await request(token, `/admin/cms/speaking/vocabulary/${entry.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ frenchTerm: values.frenchTerm, englishMeaning: values.englishMeaning || null, example: values.example || null, sortOrder: Number(values.sortOrder) }),
                      });
                    }, "Vocabulary entry saved.");
                  }}>
                    <label>French<input name="frenchTerm" defaultValue={entry.frenchTerm} required /></label><label>English<input name="englishMeaning" defaultValue={entry.englishMeaning ?? ""} /></label><label>Example<input name="example" defaultValue={entry.example ?? ""} /></label><label>Order<input name="sortOrder" type="number" min={0} defaultValue={entry.sortOrder} /></label><button className="cms-button cms-secondary" disabled={busy}>Save</button>
                  </form>)}
                  <form className="speaking-cms-mini-form" onSubmit={addEssayVocabulary}><label>French<input name="frenchTerm" required /></label><label>English<input name="englishMeaning" /></label><label>Example<input name="example" /></label><button className="cms-button cms-secondary" disabled={busy}><Plus size={14} /> Add term</button></form>
                </section>
                <section>
                  <h4>Grammar</h4>
                  {selectedEssay.grammarNotes.map((entry) => <form key={entry.id} className="speaking-cms-mini-form" onSubmit={(event) => {
                    event.preventDefault();
                    const values = formValues(event.currentTarget);
                    void run(async () => {
                      await request(token, `/admin/cms/speaking/grammar/${entry.id}`, {
                        method: "PATCH",
                        body: JSON.stringify({ structure: values.structure, example: values.example || null, purpose: values.purpose || null, explanation: values.explanation || null, sortOrder: Number(values.sortOrder) }),
                      });
                    }, "Grammar note saved.");
                  }}>
                    <label>Structure<input name="structure" defaultValue={entry.structure} required /></label><label>Example<input name="example" defaultValue={entry.example ?? ""} /></label><label>Purpose<input name="purpose" defaultValue={entry.purpose ?? ""} /></label><label>Explanation<textarea name="explanation" defaultValue={entry.explanation ?? ""} rows={3} /></label><label>Order<input name="sortOrder" type="number" min={0} defaultValue={entry.sortOrder} /></label><button className="cms-button cms-secondary" disabled={busy}>Save</button>
                  </form>)}
                  <form className="speaking-cms-mini-form" onSubmit={addEssayGrammar}><label>Structure<input name="structure" required /></label><label>Example<input name="example" /></label><label>Purpose<input name="purpose" /></label><label>Explanation<textarea name="explanation" rows={3} /></label><button className="cms-button cms-secondary" disabled={busy}><Plus size={14} /> Add grammar</button></form>
                </section>
              </div>}
            </section>
          )}
        </div>
      )}
    </section>
  );
}
