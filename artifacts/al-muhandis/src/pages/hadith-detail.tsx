import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Bookmark, Pencil, Check, Trash2, Sparkles, Loader2,
  BookOpen, Network, AlertTriangle, ChevronDown, MessageCircle, Share2,
} from "lucide-react";
import {
  useGetHadith,
  useGetHadithRelatedAyahs,
  useCreateBookmark,
  useDeleteBookmark,
  useListBookmarks,
  getListBookmarksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useNote } from "@/hooks/use-notes";
import { GradeBadge, InlineGradeBadge } from "@/components/grade-badge";
import { IsnadMap, type IsnadData } from "@/components/isnad-map";
import { MarkdownRenderer } from "@/components/markdown-renderer";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

const NARRATOR_BIOS: Record<string, { bio: string; type: string; died: string; arabicInitial: string; reliability?: string; hadiths?: number }> = {
  "Abu Hurairah": {
    bio: "The most prolific narrator of hadith among the Prophet's companions. He embraced Islam in 7 AH and spent approximately 4 years with the Prophet ﷺ. He devoted his life entirely to learning and transmitting the Prophet's words, famously asking the Prophet ﷺ for a cure for forgetfulness and receiving a supplication.",
    type: "Companion (Sahabi)", died: "57 AH", arabicInitial: "ه",
    reliability: "Unanimously trustworthy (thiqah). His narrations are found in all Six Books.",
    hadiths: 5374,
  },
  "Abdullah ibn Umar": {
    bio: "Son of Caliph Umar ibn al-Khattab. Embraced Islam as a child. Known for his extreme precision and caution in narrating hadith — he would tremble before narrating. He was one of the longest-surviving companions, dying in 73 AH.",
    type: "Companion (Sahabi)", died: "73 AH", arabicInitial: "ع",
    reliability: "Among the most reliable of all narrators. Known for precision and piety.",
    hadiths: 2630,
  },
  "Aisha": {
    bio: "Wife of the Prophet ﷺ and one of the greatest scholars of Islam. She was uniquely positioned to transmit hadith on private matters of the Prophet's life. Companions would regularly consult her. She was well-versed in Quran, poetry, and medicine.",
    type: "Companion (Sahabi)", died: "57 AH", arabicInitial: "ع",
    reliability: "Unquestionable. A primary source for hadiths on personal and family matters.",
    hadiths: 2210,
  },
  "Anas ibn Malik": {
    bio: "Served the Prophet ﷺ for 10 years from age 10. The Prophet ﷺ prayed for him, asking Allah to bless him with wealth, children, and long life — all of which were granted. He lived to approximately 93 years and is considered one of the last companions to die in Basra.",
    type: "Companion (Sahabi)", died: "93 AH", arabicInitial: "ا",
    reliability: "Fully trustworthy. Personal servant of the Prophet ﷺ for a decade.",
    hadiths: 2286,
  },
  "Abdullah ibn Abbas": {
    bio: "Cousin of the Prophet ﷺ. He was 13 when the Prophet ﷺ died. Known as the 'translator of the Quran' (tarjuman al-Quran), he was prayed for by the Prophet ﷺ: 'O Allah, grant him understanding of the religion.' He became the foremost Quranic interpreter.",
    type: "Companion (Sahabi)", died: "68 AH", arabicInitial: "ع",
    reliability: "Highest trust. Greatest scholar of tafseer among the companions.",
    hadiths: 1660,
  },
  "Jabir ibn Abdullah": {
    bio: "An Ansar companion from the Khazraj tribe. Participated in 19 battles with the Prophet ﷺ. He was renowned for his knowledge and dedication to narrating hadith despite blindness in old age.",
    type: "Companion (Sahabi)", died: "78 AH", arabicInitial: "ج",
    reliability: "Trustworthy (thiqah). Narrated from the Prophet ﷺ extensively.",
    hadiths: 1540,
  },
  "Abdullah ibn Masud": {
    bio: "One of the earliest Muslims and the first to recite Quran publicly in Makkah. A close companion — the Prophet ﷺ said 'Whatever Ibn Masud tells you, believe him.' He became the foremost scholar of Quran and fiqh in Kufa.",
    type: "Companion (Sahabi)", died: "32 AH", arabicInitial: "ع",
    reliability: "Fully trustworthy. The Prophet ﷺ personally approved of his knowledge.",
    hadiths: 848,
  },
  "Umar ibn al-Khattab": {
    bio: "The second Caliph of Islam. His conversion to Islam strengthened the Muslims. The Prophet ﷺ said 'If there were a prophet after me, it would be Umar.' His narrations are significant for matters of governance and law.",
    type: "Companion (Sahabi)", died: "23 AH", arabicInitial: "ع",
    reliability: "Unquestionable. The second most important companion after Abu Bakr.",
    hadiths: 537,
  },
  "Abu Bakr": {
    bio: "The first Caliph of Islam and closest companion of the Prophet ﷺ. He was with the Prophet ﷺ in the Cave of Thawr during the hijrah. Despite being the second most important figure in Islam, he narrated relatively few hadiths due to his extreme caution about attributing words to the Prophet ﷺ.",
    type: "Companion (Sahabi)", died: "13 AH", arabicInitial: "ب",
    reliability: "Unquestionable. The most trusted companion of the Prophet ﷺ.",
    hadiths: 142,
  },
  "Ali ibn Abi Talib": {
    bio: "The fourth Caliph of Islam and cousin and son-in-law of the Prophet ﷺ. He embraced Islam as a young boy. Renowned for his knowledge, bravery, and eloquence. His narrations cover fiqh, theology, and the Prophet's personal conduct.",
    type: "Companion (Sahabi)", died: "40 AH", arabicInitial: "ع",
    reliability: "Unquestionable. Among the most knowledgeable companions.",
    hadiths: 536,
  },
  "Uthman ibn Affan": {
    bio: "The third Caliph of Islam, known as 'Dhū al-Nūrayn' (Possessor of Two Lights) because he married two daughters of the Prophet ﷺ. He sponsored the standardization of the Quranic mushaf. Known for his modesty and generosity.",
    type: "Companion (Sahabi)", died: "35 AH", arabicInitial: "ع",
    reliability: "Unquestionable. Among the ten promised Paradise.",
    hadiths: 146,
  },
  "Muadh ibn Jabal": {
    bio: "Sent by the Prophet ﷺ as a teacher and judge to Yemen. The Prophet ﷺ said about him: 'The most knowledgeable of my community regarding ḥalāl and ḥarām is Muādh ibn Jabal.' He was renowned as a faqīh and a beautiful Quran reciter. He died in the plague of Amwas, aged around 34.",
    type: "Companion (Sahabi)", died: "18 AH", arabicInitial: "م",
    reliability: "Fully trustworthy. The Prophet ﷺ personally praised his knowledge.",
    hadiths: 157,
  },
  "Abu Dawud al-Ansari": {
    bio: "Companion of the Prophet ﷺ from the Ansar. Should not be confused with Imam Abu Dawud al-Sijistani (the hadith scholar). This companion Abu Dawud participated in the Battle of Badr and narrated from the Prophet ﷺ directly.",
    type: "Companion (Sahabi)", died: "Unknown AH", arabicInitial: "د",
    reliability: "Trustworthy companion.",
    hadiths: 30,
  },
  "Umm Salamah": {
    bio: "One of the Mothers of the Believers (wives of the Prophet ﷺ). Born Hind bint Abi Umayyah. She was among the early Muslims who emigrated to Abyssinia. After her first husband died at Uhud, she married the Prophet ﷺ. Known for her wisdom — she advised the Prophet ﷺ during the Hudaybiyah incident.",
    type: "Companion (Sahabi)", died: "59 AH", arabicInitial: "ا",
    reliability: "Unquestionable. A major source for rulings relating to women.",
    hadiths: 378,
  },
  "Hafsa bint Umar": {
    bio: "Mother of the Believers, daughter of Umar ibn al-Khattab and wife of the Prophet ﷺ. She was entrusted with the first written copy of the Quran. Known for her knowledge, piety, and fasting.",
    type: "Companion (Sahabi)", died: "45 AH", arabicInitial: "ح",
    reliability: "Fully trustworthy. Custodian of the first Quranic manuscript.",
    hadiths: 60,
  },
  "Abu Said al-Khudri": {
    bio: "A young companion from the Ansar. He was too young to participate in Uhud but fought in many subsequent battles. He was dedicated to sitting in the mosque and narrating hadith, and scholars considered him one of the most reliable Ansar narrators.",
    type: "Companion (Sahabi)", died: "74 AH", arabicInitial: "ا",
    reliability: "Fully trustworthy. One of the great Ansar hadith narrators.",
    hadiths: 1170,
  },
  "Ibn Umar": {
    bio: "Abdullah ibn Umar — son of Caliph Umar ibn al-Khattab. Embraced Islam as a child and lived to 73 AH. Renowned for his strict adherence to the Sunnah, he would reenact everything the Prophet ﷺ did — even tying his camel in the same spot.",
    type: "Companion (Sahabi)", died: "73 AH", arabicInitial: "ع",
    reliability: "Among the most reliable narrators. Known for precision and caution.",
    hadiths: 2630,
  },
  "Salman al-Farisi": {
    bio: "A Persian companion who traveled from Persia seeking truth, ultimately reaching the Prophet ﷺ in Medina. The Prophet ﷺ said he was from the Ahlul Bayt. He suggested digging the trench (khandaq) in the Battle of the Trench — a Persian military innovation.",
    type: "Companion (Sahabi)", died: "36 AH", arabicInitial: "س",
    reliability: "Trustworthy companion.",
    hadiths: 60,
  },
  "Abu Musa al-Ash'ari": {
    bio: "A Yemeni companion who emigrated to Abyssinia with early Muslims. Later emigrated to Medina. Renowned as one of the most beautiful Quran reciters — the Prophet ﷺ said he had been given a flute from the flutes of the family of Dawud ﷺ. Served as governor of Basra and Kufa.",
    type: "Companion (Sahabi)", died: "52 AH", arabicInitial: "ا",
    reliability: "Fully trustworthy. Known for Quran recitation and knowledge.",
    hadiths: 360,
  },
  "Said ibn al-Musayyib": {
    bio: "The greatest of the Tabi'in (successors). Born 2 years into the caliphate of Umar ibn al-Khattab. Known as 'Sayyid al-Tabi'in.' A leading scholar of Medina — he narrated from Aisha, Abu Hurairah, Zayd ibn Thabit, and other companions. A master of fiqh, hadith, and tafseer.",
    type: "Tabi'i (Successor)", died: "94 AH", arabicInitial: "س",
    reliability: "Fully trustworthy. Considered the most reliable of all Tabi'in.",
    hadiths: 430,
  },
  "Urwah ibn al-Zubayr": {
    bio: "Grandson of Abu Bakr al-Siddiq and nephew of Aisha. One of the Seven Fuqaha of Medina (al-Fuqaha al-Sab'ah). He narrated extensively from Aisha (his maternal aunt) and is a major transmitter of her knowledge. His chain through Aisha is among the most prized in Islamic scholarship.",
    type: "Tabi'i (Successor)", died: "94 AH", arabicInitial: "ع",
    reliability: "Fully trustworthy. Primary transmitter of Aisha's knowledge.",
    hadiths: 700,
  },
  "Nafi": {
    bio: "Freed slave of Abdullah ibn Umar and his primary student. He is the critical link in one of the most prized chains in Islamic hadith: Malik → Nafi → Ibn Umar (known as 'the golden chain'). Imam al-Bukhari said this chain is the most authentic chain of transmission.",
    type: "Tabi'i (Successor)", died: "117 AH", arabicInitial: "ن",
    reliability: "Thiqa Thabt (extremely reliable). Link in the golden chain.",
    hadiths: 500,
  },
  "Al-Zuhri": {
    bio: "Muhammad ibn Muslim ibn Shihab al-Zuhri — one of the greatest Tabi'in scholars. He was the first to systematically compile hadiths at the request of Caliph Umar ibn Abd al-Aziz. An unparalleled master of hadith, biography of the Prophet ﷺ, and jurisprudence.",
    type: "Tabi'i (Successor)", died: "124 AH", arabicInitial: "ز",
    reliability: "Thiqa Thabt Hafiz. The greatest hadith scholar among the Tabi'in.",
    hadiths: 2000,
  },
  "Hammam ibn Munabbih": {
    bio: "A Yemeni Tabi'i who was the student of Abu Hurairah. Author of the 'Sahifah of Hammam ibn Munabbih' — considered the earliest surviving written hadith collection. He recorded hadiths directly from Abu Hurairah in writing.",
    type: "Tabi'i (Successor)", died: "101 AH", arabicInitial: "ه",
    reliability: "Thiqa (Trustworthy). Author of the earliest surviving hadith manuscript.",
    hadiths: 138,
  },
  "Sufyan al-Thawri": {
    bio: "One of the greatest Muslim scholars of the 2nd century AH. Known as 'the chief of the believers in hadith' (Amir al-Mu'minin fi al-Hadith). He was a prolific hadith scholar, ascetic, and jurist. He is the eponymous founder of the Thawri madhhab (now extinct).",
    type: "Tabi' al-Tabi'in", died: "161 AH", arabicInitial: "س",
    reliability: "Thiqa Thabt Hafiz. Among the greatest hadith scholars of all time.",
    hadiths: 10000,
  },
  "Malik ibn Anas": {
    bio: "Founder of the Maliki school of Islamic law. Author of al-Muwatta — one of the earliest and most authoritative hadith collections. Born in Medina and lived there his entire life. He served as Mufti of Medina for decades. Imam al-Shafi'i said: 'When scholars are mentioned, Malik is the star.'",
    type: "Tabi' al-Tabi'in", died: "179 AH", arabicInitial: "م",
    reliability: "Thiqa Thabt. Founder of Maliki school and author of al-Muwatta.",
    hadiths: 1720,
  },
  "Shu'bah ibn al-Hajjaj": {
    bio: "Known as 'Amir al-Mu'minin in Hadith' (Chief of the Believers in Hadith) before Sufyan al-Thawri. He was the first to apply systematic criticism to hadith narrators. Based in Basra, he was extremely meticulous and is credited with establishing the science of narrator criticism.",
    type: "Tabi' al-Tabi'in", died: "160 AH", arabicInitial: "ش",
    reliability: "Thiqa Thabt Hafiz. Father of the science of narrator criticism.",
    hadiths: 3000,
  },
  "Abu Hurairah (variant)": {
    bio: "Abd al-Rahman ibn Sakhr al-Dawsi — the most prolific narrator of hadith. He joined the Prophet ﷺ and was given a du'a for memory. He spent the last decades teaching in Medina. Over 800 companions and Tabi'in narrated from him.",
    type: "Companion (Sahabi)", died: "57 AH", arabicInitial: "ه",
    reliability: "Unanimously trustworthy.",
    hadiths: 5374,
  },
};

const PROXY_COLLECTIONS = new Set([
  "bukhari", "muslim", "abu-dawud", "tirmidhi", "nasai", "ibn-majah", "malik", "nawawi-40", "qudsi",
]);

interface HadithData {
  id: string;
  hadithNumber: string;
  arabicText: string;
  translation: string;
  narrator: string;
  grade: string;
  gradeReason?: string;
  gradeScholars?: Array<{ name: string; grade: string }>;
  topics?: string[];
  sharh?: string;
  collectionId: string;
  collectionName: string;
  isnadChain?: IsnadData & { hadithId?: string };
}

type DetailTab = "text" | "isnad" | "science" | "ai";

const TABS = [
  { id: "text" as const, label: "Hadith", icon: BookOpen },
  { id: "isnad" as const, label: "Chain (Isnad)", icon: Network },
  { id: "science" as const, label: "Authenticity", icon: AlertTriangle },
  { id: "ai" as const, label: "AI Scholar", icon: Sparkles },
];

const HADITH_SCIENCE_EXPLAINER = {
  title: "علم الحديث — The Science of Hadith",
  intro: `Hadith science ('Ulūm al-Ḥadīth) is the methodology Islamic scholars developed to verify whether a saying attributed to the Prophet ﷺ is authentic. It consists of two branches:`,
  branches: [
    {
      name: "Isnād Analysis (علم الإسناد)",
      desc: "Examining the chain of transmission — who narrated from whom, across how many generations, and whether each narrator was trustworthy and had a reliable memory.",
    },
    {
      name: "Matn Analysis (علم المتن)",
      desc: "Examining the content of the hadith — whether it contradicts the Quran, mutawatir Sunnah, historical facts, or established reason.",
    },
  ],
  disciplines: [
    {
      name: "Al-Jarḥ wa al-Taʿdīl (الجرح والتعديل)",
      desc: "The science of narrator criticism and authentication. Scholars investigated the lives, character, memory, and reliability of thousands of narrators over centuries.",
    },
    {
      name: "ʿIlm al-Rijāl (علم الرجال)",
      desc: "Biography of narrator biographies — comprehensive study of every person who appeared in hadith chains, their teachers, students, dates, and reliability.",
    },
    {
      name: "ʿIlal al-Ḥadīth (علل الحديث)",
      desc: "The science of detecting hidden defects in hadith — subtle flaws not apparent on the surface, discoverable only by masters comparing hundreds of chains.",
    },
    {
      name: "Muṣṭalaḥ al-Ḥadīth (مصطلح الحديث)",
      desc: "Hadith terminology — the precise vocabulary used to classify grades, describe chain types, and communicate reliability assessments between scholars.",
    },
  ],
};

export default function HadithDetail() {
  const { collectionId, hadithId } = useParams<{ collectionId: string; hadithId: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DetailTab>("text");
  const [showNote, setShowNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);
  const [proxyHadith, setProxyHadith] = useState<HadithData | null>(null);
  const [proxyLoading, setProxyLoading] = useState(false);
  const [proxyError, setProxyError] = useState(false);

  const isProxy = PROXY_COLLECTIONS.has(collectionId ?? "");
  const numericId = isProxy ? 0 : parseInt(hadithId ?? "0", 10);

  const { data: dbHadith, isLoading: dbLoading } = useGetHadith(numericId, {
    query: { enabled: !isProxy && numericId > 0 },
  });
  const { data: relatedAyahs } = useGetHadithRelatedAyahs(numericId, {
    query: { enabled: !isProxy && numericId > 0 },
  });

  const { mutate: createBookmark } = useCreateBookmark({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() }); },
    },
  });
  const { mutate: deleteBookmark } = useDeleteBookmark({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBookmarksQueryKey() }); },
    },
  });
  const { data: bookmarks } = useListBookmarks();
  const { note, saveNote, deleteNote } = useNote("hadith", numericId);

  useEffect(() => {
    if (!isProxy || !collectionId || !hadithId) return;
    const proxyId = `${collectionId}:${hadithId}`;
    setProxyLoading(true);
    setProxyError(false);
    fetch(`${BASE_URL}/api/hadith/${encodeURIComponent(proxyId)}`)
      .then((r) => r.ok ? r.json() as Promise<HadithData> : Promise.reject(r.status))
      .then((data) => setProxyHadith(data))
      .catch(() => setProxyError(true))
      .finally(() => setProxyLoading(false));
  }, [isProxy, collectionId, hadithId]);

  const hadith: HadithData | null = isProxy
    ? proxyHadith
    : dbHadith
      ? {
          id: String(dbHadith.id),
          hadithNumber: dbHadith.hadithNumber,
          arabicText: dbHadith.arabicText,
          translation: dbHadith.translation,
          narrator: dbHadith.narrator,
          grade: dbHadith.grade,
          gradeReason: dbHadith.gradeReason,
          topics: dbHadith.topics ?? [],
          sharh: dbHadith.sharh,
          collectionId: dbHadith.collectionId,
          collectionName: dbHadith.collectionName ?? "",
          isnadChain: undefined,
        }
      : null;

  const isLoading = isProxy ? proxyLoading : dbLoading;
  const existingBookmark = bookmarks?.find((b) => b.type === "hadith" && b.referenceId === numericId);
  const isBookmarked = !!existingBookmark;

  const handleBookmark = () => {
    if (!hadith) return;
    if (isBookmarked && existingBookmark) {
      deleteBookmark({ bookmarkId: existingBookmark.id });
    } else {
      createBookmark({
        data: {
          type: "hadith",
          referenceId: numericId || 0,
          title: `${hadith.collectionName} #${hadith.hadithNumber}`,
          note: JSON.stringify({
            _meta: true,
            collectionId: hadith.collectionId,
            hadithNumber: hadith.hadithNumber,
            collectionName: hadith.collectionName,
            translationSnippet: hadith.translation.slice(0, 160),
          }),
        },
      });
    }
  };

  useEffect(() => {
    if (showNote && hadith) {
      try {
        localStorage.setItem(
          `al-muhandis-meta:hadith:${numericId}`,
          JSON.stringify({
            collectionId: hadith.collectionId,
            hadithNumber: hadith.hadithNumber,
            collectionName: hadith.collectionName,
          })
        );
      } catch {}
    }
  }, [showNote, hadith]);

  const handleSaveNote = () => { saveNote(noteDraft); setShowNote(false); };

  // Track recently viewed hadiths
  useEffect(() => {
    if (!hadith) return;
    try {
      const key = "recently-viewed-hadiths";
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ collectionId: string; hadithNumber: string; collectionName: string; translation: string }>;
      const entry = { collectionId: hadith.collectionId, hadithNumber: hadith.hadithNumber, collectionName: hadith.collectionName, translation: hadith.translation.slice(0, 120) };
      const updated = [entry, ...existing.filter((e) => !(e.collectionId === hadith.collectionId && e.hadithNumber === hadith.hadithNumber))].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [hadith]);

  const loadAiExplanation = async () => {
    if (!hadith || aiLoaded) return;
    setAiLoading(true);
    setAiLoaded(true);
    try {
      const response = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide a comprehensive scholarly explanation (sharh) for this hadith from ${hadith.collectionName}, #${hadith.hadithNumber}:\n\nArabic: ${hadith.arabicText}\nTranslation: "${hadith.translation}"\nNarrator: ${hadith.narrator}\nGrade: ${hadith.grade}\n\nCover: (1) Historical context and occasion, (2) Key Arabic terms and their meanings, (3) Main scholarly commentary (mention Ibn Hajar, Nawawi, or Ibn Rajab if relevant), (4) Practical lessons for Muslims today, (5) Related Quranic verses or companion hadiths. Be scholarly but accessible.`,
          history: [],
        }),
      });
      if (!response.body) throw new Error("No stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
            if (data.content) { text += data.content; setAiExplanation(text); }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setAiExplanation("Unable to generate AI explanation at this time. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (proxyError || (!isLoading && !hadith)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Hadith not found or failed to load.</p>
        <Link href={`/hadith/${collectionId ?? ""}`}>
          <button className="mt-4 text-xs text-primary hover:underline">← Back to collection</button>
        </Link>
      </div>
    );
  }

  if (!hadith) return null;

  const isnadData: IsnadData | null = hadith.isnadChain
    ? {
        narrators: (hadith.isnadChain.narrators ?? []) as IsnadData["narrators"],
        overallGrade: hadith.isnadChain.overallGrade,
        chainAnalysis: (hadith.isnadChain as Record<string, unknown>).chainAnalysis as string | undefined,
        defects: (hadith.isnadChain as Record<string, unknown>).defects as string[] | undefined,
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
      {/* Back navigation */}
      <Link href={`/hadith/${collectionId ?? ""}`}>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-all group mb-5">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {hadith.collectionName}
        </button>
      </Link>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
                #{hadith.hadithNumber}
              </span>
              <InlineGradeBadge grade={hadith.grade} />
              {hadith.topics?.slice(0, 2).map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!isProxy && (
                <>
                  <button
                    onClick={() => { setNoteDraft(note?.text ?? ""); setShowNote((v) => !v); }}
                    className={cn("p-1.5 rounded-lg transition-all", note ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                    title="Add note"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={cn("p-1.5 rounded-lg transition-all", isBookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Arabic text */}
          <div className="text-right mb-4 p-5 rounded-xl bg-muted/20 border border-border" dir="rtl">
            <p style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.35rem", lineHeight: 2.2 }} className="text-foreground">
              {hadith.arabicText}
            </p>
          </div>

          {/* Translation */}
          <p className="text-sm text-foreground leading-relaxed">{hadith.translation}</p>
          {hadith.narrator && (
            <p className="text-xs text-muted-foreground mt-3">
              Narrated by: <span className="font-medium text-foreground">{hadith.narrator}</span>
            </p>
          )}

          {/* Personal note */}
          {!isProxy && note && !showNote && (
            <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-2">
              <Pencil className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary mb-1">Your Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{note.text}</p>
              </div>
              <button onClick={() => { setNoteDraft(note.text); setShowNote(true); }} className="text-xs text-muted-foreground hover:text-foreground shrink-0">Edit</button>
            </div>
          )}
          <AnimatePresence>
            {showNote && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <p className="text-xs font-semibold text-primary mb-2">Your Note</p>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add a personal note or reflection on this hadith…"
                    className="w-full text-sm text-foreground bg-transparent resize-none outline-none placeholder:text-muted-foreground leading-relaxed min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                    <button onClick={() => { deleteNote(); setShowNote(false); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="w-3 h-3" />Clear
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowNote(false)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded">Cancel</button>
                      <button onClick={handleSaveNote} className="flex items-center gap-1 text-xs font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:opacity-90">
                        <Check className="w-3 h-3" />Save
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border mb-5 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); if (id === "ai") void loadAiExplanation(); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center",
              activeTab === id
                ? "bg-card border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── TAB: TEXT ─────────────────────────────────────────────────── */}
        {activeTab === "text" && (
          <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Grade details */}
            <GradeBadge grade={hadith.grade} />

            {/* Grade reason — formatted scholar verdicts */}
            {hadith.gradeReason && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Scholar Verdicts on This Chain</p>
                <div className="space-y-1.5">
                  {hadith.gradeReason.split("|").map((v, i) => {
                    const idx = v.indexOf(":");
                    if (idx === -1) return null;
                    const scholar = v.slice(0, idx).trim();
                    const verdict = v.slice(idx + 1).trim();
                    const gradeColor: Record<string, string> = {
                      "Sahih": "text-emerald-400", "Hasan Sahih": "text-emerald-300",
                      "Hasan": "text-blue-400", "Daif": "text-amber-400",
                      "Da'if": "text-amber-400", "Daif Maqtu": "text-orange-400",
                      "Daif Jiddan": "text-orange-500", "Munkar": "text-red-400",
                      "Mawdu": "text-red-500", "Matruk": "text-red-500",
                    };
                    const color = gradeColor[verdict] ?? "text-muted-foreground";
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                        <span className="text-muted-foreground">{scholar}</span>
                        <span className="text-muted-foreground/40">—</span>
                        <span className={cn("font-medium", color)}>{verdict}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historical Context Panel */}
            <HistoricalContextPanel hadith={hadith} baseUrl={BASE_URL} />

            {/* Classical Sharh */}
            {hadith.sharh && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Classical Commentary (Sharh)</p>
                </div>
                <MarkdownRenderer content={hadith.sharh} />
              </div>
            )}

            {/* Related Ayahs */}
            {relatedAyahs && relatedAyahs.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Related Quranic Verses</p>
                </div>
                {relatedAyahs.map((ayah) => (
                  <div key={ayah.id} className="mb-4 last:mb-0 p-4 rounded-xl bg-muted/20 border border-border">
                    <p className="text-right mb-2" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.3rem", lineHeight: 2 }}>
                      {ayah.arabicText}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{ayah.translation}</p>
                    <Link href={`/quran/${ayah.surahId}`}>
                      <span className="text-xs text-primary hover:underline cursor-pointer mt-2 inline-block">
                        {ayah.surahName} · Verse {ayah.ayahNumber}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Related Topics Quick Links */}
            {hadith.topics && hadith.topics.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Related Topics</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hadith.topics.map((t) => (
                    <Link key={t} href={`/topics/${t.toLowerCase().replace(/\s+/g, "-")}`}>
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-border bg-muted/20 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all cursor-pointer capitalize">
                        {t}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ask Scholar & Share quick actions */}
            <div className="flex items-center gap-2">
              <Link href={`/ask-scholar?q=${encodeURIComponent(`Explain this hadith from ${hadith.collectionName} #${hadith.hadithNumber}: "${hadith.translation.slice(0, 120)}..."`)}`}>
                <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Ask Scholar
                </button>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const text = `📖 *${hadith.collectionName} #${hadith.hadithNumber}*\n\n"${hadith.translation.slice(0, 300)}${hadith.translation.length > 300 ? "…" : ""}"\n\n— Al-Muhandis Islamic Intelligence`;
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  title="Share on WhatsApp"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button
                  onClick={() => {
                    const text = `📖 *${hadith.collectionName} #${hadith.hadithNumber}*\n\n"${hadith.translation.slice(0, 300)}${hadith.translation.length > 300 ? "…" : ""}"\n\n— Al-Muhandis`;
                    const url = `https://t.me/share/url?url=https://al--muhandis750.replit.app&text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  title="Share on Telegram"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </button>
                <button
                  onClick={() => {
                    const text = `${hadith.collectionName} #${hadith.hadithNumber}: "${hadith.translation.slice(0, 300)}${hadith.translation.length > 300 ? "…" : ""}" — Al-Muhandis`;
                    void navigator.clipboard.writeText(text).then(() => {});
                    if (navigator.share) { void navigator.share({ title: `Hadith #${hadith.hadithNumber}`, text }); }
                  }}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Inline AI Sharh ──────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {!aiLoaded && !aiExplanation ? (
                <button
                  onClick={() => { setActiveTab("text"); void loadAiExplanation(); }}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">AI Sharh (Explanation)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Get a scholarly explanation with context, key terms &amp; lessons</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ) : (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">AI Sharh</p>
                    {aiLoading && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
                  </div>
                  {aiLoading && !aiExplanation ? (
                    <div className="space-y-2">
                      {[80, 60, 90, 50, 70].map((w, i) => (
                        <div key={i} className="h-3 rounded-full bg-muted animate-pulse" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{aiExplanation}</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB: ISNAD ────────────────────────────────────────────────── */}
        {activeTab === "isnad" && (
          <motion.div key="isnad" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {isnadData && isnadData.narrators.length > 0 ? (
              <IsnadMap isnad={isnadData} />
            ) : null}

            {/* Proxy isnad chain from Arabic text */}
            {isProxy && hadith.isnadChain && hadith.isnadChain.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-4 rounded-full bg-amber-500" />
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Transmission Chain (Isnād)</p>
                </div>
                <div className="relative pl-4">
                  {hadith.isnadChain.map((link, i) => {
                    const isLast = i === hadith.isnadChain!.length - 1;
                    const roleConfig: Record<string, { color: string; bg: string; label: string }> = {
                      collector:   { color: "border-blue-500 text-blue-400", bg: "bg-blue-500", label: "Compiler" },
                      transmitter: { color: "border-muted-foreground text-muted-foreground", bg: "bg-muted-foreground/60", label: "Transmitter" },
                      companion:   { color: "border-emerald-500 text-emerald-400", bg: "bg-emerald-500", label: "Companion" },
                      prophet:     { color: "border-amber-500 text-amber-400", bg: "bg-amber-500", label: "Source" },
                    };
                    const rc = roleConfig[link.role] ?? roleConfig["transmitter"]!;
                    return (
                      <div key={i} className="relative">
                        {!isLast && (
                          <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
                        )}
                        <div className="flex items-start gap-3 pb-4">
                          <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 mt-0.5", rc.color.split(" ")[0])} style={{ background: isLast ? undefined : "var(--card)" }}>
                            {isLast && <div className={cn("w-full h-full rounded-full", rc.bg)} />}
                          </div>
                          <div>
                            <p className={cn("text-sm font-semibold", isLast ? "text-amber-400" : "text-foreground")}>{link.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", isLast ? "bg-amber-500/10 text-amber-400" : "bg-muted/40 text-muted-foreground")}>
                                {link.generation ?? rc.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                  Chain extracted from the Arabic text of the hadith. Names are parsed from transmission verbs (حَدَّثَنَا، عَنْ، أَخْبَرَنَا).
                </p>
              </div>
            )}

            {/* Arabic isnad text */}
            {hadith.arabicText && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Arabic Isnād Text</p>
                </div>
                <p className="text-right leading-loose text-muted-foreground" dir="rtl"
                  style={{ fontFamily: "'Amiri Quran', serif", fontSize: "1.1rem", lineHeight: 2.2 }}>
                  {hadith.arabicText.slice(0, 400)}{hadith.arabicText.length > 400 ? "..." : ""}
                </p>
              </div>
            )}

            {/* Narrator biography */}
            {hadith.narrator && (() => {
              const bio = NARRATOR_BIOS[hadith.narrator.trim()];
              if (!bio) return null;
              return (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-emerald-500" />
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Narrator Biography</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-sm">
                      {bio.arabicInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{hadith.narrator}</p>
                      <p className="text-xs text-emerald-400/80 mt-0.5">{bio.type} · {bio.died}</p>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{bio.bio}</p>
                      {bio.reliability && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          <span className="text-emerald-400 font-medium">Reliability: </span>{bio.reliability}
                        </p>
                      )}
                      {bio.hadiths && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{bio.hadiths.toLocaleString()} hadiths</span> attributed in major collections
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">About Isnād Science</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The isnād (chain of transmission) is the backbone of hadith authentication. Scholars spent centuries compiling biographies of every narrator — examining their character, memory, and whether they could have met their teacher — in the science known as ʿIlm al-Rijāl (narrator criticism). A break anywhere in the chain, or an unreliable narrator, affects the hadith's grade.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── TAB: SCIENCE ──────────────────────────────────────────────── */}
        {activeTab === "science" && (
          <motion.div key="science" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {/* Grade with full explanation */}
            <GradeBadge grade={hadith.grade} showExpanded />

            {/* Per-scholar grading panel */}
            {hadith.gradeScholars && hadith.gradeScholars.length > 0 && hadith.gradeScholars[0]?.name !== "Scholarly consensus" && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-amber-500" />
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Scholars' Grading of This Hadith</p>
                </div>
                <div className="space-y-2">
                  {hadith.gradeScholars.map((s, i) => {
                    const gradeColors: Record<string, string> = {
                      "Sahih": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      "Hasan Sahih": "text-teal-400 bg-teal-500/10 border-teal-500/20",
                      "Hasan": "text-blue-400 bg-blue-500/10 border-blue-500/20",
                      "Da'if": "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      "Da'if Jiddan": "text-orange-400 bg-orange-500/10 border-orange-500/20",
                      "Munkar": "text-red-400 bg-red-500/10 border-red-500/20",
                      "Matruk": "text-red-500 bg-red-600/10 border-red-600/20",
                      "Mawdu'": "text-rose-500 bg-rose-600/10 border-rose-600/20",
                      "Mursal": "text-violet-400 bg-violet-500/10 border-violet-500/20",
                      "Munqati'": "text-purple-400 bg-purple-500/10 border-purple-500/20",
                    };
                    const colorClass = gradeColors[s.grade] ?? "text-muted-foreground bg-muted/40 border-border";
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground text-xs">{s.name}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", colorClass)}>
                          {s.grade}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 leading-snug">
                  Grade data sourced from Fawaz Ahmed's hadith database, based on published scholarly works.
                </p>
              </div>
            )}

            {/* Hadith science overview */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 rounded-full bg-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {HADITH_SCIENCE_EXPLAINER.title}
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{HADITH_SCIENCE_EXPLAINER.intro}</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {HADITH_SCIENCE_EXPLAINER.branches.map((b) => (
                  <div key={b.name} className="p-3 rounded-lg bg-muted/20 border border-border">
                    <p className="text-xs font-semibold text-foreground mb-1">{b.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {HADITH_SCIENCE_EXPLAINER.disciplines.map((d) => (
                  <ExpandableCard key={d.name} title={d.name} desc={d.desc} />
                ))}
              </div>
            </div>

            {/* Chain quality for this specific hadith */}
            {isnadData?.chainAnalysis && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 rounded-full bg-primary" />
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">This Hadith's Chain Assessment</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{isnadData.chainAnalysis}</p>
                {isnadData.defects && isnadData.defects.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Identified Issues</p>
                    {isnadData.defects.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: AI SCHOLAR ───────────────────────────────────────────── */}
        {activeTab === "ai" && (
          <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Main AI explanation */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">AI Sharh (Scholarly Explanation)</p>
                  <p className="text-xs text-muted-foreground">Context · Key Terms · Commentary · Lessons</p>
                </div>
                {aiLoading && <Loader2 className="w-4 h-4 text-violet-400 animate-spin ml-auto shrink-0" />}
              </div>
              <div className="p-5">
                {aiExplanation ? (
                  <MarkdownRenderer content={aiExplanation} />
                ) : aiLoading ? (
                  <div className="space-y-2.5 py-2">
                    {[100, 80, 95, 60, 85, 70, 90, 55].map((w, i) => (
                      <div key={i} className="h-3 rounded-full bg-muted/50 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-violet-400/30" />
                    <p className="text-sm text-muted-foreground mb-3">Get a comprehensive scholarly explanation</p>
                    <button onClick={() => void loadAiExplanation()}
                      className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/20 transition-all">
                      Generate AI Sharh
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Fiqh Ruling Extractor */}
            <FiqhRulingPanel hadith={hadith} baseUrl={BASE_URL} />

            {/* Historical Context */}
            <HistoricalContextPanel hadith={hadith} baseUrl={BASE_URL} />

            {/* AI disclaimer */}
            <div className="px-4 py-3 rounded-xl border border-border bg-muted/20">
              <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
                AI explanations are generated for educational purposes. Always verify rulings with qualified scholars. The AI uses established scholarly sources but may have limitations.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prev/Next Hadith Navigation */}
      {isProxy && hadithId && (() => {
        const current = parseInt(hadithId, 10);
        if (isNaN(current)) return null;
        return (
          <div className="flex items-center justify-between gap-3 mt-6">
            {current > 1 ? (
              <Link href={`/hadith/${collectionId ?? ""}/${current - 1}`}>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Previous Hadith
                </button>
              </Link>
            ) : <div />}
            <Link href={`/hadith/${collectionId ?? ""}/${current + 1}`}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all group">
                Next Hadith
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        );
      })()}
    </div>
  );
}

function HistoricalContextPanel({ hadith, baseUrl }: { hadith: { translation: string; arabicText: string; collectionName: string; hadithNumber: string; narrator?: string }; baseUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const loadContext = async () => {
    if (loaded) return;
    setLoading(true);
    setLoaded(true);
    try {
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide historical context for this hadith: "${hadith.translation.slice(0, 300)}"\n\nInclude:\n1. Historical background — when and why this was said (occasion of hadith / asbab al-wurud)\n2. The socio-political context of the early Muslim community at that time\n3. How the early Muslims applied this guidance\n4. Historical significance of this narration over the centuries\n\nKeep it to 3-4 short paragraphs, scholarly and readable.`,
          history: [],
        }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string };
            if (data.content) { text += data.content; setContext(text); }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setContext("Unable to load historical context at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
      {!loaded ? (
        <button onClick={() => void loadContext()}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-500/10 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <span className="text-blue-400 text-sm">🕌</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-blue-400">Historical Context</p>
              <p className="text-xs text-muted-foreground mt-0.5">Occasion of revelation, early application, and historical significance</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </button>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-blue-400 text-sm">🕌</span>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Historical Context</p>
            {loading && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
          </div>
          {loading && !context ? (
            <div className="space-y-2">
              {[90, 70, 85, 55, 80, 60].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-blue-500/10 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{context}</div>
          )}
        </div>
      )}
    </div>
  );
}

function FiqhRulingPanel({ hadith, baseUrl }: { hadith: { translation: string; arabicText: string; collectionName: string; hadithNumber: string; grade: string }; baseUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [rulings, setRulings] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const extractRulings = async () => {
    if (loaded) return;
    setLoading(true);
    setLoaded(true);
    try {
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Extract the fiqh (Islamic legal) rulings and practical lessons from this hadith:\n\n"${hadith.translation}"\n\nPlease list:\n1. Main fiqh rulings derived from this hadith (what is obligatory, recommended, prohibited, or permissible)\n2. Which madhabs (schools of thought — Hanafi, Maliki, Shafi'i, Hanbali) draw rulings from this\n3. Practical applications for everyday Muslim life\n4. Any scholarly disagreements on the ruling\n\nBe concise and scholarly.`,
          history: [],
        }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string };
            if (data.content) { text += data.content; setRulings(text); }
          } catch { /* ignore */ }
        }
      }
    } catch {
      setRulings("Unable to extract rulings at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 overflow-hidden">
      {!loaded ? (
        <button onClick={() => void extractRulings()}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-teal-500/10 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <span className="text-teal-400 text-sm">⚖️</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-teal-400">Fiqh Ruling Extractor</p>
              <p className="text-xs text-muted-foreground mt-0.5">Extract legal rulings and madhab positions from this hadith</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-teal-400 transition-colors" />
        </button>
      ) : (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-teal-400 text-sm">⚖️</span>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Fiqh Rulings</p>
            {loading && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
          </div>
          {loading && !rulings ? (
            <div className="space-y-2">
              {[85, 65, 90, 55, 75].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-teal-500/10 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{rulings}</div>
          )}
        </div>
      )}
    </div>
  );
}

function ExpandableCard({ title, desc }: { title: string; desc: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xs text-muted-foreground leading-relaxed mt-2 overflow-hidden"
          >
            {desc}
          </motion.p>
        )}
      </AnimatePresence>
    </button>
  );
}
