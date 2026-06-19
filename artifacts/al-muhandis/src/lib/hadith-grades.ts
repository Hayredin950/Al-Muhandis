export type GradeCategory = "authentic" | "good" | "weak" | "fabricated" | "disconnected" | "special";

export interface HadithGrade {
  id: string;
  name: string;
  nameArabic: string;
  nameArabicVocalized: string;
  category: GradeCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  rank: number;
  shortDesc: string;
  fullDesc: string;
  criteria: string[];
  example?: string;
  usableAsEvidence: boolean;
}

export const HADITH_GRADES: HadithGrade[] = [
  // ── AUTHENTIC ─────────────────────────────────────────────────────────
  {
    id: "sahih-li-dhatihi",
    name: "Sahih li-dhatihi",
    nameArabic: "صحيح لذاته",
    nameArabicVocalized: "صَحِيحٌ لِذَاتِهِ",
    category: "authentic",
    color: "#10b981",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    rank: 1,
    shortDesc: "Authentic — Highest Grade",
    fullDesc: "The highest grade in hadith science. A hadith narrated through a completely connected chain of thoroughly trustworthy (thiqa) narrators with sound memory, free from any irregularity (shadh) or hidden defect (illah).",
    criteria: [
      "Fully connected chain (ittisāl al-sanad) — no missing links",
      "Every narrator is 'ādil (upright) — Muslim, mature, sane, free from major sins",
      "Every narrator has dabt (precision) — excellent memory and accuracy",
      "Free from shadh (anomaly) — not contradicting a stronger narration",
      "Free from illah (hidden defect) — no subtle flaw discovered by experts",
    ],
    example: "Bukhari #1: 'Actions are by intentions' — chain: Humaidi → Sufyan ibn Uyayna → Yahya al-Ansari → Muhammad al-Taymi → Alqama → Umar ibn al-Khattab",
    usableAsEvidence: true,
  },
  {
    id: "sahih-li-ghayrihi",
    name: "Sahih li-ghayrihi",
    nameArabic: "صحيح لغيره",
    nameArabicVocalized: "صَحِيحٌ لِغَيْرِهِ",
    category: "authentic",
    color: "#34d399",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    textColor: "text-emerald-300",
    rank: 2,
    shortDesc: "Authentic — By Corroboration",
    fullDesc: "A hadith that was originally Hasan li-dhatihi but has been elevated to Sahih through supporting narrations (shawahid and mutabi'at) from other chains that remove doubts about the slight weakness in the original chain.",
    criteria: [
      "Originally a Hasan hadith with a slight weakness",
      "The weakness is overcome by supporting narrations from other chains",
      "Supporting chains each independently confirm the hadith's content",
      "The combined weight of evidence elevates it to Sahih",
    ],
    usableAsEvidence: true,
  },
  {
    id: "hasan-li-dhatihi",
    name: "Hasan li-dhatihi",
    nameArabic: "حسن لذاته",
    nameArabicVocalized: "حَسَنٌ لِذَاتِهِ",
    category: "good",
    color: "#3b82f6",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
    rank: 3,
    shortDesc: "Good — Acceptable",
    fullDesc: "A hadith meeting most criteria of Sahih but with a narrator graded 'saduq' (truthful but with occasional errors in memory) rather than 'thiqa thabt'. Fully accepted as Islamic evidence (hujja) by scholars.",
    criteria: [
      "Connected chain with no missing links",
      "All narrators are 'ādil (upright) but one or more rated saduq rather than thiqa",
      "The saduq narrator is known for occasional memory lapses but is not accused of lying",
      "Free from shadh and illah",
      "Below Sahih only due to slightly lower narrator precision",
    ],
    usableAsEvidence: true,
  },
  {
    id: "hasan-li-ghayrihi",
    name: "Hasan li-ghayrihi",
    nameArabic: "حسن لغيره",
    nameArabicVocalized: "حَسَنٌ لِغَيْرِهِ",
    category: "good",
    color: "#60a5fa",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    textColor: "text-blue-300",
    rank: 4,
    shortDesc: "Good — By Corroboration",
    fullDesc: "A weak hadith that, when corroborated by other weak narrations on the same subject, rises to the level of Hasan. No single chain is sufficient alone, but multiple weak chains together provide acceptable evidence.",
    criteria: [
      "Originally a Da'if hadith with a mild weakness",
      "Multiple other chains narrate the same content",
      "Each supporting chain is independently weak but the combined weight is sufficient",
      "The weakness in each chain is not due to lying or fabrication (only poor memory or uncertainty)",
    ],
    usableAsEvidence: true,
  },

  // ── WEAK ──────────────────────────────────────────────────────────────
  {
    id: "daif",
    name: "Da'if",
    nameArabic: "ضعيف",
    nameArabicVocalized: "ضَعِيفٌ",
    category: "weak",
    color: "#f59e0b",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
    rank: 5,
    shortDesc: "Weak — Not Used as Primary Evidence",
    fullDesc: "A hadith that fails to meet one or more criteria of Sahih or Hasan. Weakness may be in the chain (missing link, weak narrator) or in the text. Da'if hadiths are generally not used as independent evidence in Islamic law but may be cited for virtuous deeds (fada'il al-a'mal) by some scholars.",
    criteria: [
      "Fails one or more of the five criteria of Sahih",
      "Most commonly: a narrator with poor memory, or an unknown narrator (majhul)",
      "Or: a gap in the chain of transmission",
      "Not due to lying or fabrication — narrator is just unreliable",
    ],
    usableAsEvidence: false,
  },
  {
    id: "daif-jiddan",
    name: "Da'if Jiddan",
    nameArabic: "ضعيف جداً",
    nameArabicVocalized: "ضَعِيفٌ جِدَّاً",
    category: "weak",
    color: "#f97316",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/40",
    textColor: "text-orange-400",
    rank: 6,
    shortDesc: "Very Weak — Multiple Defects",
    fullDesc: "A hadith with very severe weakness, often due to multiple defects in the chain or a narrator accused of serious unreliability. Not used as evidence even for virtuous deeds by most scholars.",
    criteria: [
      "Multiple defects in the chain or text",
      "Narrator accused of lying or extreme carelessness",
      "Or: narrator known for matruk (abandoned) status",
      "Or: isolated from all reliable chains with no supporting evidence",
    ],
    usableAsEvidence: false,
  },
  {
    id: "munkar",
    name: "Munkar",
    nameArabic: "منكر",
    nameArabicVocalized: "مُنْكَرٌ",
    category: "weak",
    color: "#ef4444",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    rank: 7,
    shortDesc: "Denounced — Contradicts Reliable Narrations",
    fullDesc: "A hadith narrated by a weak narrator that contradicts what reliable (thiqa) narrators have reported. The contradiction with stronger evidence makes it 'denounced.' Imam Ahmad said: 'If a weak narrator contradicts thiqa narrators, his hadith is munkar.'",
    criteria: [
      "Narrated by a weak (da'if) narrator",
      "The content contradicts what trustworthy (thiqa) narrators have reported",
      "The contradiction cannot be reconciled by interpretation",
      "Represents an anomaly that goes against the established narrations",
    ],
    usableAsEvidence: false,
  },
  {
    id: "shadh",
    name: "Shadh",
    nameArabic: "شاذ",
    nameArabicVocalized: "شَاذٌّ",
    category: "weak",
    color: "#a78bfa",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    textColor: "text-violet-400",
    rank: 8,
    shortDesc: "Anomalous — Reliable Narrator Contradicts Majority",
    fullDesc: "A hadith where a reliable narrator contradicts what other more reliable or more numerous narrators have reported. Unlike Munkar (which involves a weak narrator), Shadh involves a trustworthy narrator going against the majority. The more widely corroborated narration is preferred.",
    criteria: [
      "Narrated by a trustworthy (thiqa) narrator",
      "However, the narrator contradicts other narrators who are more reliable or more numerous",
      "The isolated narration cannot be reconciled with the majority narration",
      "Imam al-Shafi'i defined it as a reliable narrator contradicting those more reliable",
    ],
    usableAsEvidence: false,
  },
  {
    id: "muallal",
    name: "Mu'allal",
    nameArabic: "معلل",
    nameArabicVocalized: "مُعَلَّلٌ",
    category: "weak",
    color: "#c084fc",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    rank: 9,
    shortDesc: "Defective — Hidden Flaw Discovered",
    fullDesc: "A hadith that appears sound on the surface but has a subtle hidden defect ('illah) discovered by expert hadith critics through deep examination of the chains. This is considered the most difficult science in hadith criticism — only the greatest masters could detect these defects.",
    criteria: [
      "Appears to be Sahih on the surface",
      "A hidden defect exists — usually discovered by comparing multiple chains",
      "Defect may be: wrong attribution to Prophet vs. Companion, incorrect narrator in chain, chain confusion",
      "Requires the highest level of hadith expertise to identify",
      "Imam al-Daraqutni's 'Al-Ilal' and Ibn Rajab's works are key sources",
    ],
    usableAsEvidence: false,
  },
  {
    id: "mudtarib",
    name: "Mudtarib",
    nameArabic: "مضطرب",
    nameArabicVocalized: "مُضْطَرِبٌ",
    category: "weak",
    color: "#fb923c",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    textColor: "text-orange-300",
    rank: 10,
    shortDesc: "Confused — Contradictory Versions",
    fullDesc: "A hadith narrated in contradictory versions that cannot be reconciled. The confusion may be in the chain (one narrator names different people) or in the text (different versions of the same event). When two versions are equally strong and irreconcilable, the hadith is mudtarib.",
    criteria: [
      "The hadith is narrated in two or more contradictory versions",
      "The contradiction is in the chain (sanad) or the text (matn)",
      "The contradictory versions are of equal strength — neither can be preferred",
      "Reconciliation or preference between versions is not possible",
    ],
    usableAsEvidence: false,
  },

  // ── DISCONNECTED ──────────────────────────────────────────────────────
  {
    id: "mursal",
    name: "Mursal",
    nameArabic: "مرسل",
    nameArabicVocalized: "مُرْسَلٌ",
    category: "disconnected",
    color: "#facc15",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
    rank: 11,
    shortDesc: "Disconnected — Tabi'i Skips Companion",
    fullDesc: "A hadith where a Tabi'i narrates directly from the Prophet ﷺ, omitting the Companion intermediary. The missing Companion link introduces uncertainty — the omitted narrator could be a Companion (in which case the hadith is still sound) or could be an unknown Tabi'i (in which case it is weak). Imam al-Shafi'i rejected mursal hadiths as evidence; Imam Malik and Ahmad accepted mursal hadiths from reliable Tabi'in.",
    criteria: [
      "A Tabi'i says 'The Prophet ﷺ said...' or 'The Prophet ﷺ did...' directly",
      "The Companion link between the Tabi'i and the Prophet is missing",
      "The unknown link could be a reliable Companion or an unknown narrator",
      "Imam al-Shafi'i: rejected as evidence. Imam Malik: accepted from reliable Tabi'in",
    ],
    usableAsEvidence: false,
  },
  {
    id: "munqati",
    name: "Munqati'",
    nameArabic: "منقطع",
    nameArabicVocalized: "مُنْقَطِعٌ",
    category: "disconnected",
    color: "#fbbf24",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    textColor: "text-yellow-300",
    rank: 12,
    shortDesc: "Broken Chain — One Link Missing",
    fullDesc: "A hadith where a single link is missing anywhere in the chain — except at the Companion level (which would make it Mursal). The missing link introduces an unknown narrator who cannot be assessed for reliability.",
    criteria: [
      "One link is missing from the chain (anywhere except the Companion level)",
      "The narrator mentions a person he could not have met or studied under",
      "Historical records show the narrator was born after his alleged teacher died",
    ],
    usableAsEvidence: false,
  },
  {
    id: "muadal",
    name: "Mu'dal",
    nameArabic: "معضل",
    nameArabicVocalized: "مُعْضَلٌ",
    category: "disconnected",
    color: "#fcd34d",
    bgColor: "bg-yellow-300/10",
    borderColor: "border-yellow-300/30",
    textColor: "text-yellow-200",
    rank: 13,
    shortDesc: "Doubly Broken — Two+ Links Missing",
    fullDesc: "A hadith where two or more consecutive links are missing from the chain. More severe than Munqati'. Introduces multiple unknown narrators making authentication impossible.",
    criteria: [
      "Two or more consecutive links are missing",
      "The narrator skips two generations in the chain",
      "Even if the known narrators are reliable, the multiple missing links make it unacceptable",
    ],
    usableAsEvidence: false,
  },

  // ── SPECIAL / FABRICATED ─────────────────────────────────────────────
  {
    id: "matruk",
    name: "Matruk",
    nameArabic: "متروك",
    nameArabicVocalized: "مَتْرُوكٌ",
    category: "fabricated",
    color: "#dc2626",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-600/30",
    textColor: "text-red-400",
    rank: 14,
    shortDesc: "Abandoned — Narrator Accused of Lying",
    fullDesc: "A hadith containing a narrator who has been accused of lying in hadith specifically (even if they do not lie in everyday speech), or who frequently makes contradictory narrations. The chain is effectively rejected by the entire scholarly community.",
    criteria: [
      "Contains a narrator accused of deliberate lying in hadith transmission",
      "Or: a narrator who frequently contradicts reliable narrators",
      "Or: a narrator whose narrations are mostly denounced (munkar)",
      "The hadith requires another reliable chain to even be considered",
    ],
    usableAsEvidence: false,
  },
  {
    id: "mawdu",
    name: "Mawdu'",
    nameArabic: "موضوع",
    nameArabicVocalized: "مَوْضُوعٌ",
    category: "fabricated",
    color: "#b91c1c",
    bgColor: "bg-red-700/15",
    borderColor: "border-red-700/40",
    textColor: "text-red-500",
    rank: 15,
    shortDesc: "Fabricated — Invented Lie",
    fullDesc: "The worst grade in hadith science. A hadith proven to be fabricated — invented and falsely attributed to the Prophet ﷺ. Fabrication may be proven through: the narrator confessing, historical impossibility (narrator born after the event), contradiction with established Quran/Sunnah, or internal textual evidence. Narrating a Mawdu' hadith while knowing it is fabricated is a major sin.",
    criteria: [
      "The chain contains a known fabricator (wadda') who has confessed or been proven to fabricate",
      "Historical impossibility: narrator could not have been present",
      "Content contradicts the Quran or mutawatir Sunnah",
      "The text contains obvious anachronisms or stylistic anomalies foreign to prophetic speech",
      "Major works: Ibn al-Jawzi's 'Al-Mawdu'at', al-Suyuti's 'Al-La'ali al-Masnu'a'",
    ],
    usableAsEvidence: false,
  },
  {
    id: "sahih",
    name: "Sahih",
    nameArabic: "صحيح",
    nameArabicVocalized: "صَحِيحٌ",
    category: "authentic",
    color: "#10b981",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    rank: 1,
    shortDesc: "Authentic",
    fullDesc: "Authentic narration meeting all conditions of a sound hadith: connected chain, trustworthy narrators, sound memory, free from anomaly and defect. This is the general 'Sahih' grade used by most collections.",
    criteria: [
      "Connected, unbroken chain of transmission",
      "All narrators upright ('adl) and precise (dabt)",
      "Free from shadh (anomaly) and illah (defect)",
    ],
    usableAsEvidence: true,
  },
  {
    id: "hasan",
    name: "Hasan",
    nameArabic: "حسن",
    nameArabicVocalized: "حَسَنٌ",
    category: "good",
    color: "#3b82f6",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/40",
    textColor: "text-blue-400",
    rank: 3,
    shortDesc: "Good — Acceptable Evidence",
    fullDesc: "Good hadith — meets requirements of Sahih except that a narrator has slightly lower precision (saduq rather than thiqa thabt). Fully used as evidence in Islamic law. The term was first systematically used by Imam al-Tirmidhi.",
    criteria: [
      "Connected chain of transmission",
      "Narrators are upright but with slightly less precision than Sahih",
      "One or more narrators rated saduq (truthful with occasional errors)",
      "Free from anomaly and defect",
    ],
    usableAsEvidence: true,
  },
];

export function getGradeInfo(grade: string): HadithGrade {
  const normalized = grade.trim().toLowerCase()
    .replace(/'/g, "'")
    .replace(/'/g, "'");

  const found = HADITH_GRADES.find(
    (g) =>
      g.id === normalized ||
      g.name.toLowerCase() === normalized ||
      g.nameArabic === grade ||
      g.id.replace(/-/g, " ") === normalized
  );

  if (found) return found;

  // Fuzzy match
  if (normalized.includes("sahih")) return HADITH_GRADES.find((g) => g.id === "sahih")!;
  if (normalized.includes("hasan") && normalized.includes("dhati")) return HADITH_GRADES.find((g) => g.id === "hasan-li-dhayrihi")!;
  if (normalized.includes("hasan")) return HADITH_GRADES.find((g) => g.id === "hasan")!;
  if (normalized.includes("mawdu") || normalized.includes("fabricated")) return HADITH_GRADES.find((g) => g.id === "mawdu")!;
  if (normalized.includes("munkar")) return HADITH_GRADES.find((g) => g.id === "munkar")!;
  if (normalized.includes("matruk")) return HADITH_GRADES.find((g) => g.id === "matruk")!;
  if (normalized.includes("mursal")) return HADITH_GRADES.find((g) => g.id === "mursal")!;
  if (normalized.includes("shadh") || normalized.includes("shad")) return HADITH_GRADES.find((g) => g.id === "shadh")!;
  if (normalized.includes("daif") || normalized.includes("da'if") || normalized.includes("weak")) {
    if (normalized.includes("jiddan") || normalized.includes("very")) return HADITH_GRADES.find((g) => g.id === "daif-jiddan")!;
    return HADITH_GRADES.find((g) => g.id === "daif")!;
  }

  // Default
  return {
    id: "unknown",
    name: grade || "Unknown",
    nameArabic: grade || "غير محدد",
    nameArabicVocalized: grade,
    category: "weak",
    color: "#6b7280",
    bgColor: "bg-muted",
    borderColor: "border-border",
    textColor: "text-muted-foreground",
    rank: 99,
    shortDesc: "Grade not determined",
    fullDesc: "The authenticity of this hadith has not been determined or recorded in this database.",
    criteria: [],
    usableAsEvidence: false,
  };
}

export const RELIABILITY_GRADES = [
  {
    id: "thiqa-thabt",
    label: "Thiqa Thabt",
    arabic: "ثقة ثبت",
    desc: "Trustworthy and firm — highest narrator reliability",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    score: 10,
  },
  {
    id: "thiqa-hafiz",
    label: "Thiqa Hafiz",
    arabic: "ثقة حافظ",
    desc: "Trustworthy and a preserver of hadith",
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
    score: 10,
  },
  {
    id: "thiqa",
    label: "Thiqa",
    arabic: "ثقة",
    desc: "Trustworthy — fully reliable narrator",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    score: 8,
  },
  {
    id: "companion",
    label: "Companion (ṣaḥābī)",
    arabic: "صحابي",
    desc: "Companion of the Prophet ﷺ — accepted by consensus",
    color: "text-amber-300",
    bg: "bg-amber-400/15",
    score: 10,
  },
  {
    id: "saduq",
    label: "Saduq",
    arabic: "صدوق",
    desc: "Truthful — generally reliable, occasional errors",
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    score: 6,
  },
  {
    id: "saduq-yahim",
    label: "Saduq Yahim",
    arabic: "صدوق يهم",
    desc: "Truthful but prone to errors — Hasan level narrations",
    color: "text-blue-300",
    bg: "bg-blue-400/10",
    score: 4,
  },
  {
    id: "layyin",
    label: "Layyin",
    arabic: "لين",
    desc: "Soft/slight weakness — some doubt about precision",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    score: 3,
  },
  {
    id: "daif",
    label: "Da'if",
    arabic: "ضعيف",
    desc: "Weak — fails reliability criteria",
    color: "text-amber-500",
    bg: "bg-amber-500/15",
    score: 2,
  },
  {
    id: "daif-jiddan",
    label: "Da'if Jiddan",
    arabic: "ضعيف جداً",
    desc: "Very weak — severe weakness",
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    score: 1,
  },
  {
    id: "matruk",
    label: "Matruk",
    arabic: "متروك",
    desc: "Abandoned — accused of lying in hadith",
    color: "text-red-400",
    bg: "bg-red-500/15",
    score: 0,
  },
  {
    id: "kadhdhab",
    label: "Kadhdhab",
    arabic: "كذاب",
    desc: "Liar — known to deliberately lie in narrations",
    color: "text-red-500",
    bg: "bg-red-600/15",
    score: -1,
  },
  {
    id: "wadda",
    label: "Wadda'",
    arabic: "وضاع",
    desc: "Fabricator — known to invent hadiths",
    color: "text-red-600",
    bg: "bg-red-700/15",
    score: -2,
  },
  {
    id: "unknown",
    label: "Unknown",
    arabic: "مجهول",
    desc: "Unknown narrator — reliability not established",
    color: "text-muted-foreground",
    bg: "bg-muted",
    score: 0,
  },
];

export function getReliabilityInfo(reliability: string) {
  const found = RELIABILITY_GRADES.find(
    (r) => r.label.toLowerCase() === reliability.toLowerCase() ||
           r.id === reliability.toLowerCase().replace(/\s+/g, "-") ||
           r.arabic === reliability
  );
  return found ?? RELIABILITY_GRADES.find((r) => r.id === "unknown")!;
}
