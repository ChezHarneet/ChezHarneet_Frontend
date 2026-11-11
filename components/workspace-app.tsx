"use client";

import { apiFetch, refreshAccessToken, revokeRefreshSession } from "../lib/api";
import BrandLogo from "./brand-logo";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  AudioLines,
  BookOpen,
  Bookmark,
  BriefcaseBusiness,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  Crown,
  FileText,
  Flame,
  Gamepad2,
  GraduationCap,
  Headphones,
  Home,
  Heart,
  Leaf,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Play,
  Plane,
  Search,
  Scale,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  UsersRound,
  Utensils,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";

type Page =
  | "landing"
  | "dashboard"
  | "speaking"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "pricing"
  | "practice";
type CourseTask = {
  type: string;
  format: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number | null;
  questionCount: number | null;
};
type CourseStructure = {
  modules: Array<{
    skill: string;
    title: string;
    tasks: CourseTask[];
  }>;
};
type LearnerTopic = {
  id: string;
  slug: string;
  title: string;
  situation: string | null;
  question: string | null;
  modelAnswer: string | null;
  extraInformation: string | null;
  conclusion: string | null;
  theme: {
    id: string;
    slug: string;
    name: string;
    task: { type: string; module: { skill: string } } | null;
  };
};
type LearnerLibrary = {
  topics: LearnerTopic[];
  vocabulary: Array<{
    id: string;
    term: string;
    meaning: string | null;
    example: string | null;
    topic: { id: string; title: string };
  }>;
  grammar: Array<{
    id: string;
    rule: string;
    explanation: string | null;
    example: string | null;
    topic: { id: string; title: string };
  }>;
};
type SpeakingContentTopic = {
  id: string;
  slug: string;
  title: string;
  situation: string | null;
  question: string | null;
  modelAnswer: string | null;
  extraInformation: string | null;
  conclusion: string | null;
  sortOrder: number;
};
type SpeakingContentTheme = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  topics: SpeakingContentTopic[];
};
type SpeakingContentEssay = {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  prompt: string | null;
  content: string | null;
  summary: string | null;
  extraInformation: string | null;
  sortOrder: number;
  versions: Array<{
    id: string;
    versionLabel: string;
    sortOrder: number;
    sections: Array<{
      id: string;
      sectionType: string;
      heading: string | null;
      content: string;
      sortOrder: number;
    }>;
  }>;
  vocabulary: Array<{
    id: string;
    frenchTerm: string;
    englishMeaning: string | null;
    example: string | null;
    sortOrder: number;
  }>;
  grammarNotes: Array<{
    id: string;
    structure: string;
    example: string | null;
    purpose: string | null;
    explanation: string | null;
    sortOrder: number;
  }>;
};
type SpeakingContent = {
  modules: Array<{
    tasks: Array<{
      id: string;
      type: string;
      themes: SpeakingContentTheme[];
      essays: SpeakingContentEssay[];
    }>;
  }>;
};

function taskThreeCategory(essay: SpeakingContentEssay) {
  if (essay.category?.trim()) return essay.category.trim();
  const text =
    `${essay.title} ${essay.prompt ?? ""} ${essay.content ?? ""}`.toLocaleLowerCase(
      "fr",
    );
  if (
    /environnement|plan[eè]te|climat|pollution|d[eé]chet|durable|agriculture biologique|saison|localement/.test(
      text,
    )
  )
    return "Environnement";
  if (/voiture|transport|voyage|espace|tourisme|ville|gratuit/.test(text))
    return "Transport et société";
  if (/science|espace|num[eé]rique|technolog/.test(text)) return "Sciences";
  if (/citoyen|ong|jeunes|soci[eé]t[eé]|parc zoologique|action/.test(text))
    return "Société";
  return "Autres";
}

function taskThreeCategoryIcon(category: string) {
  const text = category.toLocaleLowerCase("fr");
  if (/environnement/.test(text)) return Leaf;
  if (/transport/.test(text)) return CarFront;
  if (/science/.test(text)) return Sparkles;
  if (/soci[eé]t[eé]/.test(text)) return UsersRound;
  return BookOpen;
}

function taskThreeVersionOrder(label: string) {
  const normalized = label.toLocaleLowerCase("fr");
  if (normalized.includes("plan")) return 0;
  if (normalized.includes("clb 7")) return 1;
  if (normalized.includes("clb 5")) return 2;
  if (normalized.includes("vocab")) return 3;
  if (normalized.includes("gram")) return 4;
  return 5;
}

type TaskThreeContentEntry =
  | { type: "paragraph"; content: string }
  | { type: "point"; label: string | null; content: string };

type TaskThreeContentBlock = {
  heading: string | null;
  entries: TaskThreeContentEntry[];
};

function isTaskThreeContentHeading(line: string) {
  if (
    /^(introduction|paragraphe\s+\d+|conclusion|argument\s+[1-3]|expérience personnelle|enquête)$/i.test(
      line,
    )
  )
    return true;
  const letters = line.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "");
  return (
    line.length <= 88 &&
    letters.length >= 3 &&
    letters === letters.toLocaleUpperCase("fr")
  );
}

function normalizeTaskThreeHeading(heading: string) {
  return heading
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/^version\s+/, "")
    .replace(/[.:]/g, "");
}

function taskThreeContentBlocks(content: string): TaskThreeContentBlock[] {
  const blocks: TaskThreeContentBlock[] = [{ heading: null, entries: [] }];
  let paragraph = "";

  const flushParagraph = () => {
    if (!paragraph) return;
    blocks[blocks.length - 1].entries.push({
      type: "paragraph",
      content: paragraph,
    });
    paragraph = "";
  };

  const contentWithMarkers = content
    .replace(
      /(?<=[.!?])\s+(Introduction|Paragraphe\s+\d+|Conclusion|Argument\s+[1-3]|Expérience personnelle|Enquête)\b\s+/gi,
      "\n\n$1\n",
    )
    .replace(/(?<=[.!?])\s+([2-3])\.\s+(?=[A-ZÀ-ÖØ-Þ])/g, "\n$1. ");
  for (const rawLine of contentWithMarkers.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    if (isTaskThreeContentHeading(line)) {
      flushParagraph();
      blocks.push({ heading: line, entries: [] });
      continue;
    }

    const point = line.replace(/^[*•-]\s*/, "");
    const arrowIndex = point.indexOf("→");
    if (arrowIndex >= 0) {
      flushParagraph();
      blocks[blocks.length - 1].entries.push({
        type: "point",
        label: point.slice(0, arrowIndex).trim(),
        content: point.slice(arrowIndex + 1).trim(),
      });
      continue;
    }

    if (point !== line) {
      flushParagraph();
      blocks[blocks.length - 1].entries.push({
        type: "point",
        label: null,
        content: point,
      });
      continue;
    }

    const numberedPoint = line.match(/^([1-3])\.\s+(.+)$/);
    if (numberedPoint) {
      flushParagraph();
      blocks[blocks.length - 1].entries.push({
        type: "point",
        label: `${numberedPoint[1]}.`,
        content: numberedPoint[2],
      });
      continue;
    }

    paragraph = paragraph ? `${paragraph} ${line}` : line;
  }

  flushParagraph();
  return blocks.filter((block) => block.heading || block.entries.length > 0);
}

function taskThreeVocabularyRows(
  entries: SpeakingContentEssay["vocabulary"],
  sections: SpeakingContentEssay["versions"][number]["sections"],
) {
  if (entries.length > 0) return entries;

  const values = sections
    .flatMap((section) => section.content.split(/\r?\n/))
    .flatMap((line) => line.split("\t"))
    .map((value) => value.trim())
    .filter((value) => value && !/^_+$/.test(value));
  const headerIndex = values.findIndex(
    (value) => value.toLocaleLowerCase("fr") === "français",
  );
  const content = values
    .slice(headerIndex >= 0 ? headerIndex + 1 : 0)
    .filter(
      (value) =>
        !["english", "meaning"].includes(value.toLocaleLowerCase("fr")),
    );

  return Array.from({ length: Math.ceil(content.length / 2) }, (_, index) => ({
    id: `version-vocabulary-${index}`,
    frenchTerm: content[index * 2],
    englishMeaning: content[index * 2 + 1] ?? null,
    example: null,
    sortOrder: index,
  }));
}

function TaskThreeSectionContent({ content }: { content: string }) {
  const blocks = taskThreeContentBlocks(content);

  return (
    <div className="oral-task3-content-flow">
      {blocks.map((block, blockIndex) => (
        <section
          className="oral-task3-content-block"
          key={`${block.heading ?? "content"}-${blockIndex}`}
        >
          {block.heading && <h4>{block.heading}</h4>}
          <div className="oral-task3-content-entries">
            {block.entries.map((entry, entryIndex) =>
              entry.type === "point" ? (
                <div className="oral-task3-content-point" key={entryIndex}>
                  {entry.label && <b>{entry.label}</b>}
                  <span>{entry.content}</span>
                </div>
              ) : (
                <p key={entryIndex}>{entry.content}</p>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function taskPresentation(format: string) {
  if (format.startsWith("WRITING")) return { icon: FileText, tone: "blue" };
  if (format.includes("INTERACTION"))
    return { icon: AudioLines, tone: "peach" };
  if (format.includes("VIEWPOINT")) return { icon: Mic, tone: "mint" };
  if (format.startsWith("LISTENING"))
    return { icon: Headphones, tone: "lavender" };
  if (format.startsWith("READING")) return { icon: BookOpen, tone: "blue" };
  return { icon: MessageCircle, tone: "lavender" };
}

const oralExpressionTasks = [
  {
    type: "TASK1",
    format: "SPEAKING_INTERVIEW",
    title: "Presentation",
    description:
      "Introduce yourself and answer questions about your life, work, studies, and interests.",
    durationMinutes: 2,
    focus:
      "Present yourself clearly, add a few details, and keep the conversation natural.",
  },
  {
    type: "TASK2",
    format: "SPEAKING_INTERACTION",
    title: "Oral interaction",
    description:
      "Exchange with the examiner in an everyday situation (asking, suggesting, accepting, refusing, getting information, etc.).",
    durationMinutes: 4,
    focus: "Practise asking clear follow-up questions in everyday situations.",
  },
  {
    type: "TASK3",
    format: "SPEAKING_VIEWPOINT",
    title: "Argument",
    description:
      "Share and defend your point of view with reasons and examples.",
    durationMinutes: 5,
    focus:
      "Organize your opinion, support it with examples, and connect your ideas.",
  },
] as const;

function speakingThemeIcon(slug: string) {
  if (/education|etude|study/.test(slug)) return GraduationCap;
  if (/travail|work/.test(slug)) return BriefcaseBusiness;
  if (/societe|society|famille|family/.test(slug)) return UsersRound;
  if (/voyage|travel/.test(slug)) return Plane;
  if (/loisir|activite|sport|hobby|leisure/.test(slug)) return Gamepad2;
  if (/alimentation|food/.test(slug)) return Utensils;
  if (/sante|health/.test(slug)) return Heart;
  if (/environnement|environment/.test(slug)) return Leaf;
  return Home;
}

const taskTwoCategoryLabels = [
  { slug: "daily-life", name: "Daily life" },
  { slug: "studies", name: "Studies" },
  { slug: "work", name: "Work" },
  { slug: "society", name: "Society" },
  { slug: "leisure", name: "Leisure" },
  { slug: "travel", name: "Travel" },
] as const;

function isSourceCollectionTheme(theme: SpeakingContentTheme) {
  return /^a88(?:-|\s)/i.test(theme.slug) || /^a88(?:\s|\b)/i.test(theme.name);
}

function taskTwoDisplayCategory(
  topic: SpeakingContentTopic,
  theme: SpeakingContentTheme,
) {
  if (!isSourceCollectionTheme(theme)) {
    return { id: theme.id, slug: theme.slug, name: theme.name };
  }

  const text = `${topic.title} ${topic.situation ?? ""}`.toLowerCase();
  const slug = /école|étud|cours|formation|langue/.test(text)
    ? "studies"
    : /emploi|travaill|collègue|cuisinier|secrétaire|embauche|domicile/.test(
          text,
        )
      ? "work"
      : /voyage|vacances|hôtel|chalet|mer|tourisme|séjour|bateau|week-end|ville/.test(
            text,
          )
        ? "travel"
        : /guitare|danse|sport|festival|randonnée|fête|spectacle|zoo|musée|ludothèque|livre|film|émission/.test(
              text,
            )
          ? "leisure"
          : /voisin|bénévolat|protection animale|rencontrer|mariage|nouvel an|végétarien|garder un enfant|garder le chien|déménagement/.test(
                text,
              )
            ? "society"
            : "daily-life";

  const category = taskTwoCategoryLabels.find((item) => item.slug === slug)!;
  return { ...category, id: category.slug };
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "Practice at your pace";
  return `${minutes} min`;
}
function speakFrench(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const frenchVoices = window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.toLocaleLowerCase().startsWith("fr"));
  const voice =
    frenchVoices.find((candidate) => candidate.lang.toLocaleLowerCase() === "fr-ca") ??
    frenchVoices.find((candidate) => candidate.lang.toLocaleLowerCase() === "fr-fr") ??
    frenchVoices[0];
  utterance.lang = voice?.lang ?? "fr-CA";
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
function countQuestionPrompts(text: string | null) {
  return text?.match(/(?:^|\n)\s*\d{1,2}[.)]/g)?.length ?? 0;
}
function parseScenarioExercise(text: string | null) {
  const opening: string[] = [];
  const closing: string[] = [];
  const groups: Array<{
    title: string;
    questions: Array<{ number: number; text: string }>;
  }> = [];
  if (!text) return { opening: "", groups, closing: "" };
  let group = {
    title: "Questions",
    questions: [] as Array<{ number: number; text: string }>,
  };
  let current: { number: number; text: string } | null = null;
  let inClosing = false;
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const isHeading = (line: string) =>
    line.length < 65 && !/[.!?;:]$/.test(line) && !/^\d{1,2}[.)]/.test(line);
  for (const line of lines) {
    const numbered = line.match(/^(\d{1,2})[.)]\s*(.*)$/);
    if (numbered) {
      inClosing = false;
      current = { number: Number(numbered[1]), text: numbered[2] };
      group.questions.push(current);
      if (!groups.includes(group)) groups.push(group);
      continue;
    }
    if (/^merci\b/i.test(line)) {
      inClosing = true;
      current = null;
    }
    if (inClosing) {
      closing.push(line);
    } else if (isHeading(line)) {
      group = { title: line, questions: [] };
      current = null;
    } else if (current) {
      current.text += ` ${line}`;
    } else {
      opening.push(line);
    }
  }
  return {
    opening: opening.join(" "),
    groups: groups.filter((item) => item.questions.length),
    closing: closing.join(" "),
  };
}
type UiLanguage = "fr" | "en";
const frenchUi: Record<string, string> = {
  "FRENCH EXAM PREPARATION": "PRÉPARATION AU TCF CANADA",
  "How it works": "Notre approche",
  Practice: "S'entraîner",
  Plans: "Offres",
  "Sign in": "Se connecter",
  "Open learning space": "Accéder à mon espace",
  "My learning space": "Mon espace d’apprentissage",
  "My account": "Mon compte",
  Guest: "Visiteur",
  Visitor: "Visiteur",
  "YOUR FRENCH JOURNEY STARTS HERE": "VOTRE PARCOURS EN FRANÇAIS COMMENCE ICI",
  "Welcome to your learning space.":
    "Bienvenue dans votre espace d’apprentissage.",
  "Sign in to continue learning, or create a free account to save your progress and start your TCF Canada preparation.":
    "Connectez-vous pour continuer votre apprentissage ou créez un compte gratuit pour enregistrer vos progrès et commencer votre préparation au TCF Canada.",
  "Register to start your journey": "Inscrivez-vous pour commencer",
  "Choose a place to start": "Choisissez par où commencer",
  "Try a speaking preview": "Essayez un aperçu oral",
  "Three task previews are ready to explore.":
    "Trois aperçus de tâches sont prêts à découvrir.",
  "Build confidence with guided writing practice.":
    "Gagnez en confiance grâce à des exercices d’écriture guidés.",
  "Grow your vocabulary": "Enrichissez votre vocabulaire",
  "Learn useful French words in context.":
    "Apprenez des mots français utiles en contexte.",
  "Review grammar": "Révisez la grammaire",
  "Strengthen your French foundations.": "Renforcez vos bases en français.",
  "Explore a free preview": "Explorez un aperçu gratuit",
  "One sample topic from each speaking task":
    "Un sujet exemple pour chaque tâche orale",
  "Preview coming soon": "Aperçu bientôt disponible",
  "Grammar for this topic": "Grammaire de ce sujet",
  "GRAMMAR FOR THIS TASK 2 TOPIC": "GRAMMAIRE POUR CE SUJET DE LA TÂCHE 2",
  "A quick grammar guide for using French in this situation.":
    "Un guide rapide pour utiliser le français dans cette situation.",
  "GRAMMAR RULE": "RÈGLE DE GRAMMAIRE",
  EXPLANATION: "EXPLICATION",
  EXAMPLE: "EXEMPLE",
  "Grammar guide": "Guide de grammaire",
  "A clearer way to prepare": "Une préparation plus claire",
  "Build your French confidence,": "Gagnez en confiance en français,",
  "one step at a time.": "un pas après l'autre.",
  "Structured TCF Canada practice for speaking, writing, vocabulary, and grammar. Learn at your pace, with a clear next step every time.":
    "Une préparation structurée au TCF Canada : expression orale et écrite, vocabulaire et grammaire. Avancez à votre rythme, avec une prochaine étape clairement définie.",
  "Explore the learning space": "Découvrir mon espace",
  "Browse speaking practice": "Voir les activités orales",
  "Guided practice": "Pratique guidée",
  "Learn at your pace": "À votre rythme",
  "Progress that stays yours": "Votre progression vous appartient",
  "Speaking practice": "Expression orale",
  "Oral expression": "Expression orale",
  "Oral expression tasks": "Tâches d'expression orale",
  "Prepare for the TCF Canada oral exam with real-life situations.":
    "Préparez-vous à l'épreuve d'expression orale du TCF Canada avec des situations réelles.",
  "Task 1": "Tâche 1",
  "Task 2": "Tâche 2",
  "Task 3": "Tâche 3",
  "Task 3 — Argumentation": "Tâche 3 — Argumentation",
  Presentation: "Présentation",
  "Oral interaction": "Interaction orale",
  Argument: "Argumentation",
  "Three tasks. One oral exam.": "Trois tâches. Une épreuve orale.",
  "Choose a task to explore its format and start practising.":
    "Choisissez une tâche pour découvrir son format et commencer à vous entraîner.",
  "Practice this task": "S'entraîner à cette tâche",
  "Training topics": "Sujets d'entraînement",
  "Practise with varied situations and build confidence.":
    "Des situations variées pour pratiquer l'interaction orale et gagner en aisance.",
  "available topics": "sujets disponibles",
  "Search a topic…": "Rechercher un sujet…",
  "Search a topic": "Rechercher un sujet",
  All: "Tous",
  "3–4 min": "3 à 4 min",
  "Task 2 — Oral interaction": "Tâche 2 — Interaction orale",
  "Daily life": "Vie quotidienne",
  Studies: "Études",
  Work: "Travail",
  Society: "Société",
  Leisure: "Loisirs",
  Travel: "Voyage",
  "topics available": "sujets disponibles",
  "No topics match your search.":
    "Aucun sujet ne correspond à votre recherche.",
  "Estimated duration:": "Durée estimée :",
  "Exchange with the examiner in an everyday situation (asking, suggesting, accepting, refusing, getting information, etc.).":
    "Échangez avec l'examinateur sur une situation de la vie quotidienne (demander, proposer, accepter, refuser, s'informer, etc.).",
  "Introduce yourself and answer questions about your life, work, studies, and interests.":
    "Présentez-vous et répondez à des questions sur votre vie, votre travail, vos études et vos centres d'intérêt.",
  "Share and defend your point of view with reasons and examples.":
    "Exprimez et défendez votre point de vue à l'aide de raisons et d'exemples.",
  "Practice situations": "Mises en situation",
  "Loading Task 2 situations…":
    "Chargement des mises en situation de la tâche 2…",
  "No Task 2 situations are available yet.":
    "Aucune mise en situation n'est disponible pour la tâche 2.",
  "Ask questions in a realistic situation to get the information you need.":
    "Posez des questions dans une situation réaliste pour obtenir les renseignements dont vous avez besoin.",
  "Present yourself clearly, add a few details, and keep the conversation natural.":
    "Présentez-vous clairement, ajoutez quelques détails et gardez un échange naturel.",
  "Practise asking clear follow-up questions in everyday situations.":
    "Entraînez-vous à poser des questions de suivi claires dans des situations de la vie quotidienne.",
  "Organize your opinion, support it with examples, and connect your ideas.":
    "Structurez votre opinion, appuyez-la par des exemples et reliez vos idées.",
  "practice situations": "mises en situation",
  "speaking tasks": "tâches d'expression orale",
  "Task 2 situations": "Sujets d'entraînement (Tâche 2)",
  Expand: "Développer",
  Collapse: "Réduire",
  "Ask, listen, follow up": "Questionner, écouter, relancer",
  "Your learning path": "Votre parcours d'apprentissage",
  "A little progress adds up": "Chaque progrès compte",
  "UP NEXT · SPEAKING": "À SUIVRE · EXPRESSION ORALE",
  "Ask the right questions": "Poser les bonnes questions",
  "Guided role-play · 10 minutes": "Jeu de rôle guidé · 10 minutes",
  "Ready when you are": "Prêt quand vous l'êtes",
  "Practice your way": "Apprenez à votre façon",
  "No perfect French required": "Pas besoin d'un français parfait",
  "THE CHEZ HARNEET APPROACH": "L'APPROCHE CHEZ HARNEET",
  "Real structure. A calmer way forward.":
    "Une méthode claire pour avancer sereinement.",
  "Prepare for the skills you need with focused lessons and practical exercises, all in one learning space.":
    "Préparez les compétences dont vous avez besoin grâce à des leçons ciblées et des exercices pratiques réunis dans un même espace.",
  "01 · SPEAK WITH CONFIDENCE": "01 · PARLEZ AVEC CONFIANCE",
  "Practise real conversations": "Entraînez-vous à converser",
  "Use role-play scenarios, sample openings, suggested questions, and closings to get comfortable speaking naturally.":
    "Utilisez des mises en situation, des exemples d'introduction, des questions suggérées et des conclusions pour parler plus naturellement.",
  "Explore speaking": "Découvrir l'oral",
  "02 · WRITE WITH CLARITY": "02 · ÉCRIVEZ CLAIREMENT",
  "Shape your ideas clearly": "Structurez clairement vos idées",
  "Build a writing habit with guided prompts and a simple place to organise your response.":
    "Prenez l'habitude d'écrire avec des sujets guidés et un espace simple pour organiser vos réponses.",
  "Explore writing": "Découvrir l'écrit",
  "03 · GROW YOUR FRENCH": "03 · ENRICHISSEZ VOTRE FRANÇAIS",
  "Strengthen the foundations": "Renforcez vos bases",
  "Review vocabulary and grammar in context, with focused resources that support your practice.":
    "Révisez le vocabulaire et la grammaire en contexte grâce à des ressources conçues pour accompagner votre pratique.",
  "Explore learning tools": "Découvrir les outils",
  "YOUR PREPARATION, IN FOCUS": "VOTRE PRÉPARATION EN UN COUP D'ŒIL",
  "Know what to work on next.": "Sachez quoi travailler ensuite.",
  "Move from a small daily practice to a more confident exam day.":
    "De petites séances régulières à une plus grande confiance le jour de l'examen.",
  "Choose a skill": "Choisissez une compétence",
  "Start with speaking, writing, vocabulary, or grammar.":
    "Commencez par l'oral, l'écrit, le vocabulaire ou la grammaire.",
  "Practise with guidance": "Entraînez-vous avec méthode",
  "Use structured prompts to make each session count.":
    "Suivez des sujets structurés pour profiter de chaque séance.",
  "Keep building momentum": "Gardez votre élan",
  "Return to your learning space and pick up where you left off.":
    "Retrouvez votre espace et reprenez là où vous en étiez.",
  "Start exploring": "Commencer à découvrir",
  "A PLAN THAT FITS YOUR JOURNEY": "UNE OFFRE ADAPTÉE À VOTRE PARCOURS",
  "Start where you are.": "Commencez là où vous en êtes.",
  "Explore Chez Harneet for free. More ways to practise are on the way.":
    "Découvrez gratuitement Chez Harneet. De nouvelles façons de vous entraîner arrivent bientôt.",
  "YOUR STARTING POINT": "POUR BIEN COMMENCER",
  "Free learning space": "Espace d'apprentissage gratuit",
  "Build your routine with guided activities and core French learning tools.":
    "Créez votre routine avec des activités guidées et des outils essentiels pour apprendre le français.",
  "Explore speaking and writing": "Découvrir l'oral et l'écrit",
  "Review vocabulary and grammar": "Réviser le vocabulaire et la grammaire",
  "Keep practice progress": "Suivre vos progrès",
  "Open the learning space": "Accéder à mon espace",
  "IN DEVELOPMENT": "EN PRÉPARATION",
  "More ways to prepare": "Plus de façons de se préparer",
  "Expanded practice libraries and exam-style simulations are being prepared.":
    "De nouvelles activités et des simulations d'examen sont en préparation.",
  "Full scenario collections": "Toutes les mises en situation",
  "Mock exam practice": "Simulations d'examen",
  "Deeper progress insights": "Un suivi détaillé des progrès",
  "See what’s coming": "Découvrir les nouveautés",
  "No payment is collected in this preview. Pricing will be shown when plans are available.":
    "Aucun paiement n'est demandé dans cet aperçu. Les tarifs seront affichés lorsque les offres seront disponibles.",
  "YOUR NEXT FRENCH MILESTONE": "VOTRE PROCHAIN OBJECTIF EN FRANÇAIS",
  "Make space for steady progress.": "Avancez à votre rythme, pas à pas.",
  "Open your learning space and find a practice that fits today.":
    "Ouvrez votre espace et choisissez une activité pour aujourd'hui.",
  "Enter Chez Harneet": "Entrer chez Chez Harneet",
  "Independent French preparation · Not an official examination provider":
    "Préparation indépendante au français · Organisme non affilié à l'examen officiel",
  "WELCOME BACK": "RAVI DE VOUS REVOIR",
  "Your learning, all in one place.": "Votre apprentissage, au même endroit.",
  Overview: "Vue d'ensemble",
  Speaking: "Expression orale",
  Writing: "Expression écrite",
  Vocabulary: "Vocabulaire",
  Grammar: "Grammaire",
  "YOUR WORKSPACE": "VOTRE ESPACE",
  "YOUR TOOLS": "VOS OUTILS",
  "Practice room": "Salle d'entraînement",
  "Mock exam": "Examen blanc",
  "My progress": "Ma progression",
  Settings: "Paramètres",
  "Make real progress": "Progressez concrètement",
  "Unlock full practice sets and exam simulations.":
    "Accédez aux séries d'exercices et aux simulations d'examen.",
  "Explore plans": "Découvrir les offres",
  "Manage plan": "Gérer mon offre",
  "Close menu": "Fermer le menu",
  Workspace: "Espace de travail",
  "Help centre": "Centre d'aide",
  "Bonjour,": "Bonjour,",
  "YOUR LEARNING SPACE": "VOTRE ESPACE D'APPRENTISSAGE",
  "A little practice every day goes a long way. Let’s keep your momentum.":
    "Un peu de pratique chaque jour vous fait progresser. Continuez sur cette lancée.",
  "YOUR NEXT STEP": "VOTRE PROCHAINE ÉTAPE",
  "Small steps.": "Un petit pas.",
  "Big confidence.": "Une grande confiance.",
  "Pick up where you left off and keep moving towards your TCF goal.":
    "Reprenez là où vous en étiez et avancez vers votre objectif TCF.",
  "Continue learning": "Continuer à apprendre",
  "Your progress is saved as you learn":
    "Votre progression est enregistrée au fil de vos activités",
  "Learning progress": "Progression d'apprentissage",
  "Activities completed": "Activités terminées",
  "Current streak": "Série actuelle",
  "Time spent learning": "Temps d'apprentissage",
  "Focused practice for every part of the exam.":
    "Des exercices ciblés pour chaque épreuve.",
  "View all learning": "Voir tous les cours",
  "Word of the day": "Mot du jour",
  "A small phrase to add to your French.":
    "Une expression à ajouter à votre français.",
  "Your weekly focus": "Vos objectifs de la semaine",
  "This week": "Cette semaine",
  "Take your time": "Prenez votre temps",
  "Back to learning": "Retour aux cours",
  "GUIDED PRACTICE": "PRATIQUE GUIDÉE",
  "FRENCH EXAM · PRACTICE": "EXAMEN DE FRANÇAIS · PRATIQUE",
  "Read the prompt, prepare your response, and practise at your own pace.":
    "Lisez le sujet, préparez votre réponse et entraînez-vous à votre rythme.",
  "YOUR PROMPT": "VOTRE SUJET",
  "Tip:": "Conseil :",
  "Start with a polite opening, ask one clear question at a time, and use follow-up questions naturally.":
    "Commencez poliment, posez une question à la fois et enchaînez naturellement avec des relances.",
  "YOUR RESPONSE": "VOTRE RÉPONSE",
  "Save practice": "Enregistrer ma séance",
  "Your role-play guide": "Votre guide de mise en situation",
  "Use the opening, choose questions in any order, then finish naturally.":
    "Utilisez l'introduction, choisissez les questions dans l'ordre souhaité, puis terminez naturellement.",
  "SAMPLE OPENING": "EXEMPLE D'INTRODUCTION",
  "SAMPLE CLOSING": "EXEMPLE DE CONCLUSION",
  "Mark complete": "Marquer comme terminé",
  Completed: "Terminé",
  "What to focus on": "Points à travailler",
  "Be polite and clear": "Soyez poli et clair",
  "Ask complete questions": "Posez des questions complètes",
  "Add a follow-up": "Ajoutez une relance",
  "Speak at a natural pace": "Parlez à un rythme naturel",
  "Progress over perfection.": "Le progrès avant la perfection.",
  "You don’t need to get every word right. Practising is how you improve.":
    "Vous n'avez pas besoin de tout dire parfaitement. C'est en pratiquant que vous progresserez.",
  "Questions to get you started": "Des questions pour commencer",
  "Choose a question, then practise saying it aloud.":
    "Choisissez une question, puis entraînez-vous à la dire à voix haute.",
  "Your notes": "Vos notes",
  "Create your first draft to begin building this library.":
    "Créez votre premier brouillon pour commencer cette collection.",
  "Nothing here yet": "Rien pour le moment",
  "Search courses...": "Rechercher des cours...",
  "All statuses": "Tous les statuts",
  "New Course": "Nouveau cours",
  "Import JSON": "Importer JSON",
  Export: "Exporter",
  Refresh: "Actualiser",
  "Free learner": "Apprenant gratuit",
  "Sign in / account": "Connexion / compte",
  "Open ": "Ouvrir ",
  "French exam": "Examen de français",
  "A plan that fits your journey": "Une offre adaptée à votre parcours",
  "Make room for more progress.": "Faites plus de progrès.",
  "Start for free. Unlock more when you’re ready.":
    "Commencez gratuitement. Allez plus loin quand vous le souhaitez.",
  STARTER: "DÉCOUVERTE",
  "Full preparation": "Préparation complète",
  "Build a daily habit and explore the learning experience.":
    "Prenez de bonnes habitudes et découvrez votre espace d'apprentissage.",
  forever: "à vie",
  "Your current plan": "Votre offre actuelle",
  "Selected learning examples": "Des exemples de cours",
  "Vocabulary and grammar basics":
    "Les bases du vocabulaire et de la grammaire",
  "Progress preview": "Aperçu de votre progression",
  "Full practice library": "Bibliothèque complète d'exercices",
  "Full mock exams": "Examens blancs complets",
  "MOST FLEXIBILITY": "LE PLUS COMPLET",
  "Go deeper with structured practice and exam-style activities.":
    "Approfondissez avec des exercices structurés et des activités inspirées de l'examen.",
  "Set your price": "Tarif à définir",
  "before launch": "avant le lancement",
  "Join the waitlist": "Rejoindre la liste d'attente",
  "Full speaking and writing library":
    "Bibliothèque complète d'oral et d'écrit",
  "Practice sets and simulations": "Séries d'exercices et simulations",
  "Detailed progress history": "Historique détaillé de progression",
  "Saved activities and drafts": "Activités et brouillons enregistrés",
  "Subscription access controls": "Gestion de l'accès par abonnement",
  "Secure checkout will be enabled after payment setup.":
    "Le paiement sécurisé sera activé après sa configuration.",
  "Pricing and checkout are not live in this preview. Final plans, billing period, taxes, and refund terms must be configured before accepting payments.":
    "Les tarifs et paiements ne sont pas encore disponibles dans cet aperçu. Les offres, périodes de facturation, taxes et conditions de remboursement seront précisés avant toute vente.",
  "Made for your next French milestone.":
    "Conçu pour votre prochain objectif en français.",
  "Couldn't load your course content":
    "Impossible de charger le contenu du cours",
  "Loading your course content…": "Chargement du contenu du cours…",
  Loading: "Chargement",
  Continue: "Continuer",
  "View all": "Tout voir",
  Close: "Fermer",
  Cancel: "Annuler",
  Save: "Enregistrer",
  Submit: "Envoyer",
  Search: "Rechercher",
  "Email address": "Adresse e-mail",
  "Verification code": "Code de vérification",
  "Verify and continue": "Vérifier et continuer",
  "Send sign-in code": "Envoyer le code de connexion",
  "Use another email": "Utiliser une autre adresse e-mail",
  "Resend code": "Renvoyer le code",
  "Invalid or expired token": "Code invalide ou expiré",
  "Invalid or expired OTP": "Code invalide ou expiré",
  "If this email belongs to an account, a sign-in code has been sent.":
    "Si cette adresse correspond à un compte, un code de connexion a été envoyé.",
  "Only ADMIN and SUPER_ADMIN roles can access content tools.":
    "Seuls les rôles ADMIN et SUPER_ADMIN peuvent accéder aux outils de contenu.",
  "Access is checked by the API against your current account role.":
    "L'accès est vérifié par l'API selon le rôle de votre compte.",
  "Tip: use connectors to structure your ideas.":
    "Conseil : utilisez des connecteurs pour structurer vos idées.",
  "Explore examples": "Découvrir des exemples",
  "Open writing editor": "Ouvrir l'éditeur d'écriture",
  "Open task": "Ouvrir l'activité",
  "Task details": "Détails de l'activité",
  "View task": "Voir l'activité",
  "EXPRESSION ÉCRITE ·": "EXPRESSION ÉCRITE ·",
  "Three tasks. One stronger voice. Practice at your own pace.":
    "Trois activités pour renforcer votre expression. Entraînez-vous à votre rythme.",
  "Practice short messages and opinion writing, one prompt at a time.":
    "Entraînez-vous aux messages courts et à l'expression d'opinion, un sujet à la fois.",
  "Find your words, organize your thoughts, and speak with confidence.":
    "Trouvez vos mots, organisez vos idées et exprimez-vous avec confiance.",
  "Simple explanations to support confident speaking and writing.":
    "Des explications simples pour mieux vous exprimer à l'oral et à l'écrit.",
  "Turn your ideas into clear, structured French writing.":
    "Transformez vos idées en textes français clairs et structurés.",
  "Useful phrases that help you sound more natural.":
    "Des expressions utiles pour parler plus naturellement.",
  "Des idées claires.": "Des idées claires.",
  "Des mots justes.": "Des mots justes.",
  "MAKE YOUR FRENCH FLOW": "FAITES PROGRESSER VOTRE FRANÇAIS",
  "WRITE WITH PURPOSE": "ÉCRIVEZ AVEC INTENTION",
  "YOUR SPEAKING STUDIO": "VOTRE ESPACE D'EXPRESSION ORALE",
  "FRENCH EXAM · ORAL EXPRESSION": "EXAMEN DE FRANÇAIS · EXPRESSION ORALE",
  "FRENCH EXAM · EXPRESSION ÉCRITE": "EXAMEN DE FRANÇAIS · EXPRESSION ÉCRITE",
  "Choose a task": "Choisissez une activité",
  "Choose a format and get started.": "Choisissez un format pour commencer.",
  "Each task develops a different speaking skill.":
    "Chaque activité développe une compétence orale différente.",
  "Speaking scenarios": "Mises en situation à l'oral",
  "Published scenarios": "Mises en situation disponibles",
  "Vocabulary library": "Bibliothèque de vocabulaire",
  "Grammar notes": "Fiches de grammaire",
  "Available in this course": "Disponible dans ce cours",
  "No published vocabulary content yet.":
    "Aucun contenu de vocabulaire n'est disponible pour le moment.",
  "No published grammar notes yet.":
    "Aucune fiche de grammaire n'est disponible pour le moment.",
  "THIS WEEK": "CETTE SEMAINE",
  "A balanced study routine.": "Une routine d'étude équilibrée.",
  "Keep your weekly rhythm": "Gardez votre rythme cette semaine",
  "One step at a time": "Un pas après l'autre",
  "Everyday French": "Le français au quotidien",
  "Speak with confidence": "Parlez avec confiance",
  "Practice makes progress": "La pratique fait progresser",
  "Enter practice room": "Accéder à la salle d'entraînement",
  "Explore vocabulary": "Découvrir le vocabulaire",
  "Start writing": "Commencer à écrire",
  "Your writing stays yours.": "Vos textes restent les vôtres.",
  "This starter includes a practice editor and word counter. Automated correction can be connected later when a trusted provider is configured.":
    "Cette formule inclut un éditeur d'entraînement et un compteur de mots. Une correction automatique pourra être ajoutée ultérieurement.",
  "Development code:": "Code de développement :",
  "Six-digit code": "Code à six chiffres",
  "Create account": "Créer un compte",
  "First name": "Prénom",
  "Last name": "Nom",
  Phone: "Téléphone",
  "Signed in as": "Connecté en tant que",
  "Notify me when it’s ready": "Me prévenir de la disponibilité",
  "Your next level is on its way.":
    "De nouvelles possibilités arrivent bientôt.",
  "We're preparing full practice sets, mock exams, and more detailed progress tools. Paid access is not enabled yet, so you won't be charged.":
    "Nous préparons des séries complètes, des examens blancs et un suivi plus détaillé. Les paiements ne sont pas activés : aucun débit ne sera effectué.",
  "Your password is never requested.":
    "Nous ne vous demanderons jamais votre mot de passe.",
  "Profile updated.": "Profil mis à jour.",
  "Sending code…": "Envoi du code…",
  "Verifying…": "Vérification…",
  "Saving…": "Enregistrement…",
  "Progress saved to your account.":
    "Progression enregistrée dans votre compte.",
  "Practice marked for this session. Sign in to sync progress.":
    "Séance enregistrée. Connectez-vous pour synchroniser votre progression.",
  "Complete a practice to start a streak.":
    "Terminez une activité pour commencer votre série.",
  "You’re building a habit!": "Vous prenez une bonne habitude !",
  days: "jours",
  words: "mots",
  "terms available": "termes disponibles",
  of: "sur",
  "topics completed": "sujets terminés",
  questions: "questions",
  prompts: "sujets",
  complete: "terminé",
  "No published prompt is available for this activity yet.":
    "Aucun sujet n'est encore disponible pour cette activité.",
  "No published questions are available for this activity yet.":
    "Aucune question n'est encore disponible pour cette activité.",
  "Practice this writing task.": "Entraînez-vous à cette activité d'écriture.",
  "Explore this part of the exam.": "Découvrez cette partie de l'examen.",
  "Practice this part of the speaking exam.":
    "Entraînez-vous à cette partie de l'épreuve orale.",
  "Could not load the course": "Impossible de charger le cours",
  "Could not load course content": "Impossible de charger le contenu du cours",
  "Could not load your progress": "Impossible de charger votre progression",
  "Could not update your profile": "Impossible de mettre à jour votre profil",
  "Code verification failed": "La vérification du code a échoué",
  "Select interface language": "Choisir la langue de l'interface",
  "Interface language": "Langue de l'interface",
  "Course overview": "Aperçu du cours",
  "Task ": "Activité ",
  "Sign out": "Se déconnecter",
  Account: "Compte",
  "BUILD YOUR FRENCH TOOLKIT": "CONSTRUISEZ VOTRE BOÎTE À OUTILS EN FRANÇAIS",
  "Writing studio": "Atelier d'écriture",
  "Writing tasks": "Activités d'expression écrite",
  "No payment is collected in this preview.":
    "Aucun paiement n'est demandé dans cet aperçu.",
  Free: "Gratuit",
  PLUS: "PLUS",
  "FRENCH EXAM": "EXAMEN DE FRANÇAIS",
  "What's new": "Nouveautés",
  "Main navigation": "Navigation principale",
  Language: "Langue",
  "Start your practice": "Commencer votre entraînement",
  "Continue your practice": "Reprendre votre entraînement",
  "A little practice every day goes a long way.":
    "Un peu de pratique chaque jour vous fait progresser.",
  "Keep your momentum.": "Continuez sur cette lancée.",
  "Enter your email to sign in or create a learner account with a one-time code.":
    "Saisissez votre adresse e-mail pour vous connecter ou créer un compte avec un code à usage unique.",
  "The API did not return an access token":
    "L'API n'a pas renvoyé de jeton d'accès",
  "Could not load your account": "Impossible de charger votre compte",
  Help: "Aide",
  Email: "E-mail",
  Profile: "Profil",
  "Save profile": "Enregistrer le profil",
  "FRENCH EXAM ·": "EXAMEN DE FRANÇAIS ·",
  "SPEAKING ·": "EXPRESSION ORALE ·",
  USER: "APPRENANT",
  ADMIN: "ADMINISTRATEUR",
  "SUPER ADMIN": "SUPER ADMINISTRATEUR",
  "Your current account role": "Le rôle actuel de votre compte",
  "Make room for": "Faites plus de",
  "more progress.": "progrès.",
  "CHEZ HARNEET PLUS": "CHEZ HARNEET PLUS",
  "Use your email to sign in or create a learner account with a one-time code.":
    "Utilisez votre adresse e-mail pour vous connecter ou créer un compte avec un code à usage unique.",
};
function translateUi(node: ReactNode, language: UiLanguage): ReactNode {
  if (language === "en" || node == null || typeof node === "boolean")
    return node;
  if (typeof node === "string") {
    const leading = node.match(/^\s*/)?.[0] ?? "";
    const trailing = node.match(/\s*$/)?.[0] ?? "";
    const trimmed = node.trim();
    let translated = frenchUi[trimmed] ?? frenchUi[node] ?? trimmed;
    if (translated === trimmed) {
      for (const [source, target] of Object.entries(frenchUi)
        .filter(([source]) => source.trim().length >= 4)
        .sort(([a], [b]) => b.length - a.length)) {
        translated = translated.replaceAll(source, target);
      }
      translated = translated
        .replace(/(\d+)\s+terms available/g, "$1 termes disponibles")
        .replace(
          /(\d+)\s+of\s+(\d+)\s+topics completed/g,
          "$1 sur $2 sujets terminés",
        )
        .replace(/(\d+)\s+topics/g, "$1 sujets")
        .replace(/(\d+)\s+day streak/g, "Série de $1 jours")
        .replace(/(\d+)\s+words/g, "$1 mots");
    }
    return `${leading}${translated}${trailing}`;
  }
  if (Array.isArray(node))
    return Children.map(node, (child) => translateUi(child, language));
  if (isValidElement(node)) {
    const props = node.props as Record<string, unknown>;
    const localizedProps: Record<string, unknown> = {};
    for (const key of ["placeholder", "title", "aria-label", "alt"]) {
      const value = props[key];
      if (typeof value === "string")
        localizedProps[key] =
          frenchUi[value] ?? value.replace(/^Open /, "Ouvrir ");
    }
    localizedProps.children = translateUi(
      props.children as ReactNode,
      language,
    );
    return cloneElement(node, localizedProps);
  }
  return node;
}
function LanguageSwitcher({
  language,
  onChange,
  compact = false,
}: {
  language: UiLanguage;
  onChange: (value: UiLanguage) => void;
  compact?: boolean;
}) {
  return (
    <label className={`language-switcher${compact ? " compact" : ""}`}>
      <span aria-hidden="true">文</span>
      <select
        aria-label="Interface language"
        value={language}
        onChange={(event) => onChange(event.target.value as UiLanguage)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
      <ChevronDown size={12} />
    </label>
  );
}
function referenceSection(text: string | null, heading: RegExp, until: RegExp) {
  if (!text) return "";
  const start = heading.exec(text);
  if (!start) return "";
  const remainder = text.slice(start.index + start[0].length);
  const end = until.exec(remainder);
  return (end ? remainder.slice(0, end.index) : remainder).trim();
}
function topicVocabularyFromText(topic: LearnerTopic) {
  const section = referenceSection(
    topic.extraInformation,
    /About the topic\s*[–-]\s*Vocab(?:ulary)?/i,
    /Grammar Rule|Exam criterion/i,
  );
  const lines = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !/^(?:French|English|vocabulary|meaning)(?:\s+(?:French|English|vocabulary|meaning))*$/i.test(
          line,
        ),
    );
  const normalizedLines: string[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (
      /^l'heure d'arrivée \/ de check-in \/ check-out$/i.test(lines[index]) &&
      /^départ time$/i.test(lines[index + 1] ?? "")
    ) {
      normalizedLines.push(
        "l'heure d'arrivée / de départ arrival / departure time (check-in / check-out)",
      );
      index += 1;
      continue;
    }
    normalizedLines.push(lines[index]);
  }
  const entries: Array<{
    id: string;
    term: string;
    meaning: string | null;
    example: string | null;
    topic: { id: string; title: string };
  }> = [];
  const englishStarts =
    /\s(?=(?:to|a|an|the|public|nearby|quiet|furnished|well equipped|air-conditioned|shared|vegetarian|available|noise|size|price|rent|lease|housing|offer|advise|recommend|heating|paid|included|flatshare|roommate|furniture|rate|stay|washing|real estate|double|new|already|used|second-hand|negotiable|free|garden|garbage|problem|emergency|careful|windows|expenses|cleaning|products|someone|how|big|enough|season|availability|time|registration|enrolment|private|school|newcomers|homework|daycare|fees|supplies|online|happen|indoors|outdoors|schedule|planned|workshop|face painting|admission|games|opening|holidays|per year|lost|longer|shy|tastes|likes|soccer|swimming|music|favourite|favorite|colour|about|around|clothes|useful|fun|babysit|habits|first name|experience|calm|active|somewhere|diet|mealtimes|leisure|activities|screens|instructions|his|its|things|friendly|gentle|health|medication|progress|latin music|changing rooms|summer holidays|shoes|hours|exam preparation|french-speaking|includes|organization|animal|welfare|volunteering|campaign|veterinary|training|safety|membership|basis|colleague|professional|relaxed|remote work|salary|benefit|interview|background|transport|costs|birthday|arrival|return|departure|date|security|deposit|check-in|check-out|availability|registration|school supplies|happen|board games|opening hours|holidays|year|lost|around|babysit|mealtimes|leisure activities|friendly|progress|station|equipment|showers|bikes|appointment|pharmacist|advice|center|industry|staff|part-time|accommodation|wage|overtime|office|visiting|savanna|giraffe|all year|round|moment|feeding|families|seniors|directly|train|souvenirs|brochure|tourism|medical|night|dishes|crockery|cutlery|charges|rsvp|tape|heavy|fragile|interactive|authorized|accessible|coverage|repair|roadside assistance|position|taxes|reservation|replacement|full|crowded|rush hour|valid|safe|carpooling|back|ready|gas|fuel|parking|passenger|space|radio|allowed|absent|opinion|nature|popular|local|convenient|enjoy|absolutely|without fail|new year's|party|resolutions|midnight|fireworks|winter sports|ice skating|city|place|history|old québec|guided|table|live music|animated|walking|foot|trip|booking|reimbursed|refunded|travel insurance|installments|family-friendly|additional costs|community|evening|exchange|lunchtime|hobbies|indian|meat|eggs|groceries|tofu|legumes|beans|lentils|vegetables|organic|cheaper|breakfast|attractions|tourist|cancellation|reasonable|job|opportunities|higher education|requirements|tuition|university|residence|clean|comfortable|chef|plates|glasses|moving|tape|heavy|fragile|digital|well-known|interest|read|publication|director|subtitles|broadcasting|screening|recorded|applicant|camera|presenter|general knowledge|condition|food|departure|return date|specific|leaving|happen|residents|enjoyment|adult|adults|children|popular|performance|company|stage|parking|your|how|much|meeting|district|outdoors|dance|special|bicycles|license|replacement|arrival time|departure time)\b)/i;
  const additionalEnglishStarts =
    /\s(?=(?:sheets|gardening|while|in case|in advance|air conditioning|in good|condition|insurance|lights|traditional|modern|suitable|animals|seasickness|on board|drinks|housework|grocery|in cash|punctual|reliable|home delivery|assembly|bike-share|transit|card|per week|over there|with family|helpful|lively|nervous|stressed|rental|fixed-term|permanent|how far|big enough|free of charge|at any time|opening hours|school holidays|face painting|tourist attractions|higher education|job opportunities|medical assistance|safety measures|membership fees|fixed-term contract|permanent contract|departure time|arrival time|sheets and towels|washing machine|school supplies|sporty|athletic|registration fees|transport costs|cleaning products|grocery shopping|family-friendly|homework|mealtimes|free room|health insurance|towels|neighbourhood|performance|at a distance|across|during|from|your|for|and|of|on|in|by|with|a|an|the)\b)/i;

  const termContinuation = /^(?:[\p{L}][\p{L}'’()-]*)(?:[\s/]+[\p{L}][\p{L}'’()-]*)?$/u;
  const incompleteTerm = /(?:\bde|\bd'|\bà|\bet|\bles|\bla|\ble|\/|\bthe)$/i;
  const incompleteMeaning = /(?:\bof|\bto|\bfor|\bwith|\bin|\bon|\band|\/|\ba|\ban|\bthe)$/i;

  for (const [index, line] of normalizedLines.entries()) {
    const splitCandidates = [
      line.search(englishStarts),
      line.search(additionalEnglishStarts),
    ].filter((index) => index >= 0);
    const splitAt = splitCandidates.length ? Math.min(...splitCandidates) : -1;
    const previous = entries.at(-1);

    if (splitAt === 0) {
      if (previous) {
        previous.meaning = [previous.meaning, line].filter(Boolean).join(" ");
        continue;
      }
    }

    if (/^\([^)]+\)$/.test(line) && previous) {
      if (/^\((?:CDD|CDI)\)$/i.test(line)) {
        previous.term = `${previous.term} ${line}`;
      } else {
        previous.meaning = [previous.meaning, line].filter(Boolean).join(" ");
      }
      continue;
    }

    if (splitAt < 0 && previous && termContinuation.test(line)) {
      if (incompleteTerm.test(previous.term) || previous.meaning) {
        previous.term = `${previous.term} ${line}`.trim();
        continue;
      }
    }

    const term = splitAt > 0 ? line.slice(0, splitAt).trim() : line;
    const meaning = splitAt > 0 ? line.slice(splitAt).trim() : null;

    if (previous && meaning && incompleteTerm.test(previous.term)) {
      previous.term = `${previous.term} ${term}`.trim();
      previous.meaning = [previous.meaning, meaning].filter(Boolean).join(" ");
      continue;
    }

    if (previous?.meaning && incompleteMeaning.test(previous.meaning) && splitAt > 0) {
      previous.meaning = `${previous.meaning} ${term} ${meaning}`.trim();
      continue;
    }

    entries.push({
      id: `${topic.id}-reference-vocab-${index}`,
      term,
      meaning,
      example: null,
      topic: { id: topic.id, title: topic.title },
    });
  }

  return entries;
}
export default function WorkspaceApp() {
  const pathname = usePathname();
  const router = useRouter();
  const routePages: Record<string, Page> = {
    "/": "landing",
    "/dashboard": "dashboard",
    "/speaking": "speaking",
    "/writing": "writing",
    "/vocabulary": "vocabulary",
    "/grammar": "grammar",
    "/practice": "practice",
    "/pricing": "pricing",
  };
  const page = routePages[pathname] ?? "dashboard";
  const [sidebar, setSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState<UiLanguage>("fr");
  const [selectedSpeakingTaskType, setSelectedSpeakingTaskType] =
    useState("TASK2");
  const [query, setQuery] = useState("");
  const [speakingSearchQuery, setSpeakingSearchQuery] = useState("");
  const [selectedSpeakingTheme, setSelectedSpeakingTheme] = useState("ALL");
  const [taskTwoPage, setTaskTwoPage] = useState(1);
  const [selectedPresentationTopicId, setSelectedPresentationTopicId] =
    useState("");
  const [selectedSpeakingEssayId, setSelectedSpeakingEssayId] = useState("");
  const [selectedSpeakingVersionId, setSelectedSpeakingVersionId] =
    useState("");
  const [taskThreeSearch, setTaskThreeSearch] = useState("");
  const [taskThreeCategoryFilter, setTaskThreeCategoryFilter] = useState("ALL");
  const [taskThreeClb, setTaskThreeClb] = useState("ALL");
  const [taskThreePage, setTaskThreePage] = useState(1);
  const [done, setDone] = useState<string[]>([]);
  const [progressRecords, setProgressRecords] = useState<
    Array<{
      topicId: string;
      completed: boolean;
      lastViewedAt: string;
      completedAt: string | null;
    }>
  >([]);
  const [courseStructure, setCourseStructure] =
    useState<CourseStructure | null>(null);
  const [library, setLibrary] = useState<LearnerLibrary | null>(null);
  const [speakingContent, setSpeakingContent] =
    useState<SpeakingContent | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<"sidebar" | "header">(
    "sidebar",
  );
  useEffect(() => {
    if (!showProfile) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.closest(
          ".profile-pop, .top-avatar, .profile-mini, .settings-link",
        )
      )
        return;
      setShowProfile(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowProfile(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showProfile]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [authPurpose, setAuthPurpose] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [sessionRole, setSessionRole] = useState("USER");
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const accountName =
    sessionName ||
    (sessionEmail
      ? sessionEmail
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "Guest");
  const accountInitials = accountName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("chez-harneet-language");
    if (savedLanguage === "fr" || savedLanguage === "en")
      setLanguage(savedLanguage);
    setSessionEmail(
      window.sessionStorage.getItem("learner-account-email") ?? "",
    );
    setSessionName(window.sessionStorage.getItem("learner-account-name") ?? "");
    // Role visibility is derived from /auth/me, never from editable browser storage.
    setProfileFirstName(
      window.sessionStorage.getItem("learner-first-name") ?? "",
    );
    setProfileLastName(
      window.sessionStorage.getItem("learner-last-name") ?? "",
    );
    setProfilePhone(window.sessionStorage.getItem("learner-phone") ?? "");
    let cancelled = false;
    void (async () => {
      const accessToken =
        window.sessionStorage.getItem("learner-access-token") ??
        (await refreshAccessToken());
      if (!accessToken || cancelled) return;
      const response = await apiFetch("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          [
            "learner-access-token",
            "learner-account-email",
            "learner-account-name",
            "learner-account-role",
            "learner-first-name",
            "learner-last-name",
            "learner-phone",
            "cms-access-token",
            "cms-account-email",
          ].forEach((key) => window.sessionStorage.removeItem(key));
          setSessionEmail("");
          setSessionName("");
          setSessionRole("USER");
        }
        return;
      }
      const profile = await response.json();
      if (cancelled) return;
      const fullName = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(" ");
      const activeToken =
        window.sessionStorage.getItem("learner-access-token") ?? accessToken;
      const values: Record<string, string> = {
        "learner-access-token": activeToken,
        "learner-account-email": profile.email ?? "",
        "learner-account-name": fullName,
        "learner-account-role": profile.role ?? "USER",
        "learner-first-name": profile.firstName ?? "",
        "learner-last-name": profile.lastName ?? "",
        "learner-phone": profile.phone ?? "",
      };
      for (const [key, value] of Object.entries(values)) {
        window.sessionStorage.setItem(key, value);
      }
      setSessionEmail(profile.email ?? "");
      setSessionName(fullName);
      setSessionRole(profile.role ?? "USER");
      setProfileFirstName(profile.firstName ?? "");
      setProfileLastName(profile.lastName ?? "");
      setProfilePhone(profile.phone ?? "");
    })().catch((cause) => {
      if (!cancelled) {
        setAuthError(
          cause instanceof Error
            ? cause.message
            : "Could not restore your sign-in",
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("chez-harneet-language", language);
  }, [language]);
  useEffect(() => {
    let cancelled = false;
    const loadContent = async () => {
      setContentLoading(true);
      setContentError("");
      try {
        const [structureResponse, libraryResponse, speakingResponse] =
          await Promise.all([
            apiFetch(`/courses/french-exam/structure`),
            apiFetch(`/courses/french-exam/library`),
            apiFetch(`/courses/french-exam/speaking`),
          ]);
        const [structurePayload, libraryPayload, speakingPayload] =
          await Promise.all([
            structureResponse.json(),
            libraryResponse.json(),
            speakingResponse.json(),
          ]);
        if (!structureResponse.ok)
          throw new Error(
            structurePayload.message ?? "Could not load the course",
          );
        if (!libraryResponse.ok)
          throw new Error(
            libraryPayload.message ?? "Could not load course content",
          );
        if (!speakingResponse.ok)
          throw new Error(
            speakingPayload.message ?? "Could not load speaking content",
          );
        if (!cancelled) {
          setCourseStructure(structurePayload as CourseStructure);
          setLibrary(libraryPayload as LearnerLibrary);
          setSpeakingContent(speakingPayload as SpeakingContent);
        }
      } catch (cause) {
        if (!cancelled)
          setContentError(
            cause instanceof Error
              ? cause.message
              : "Could not load course content",
          );
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    };
    void loadContent();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const token = window.sessionStorage.getItem("learner-access-token");
    if (!token) {
      setProgressRecords([]);
      return;
    }
    let cancelled = false;
    void apiFetch(`/progress/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.message ?? "Could not load your progress");
        if (!cancelled) setProgressRecords(payload);
      })
      .catch(() => {
        if (!cancelled) setProgressRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionEmail]);
  const [activeTopic, setActiveTopic] = useState("");
  const [activeTopicId, setActiveTopicId] = useState("");
  const [activeTask, setActiveTask] = useState<CourseTask | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const topics = library?.topics ?? [];
  const vocabulary = topics.flatMap((topic) => {
    const publishedEntries =
      library?.vocabulary.filter((entry) => entry.topic.id === topic.id) ?? [];
    return publishedEntries.length
      ? publishedEntries
      : topicVocabularyFromText(topic);
  });
  const grammarNotes = library?.grammar.length
    ? library.grammar
    : topics.flatMap((topic) => {
        const explanation = referenceSection(
          topic.extraInformation,
          /Grammar Rule/i,
          /Exam criterion/i,
        );
        return explanation
          ? [
              {
                id: topic.id,
                rule: topic.title,
                explanation,
                example: null,
                topic: { id: topic.id, title: topic.title },
              },
            ]
          : [];
      });
  const tasks =
    courseStructure?.modules.flatMap((module) =>
      module.tasks.map((task) => ({ ...task, skill: module.skill })),
    ) ?? [];
  const speakingTasks = tasks.filter((task) => task.skill === "SPEAKING");
  const structuredSpeakingTasks =
    speakingContent?.modules.flatMap((module) => module.tasks) ?? [];
  const structuredTask = (taskType: string) =>
    structuredSpeakingTasks.find((task) => task.type === taskType);
  const asLearnerTopic = (
    topic: SpeakingContentTopic,
    theme: SpeakingContentTheme,
    taskType: string,
  ): LearnerTopic => ({
    ...topic,
    theme: {
      id: theme.id,
      slug: theme.slug,
      name: theme.name,
      task: { type: taskType, module: { skill: "SPEAKING" } },
    },
  });
  const taskTwoThemes = structuredTask("TASK2")?.themes ?? [];
  const taskTwoSpeakingTopics = taskTwoThemes.flatMap((theme) =>
    theme.topics.map((topic) => asLearnerTopic(topic, theme, "TASK2")),
  );
  const taskOneTopics = (structuredTask("TASK1")?.themes ?? []).flatMap(
    (theme) =>
      theme.topics.map((topic) => asLearnerTopic(topic, theme, "TASK1")),
  );
  const taskThreeEssays = structuredTask("TASK3")?.essays ?? [];
  const previewSpeakingTopicIds = new Set(
    [
      taskOneTopics[0]?.id,
      taskTwoSpeakingTopics[0]?.id,
      taskThreeEssays[0]?.id,
    ].filter((id): id is string => Boolean(id)),
  );
  const selectedSpeakingEssay = taskThreeEssays.find(
    (essay) => essay.id === selectedSpeakingEssayId,
  );
  const selectedSpeakingVersion =
    selectedSpeakingEssay?.versions.find(
      (version) => version.id === selectedSpeakingVersionId,
    ) ?? selectedSpeakingEssay?.versions[0];
  const selectedSpeakingVocabulary = selectedSpeakingEssay
    ? taskThreeVocabularyRows(
        selectedSpeakingEssay.vocabulary,
        selectedSpeakingVersion?.sections ?? [],
      )
    : [];
  const taskThreeCategories = [
    ...new Set(taskThreeEssays.map(taskThreeCategory)),
  ].sort((a, b) => a.localeCompare(b));
  const filteredTaskThreeEssays = taskThreeEssays.filter((essay) => {
    const category = taskThreeCategory(essay);
    const queryMatch = `${essay.title} ${essay.prompt ?? ""}`
      .toLocaleLowerCase("fr")
      .includes(taskThreeSearch.trim().toLocaleLowerCase("fr"));
    const categoryMatch =
      taskThreeCategoryFilter === "ALL" || category === taskThreeCategoryFilter;
    const labels = essay.versions.map((version) =>
      version.versionLabel.toLocaleLowerCase("fr"),
    );
    const clbMatch =
      taskThreeClb === "ALL" ||
      (taskThreeClb === "CLB_7" &&
        labels.some((label) => label.includes("clb 7"))) ||
      (taskThreeClb === "CLB_5_6" &&
        labels.some((label) => label.includes("clb 5")));
    return queryMatch && categoryMatch && clbMatch;
  });
  const taskThreePageSize = 12;
  const taskThreePageCount = Math.max(
    1,
    Math.ceil(filteredTaskThreeEssays.length / taskThreePageSize),
  );
  const visibleTaskThreeEssays = filteredTaskThreeEssays.slice(
    (taskThreePage - 1) * taskThreePageSize,
    taskThreePage * taskThreePageSize,
  );
  const selectedPresentationTopic = !sessionEmail
    ? taskOneTopics[0]
    : (taskOneTopics.find(
        (topic) => topic.id === selectedPresentationTopicId,
      ) ?? taskOneTopics[0]);
  const taskTwoCategorizedTopics = taskTwoThemes.flatMap((theme) =>
    theme.topics.map((sourceTopic) => ({
      topic: asLearnerTopic(sourceTopic, theme, "TASK2"),
      category: taskTwoDisplayCategory(sourceTopic, theme),
    })),
  );
  const speakingThemeOptions = taskTwoCategorizedTopics
    .reduce<
      Array<{
        id: string;
        slug: string;
        name: string;
        count: number;
      }>
    >((categories, { category }) => {
      const existing = categories.find((item) => item.id === category.id);
      if (existing) existing.count += 1;
      else categories.push({ ...category, count: 1 });
      return categories;
    }, [])
    .sort((left, right) => {
      const leftOrder = taskTwoCategoryLabels.findIndex(
        (item) => item.slug === left.slug,
      );
      const rightOrder = taskTwoCategoryLabels.findIndex(
        (item) => item.slug === right.slug,
      );
      if (leftOrder === -1 && rightOrder === -1)
        return left.name.localeCompare(right.name);
      return (
        (leftOrder === -1 ? taskTwoCategoryLabels.length : leftOrder) -
        (rightOrder === -1 ? taskTwoCategoryLabels.length : rightOrder)
      );
    });
  const filteredTaskTwoTopics = taskTwoCategorizedTopics.filter(
    ({ category, topic }) => {
      const categoryMatches =
        selectedSpeakingTheme === "ALL" || category.id === selectedSpeakingTheme;
      const searchText = `${topic.title} ${topic.situation ?? ""} ${category.name}`;
      const searchMatches = searchText
        .toLocaleLowerCase("fr")
        .includes(speakingSearchQuery.trim().toLocaleLowerCase("fr"));
      return categoryMatches && searchMatches;
    },
  );
  const taskTwoPageSize = 12;
  const taskTwoPageCount = Math.max(
    1,
    Math.ceil(filteredTaskTwoTopics.length / taskTwoPageSize),
  );
  const visibleTaskTwoTopics = filteredTaskTwoTopics.slice(
    (taskTwoPage - 1) * taskTwoPageSize,
    taskTwoPage * taskTwoPageSize,
  );
  const selectedSpeakingTaskSpec =
    oralExpressionTasks.find(
      (task) => task.type === selectedSpeakingTaskType,
    ) ?? oralExpressionTasks[1];
  const activeSpeakingTask: CourseTask & { skill: string } = speakingTasks.find(
    (task) => task.type === selectedSpeakingTaskSpec.type,
  ) ?? {
    type: selectedSpeakingTaskSpec.type,
    format: selectedSpeakingTaskSpec.format,
    title: selectedSpeakingTaskSpec.title,
    description: selectedSpeakingTaskSpec.description,
    instructions: null,
    durationMinutes: selectedSpeakingTaskSpec.durationMinutes,
    questionCount: null,
    skill: "SPEAKING",
  };
  const writingTasks = tasks.filter((task) => task.skill === "WRITING");
  const activeTopicRecord =
    topics.find((topic) => topic.id === activeTopicId) ?? null;
  const activeTopicGrammarNotes =
    activeTopicRecord?.theme.task?.type === "TASK2"
      ? (library?.grammar.filter(
          (note) => note.topic.id === activeTopicRecord.id,
        ) ?? [])
      : [];
  const activeTopicGrammarFallback =
    activeTopicRecord?.theme.task?.type === "TASK2"
      ? referenceSection(
          activeTopicRecord.extraInformation,
          /Grammar Rule/i,
          /Exam criterion/i,
        )
      : "";
  const practiceTopicLocked = Boolean(
    !sessionEmail &&
    activeTopicRecord?.theme.task?.module.skill === "SPEAKING" &&
    !previewSpeakingTopicIds.has(activeTopicRecord.id),
  );
  const completedTopicIds = new Set([
    ...progressRecords
      .filter((record) => record.completed)
      .map((record) => record.topicId),
    ...done,
  ]);
  const completedCount = completedTopicIds.size;
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const completedThisWeek = new Set([
    ...progressRecords
      .filter(
        (record) =>
          record.completed &&
          record.completedAt &&
          new Date(record.completedAt) >= weekStart,
      )
      .map((record) => record.topicId),
    ...done,
  ]).size;
  const progressPercent = topics.length
    ? Math.min(100, Math.round((completedCount / topics.length) * 100))
    : 0;
  const streak = (() => {
    const days = new Set(
      progressRecords
        .filter((record) => record.completedAt)
        .map((record) =>
          new Date(record.completedAt as string).toLocaleDateString("en-CA"),
        ),
    );
    let count = 0;
    const date = new Date();
    if (!days.has(date.toLocaleDateString("en-CA")))
      date.setDate(date.getDate() - 1);
    while (days.has(date.toLocaleDateString("en-CA"))) {
      count++;
      date.setDate(date.getDate() - 1);
    }
    return count;
  })();
  const filteredVocab = useMemo(
    () =>
      vocabulary.filter((v) =>
        (
          v.term +
          " " +
          (v.meaning ?? "") +
          " " +
          (v.example ?? "") +
          " " +
          v.topic.title
        )
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, vocabulary],
  );
  const filteredVocabGroups = useMemo(() => {
    const groups = new Map<string, typeof filteredVocab>();
    for (const entry of filteredVocab) {
      const group = groups.get(entry.topic.id) ?? [];
      group.push(entry);
      groups.set(entry.topic.id, group);
    }
    return [...groups.values()];
  }, [filteredVocab]);
  const activeTopicVocabulary = activeTopicRecord
    ? vocabulary.filter((entry) => entry.topic.id === activeTopicRecord.id)
    : [];
  const navItems: [Page, string, LucideIcon][] = [
    ["dashboard", "Overview", Home],
    ["speaking", "Speaking", MessageCircle],
    ["writing", "Writing", FileText],
    ["vocabulary", "Vocabulary", BookOpen],
    ["grammar", "Grammar", Sparkles],
  ];
  const go = (p: Page) => {
    router.push(p === "landing" ? "/" : `/${p}`);
    setSidebar(false);
    setSubmitted(false);
  };
  const openSignIn = () => {
    setAuthPurpose("LOGIN");
    setAuthError("");
    setAuthNotice("");
    setOtpSent(false);
    setShowLogin(true);
  };
  const startTask = (task: CourseTask & { skill?: string }) => {
    setActiveTask(task);
    const topic = topics.find(
      (item) =>
        item.theme.task?.type === task.type &&
        item.theme.task.module.skill === task.skill,
    );
    setActiveTopic(
      topic?.title ?? `${task.skill ?? "Practice"} · ${task.title}`,
    );
    setActiveTopicId(topic?.id ?? "");
    setAnswer("");
    go("practice");
  };
  const startTopic = (topic: LearnerTopic) => {
    if (!sessionEmail && !previewSpeakingTopicIds.has(topic.id)) {
      openSignIn();
      return;
    }
    setActiveTopic(topic.title);
    setActiveTopicId(topic.id);
    setActiveTask(
      speakingTasks.find((task) => task.type === topic.theme.task?.type) ??
        null,
    );
    setAnswer("");
    go("practice");
  };
  const savePractice = async () => {
    setSubmitted(true);
    if (!activeTopicRecord) return;
    const token = window.sessionStorage.getItem("learner-access-token");
    if (!token) {
      setDone((items) =>
        items.includes(activeTopicRecord.id)
          ? items
          : [...items, activeTopicRecord.id],
      );
      return;
    }
    try {
      const response = await apiFetch(`/progress/${activeTopicRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.message ?? "Could not save your progress");
      setProgressRecords((records) => [
        ...records.filter((record) => record.topicId !== payload.topicId),
        payload,
      ]);
    } catch (cause) {
      setContentError(
        cause instanceof Error ? cause.message : "Could not save your progress",
      );
    }
  };
  const scenarioExercise = useMemo(
    () => parseScenarioExercise(activeTopicRecord?.question ?? null),
    [activeTopicRecord?.question],
  );
  const isTopicComplete = Boolean(
    activeTopicRecord &&
    (done.includes(activeTopicRecord.id) ||
      progressRecords.some(
        (record) => record.topicId === activeTopicRecord.id && record.completed,
      )),
  );
  const requestAuthCode = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const response = await apiFetch(`/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: authPurpose }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          Array.isArray(payload.message)
            ? payload.message.join(", ")
            : (payload.message ?? "Could not request a sign-in code"),
        );
      setDevCode(typeof payload.devCode === "string" ? payload.devCode : "");
      setOtpSent(true);
      setAuthNotice(
        "If this email can be used for this action, a code has been sent.",
      );
    } catch (cause) {
      setAuthError(
        cause instanceof Error
          ? cause.message
          : "Could not request a sign-in code",
      );
    } finally {
      setAuthBusy(false);
    }
  };
  const verifyAuthCode = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    try {
      const response = await apiFetch(`/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: authCode, purpose: authPurpose }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          Array.isArray(payload.message)
            ? payload.message.join(", ")
            : (payload.message ?? "Code verification failed"),
        );
      if (typeof payload.accessToken !== "string")
        throw new Error("The API did not return an access token");
      const profileResponse = await apiFetch(`/auth/me`, {
        headers: { Authorization: `Bearer ${payload.accessToken}` },
      });
      const profile = await profileResponse.json();
      if (!profileResponse.ok)
        throw new Error(profile.message ?? "Could not load your account");
      const fullName = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(" ");
      window.sessionStorage.setItem(
        "learner-access-token",
        payload.accessToken,
      );
      window.sessionStorage.setItem(
        "learner-account-email",
        profile.email ?? email,
      );
      window.sessionStorage.setItem("learner-account-name", fullName);
      window.sessionStorage.setItem(
        "learner-account-role",
        profile.role ?? "USER",
      );
      window.sessionStorage.setItem(
        "learner-first-name",
        profile.firstName ?? "",
      );
      window.sessionStorage.setItem(
        "learner-last-name",
        profile.lastName ?? "",
      );
      window.sessionStorage.setItem("learner-phone", profile.phone ?? "");
      if (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") {
        window.sessionStorage.setItem("cms-access-token", payload.accessToken);
        window.sessionStorage.setItem(
          "cms-account-email",
          profile.email ?? email,
        );
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      setSessionEmail(email);
      setSessionName(fullName);
      setSessionRole(profile.role ?? "USER");
      setProfileFirstName(profile.firstName ?? "");
      setProfileLastName(profile.lastName ?? "");
      setProfilePhone(profile.phone ?? "");
      setOtpSent(false);
      setAuthCode("");
      setDevCode("");
      setShowLogin(false);
      setShowProfile(false);
      setAuthNotice("");
    } catch (cause) {
      setAuthError(
        cause instanceof Error ? cause.message : "Code verification failed",
      );
    } finally {
      setAuthBusy(false);
    }
  };
  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    const accessToken = window.sessionStorage.getItem("learner-access-token");
    if (!accessToken) return;
    setAuthBusy(true);
    setAuthError("");
    try {
      const response = await apiFetch(`/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          firstName: profileFirstName,
          lastName: profileLastName,
          phone: profilePhone,
        }),
      });
      const profile = await response.json();
      if (!response.ok)
        throw new Error(profile.message ?? "Could not update your profile");
      const fullName = [profile.firstName, profile.lastName]
        .filter(Boolean)
        .join(" ");
      setSessionName(fullName);
      window.sessionStorage.setItem("learner-account-name", fullName);
      setAuthNotice("Profile updated.");
    } catch (cause) {
      setAuthError(
        cause instanceof Error
          ? cause.message
          : "Could not update your profile",
      );
    } finally {
      setAuthBusy(false);
    }
  };
  const signOut = async () => {
    setAuthError("");
    try {
      await revokeRefreshSession();
    } catch (cause) {
      setAuthError(
        cause instanceof Error ? cause.message : "Could not securely sign out",
      );
      setShowLogin(true);
      return;
    }
    [
      "learner-access-token",
      "learner-account-email",
      "learner-account-name",
      "learner-account-role",
      "learner-first-name",
      "learner-last-name",
      "learner-phone",
      "cms-access-token",
      "cms-account-email",
    ].forEach((key) => window.sessionStorage.removeItem(key));
    setSessionEmail("");
    setSessionName("");
    setSessionRole("USER");
    setShowProfile(false);
    setShowLogin(false);
    setAuthNotice("You’ve been signed out.");
  };
  if (pathname.startsWith("/admin") || pathname === "/auth/callback")
    return null;
  const app = (
    <div
      className={`app-shell${page === "landing" ? " landing-app" : ""}${sidebarCollapsed && page !== "landing" ? " sidebar-is-collapsed" : ""}`}
    >
      {page !== "landing" && (
        <aside
          className={`sidebar ${sidebar ? "sidebar-open" : ""}${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
        >
          <div className="brand" onClick={() => go("dashboard")}>
            <BrandLogo className="brand-mark" size={50} />
            <div>
              <b>Chez Harneet</b>
              <small>FRENCH EXAM</small>
            </div>
            <button
              className="sidebar-collapse"
              onClick={(event) => {
                event.stopPropagation();
                setSidebarCollapsed((collapsed) => !collapsed);
              }}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight size={17} />
            </button>
            <button
              className="mobile-close"
              onClick={() => setSidebar(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="workspace-label">YOUR WORKSPACE</div>
          <nav className="nav-list">
            {navItems.map(([p, label, Icon]) => (
              <button
                key={p}
                className={`nav-link ${page === p ? "active" : ""}`}
                title={label}
                onClick={() => go(p as Page)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {p === "speaking" && (
                  <span className="nav-count">
                    {oralExpressionTasks.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <div className="workspace-label">YOUR TOOLS</div>
          <button
            className={`nav-link ${page === "practice" ? "active" : ""}`}
            title="Practice room"
            onClick={() => go("practice")}
          >
            <Target size={18} />
            <span>Practice room</span>
          </button>
          <button
            className="nav-link"
            title="Mock exam"
            onClick={() => setShowUpgrade(true)}
          >
            <Trophy size={18} />
            <span>Mock exam</span>
            <span className="tiny-lock">
              <LockKeyhole size={12} />
            </span>
          </button>
          <button
            className="nav-link"
            title="My progress"
            onClick={() => setShowUpgrade(true)}
          >
            <Activity size={18} />
            <span>My progress</span>
          </button>
          {["ADMIN", "SUPER_ADMIN"].includes(sessionRole) && (
            <button
              className="nav-link"
              title="Admin section"
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft size={18} />
              <span>Admin section</span>
            </button>
          )}
          <div className="sidebar-spacer" />
          <button
            className="nav-link settings-link"
            onClick={() => {
              setProfileAnchor("sidebar");
              setShowProfile(!showProfile);
            }}
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
          <div
            className="profile-mini"
            onClick={() => {
              setProfileAnchor("sidebar");
              setShowProfile(!showProfile);
            }}
          >
            <div className="avatar">{accountInitials}</div>
            <div className="profile-meta">
              <b>{accountName}</b>
              <small>{sessionEmail || "Visitor"}</small>
            </div>
            <MoreHorizontal size={18} className="muted-icon" />
          </div>
          {showProfile && profileAnchor === "sidebar" && (
            <div className="profile-pop">
              <button
                onClick={() => {
                  setShowLogin(true);
                  setShowProfile(false);
                }}
              >
                <UserRound size={15} />{" "}
                {sessionEmail ? accountName : "Sign in / account"}
              </button>
              <button onClick={() => setShowUpgrade(true)}>
                <Crown size={15} /> Manage plan
              </button>
              <button
                onClick={() => {
                  if (sessionEmail) {
                    void signOut();
                    return;
                  }
                  setShowProfile(false);
                  go("dashboard");
                }}
              >
                <LogOut size={15} /> {sessionEmail ? "Sign out" : "Close menu"}
              </button>
            </div>
          )}
        </aside>
      )}
      <main className="main-area">
        {page === "landing" ? (
          <header className="landing-nav">
            <button className="landing-brand" onClick={() => go("landing")}>
              <BrandLogo className="landing-brand-mark" size={48} />
              <span>
                <b>Chez Harneet</b>
                <small>FRENCH EXAM PREPARATION</small>
              </span>
            </button>
            <nav aria-label="Main navigation">
              <a href="#approach">How it works</a>
              <a href="#practice-path">Practice</a>
              <a href="#plans">Plans</a>
            </nav>
            <div className="landing-nav-actions">
              <LanguageSwitcher language={language} onChange={setLanguage} />
              {sessionEmail ? (
                <button
                  className="landing-login"
                  onClick={() => setShowLogin(true)}
                  aria-label={`Open ${accountName}'s account`}
                >
                  My account
                </button>
              ) : (
                <button
                  className="landing-login"
                  onClick={() => setShowLogin(true)}
                >
                  Sign in
                </button>
              )}
              <button
                className="landing-nav-cta"
                onClick={() => go("dashboard")}
              >
                {sessionEmail ? "My learning space" : "Open learning space"}{" "}
                <ArrowRight size={15} />
              </button>
            </div>
          </header>
        ) : (
          <header className="topbar">
            <button
              className="mobile-menu"
              onClick={() => setSidebar(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <b>
                {page === "dashboard"
                  ? "Overview"
                  : page === "practice"
                    ? "Practice room"
                    : page[0].toUpperCase() + page.slice(1)}
              </b>
            </div>
            <div className="top-actions">
              <LanguageSwitcher
                language={language}
                onChange={setLanguage}
                compact
              />
              <button className="help-btn" title="Help">
                <CircleHelp size={18} />
                <span>Help centre</span>
              </button>
              <button
                className="icon-btn"
                onClick={() => setShowUpgrade(true)}
                title="What's new"
              >
                <Sparkles size={18} />
              </button>
              <button
                className="top-avatar"
                onClick={() => {
                  setProfileAnchor("header");
                  setShowProfile(!showProfile);
                }}
                aria-label={`Open ${accountName}'s profile`}
              >
                {accountInitials}
              </button>
              {showProfile && profileAnchor === "header" && (
                <div className="profile-pop header-profile-pop">
                  <div className="profile-pop-account">
                    <span className="avatar">{accountInitials}</span>
                    <span>
                      <b>{accountName}</b>
                      <small>{sessionEmail || "Visitor"}</small>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setShowProfile(false);
                    }}
                  >
                    <UserRound size={15} />{" "}
                    {sessionEmail ? "Account" : "Sign in / account"}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpgrade(true);
                      setShowProfile(false);
                    }}
                  >
                    <Crown size={15} /> Manage plan
                  </button>
                  {sessionEmail && (
                    <button onClick={() => void signOut()}>
                      <LogOut size={15} /> Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </header>
        )}
        <div
          className={`page-content${page === "landing" ? " landing-content" : ""}${page === "dashboard" ? " dashboard-content" : ""}`}
        >
          {page === "landing" ? (
            <>
              <section className="landing-hero">
                <div className="landing-hero-copy">
                  <span className="landing-eyebrow">
                    <span /> A clearer way to prepare
                  </span>
                  <h1>
                    Build your French confidence,<em> one step at a time.</em>
                  </h1>
                  <p>
                    Structured TCF Canada practice for speaking, writing,
                    vocabulary, and grammar. Learn at your pace, with a clear
                    next step every time.
                  </p>
                  <div className="landing-hero-actions">
                    <button
                      className="landing-primary"
                      onClick={() => go("dashboard")}
                    >
                      Explore the learning space <ArrowRight size={17} />
                    </button>
                    <button
                      className="landing-secondary"
                      onClick={() => go("speaking")}
                    >
                      <MessageCircle size={16} /> Browse speaking practice
                    </button>
                  </div>
                  <div className="landing-proof">
                    <span>
                      <CheckCircle2 size={16} /> Guided practice
                    </span>
                    <span>
                      <CheckCircle2 size={16} /> Learn at your pace
                    </span>
                    <span>
                      <CheckCircle2 size={16} /> Progress that stays yours
                    </span>
                  </div>
                </div>
                <div
                  className="landing-hero-art"
                  aria-label="A preview of the Chez Harneet learning space"
                >
                  <div className="landing-art-glow" />
                  <div className="landing-art-orbit orbit-one" />
                  <div className="landing-art-orbit orbit-two" />
                  <div className="landing-art-note note-one">
                    <span className="landing-note-icon">
                      <AudioLines size={17} />
                    </span>
                    <span>
                      <b>Speaking practice</b>
                      <small>Ask, listen, follow up</small>
                    </span>
                  </div>
                  <div className="landing-art-panel">
                    <div className="landing-panel-top">
                      <BrandLogo className="landing-panel-logo" size={34} />
                      <span>
                        <b>Your learning path</b>
                        <small>A little progress adds up</small>
                      </span>
                      <Sparkles size={17} />
                    </div>
                    <div className="landing-panel-progress">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="landing-panel-task">
                      <span className="landing-task-icon">
                        <MessageCircle size={19} />
                      </span>
                      <span>
                        <small>UP NEXT · SPEAKING</small>
                        <b>Ask the right questions</b>
                        <small>Guided role-play · 10 minutes</small>
                      </span>
                      <ArrowRight size={17} />
                    </div>
                    <div className="landing-panel-foot">
                      <CheckCircle2 size={15} /> Ready when you are
                    </div>
                  </div>
                  <div className="landing-art-note note-two">
                    <span className="landing-note-check">
                      <Check size={16} />
                    </span>
                    <span>
                      <b>Practice your way</b>
                      <small>No perfect French required</small>
                    </span>
                  </div>
                </div>
              </section>
              <section className="landing-intro-strip" id="approach">
                <div>
                  <span className="landing-section-kicker">
                    THE CHEZ HARNEET APPROACH
                  </span>
                  <h2>Real structure. A calmer way forward.</h2>
                </div>
                <p>
                  Prepare for the skills you need with focused lessons and
                  practical exercises, all in one learning space.
                </p>
              </section>
              <section className="landing-feature-grid">
                <article className="landing-feature-card feature-lav">
                  <span>
                    <MessageCircle size={20} />
                  </span>
                  <small>01 · SPEAK WITH CONFIDENCE</small>
                  <h3>Practise real conversations</h3>
                  <p>
                    Use role-play scenarios, sample openings, suggested
                    questions, and closings to get comfortable speaking
                    naturally.
                  </p>
                  <button onClick={() => go("speaking")}>
                    Explore speaking <ArrowRight size={15} />
                  </button>
                </article>
                <article className="landing-feature-card feature-blue">
                  <span>
                    <FileText size={20} />
                  </span>
                  <small>02 · WRITE WITH CLARITY</small>
                  <h3>Shape your ideas clearly</h3>
                  <p>
                    Build a writing habit with guided prompts and a simple place
                    to organise your response.
                  </p>
                  <button onClick={() => go("writing")}>
                    Explore writing <ArrowRight size={15} />
                  </button>
                </article>
                <article className="landing-feature-card feature-mint">
                  <span>
                    <BookOpen size={20} />
                  </span>
                  <small>03 · GROW YOUR FRENCH</small>
                  <h3>Strengthen the foundations</h3>
                  <p>
                    Review vocabulary and grammar in context, with focused
                    resources that support your practice.
                  </p>
                  <button onClick={() => go("vocabulary")}>
                    Explore learning tools <ArrowRight size={15} />
                  </button>
                </article>
              </section>
              <section className="landing-path" id="practice-path">
                <div className="landing-section-heading">
                  <span className="landing-section-kicker">
                    YOUR PREPARATION, IN FOCUS
                  </span>
                  <h2>Know what to work on next.</h2>
                  <p>
                    Move from a small daily practice to a more confident exam
                    day.
                  </p>
                </div>
                <div className="landing-steps">
                  <article>
                    <span>1</span>
                    <div>
                      <b>Choose a skill</b>
                      <p>
                        Start with speaking, writing, vocabulary, or grammar.
                      </p>
                    </div>
                  </article>
                  <article>
                    <span>2</span>
                    <div>
                      <b>Practise with guidance</b>
                      <p>Use structured prompts to make each session count.</p>
                    </div>
                  </article>
                  <article>
                    <span>3</span>
                    <div>
                      <b>Keep building momentum</b>
                      <p>
                        Return to your learning space and pick up where you left
                        off.
                      </p>
                    </div>
                  </article>
                </div>
                <button
                  className="landing-primary"
                  onClick={() => go("dashboard")}
                >
                  Start exploring <ArrowRight size={16} />
                </button>
              </section>
              <section className="landing-plans" id="plans">
                <div className="landing-section-heading">
                  <span className="landing-section-kicker">
                    A PLAN THAT FITS YOUR JOURNEY
                  </span>
                  <h2>Start where you are.</h2>
                  <p>
                    Explore Chez Harneet for free. More ways to practise are on
                    the way.
                  </p>
                </div>
                <div className="landing-plan-grid">
                  <article>
                    <span className="landing-plan-label">
                      YOUR STARTING POINT
                    </span>
                    <h3>Free learning space</h3>
                    <p>
                      Build your routine with guided activities and core French
                      learning tools.
                    </p>
                    <ul>
                      <li>
                        <CheckCircle2 size={15} /> Explore speaking and writing
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Review vocabulary and grammar
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Keep practice progress
                      </li>
                    </ul>
                    <button
                      className="landing-secondary"
                      onClick={() => go("dashboard")}
                    >
                      Open the learning space <ArrowRight size={15} />
                    </button>
                  </article>
                  <article className="landing-plan-plus">
                    <span className="landing-plan-label">IN DEVELOPMENT</span>
                    <h3>More ways to prepare</h3>
                    <p>
                      Expanded practice libraries and exam-style simulations are
                      being prepared.
                    </p>
                    <ul>
                      <li>
                        <CheckCircle2 size={15} /> Full scenario collections
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Mock exam practice
                      </li>
                      <li>
                        <CheckCircle2 size={15} /> Deeper progress insights
                      </li>
                    </ul>
                    <button
                      className="landing-plan-wait"
                      onClick={() => setShowUpgrade(true)}
                    >
                      See what’s coming <Sparkles size={15} />
                    </button>
                  </article>
                </div>
                <p className="landing-plan-note">
                  <ShieldCheck size={14} /> No payment is collected in this
                  preview. Pricing will be shown when plans are available.
                </p>
              </section>
              <section className="landing-cta">
                <div>
                  <span className="landing-section-kicker">
                    YOUR NEXT FRENCH MILESTONE
                  </span>
                  <h2>Make space for steady progress.</h2>
                  <p>
                    Open your learning space and find a practice that fits
                    today.
                  </p>
                </div>
                <button
                  className="landing-cta-btn"
                  onClick={() => go("dashboard")}
                >
                  Enter Chez Harneet <ArrowRight size={16} />
                </button>
              </section>
              <footer className="landing-footer">
                <button className="landing-brand" onClick={() => go("landing")}>
                  <BrandLogo className="landing-brand-mark" size={48} />
                  <span>
                    <b>Chez Harneet</b>
                    <small>FRENCH EXAM PREPARATION</small>
                  </span>
                </button>
                <span>
                  Independent French preparation · Not an official examination
                  provider
                </span>
                <button onClick={() => setShowLogin(true)}>
                  Sign in <ArrowRight size={14} />
                </button>
              </footer>
            </>
          ) : (
            <>
              {contentError && (
                <div className="notice-box" role="alert">
                  {contentError}
                </div>
              )}
              {contentLoading && (
                <div className="notice-box" role="status">
                  Loading your course content…
                </div>
              )}
              {page === "dashboard" && (
                <>
                  {sessionEmail ? (
                    <>
                      <section className="welcome-row">
                        <div>
                          <div className="eyebrow">
                            <span className="eyebrow-dot" /> YOUR LEARNING SPACE
                          </div>
                          <h1>
                            Bonjour, {accountName.split(" ")[0]}{" "}
                            <span className="wave">✳</span>
                          </h1>
                          <p className="subhead">
                            A little practice every day goes a long way. Let’s
                            keep your momentum.
                          </p>
                        </div>
                        <div className="streak-pill">
                          <div className="streak-flame">
                            <Flame size={19} fill="currentColor" />
                          </div>
                          <div>
                            <b>{streak} day streak</b>
                            <small>
                              {streak
                                ? "You’re building a habit!"
                                : "Complete a practice to start a streak."}
                            </small>
                          </div>
                        </div>
                      </section>
                      <section className="hero-panel">
                        <div className="hero-copy">
                          <div className="hero-tag">
                            <Sparkles size={13} /> YOUR NEXT STEP
                          </div>
                          <h2>
                            Small steps.
                            <br />
                            <em>Big confidence.</em>
                          </h2>
                          <p>
                            Pick up where you left off and keep moving towards
                            your TCF goal.
                          </p>
                          <button
                            className="primary-btn"
                            onClick={() => go("speaking")}
                          >
                            Continue learning <ArrowRight size={16} />
                          </button>
                          <div className="hero-note">
                            <CheckCircle2 size={15} /> Your progress is saved as
                            you learn
                          </div>
                        </div>
                        <div className="hero-art">
                          <div className="art-sun" />
                          <div className="art-arch">
                            <div className="art-person">
                              <div className="person-head" />
                              <div className="person-body" />
                              <div className="person-book" />
                            </div>
                          </div>
                          <div className="floating-note note-top">
                            <span className="note-check">
                              <Check size={12} />
                            </span>
                            <div>
                              <b>Everyday French</b>
                              <small>One step at a time</small>
                            </div>
                          </div>
                          <div className="floating-note note-bottom">
                            <div className="note-wave">
                              <AudioLines size={18} />
                            </div>
                            <div>
                              <b>Speak with confidence</b>
                              <small>Practice makes progress</small>
                            </div>
                          </div>
                          <div className="art-star star-a">✦</div>
                          <div className="art-star star-b">✳</div>
                        </div>
                      </section>
                      <section className="stats-grid">
                        <div className="stat-card">
                          <div className="stat-icon stat-purple">
                            <Target size={18} />
                          </div>
                          <div className="stat-title">Learning progress</div>
                          <div className="stat-value">
                            {progressPercent}
                            <span>%</span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill purple-fill"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <small>Keep your weekly rhythm</small>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon stat-green">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="stat-title">Activities completed</div>
                          <div className="stat-value">
                            {completedCount}
                            <span className="stat-small">
                              {" "}
                              / {topics.length}
                            </span>
                          </div>
                          <div className="stat-foot">
                            <span className="trend-up">
                              <TrendingUp size={13} /> {completedThisWeek}{" "}
                              completed this week
                            </span>
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon stat-orange">
                            <Flame size={18} />
                          </div>
                          <div className="stat-title">Current streak</div>
                          <div className="stat-value">
                            {streak} <span>days</span>
                          </div>
                          <div className="week-dots">
                            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                              <div
                                key={i}
                                className={
                                  i < streak && streak > 0
                                    ? "day done-day"
                                    : "day"
                                }
                              >
                                {i < streak && streak > 0 ? (
                                  <Check size={11} />
                                ) : (
                                  d
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-icon stat-blue">
                            <Clock3 size={18} />
                          </div>
                          <div className="stat-title">Published scenarios</div>
                          <div className="stat-value">{topics.length}</div>
                          <div className="stat-foot">
                            <span className="muted-text">
                              Available in this course
                            </span>
                          </div>
                        </div>
                      </section>
                      <section className="section-heading">
                        <div>
                          <h3>Your learning path</h3>
                          <p>Focused practice for every part of the exam.</p>
                        </div>
                        <button
                          className="text-btn"
                          onClick={() => go("speaking")}
                        >
                          View all learning <ArrowRight size={15} />
                        </button>
                      </section>
                      <section className="task-grid">
                        {tasks.map((task) => {
                          const { icon: Icon, tone } = taskPresentation(
                            task.format,
                          );
                          const taskTopics = topics.filter(
                            (topic) => topic.theme.task?.type === task.type,
                          );
                          const taskDone = taskTopics.filter((topic) =>
                            completedTopicIds.has(topic.id),
                          ).length;
                          const taskProgress = taskTopics.length
                            ? Math.round((taskDone / taskTopics.length) * 100)
                            : 0;
                          return (
                            <article key={task.title} className="task-card">
                              <div className="task-card-top">
                                <div className={`task-icon ${tone}`}>
                                  <Icon size={20} />
                                </div>
                                <button
                                  className={`bookmark-btn ${saved.includes(task.title) ? "is-saved" : ""}`}
                                  onClick={() =>
                                    setSaved((s) =>
                                      s.includes(task.title)
                                        ? s.filter((x) => x !== task.title)
                                        : [...s, task.title],
                                    )
                                  }
                                  aria-label="Save activity"
                                >
                                  <Bookmark
                                    size={17}
                                    fill={
                                      saved.includes(task.title)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                              </div>
                              <div className="task-kicker">
                                {task.skill} <span>·</span>{" "}
                                {task.type.replace("TASK", "Task ")}
                              </div>
                              <h4>{task.title}</h4>
                              <p>
                                {task.description ??
                                  task.instructions ??
                                  "Explore this part of the exam."}
                              </p>
                              <div className="task-meta">
                                <span>
                                  <Clock3 size={13} />
                                  {formatDuration(task.durationMinutes)}
                                </span>
                                <span>
                                  {taskDone} / {taskTopics.length} topics
                                </span>
                              </div>
                              <div className="progress-track task-track">
                                <div
                                  className={`progress-fill ${tone}-fill`}
                                  style={{ width: `${taskProgress}%` }}
                                />
                              </div>
                              <button
                                className="task-action"
                                onClick={() => {
                                  startTask(task);
                                }}
                              >
                                {taskTopics.length ? "Continue" : "View task"}{" "}
                                <ArrowRight size={15} />
                              </button>
                            </article>
                          );
                        })}
                      </section>
                      <section className="bottom-grid">
                        <div className="panel-card daily-card">
                          <div className="panel-title">
                            <div>
                              <h3>Word of the day</h3>
                              <p>A small phrase to add to your French.</p>
                            </div>
                            <div className="word-mark">
                              <BookOpen size={19} />
                            </div>
                          </div>
                          {vocabulary[0] ? (
                            <>
                              <div className="word-fr">
                                « {vocabulary[0].term} »{" "}
                                <button
                                  onClick={() =>
                                    speakFrench(vocabulary[0].term)
                                  }
                                  aria-label="Hear pronunciation"
                                >
                                  <Volume2 size={16} />
                                </button>
                              </div>
                              <div className="word-translation">
                                {vocabulary[0].meaning ?? ""}
                              </div>
                              <p className="word-example">
                                {vocabulary[0].example ??
                                  vocabulary[0].topic.title}
                              </p>
                            </>
                          ) : (
                            <p className="word-example">
                              No published vocabulary content yet.
                            </p>
                          )}
                          <button
                            className="outline-btn"
                            onClick={() => go("vocabulary")}
                          >
                            Explore vocabulary <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="panel-card focus-card">
                          <div className="panel-title">
                            <div>
                              <h3>Your weekly focus</h3>
                              <p>A balanced study routine.</p>
                            </div>
                            <span className="focus-badge">THIS WEEK</span>
                          </div>
                          {[
                            {
                              title: "Speaking practice",
                              topics: topics.filter(
                                (topic) =>
                                  topic.theme.task?.module.skill === "SPEAKING",
                              ),
                              icon: MessageCircle,
                              tone: "f1",
                              fill: "purple-fill",
                            },
                            {
                              title: "Writing practice",
                              topics: topics.filter(
                                (topic) =>
                                  topic.theme.task?.module.skill === "WRITING",
                              ),
                              icon: FileText,
                              tone: "f2",
                              fill: "blue-fill",
                            },
                            {
                              title: "Vocabulary library",
                              topics: [],
                              icon: BookOpen,
                              tone: "f3",
                              fill: "mint-fill",
                            },
                          ].map((item) => {
                            const total =
                              item.title === "Vocabulary library"
                                ? vocabulary.length
                                : item.topics.length;
                            const completed = item.topics.filter((topic) =>
                              completedTopicIds.has(topic.id),
                            ).length;
                            const percent = total
                              ? Math.round((completed / total) * 100)
                              : 0;
                            const Icon = item.icon;
                            return (
                              <div className="focus-row" key={item.title}>
                                <div className={`focus-icon ${item.tone}`}>
                                  <Icon size={16} />
                                </div>
                                <div className="focus-info">
                                  <b>{item.title}</b>
                                  <small>
                                    {item.title === "Vocabulary library"
                                      ? `${total} terms available`
                                      : `${completed} of ${total} topics completed`}
                                  </small>
                                  <div className="progress-track">
                                    <div
                                      className={`progress-fill ${item.fill}`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="focus-percent">
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </>
                  ) : (
                    <section className="guest-dashboard">
                      <div className="guest-dashboard-hero">
                        <div className="guest-dashboard-welcome">
                          <div className="guest-dashboard-icon">
                            <UserRound size={24} />
                          </div>
                          <span className="landing-section-kicker">
                            YOUR FRENCH JOURNEY STARTS HERE
                          </span>
                          <h1>Welcome to your learning space.</h1>
                          <p>
                            Sign in to continue learning, or create a free
                            account to save your progress and start your TCF
                            Canada preparation.
                          </p>
                          <div className="guest-dashboard-actions">
                            <button
                              className="primary-btn"
                              onClick={openSignIn}
                            >
                              Sign in <ArrowRight size={16} />
                            </button>
                            <button
                              className="outline-btn"
                              onClick={() => {
                                setAuthPurpose("SIGNUP");
                                setAuthError("");
                                setAuthNotice("");
                                setOtpSent(false);
                                setShowLogin(true);
                              }}
                            >
                              Register to start your journey
                            </button>
                          </div>
                        </div>
                        <aside className="guest-preview-panel">
                          <div className="guest-preview-heading">
                            <span className="guest-preview-icon">
                              <Mic size={17} />
                            </span>
                            <span>
                              <b>Explore a free preview</b>
                              <small>
                                One sample topic from each speaking task
                              </small>
                            </span>
                          </div>
                          {oralExpressionTasks.map((task, index) => {
                            const previewTopic =
                              index === 0
                                ? taskOneTopics[0]
                                : index === 1
                                  ? taskTwoSpeakingTopics[0]
                                  : taskThreeEssays[0];
                            return (
                              <button
                                className="guest-preview-task"
                                type="button"
                                key={task.type}
                                disabled={!previewTopic}
                                onClick={() => {
                                  setSelectedSpeakingTaskType(task.type);
                                  setSelectedSpeakingEssayId("");
                                  setSelectedSpeakingVersionId("");
                                  go("speaking");
                                }}
                              >
                                <span
                                  className={`guest-preview-number preview-tone-${index + 1}`}
                                >
                                  {index + 1}
                                </span>
                                <span>
                                  <b>{task.title}</b>
                                  <small>
                                    {previewTopic?.title ??
                                      "Preview coming soon"}
                                  </small>
                                </span>
                                <ArrowRight size={15} />
                              </button>
                            );
                          })}
                        </aside>
                      </div>
                      <div className="guest-dashboard-explore">
                        <h2>Choose a place to start</h2>
                        <div className="guest-dashboard-links">
                          {[
                            {
                              title: "Try a speaking preview",
                              description:
                                "Three task previews are ready to explore.",
                              icon: MessageCircle,
                              target: "speaking" as Page,
                            },
                            {
                              title: "Explore writing",
                              description:
                                "Build confidence with guided writing practice.",
                              icon: FileText,
                              target: "writing" as Page,
                            },
                            {
                              title: "Grow your vocabulary",
                              description:
                                "Learn useful French words in context.",
                              icon: BookOpen,
                              target: "vocabulary" as Page,
                            },
                            {
                              title: "Review grammar",
                              description:
                                "Strengthen your French foundations.",
                              icon: Sparkles,
                              target: "grammar" as Page,
                            },
                          ].map(
                            ({ title, description, icon: Icon, target }) => (
                              <button
                                className="guest-dashboard-link"
                                type="button"
                                key={title}
                                onClick={() => go(target)}
                              >
                                <span className="guest-dashboard-link-icon">
                                  <Icon size={18} />
                                </span>
                                <span>
                                  <b>{title}</b>
                                  <small>{description}</small>
                                </span>
                                <ArrowRight size={16} aria-hidden="true" />
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
              {page === "speaking" && (
                <>
                  <div className="oral-page-heading">
                    <div className="oral-page-icon">
                      <Mic size={22} />
                    </div>
                    <div>
                      <h1>Oral expression</h1>
                      <p>
                        Prepare for the TCF Canada oral exam with real-life
                        situations.
                      </p>
                    </div>
                  </div>
                  <div
                    className="oral-task-tabs"
                    role="group"
                    aria-label="Oral expression tasks"
                  >
                    {oralExpressionTasks.map((task, index) => {
                      const isSelected =
                        task.type === selectedSpeakingTaskSpec.type;
                      const TaskIcon = [UserRound, MessageCircle, Scale][index];
                      return (
                        <button
                          className={`oral-task-tab${isSelected ? " is-selected" : ""}`}
                          key={task.type}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setSelectedSpeakingTaskType(task.type);
                            setSelectedSpeakingTheme("ALL");
                            setTaskTwoPage(1);
                            setSelectedSpeakingEssayId("");
                            setSelectedSpeakingVersionId("");
                          }}
                        >
                          <TaskIcon size={22} aria-hidden="true" />
                          <span>
                            <b>{`Task ${index + 1}`}</b>
                            <small>{task.title}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <section className="oral-task-panel" aria-live="polite">
                    <div className="oral-task-art" aria-hidden="true">
                      <span className="oral-bubble-main">
                        <MessageCircle size={28} fill="currentColor" />
                      </span>
                      <span className="oral-bubble-small">
                        <MessageCircle size={20} fill="currentColor" />
                      </span>
                      <span className="oral-art-rays">{"///"}</span>
                    </div>
                    <div className="oral-task-copy">
                      <h3>{`Task ${oralExpressionTasks.findIndex((task) => task.type === selectedSpeakingTaskSpec.type) + 1} — ${selectedSpeakingTaskSpec.title}`}</h3>
                      <p>{selectedSpeakingTaskSpec.description}</p>
                      <span className="oral-task-duration">
                        <Clock3 size={16} /> Estimated duration:{" "}
                        <b>
                          {selectedSpeakingTaskSpec.type === "TASK2"
                            ? "3–4 min"
                            : formatDuration(
                                activeSpeakingTask.durationMinutes,
                              )}
                        </b>
                      </span>
                    </div>
                    <aside className="oral-task-action">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={() => {
                          if (selectedSpeakingTaskSpec.type === "TASK3") {
                            document
                              .getElementById("speaking-task-content")
                              ?.scrollIntoView({ behavior: "smooth" });
                          } else {
                            const firstTopic =
                              selectedSpeakingTaskSpec.type === "TASK1"
                                ? taskOneTopics[0]
                                : taskTwoSpeakingTopics[0];
                            if (firstTopic) startTopic(firstTopic);
                            else startTask(activeSpeakingTask);
                          }
                        }}
                        disabled={
                          selectedSpeakingTaskSpec.type === "TASK1" &&
                          taskOneTopics.length === 0
                        }
                      >
                        <Play size={15} />{" "}
                        {selectedSpeakingTaskSpec.type === "TASK3"
                          ? "Explore topics"
                          : "Practice this task"}
                      </button>
                    </aside>
                  </section>
                  <div id="speaking-task-content">
                    {selectedSpeakingTaskSpec.type === "TASK1" && (
                      <section className="oral-learning-section">
                        <div className="oral-scenarios-title">
                          <div>
                            <h2>Présentation topics</h2>
                            <p>
                              Choose an individual topic and explore its
                              learning content.
                            </p>
                          </div>
                          <span className="oral-total-count">
                            {taskOneTopics.length} topics
                          </span>
                        </div>
                        {taskOneTopics.length ? (
                          <div className="oral-task1-layout">
                            <div className="oral-task1-list">
                              {taskOneTopics.map((topic, index) => {
                                const isLocked = !sessionEmail && index > 0;
                                return (
                                  <button
                                    className={`oral-task1-topic${selectedPresentationTopic?.id === topic.id ? " is-active" : ""}${isLocked ? " guest-locked-topic" : ""}`}
                                    type="button"
                                    key={topic.id}
                                    onClick={() => {
                                      if (isLocked) openSignIn();
                                      else
                                        setSelectedPresentationTopicId(
                                          topic.id,
                                        );
                                    }}
                                  >
                                    <span>
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <b>{topic.title}</b>
                                    {isLocked ? (
                                      <LockKeyhole
                                        size={15}
                                        aria-label="Locked"
                                      />
                                    ) : (
                                      <ChevronRight size={16} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                            {selectedPresentationTopic && (
                              <article className="oral-task1-detail">
                                <h3>{selectedPresentationTopic.title}</h3>
                                {selectedPresentationTopic.situation && (
                                  <p>{selectedPresentationTopic.situation}</p>
                                )}
                                {selectedPresentationTopic.question && (
                                  <div>
                                    <b>Prompt</b>
                                    <p>{selectedPresentationTopic.question}</p>
                                  </div>
                                )}
                                {selectedPresentationTopic.modelAnswer && (
                                  <div>
                                    <b>Model answer</b>
                                    <p>
                                      {selectedPresentationTopic.modelAnswer}
                                    </p>
                                  </div>
                                )}
                                {selectedPresentationTopic.extraInformation && (
                                  <div>
                                    <b>Learning notes</b>
                                    <p>
                                      {
                                        selectedPresentationTopic.extraInformation
                                      }
                                    </p>
                                  </div>
                                )}
                                {selectedPresentationTopic.conclusion && (
                                  <div>
                                    <b>Closing</b>
                                    <p>
                                      {selectedPresentationTopic.conclusion}
                                    </p>
                                  </div>
                                )}
                                <button
                                  className="primary-btn"
                                  type="button"
                                  onClick={() =>
                                    startTopic(selectedPresentationTopic)
                                  }
                                >
                                  <Play size={14} /> Practise this topic
                                </button>
                              </article>
                            )}
                          </div>
                        ) : (
                          <div className="notice-box" role="status">
                            {contentLoading
                              ? "Loading Task 1 topics…"
                              : "No published Task 1 topics are available yet."}
                          </div>
                        )}
                      </section>
                    )}
                    {selectedSpeakingTaskSpec.type === "TASK2" && (
                      <section className="oral-task3-experience oral-task2-experience">
                        <div className="oral-task3-list-toolbar oral-task2-list-toolbar">
                          <label className="oral-task3-search">
                            <Search size={16} aria-hidden="true" />
                            <input
                              type="search"
                              value={speakingSearchQuery}
                              onChange={(event) => {
                                setSpeakingSearchQuery(event.target.value);
                                setTaskTwoPage(1);
                              }}
                              placeholder="Search a topic…"
                              aria-label="Search Task 2 topics"
                            />
                          </label>
                          <label className="oral-task3-select">
                            <span className="sr-only">Filter by category</span>
                            <select
                              value={selectedSpeakingTheme}
                              onChange={(event) => {
                                setSelectedSpeakingTheme(event.target.value);
                                setTaskTwoPage(1);
                              }}
                            >
                              <option value="ALL">All categories</option>
                              {speakingThemeOptions.map((theme) => (
                                <option value={theme.id} key={theme.id}>
                                  {theme.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={15} aria-hidden="true" />
                          </label>
                          <span className="oral-task3-count">
                            {filteredTaskTwoTopics.length} topics
                          </span>
                        </div>
                        {taskTwoSpeakingTopics.length ? (
                          visibleTaskTwoTopics.length ? (
                            <>
                              <div className="oral-task3-topic-grid">
                                {visibleTaskTwoTopics.map(
                                  ({ topic, category }, index) => {
                                    const CategoryIcon = speakingThemeIcon(category.slug);
                                    const isLocked =
                                      !sessionEmail &&
                                      topic.id !== taskTwoSpeakingTopics[0]?.id;
                                    return (
                                      <button
                                        type="button"
                                        className={`oral-task3-topic-card${isLocked ? " guest-locked-topic" : ""}`}
                                        key={topic.id}
                                        onClick={() => {
                                          if (isLocked) {
                                            openSignIn();
                                            return;
                                          }
                                          startTopic(topic);
                                        }}
                                      >
                                        <span className={`oral-task3-card-icon tone-${index % 4}`}>
                                          <CategoryIcon size={22} />
                                        </span>
                                        <span className="oral-task3-card-copy">
                                          <b>{topic.title}</b>
                                          <span>
                                            <i>{category.name}</i>
                                            <i>{countQuestionPrompts(topic.question)} questions</i>
                                          </span>
                                        </span>
                                        {isLocked ? (
                                          <LockKeyhole size={16} aria-label="Locked" />
                                        ) : (
                                          <ChevronRight size={18} />
                                        )}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                              <div className="oral-task3-pagination">
                                <span>
                                  Showing {(taskTwoPage - 1) * taskTwoPageSize + 1}–
                                  {Math.min(taskTwoPage * taskTwoPageSize, filteredTaskTwoTopics.length)} of {filteredTaskTwoTopics.length} topics
                                </span>
                                <div>
                                  <button
                                    type="button"
                                    aria-label="Previous page"
                                    disabled={taskTwoPage === 1}
                                    onClick={() => setTaskTwoPage((current) => Math.max(1, current - 1))}
                                  >
                                    <ArrowLeft size={16} />
                                  </button>
                                  {Array.from({ length: taskTwoPageCount }, (_, index) => index + 1).map((pageNumber) => (
                                    <button
                                      type="button"
                                      aria-current={taskTwoPage === pageNumber ? "page" : undefined}
                                      className={taskTwoPage === pageNumber ? "is-current" : ""}
                                      key={pageNumber}
                                      onClick={() => setTaskTwoPage(pageNumber)}
                                    >
                                      {pageNumber}
                                    </button>
                                  ))}
                                  <button
                                    type="button"
                                    aria-label="Next page"
                                    disabled={taskTwoPage === taskTwoPageCount}
                                    onClick={() => setTaskTwoPage((current) => Math.min(taskTwoPageCount, current + 1))}
                                  >
                                    <ArrowRight size={16} />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="notice-box" role="status">No topics match your search.</div>
                          )
                        ) : (
                          <div className="notice-box" role="status">
                            {contentLoading ? "Loading Task 2 situations…" : "No Task 2 situations are available yet."}
                          </div>
                        )}
                      </section>
                    )}
                    {selectedSpeakingTaskSpec.type === "TASK3" && (
                      <section className="oral-learning-section oral-task3-experience">
                        {taskThreeEssays.length ? (
                          selectedSpeakingEssay &&
                          (sessionEmail ||
                            selectedSpeakingEssay.id ===
                              taskThreeEssays[0]?.id) ? (
                            <>
                              <div className="oral-task3-detail-navigation">
                                <button
                                  type="button"
                                  className="oral-task3-back"
                                  onClick={() => {
                                    setSelectedSpeakingEssayId("");
                                    setSelectedSpeakingVersionId("");
                                  }}
                                >
                                  <ArrowLeft size={15} /> Back to all topics
                                </button>
                                <div>
                                  <button
                                    type="button"
                                    aria-label="Previous topic"
                                    disabled={
                                      taskThreeEssays.findIndex(
                                        (essay) =>
                                          essay.id === selectedSpeakingEssay.id,
                                      ) <= 0
                                    }
                                    onClick={() => {
                                      const index = taskThreeEssays.findIndex(
                                        (essay) =>
                                          essay.id === selectedSpeakingEssay.id,
                                      );
                                      const previous =
                                        taskThreeEssays[index - 1];
                                      if (previous) {
                                        setSelectedSpeakingEssayId(previous.id);
                                        setSelectedSpeakingVersionId(
                                          previous.versions.find((version) =>
                                            version.versionLabel
                                              .toLowerCase()
                                              .includes("plan"),
                                          )?.id ??
                                            previous.versions[0]?.id ??
                                            "",
                                        );
                                      }
                                    }}
                                  >
                                    <ArrowLeft size={15} /> Previous
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Next topic"
                                    disabled={
                                      taskThreeEssays.findIndex(
                                        (essay) =>
                                          essay.id === selectedSpeakingEssay.id,
                                      ) >=
                                      taskThreeEssays.length - 1
                                    }
                                    onClick={() => {
                                      const index = taskThreeEssays.findIndex(
                                        (essay) =>
                                          essay.id === selectedSpeakingEssay.id,
                                      );
                                      const next = taskThreeEssays[index + 1];
                                      if (next) {
                                        setSelectedSpeakingEssayId(next.id);
                                        setSelectedSpeakingVersionId(
                                          next.versions.find((version) =>
                                            version.versionLabel
                                              .toLowerCase()
                                              .includes("plan"),
                                          )?.id ??
                                            next.versions[0]?.id ??
                                            "",
                                        );
                                      }
                                    }}
                                  >
                                    Next <ArrowRight size={15} />
                                  </button>
                                </div>
                              </div>
                              <div className="oral-task3-detail-heading">
                                {(() => {
                                  const CategoryIcon = taskThreeCategoryIcon(
                                    taskThreeCategory(selectedSpeakingEssay),
                                  );
                                  return (
                                    <span className="oral-task3-detail-icon">
                                      <CategoryIcon size={28} />
                                    </span>
                                  );
                                })()}
                                <div>
                                  <h2>{selectedSpeakingEssay.title}</h2>
                                  <div className="oral-task3-meta">
                                    <span>
                                      {taskThreeCategory(selectedSpeakingEssay)}
                                    </span>
                                    {selectedSpeakingEssay.versions.some(
                                      (version) =>
                                        version.versionLabel
                                          .toLowerCase()
                                          .includes("clb 7"),
                                    ) && <span>CLB 7</span>}
                                    {selectedSpeakingEssay.versions.some(
                                      (version) =>
                                        version.versionLabel
                                          .toLowerCase()
                                          .includes("clb 5"),
                                    ) && <span>CLB 5–6</span>}
                                    <span>
                                      <Clock3 size={14} /> 2–3 minutes
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`oral-task3-icon-button${saved.includes(selectedSpeakingEssay.id) ? " is-saved" : ""}`}
                                  aria-label={
                                    saved.includes(selectedSpeakingEssay.id)
                                      ? "Remove bookmark"
                                      : "Bookmark topic"
                                  }
                                  onClick={() =>
                                    setSaved((current) =>
                                      current.includes(selectedSpeakingEssay.id)
                                        ? current.filter(
                                            (id) =>
                                              id !== selectedSpeakingEssay.id,
                                          )
                                        : [
                                            ...current,
                                            selectedSpeakingEssay.id,
                                          ],
                                    )
                                  }
                                >
                                  <Bookmark
                                    size={18}
                                    fill={
                                      saved.includes(selectedSpeakingEssay.id)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                                <button
                                  type="button"
                                  className="oral-task3-practice"
                                  onClick={() => startTask(activeSpeakingTask)}
                                >
                                  <Play size={15} /> Practise speaking
                                </button>
                              </div>
                              <div className="oral-task3-detail-layout">
                                <div className="oral-task3-main-content">
                                  {selectedSpeakingEssay.versions.length > 0 ? (
                                    <>
                                      <div
                                        className="oral-task3-detail-tabs"
                                        role="tablist"
                                        aria-label="Topic learning sections"
                                      >
                                        {[...selectedSpeakingEssay.versions]
                                          .sort(
                                            (left, right) =>
                                              taskThreeVersionOrder(
                                                left.versionLabel,
                                              ) -
                                              taskThreeVersionOrder(
                                                right.versionLabel,
                                              ),
                                          )
                                          .map((version) => (
                                            <button
                                              type="button"
                                              role="tab"
                                              aria-selected={
                                                selectedSpeakingVersion?.id ===
                                                version.id
                                              }
                                              className={
                                                selectedSpeakingVersion?.id ===
                                                version.id
                                                  ? "is-active"
                                                  : ""
                                              }
                                              key={version.id}
                                              onClick={() =>
                                                setSelectedSpeakingVersionId(
                                                  version.id,
                                                )
                                              }
                                            >
                                              {version.versionLabel
                                                .toLowerCase()
                                                .includes("plan") ? (
                                                <BookOpen size={16} />
                                              ) : version.versionLabel
                                                  .toLowerCase()
                                                  .includes("vocab") ? (
                                                <Bookmark size={16} />
                                              ) : (
                                                <FileText size={16} />
                                              )}
                                              {version.versionLabel
                                                .toLowerCase()
                                                .includes("clb")
                                                ? `Réponse ${version.versionLabel}`
                                                : version.versionLabel}
                                            </button>
                                          ))}
                                      </div>
                                      {selectedSpeakingVersion?.versionLabel
                                        .toLocaleLowerCase("fr")
                                        .includes("vocab") &&
                                      selectedSpeakingVocabulary.length > 0 ? (
                                        <article className="oral-task3-vocabulary-card">
                                          <header className="oral-task3-vocabulary-heading">
                                            <span>
                                              <BookOpen size={24} />
                                            </span>
                                            <div>
                                              <h3>Vocabulaire</h3>
                                              <p>Vocabulaire du sujet</p>
                                            </div>
                                          </header>
                                          <div className="oral-task3-vocabulary-table-wrap">
                                            <table>
                                              <thead>
                                                <tr>
                                                  <th>Français</th>
                                                  <th>English meaning</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {selectedSpeakingVocabulary.map(
                                                  (entry) => (
                                                    <tr key={entry.id}>
                                                      <th scope="row">
                                                        {entry.frenchTerm}
                                                        {entry.example && (
                                                          <small>
                                                            {entry.example}
                                                          </small>
                                                        )}
                                                      </th>
                                                      <td>
                                                        {entry.englishMeaning ||
                                                          "—"}
                                                      </td>
                                                    </tr>
                                                  ),
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                          <footer>
                                            {selectedSpeakingVocabulary.length}{" "}
                                            vocabulary terms
                                          </footer>
                                        </article>
                                      ) : (
                                        <article className="oral-task3-content-card">
                                          <h3>
                                            {selectedSpeakingVersion?.versionLabel ??
                                              "Topic content"}
                                          </h3>
                                          {selectedSpeakingVersion?.sections.map(
                                            (section) => (
                                              <section
                                                className="oral-task3-content-section"
                                                key={section.id}
                                              >
                                                {section.heading &&
                                                  normalizeTaskThreeHeading(
                                                    section.heading,
                                                  ) !==
                                                    normalizeTaskThreeHeading(
                                                      selectedSpeakingVersion.versionLabel,
                                                    ) && (
                                                    <h4>{section.heading}</h4>
                                                  )}
                                                <TaskThreeSectionContent
                                                  content={section.content}
                                                />
                                              </section>
                                            ),
                                          )}
                                        </article>
                                      )}
                                    </>
                                  ) : selectedSpeakingEssay.content ? (
                                    <article className="oral-task3-content-card">
                                      <h3>Existing response</h3>
                                      <TaskThreeSectionContent
                                        content={selectedSpeakingEssay.content}
                                      />
                                    </article>
                                  ) : (
                                    <div className="notice-box">
                                      No published structured versions are
                                      available for this topic yet.
                                    </div>
                                  )}
                                  {selectedSpeakingEssay.vocabulary.length >
                                    0 &&
                                    !selectedSpeakingVersion?.versionLabel
                                      .toLocaleLowerCase("fr")
                                      .includes("vocab") && (
                                      <section className="oral-task3-learning-block">
                                        <h4>Topic vocabulary</h4>
                                        <div className="oral-task3-vocabulary">
                                          {selectedSpeakingEssay.vocabulary.map(
                                            (entry) => (
                                              <article key={entry.id}>
                                                <b>{entry.frenchTerm}</b>
                                                {entry.englishMeaning && (
                                                  <span>
                                                    {entry.englishMeaning}
                                                  </span>
                                                )}
                                                {entry.example && (
                                                  <small>{entry.example}</small>
                                                )}
                                              </article>
                                            ),
                                          )}
                                        </div>
                                      </section>
                                    )}
                                  {selectedSpeakingEssay.grammarNotes.length >
                                    0 && (
                                    <section className="oral-task3-learning-block">
                                      <h4>Grammar notes</h4>
                                      <div className="oral-task3-grammar">
                                        {selectedSpeakingEssay.grammarNotes.map(
                                          (note) => (
                                            <article key={note.id}>
                                              <b>{note.structure}</b>
                                              {note.purpose && (
                                                <span>{note.purpose}</span>
                                              )}
                                              {note.explanation && (
                                                <p>{note.explanation}</p>
                                              )}
                                              {note.example && (
                                                <small>{note.example}</small>
                                              )}
                                            </article>
                                          ),
                                        )}
                                      </div>
                                    </section>
                                  )}
                                </div>
                                <aside className="oral-task3-sidebar">
                                  <section>
                                    <h3>
                                      <Sparkles size={16} /> Quick overview
                                    </h3>
                                    <dl>
                                      <div>
                                        <dt>Task</dt>
                                        <dd>Task 3 — Argumentation</dd>
                                      </div>
                                      <div>
                                        <dt>Level</dt>
                                        <dd>
                                          {selectedSpeakingEssay.versions
                                            .filter((version) =>
                                              version.versionLabel
                                                .toLowerCase()
                                                .includes("clb"),
                                            )
                                            .map(
                                              (version) => version.versionLabel,
                                            )
                                            .join(" / ") || "Practice"}
                                        </dd>
                                      </div>
                                      <div>
                                        <dt>Duration</dt>
                                        <dd>2–3 minutes</dd>
                                      </div>
                                      <div>
                                        <dt>Topic</dt>
                                        <dd>
                                          {taskThreeCategory(
                                            selectedSpeakingEssay,
                                          )}
                                        </dd>
                                      </div>
                                    </dl>
                                  </section>
                                  <section>
                                    <h3>
                                      <CheckCircle2 size={16} /> Speaking tips
                                    </h3>
                                    <ul>
                                      <li>State your opinion clearly.</li>
                                      <li>
                                        Support it with reasons and examples.
                                      </li>
                                      <li>Connect your ideas naturally.</li>
                                      <li>Finish with a concise conclusion.</li>
                                    </ul>
                                  </section>
                                </aside>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="oral-task3-list-toolbar">
                                <label className="oral-task3-search">
                                  <Search size={16} aria-hidden="true" />
                                  <input
                                    type="search"
                                    value={taskThreeSearch}
                                    onChange={(event) => {
                                      setTaskThreeSearch(event.target.value);
                                      setTaskThreePage(1);
                                    }}
                                    placeholder="Search a topic…"
                                    aria-label="Search Task 3 topics"
                                  />
                                </label>
                                <label className="oral-task3-select">
                                  <span className="sr-only">
                                    Filter by category
                                  </span>
                                  <select
                                    value={taskThreeCategoryFilter}
                                    onChange={(event) => {
                                      setTaskThreeCategoryFilter(
                                        event.target.value,
                                      );
                                      setTaskThreePage(1);
                                    }}
                                  >
                                    <option value="ALL">All categories</option>
                                    {taskThreeCategories.map((category) => (
                                      <option value={category} key={category}>
                                        {category}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown size={15} aria-hidden="true" />
                                </label>
                                <label className="oral-task3-select">
                                  <span className="sr-only">
                                    Filter by CLB level
                                  </span>
                                  <select
                                    value={taskThreeClb}
                                    onChange={(event) => {
                                      setTaskThreeClb(event.target.value);
                                      setTaskThreePage(1);
                                    }}
                                  >
                                    <option value="ALL">All CLB</option>
                                    <option value="CLB_7">CLB 7</option>
                                    <option value="CLB_5_6">CLB 5–6</option>
                                  </select>
                                  <ChevronDown size={15} aria-hidden="true" />
                                </label>
                                <span className="oral-task3-count">
                                  {filteredTaskThreeEssays.length} topics
                                </span>
                              </div>
                              {visibleTaskThreeEssays.length ? (
                                <>
                                  <div className="oral-task3-topic-grid">
                                    {visibleTaskThreeEssays.map(
                                      (essay, index) => {
                                        const category =
                                          taskThreeCategory(essay);
                                        const CategoryIcon =
                                          taskThreeCategoryIcon(category);
                                        const isLocked =
                                          !sessionEmail &&
                                          essay.id !== taskThreeEssays[0]?.id;
                                        const levels = [
                                          essay.versions.some((version) =>
                                            version.versionLabel
                                              .toLowerCase()
                                              .includes("clb 7"),
                                          )
                                            ? "CLB 7"
                                            : "",
                                          essay.versions.some((version) =>
                                            version.versionLabel
                                              .toLowerCase()
                                              .includes("clb 5"),
                                          )
                                            ? "5–6"
                                            : "",
                                        ]
                                          .filter(Boolean)
                                          .join(" / ");
                                        return (
                                          <button
                                            type="button"
                                            className={`oral-task3-topic-card${isLocked ? " guest-locked-topic" : ""}`}
                                            key={essay.id}
                                            onClick={() => {
                                              if (isLocked) {
                                                openSignIn();
                                                return;
                                              }
                                              setSelectedSpeakingEssayId(
                                                essay.id,
                                              );
                                              setSelectedSpeakingVersionId(
                                                essay.versions.find((version) =>
                                                  version.versionLabel
                                                    .toLowerCase()
                                                    .includes("plan"),
                                                )?.id ??
                                                  essay.versions.find(
                                                    (version) =>
                                                      version.versionLabel
                                                        .toLowerCase()
                                                        .includes("clb 7"),
                                                  )?.id ??
                                                  essay.versions[0]?.id ??
                                                  "",
                                              );
                                            }}
                                          >
                                            <span
                                              className={`oral-task3-card-icon tone-${index % 4}`}
                                            >
                                              <CategoryIcon size={22} />
                                            </span>
                                            <span className="oral-task3-card-copy">
                                              <b>{essay.title}</b>
                                              <span>
                                                <i>{category}</i>
                                                {levels && <i>{levels}</i>}
                                              </span>
                                            </span>
                                            {isLocked ? (
                                              <LockKeyhole
                                                size={16}
                                                aria-label="Locked"
                                              />
                                            ) : (
                                              <ChevronRight size={18} />
                                            )}
                                          </button>
                                        );
                                      },
                                    )}
                                  </div>
                                  <div className="oral-task3-pagination">
                                    <span>
                                      Showing{" "}
                                      {(taskThreePage - 1) * taskThreePageSize +
                                        1}
                                      –
                                      {Math.min(
                                        taskThreePage * taskThreePageSize,
                                        filteredTaskThreeEssays.length,
                                      )}{" "}
                                      of {filteredTaskThreeEssays.length} topics
                                    </span>
                                    <div>
                                      <button
                                        type="button"
                                        aria-label="Previous page"
                                        disabled={taskThreePage === 1}
                                        onClick={() =>
                                          setTaskThreePage((pageNumber) =>
                                            Math.max(1, pageNumber - 1),
                                          )
                                        }
                                      >
                                        <ArrowLeft size={16} />
                                      </button>
                                      {Array.from(
                                        { length: taskThreePageCount },
                                        (_, index) => index + 1,
                                      ).map((pageNumber) => (
                                        <button
                                          type="button"
                                          aria-current={
                                            taskThreePage === pageNumber
                                              ? "page"
                                              : undefined
                                          }
                                          className={
                                            taskThreePage === pageNumber
                                              ? "is-current"
                                              : ""
                                          }
                                          key={pageNumber}
                                          onClick={() =>
                                            setTaskThreePage(pageNumber)
                                          }
                                        >
                                          {pageNumber}
                                        </button>
                                      ))}
                                      <button
                                        type="button"
                                        aria-label="Next page"
                                        disabled={
                                          taskThreePage === taskThreePageCount
                                        }
                                        onClick={() =>
                                          setTaskThreePage((pageNumber) =>
                                            Math.min(
                                              taskThreePageCount,
                                              pageNumber + 1,
                                            ),
                                          )
                                        }
                                      >
                                        <ArrowRight size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="notice-box" role="status">
                                  {contentLoading
                                    ? "Loading Task 3 topics…"
                                    : "No topics match these filters."}
                                </div>
                              )}
                            </>
                          )
                        ) : (
                          <div className="notice-box" role="status">
                            {contentLoading
                              ? "Loading Task 3 topics…"
                              : "No published Task 3 topics are available yet."}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                </>
              )}
              {page === "writing" && (
                <>
                  <div className="page-intro">
                    <div className="eyebrow">
                      FRENCH EXAM · EXPRESSION ÉCRITE
                    </div>
                    <h1>Writing studio</h1>
                    <p className="subhead">
                      Turn your ideas into clear, structured French writing.
                    </p>
                  </div>
                  <div className="skill-banner writing-banner">
                    <div>
                      <span className="banner-label">WRITE WITH PURPOSE</span>
                      <h2>
                        Des idées claires.
                        <br />
                        Des mots justes.
                      </h2>
                      <p>
                        Practice short messages and opinion writing, one prompt
                        at a time.
                      </p>
                      <button
                        className="primary-btn"
                        onClick={() =>
                          writingTasks[0] && startTask(writingTasks[0])
                        }
                        disabled={!writingTasks.length}
                      >
                        Start writing <ArrowRight size={16} />
                      </button>
                    </div>
                    <div className="writing-art">
                      <div className="paper-sheet">
                        <div />
                        <div />
                        <div />
                        <div />
                        <span>Bonjour !</span>
                      </div>
                      <div className="pen-shape" />
                    </div>
                  </div>
                  <div className="section-heading">
                    <div>
                      <h3>Writing tasks</h3>
                      <p>Choose a format and get started.</p>
                    </div>
                  </div>
                  {writingTasks.length ? (
                    <div className="task-grid">
                      {writingTasks.map((t) => {
                        const { icon: Icon, tone } = taskPresentation(t.format);
                        return (
                          <article className="task-card" key={t.type}>
                            <div className="task-card-top">
                              <div className={`task-icon ${tone}`}>
                                <Icon size={20} />
                              </div>
                              <span className="level-chip">Writing</span>
                            </div>
                            <div className="task-kicker">
                              EXPRESSION ÉCRITE · {t.type}
                            </div>
                            <h4>{t.title}</h4>
                            <p>
                              {t.description ??
                                t.instructions ??
                                "Practice this writing task."}
                            </p>
                            <div className="task-meta">
                              <span>
                                <Clock3 size={13} />
                                {formatDuration(t.durationMinutes)}
                              </span>
                              <span>Practice</span>
                            </div>
                            <button
                              className="task-action"
                              onClick={() => startTask(t)}
                            >
                              Open writing editor <ArrowRight size={15} />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="notice-box" role="status">
                      <AlertCircle size={18} />
                      <div>
                        <b>No writing prompts are published yet.</b>
                        <p>
                          The writing studio will be available when course
                          prompts are added.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="notice-box">
                    <Sparkles size={18} />
                    <div>
                      <b>Your writing stays yours.</b>
                      <p>
                        This starter includes a practice editor and word
                        counter. Automated correction can be connected later
                        when a trusted provider is configured.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {page === "vocabulary" && (
                <>
                  <div className="page-intro">
                    <div className="eyebrow">BUILD YOUR FRENCH TOOLKIT</div>
                    <h1>Vocabulary library</h1>
                    <p className="subhead">
                      Useful phrases that help you sound more natural.
                    </p>
                  </div>
                  <div className="search-field">
                    <Search size={18} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search a phrase, meaning, or example…"
                    />
                    <span>{filteredVocab.length} phrases</span>
                  </div>
                  <div className="vocab-list">
                    {filteredVocabGroups.map((group) => (
                      <section
                        className="vocab-topic-group"
                        key={group[0].topic.id}
                      >
                        <h2>{group[0].topic.title}</h2>
                        {group.map((v, i) => (
                          <article className="vocab-card" key={v.id}>
                            <div className="vocab-number">
                              {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="vocab-body">
                              <h3>{v.term}</h3>
                              {v.meaning && (
                                <div className="vocab-en">{v.meaning}</div>
                              )}
                              {v.example && <p>{v.example}</p>}
                            </div>
                            <button
                              className={`bookmark-btn ${saved.includes(v.id) ? "is-saved" : ""}`}
                              onClick={() =>
                                setSaved((s) =>
                                  s.includes(v.id)
                                    ? s.filter((x) => x !== v.id)
                                    : [...s, v.id],
                                )
                              }
                              aria-label="Save phrase"
                            >
                              <Bookmark
                                size={17}
                                fill={
                                  saved.includes(v.id) ? "currentColor" : "none"
                                }
                              />
                            </button>
                          </article>
                        ))}
                      </section>
                    ))}
                  </div>
                </>
              )}
              {page === "grammar" && (
                <>
                  <section className="grammar-guide">
                    <header className="grammar-guide-heading">
                      <div className="grammar-guide-icon">
                        <BookOpen size={28} />
                      </div>
                      <div>
                        <span>GRAMMAR RULE</span>
                        <h1>Grammar guide</h1>
                      </div>
                    </header>
                    <div className="grammar-guide-list">
                      {grammarNotes.map((g, i) => (
                        <details className="grammar-guide-row" key={g.id}>
                          <summary>
                            <span
                              className="grammar-guide-index"
                              aria-hidden="true"
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <strong>{g.rule}</strong>
                            <span className="grammar-guide-preview">
                              {[g.example, g.explanation]
                                .filter(Boolean)
                                .join(" · ") || g.topic.title}
                            </span>
                            <ChevronRight
                              className="grammar-guide-chevron"
                              size={20}
                              aria-hidden="true"
                            />
                          </summary>
                          <div className="grammar-guide-details">
                            {g.example && (
                              <div>
                                <span>EXAMPLE</span>
                                <p>{g.example}</p>
                              </div>
                            )}
                            {g.explanation && (
                              <div>
                                <span>EXPLANATION</span>
                                <p>{g.explanation}</p>
                              </div>
                            )}
                            <small>{g.topic.title}</small>
                            <button
                              className="task-action"
                              onClick={() => {
                                setQuery(g.topic.title);
                                go("vocabulary");
                              }}
                            >
                              Explore examples <ArrowRight size={15} />
                            </button>
                          </div>
                        </details>
                      ))}
                      {!contentLoading && grammarNotes.length === 0 && (
                        <div className="notice-box">
                          No published grammar notes yet.
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
              {page === "practice" &&
                (practiceTopicLocked ? (
                  <section className="guest-dashboard">
                    <div className="guest-dashboard-icon">
                      <LockKeyhole size={24} />
                    </div>
                    <span className="landing-section-kicker">TOPIC LOCKED</span>
                    <h1>Sign in to continue practising.</h1>
                    <p>
                      Create an account or sign in to unlock this topic and
                      continue your TCF Canada preparation.
                    </p>
                    <div className="guest-dashboard-actions">
                      <button
                        className="primary-btn"
                        type="button"
                        onClick={openSignIn}
                      >
                        Sign in <ArrowRight size={16} />
                      </button>
                    </div>
                  </section>
                ) : (
                  <>
                    <button
                      className="back-link"
                      onClick={() =>
                        go(
                          activeTopic.includes("message") ||
                            activeTopic.toLowerCase().includes("writing")
                            ? "writing"
                            : "speaking",
                        )
                      }
                    >
                      <ArrowLeft size={15} /> Back to learning
                    </button>
                    <div className="practice-layout">
                      <section className="practice-main">
                        <div className="practice-topline">
                          <span className="level-chip">GUIDED PRACTICE</span>
                          <div className="practice-actions">
                            <span className="practice-timer">
                              <Clock3 size={14} /> Take your time
                            </span>
                            {!activeTask?.format.startsWith("WRITING") && (
                              <button
                                className={`practice-complete-btn${isTopicComplete ? " is-complete" : ""}`}
                                onClick={() => void savePractice()}
                              >
                                <CheckCircle2 size={15} />{" "}
                                {isTopicComplete
                                  ? "Completed"
                                  : "Mark complete"}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="eyebrow">FRENCH EXAM · PRACTICE</div>
                        <h1>{activeTopic || "Choose a published activity"}</h1>
                        <p className="subhead">
                          Read the prompt, prepare your response, and practise
                          at your own pace.
                        </p>
                        <div className="prompt-card">
                          <div className="prompt-label">
                            <MessageCircle size={16} /> YOUR PROMPT
                          </div>
                          <h3 style={{ whiteSpace: "pre-line" }}>
                            {activeTopicRecord?.situation ??
                              activeTask?.instructions ??
                              activeTask?.description ??
                              "No published prompt is available for this activity yet."}
                          </h3>
                          <div className="prompt-tip">
                            <Sparkles size={15} />
                            <span>
                              <b>Tip:</b> Start with a polite opening, ask one
                              clear question at a time, and use follow-up
                              questions naturally.
                            </span>
                          </div>
                        </div>
                        {activeTask?.format.startsWith("WRITING") ? (
                          <div className="editor-card">
                            <div className="editor-toolbar">
                              <span>YOUR RESPONSE</span>
                              <span>
                                {answer.trim()
                                  ? answer.trim().split(/\s+/).length
                                  : 0}{" "}
                                words
                              </span>
                            </div>
                            <textarea
                              value={answer}
                              onChange={(e) => {
                                setAnswer(e.target.value);
                                setSubmitted(false);
                              }}
                              placeholder="Commencez à écrire votre réponse ici…"
                              rows={9}
                            />
                            <div className="editor-footer">
                              <span>
                                Tip: use connectors to structure your ideas.
                              </span>
                              <button
                                className="primary-btn"
                                onClick={() => void savePractice()}
                              >
                                Save practice <Check size={15} />
                              </button>
                            </div>
                            {submitted && (
                              <div className="success-message">
                                <CheckCircle2 size={16} />{" "}
                                {window.sessionStorage.getItem(
                                  "learner-access-token",
                                )
                                  ? "Progress saved to your account."
                                  : "Practice marked for this session. Sign in to sync progress."}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="question-builder">
                            <div className="builder-head">
                              <div>
                                <h3>Your role-play guide</h3>
                                <p>
                                  Use the opening, choose questions in any
                                  order, then finish naturally.
                                </p>
                              </div>
                              <span>
                                {countQuestionPrompts(
                                  activeTopicRecord?.question ?? null,
                                )}{" "}
                                questions
                              </span>
                            </div>
                            {scenarioExercise.opening && (
                              <div className="scenario-opening">
                                <span className="scenario-kicker">
                                  <MessageCircle size={14} /> SAMPLE OPENING
                                </span>
                                <p>{scenarioExercise.opening}</p>
                              </div>
                            )}
                            {scenarioExercise.groups.length ? (
                              <div className="scenario-groups">
                                {scenarioExercise.groups.map((section) => (
                                  <section
                                    className="scenario-group"
                                    key={`${activeTopicRecord?.id}-${section.title}`}
                                  >
                                    <h4>{section.title}</h4>
                                    <div className="scenario-question-grid">
                                      {section.questions.map((item) => (
                                        <article
                                          className="scenario-question-card"
                                          key={item.number}
                                        >
                                          <span className="scenario-question-number">
                                            {String(item.number).padStart(
                                              2,
                                              "0",
                                            )}
                                          </span>
                                          <p>{item.text}</p>
                                        </article>
                                      ))}
                                    </div>
                                  </section>
                                ))}
                              </div>
                            ) : (
                              <p className="scenario-empty">
                                {activeTask?.instructions ??
                                  "No published questions are available for this activity yet."}
                              </p>
                            )}
                            {scenarioExercise.closing && (
                              <div className="scenario-closing">
                                <span className="scenario-kicker">
                                  <CheckCircle2 size={14} /> SAMPLE CLOSING
                                </span>
                                <p>{scenarioExercise.closing}</p>
                              </div>
                            )}
                            {submitted && (
                              <div className="success-message">
                                <CheckCircle2 size={16} />{" "}
                                {window.sessionStorage.getItem(
                                  "learner-access-token",
                                )
                                  ? "Progress saved to your account."
                                  : "Practice marked for this session. Sign in to sync progress."}
                              </div>
                            )}
                          </div>
                        )}
                        {activeTopicRecord && (
                          <section className="topic-vocab-panel">
                            <div className="topic-vocab-heading">
                              <div className="topic-vocab-icon">
                                <BookOpen size={17} />
                              </div>
                              <div>
                                <span>BUILD YOUR FRENCH TOOLKIT</span>
                                <h3>Vocabulary for this topic</h3>
                              </div>
                              <span className="topic-vocab-count">
                                {activeTopicVocabulary.length} terms
                              </span>
                            </div>
                            {activeTopicVocabulary.length ? (
                              <div className="topic-vocab-grid">
                                {activeTopicVocabulary.map((entry) => (
                                  <article
                                    className="topic-vocab-item"
                                    key={entry.id}
                                  >
                                    <button
                                      type="button"
                                      className="topic-vocab-term"
                                      onClick={() => speakFrench(entry.term)}
                                      aria-label={`Hear French pronunciation of ${entry.term}`}
                                    >
                                      <b>{entry.term}</b>
                                      <Volume2 size={14} aria-hidden="true" />
                                    </button>
                                    {entry.meaning && (
                                      <span>{entry.meaning}</span>
                                    )}
                                    {entry.example && (
                                      <small>{entry.example}</small>
                                    )}
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p className="topic-vocab-empty">
                                Vocabulary for this topic has not been added
                                yet.
                              </p>
                            )}
                          </section>
                        )}
                        {activeTopicRecord?.theme.task?.type === "TASK2" &&
                          (activeTopicGrammarNotes.length > 0 ||
                            activeTopicGrammarFallback) && (
                            <section className="topic-grammar-panel">
                              <div className="topic-grammar-heading">
                                <div className="topic-grammar-icon">
                                  <Sparkles size={17} />
                                </div>
                                <div>
                                  <span>GRAMMAR FOR THIS TASK 2 TOPIC</span>
                                  <h3>Grammar for this topic</h3>
                                  <p>
                                    A quick grammar guide for using French in
                                    this situation.
                                  </p>
                                </div>
                                <span className="topic-grammar-count">
                                  {activeTopicGrammarNotes.length || 1}{" "}
                                  {activeTopicGrammarNotes.length === 1
                                    ? "note"
                                    : "notes"}
                                </span>
                              </div>
                              {activeTopicGrammarNotes.length ? (
                                <div className="topic-grammar-grid">
                                  {activeTopicGrammarNotes.map(
                                    (note, index) => (
                                      <article
                                        className="topic-grammar-item"
                                        key={note.id}
                                      >
                                        <span className="topic-grammar-index">
                                          {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <div className="topic-grammar-content">
                                          <span className="topic-grammar-label">
                                            GRAMMAR RULE
                                          </span>
                                          <h4>{note.rule}</h4>
                                          {note.explanation && (
                                            <div className="topic-grammar-detail">
                                              <span>EXPLANATION</span>
                                              <p>{note.explanation}</p>
                                            </div>
                                          )}
                                          {note.example && (
                                            <div className="topic-grammar-example">
                                              <span>EXAMPLE</span>
                                              <p>{note.example}</p>
                                            </div>
                                          )}
                                        </div>
                                      </article>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <article className="topic-grammar-item topic-grammar-fallback">
                                  <span className="topic-grammar-index">
                                    <BookOpen size={17} />
                                  </span>
                                  <div className="topic-grammar-content">
                                    <span className="topic-grammar-label">
                                      GRAMMAR RULE
                                    </span>
                                    <h4>Grammar guide</h4>
                                    <p className="topic-grammar-legacy">
                                      {activeTopicGrammarFallback}
                                    </p>
                                  </div>
                                </article>
                              )}
                            </section>
                          )}
                      </section>
                      <aside className="practice-side">
                        <div className="side-card">
                          <div className="side-card-icon">
                            <Target size={18} />
                          </div>
                          <h3>What to focus on</h3>
                          <ul>
                            <li>
                              <CheckCircle2 size={15} /> Be polite and clear
                            </li>
                            <li>
                              <CheckCircle2 size={15} /> Ask complete questions
                            </li>
                            <li>
                              <CheckCircle2 size={15} /> Add a follow-up
                            </li>
                            <li>
                              <CheckCircle2 size={15} /> Speak at a natural pace
                            </li>
                          </ul>
                        </div>
                        <div className="side-card encouragement">
                          <Sparkles size={19} />
                          <h3>Progress over perfection.</h3>
                          <p>
                            You don’t need to get every word right. Practising
                            is how you improve.
                          </p>
                        </div>
                      </aside>
                    </div>
                  </>
                ))}
              {page === "pricing" && (
                <>
                  <div className="pricing-intro">
                    <div className="eyebrow">A PLAN THAT FITS YOUR JOURNEY</div>
                    <h1>
                      Make room for <em>more progress.</em>
                    </h1>
                    <p className="subhead">
                      Start for free. Unlock more when you’re ready.
                    </p>
                  </div>
                  <div className="pricing-grid">
                    <article className="price-card">
                      <span className="plan-label">STARTER</span>
                      <h3>Free</h3>
                      <p>
                        Build a daily habit and explore the learning experience.
                      </p>
                      <div className="price-amount">
                        ₹0 <small>forever</small>
                      </div>
                      <button
                        className="outline-btn full-btn"
                        onClick={() => {
                          go("dashboard");
                        }}
                      >
                        Your current plan <Check size={15} />
                      </button>
                      <ul>
                        <li>
                          <Check size={15} /> Selected learning examples
                        </li>
                        <li>
                          <Check size={15} /> Vocabulary and grammar basics
                        </li>
                        <li>
                          <Check size={15} /> Progress preview
                        </li>
                        <li className="not-included">
                          <X size={15} /> Full practice library
                        </li>
                        <li className="not-included">
                          <X size={15} /> Full mock exams
                        </li>
                      </ul>
                    </article>
                    <article className="price-card featured-plan">
                      <div className="popular-tag">
                        <Sparkles size={13} /> MOST FLEXIBILITY
                      </div>
                      <span className="plan-label">PLUS</span>
                      <h3>Full preparation</h3>
                      <p>
                        Go deeper with structured practice and exam-style
                        activities.
                      </p>
                      <div className="price-amount">
                        Set your price <small>before launch</small>
                      </div>
                      <button
                        className="primary-btn full-btn"
                        onClick={() => setShowUpgrade(true)}
                      >
                        Join the waitlist <ArrowRight size={15} />
                      </button>
                      <ul>
                        <li>
                          <Check size={15} /> Full speaking and writing library
                        </li>
                        <li>
                          <Check size={15} /> Practice sets and simulations
                        </li>
                        <li>
                          <Check size={15} /> Detailed progress history
                        </li>
                        <li>
                          <Check size={15} /> Saved activities and drafts
                        </li>
                        <li>
                          <Check size={15} /> Subscription access controls
                        </li>
                      </ul>
                      <div className="plan-footnote">
                        <ShieldCheck size={14} /> Secure checkout will be
                        enabled after payment setup.
                      </div>
                    </article>
                  </div>
                  <p className="pricing-disclaimer">
                    Pricing and checkout are not live in this preview. Final
                    plans, billing period, taxes, and refund terms must be
                    configured before accepting payments.
                  </p>
                </>
              )}
              <footer className="page-footer">
                <div>
                  <span className="footer-logo">Chez Harneet</span>
                  <span>Made for your next French milestone.</span>
                </div>
                <span>
                  © 2026 Chez Harneet. All rights reserved. · Independent French
                  preparation · Not an official examination provider
                </span>
              </footer>
            </>
          )}
        </div>
      </main>
      {showUpgrade && (
        <div className="modal-backdrop" onClick={() => setShowUpgrade(false)}>
          <section className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => setShowUpgrade(false)}
            >
              <X size={18} />
            </button>
            <div className="modal-symbol">
              <Crown size={22} />
            </div>
            <div className="eyebrow">CHEZ HARNEET PLUS</div>
            <h2>Your next level is on its way.</h2>
            <p>
              We&apos;re preparing full practice sets, mock exams, and more
              detailed progress tools. Paid access is not enabled yet, so you
              won&apos;t be charged.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowUpgrade(false);
                setShowLogin(false);
                alert(
                  "Thanks — waitlist sign-up is a preview only until a backend is connected.",
                );
              }}
            >
              <label htmlFor="waitlist-email">Email address</label>
              <input
                id="waitlist-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="primary-btn full-btn" type="submit">
                Notify me when it’s ready <ArrowRight size={15} />
              </button>
            </form>
            <small className="modal-safe">
              <ShieldCheck size={13} /> No payment is collected in this preview.
            </small>
          </section>
        </div>
      )}
      {showLogin && (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <section className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              aria-label="Close dialog"
              onClick={() => {
                setShowLogin(false);
                setAuthError("");
              }}
            >
              <X size={18} />
            </button>
            <div className="modal-symbol">
              <UserRound size={22} />
            </div>
            <div className="eyebrow">WELCOME BACK</div>
            <h2>Your learning, all in one place.</h2>
            {sessionEmail ? (
              <>
                <p>
                  Signed in as <strong>{sessionEmail}</strong> ·{" "}
                  {sessionRole.replace("_", " ")}.
                </p>
                <form onSubmit={saveProfile}>
                  <label htmlFor="profile-first-name">First name</label>
                  <input
                    id="profile-first-name"
                    value={profileFirstName}
                    maxLength={80}
                    onChange={(event) =>
                      setProfileFirstName(event.target.value)
                    }
                  />
                  <label htmlFor="profile-last-name">Last name</label>
                  <input
                    id="profile-last-name"
                    value={profileLastName}
                    maxLength={80}
                    onChange={(event) => setProfileLastName(event.target.value)}
                  />
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={profilePhone}
                    maxLength={30}
                    onChange={(event) => setProfilePhone(event.target.value)}
                  />
                  {authError && (
                    <p role="alert" className="auth-message auth-error">
                      {authError}
                    </p>
                  )}
                  {authNotice && <p className="auth-message">{authNotice}</p>}
                  <button
                    className="primary-btn full-btn"
                    type="submit"
                    disabled={authBusy}
                  >
                    {authBusy ? "Saving…" : "Save profile"} <Check size={15} />
                  </button>
                </form>
                <button className="auth-back" onClick={() => void signOut()}>
                  Sign out <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <p>
                  Use your email to sign in or create a learner account with a
                  one-time code.
                </p>
                {!otpSent ? (
                  <form onSubmit={requestAuthCode}>
                    <label htmlFor="learner-auth-email">Email address</label>
                    <input
                      id="learner-auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                    <div className="auth-mode-switch">
                      <button
                        type="button"
                        className={authPurpose === "LOGIN" ? "selected" : ""}
                        onClick={() => {
                          setAuthPurpose("LOGIN");
                          setAuthError("");
                        }}
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        className={authPurpose === "SIGNUP" ? "selected" : ""}
                        onClick={() => {
                          setAuthPurpose("SIGNUP");
                          setAuthError("");
                        }}
                      >
                        Create account
                      </button>
                    </div>
                    {authError && (
                      <p role="alert" className="auth-message auth-error">
                        {authError}
                      </p>
                    )}
                    <button
                      className="primary-btn full-btn"
                      type="submit"
                      disabled={authBusy}
                    >
                      {authBusy ? "Sending code…" : "Send sign-in code"}{" "}
                      <ArrowRight size={15} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={verifyAuthCode}>
                    <p>
                      {authNotice}{" "}
                      {devCode && (
                        <span>
                          Development code: <strong>{devCode}</strong>
                        </span>
                      )}
                    </p>
                    <label htmlFor="learner-auth-code">Six-digit code</label>
                    <input
                      id="learner-auth-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={authCode}
                      onChange={(event) =>
                        setAuthCode(event.target.value.replace(/\D/g, ""))
                      }
                    />
                    {authError && (
                      <p role="alert" className="auth-message auth-error">
                        {authError}
                      </p>
                    )}
                    <button
                      className="primary-btn full-btn"
                      type="submit"
                      disabled={authBusy || authCode.length !== 6}
                    >
                      {authBusy ? "Verifying…" : "Verify and continue"}{" "}
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      className="auth-back"
                      onClick={() => {
                        setOtpSent(false);
                        setAuthCode("");
                        setAuthError("");
                      }}
                    >
                      Use another email
                    </button>
                  </form>
                )}
                {authNotice && !otpSent && (
                  <p className="auth-message">{authNotice}</p>
                )}
              </>
            )}
            <small className="modal-safe">
              <LockKeyhole size={13} /> Your password is never requested.
            </small>
          </section>
        </div>
      )}
    </div>
  );
  return translateUi(app, language);
}
