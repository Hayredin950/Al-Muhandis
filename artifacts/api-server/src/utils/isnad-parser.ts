import { findNarratorByName, stripTashkeel, type NarratorEntry } from "../data/narrators.js";

export interface ParsedNarrator {
  rawName: string;
  rawNameArabic: string;
  entry?: NarratorEntry;
  position: number;
  transmissionVerb: string;
}

export interface ParsedIsnad {
  narrators: ParsedNarrator[];
  chainText: string;
  mainText: string;
  overallGrade: string;
  weakestLink?: ParsedNarrator;
  chainAnalysis: string;
  defects: string[];
}

const TRANSMISSION_VERBS_AR = [
  "حَدَّثَنَا", "حَدَّثَنِي", "حدثنا", "حدثني",
  "أَخْبَرَنَا", "أَخْبَرَنِي", "أخبرنا", "أخبرني",
  "أَنْبَأَنَا", "أَنْبَأَنِي", "أنبأنا", "أنبأني",
  "سَمِعْتُ", "سمعت",
  "قَالَ", "قال",
  "عَنْ", "عن",
];

const VERB_QUALITY: Record<string, number> = {
  "سمعت": 5, "سَمِعْتُ": 5,
  "حدثني": 5, "حَدَّثَنِي": 5,
  "حدثنا": 4, "حَدَّثَنَا": 4,
  "أخبرني": 4, "أَخْبَرَنِي": 4,
  "أخبرنا": 3, "أَخْبَرَنَا": 3,
  "أنبأني": 3, "أَنْبَأَنِي": 3,
  "أنبأنا": 3, "أَنْبَأَنَا": 3,
  "عن": 2, "عَنْ": 2,
};

const NOISE_WORDS = new Set([
  "قال", "قَالَ", "رضي", "رَضِيَ", "الله", "اللَّهِ", "عنه", "عَنْهُ",
  "عنها", "عَنْهَا", "عليه", "عَلَيْهِ", "وسلم", "وَسَلَّمَ", "صلى", "صَلَّى",
  "على", "عَلَى", "المنبر", "الْمِنْبَرِ", "أنه", "أَنَّهُ", "أن", "أَنَّ",
  "يقول", "يَقُولُ", "رحمه", "رَحِمَهُ", "حفظه", "حَفِظَهُ", "سمع", "سَمِعَ",
]);

// Main text typically begins with these patterns
const MAIN_TEXT_MARKERS = [
  /سَمِعْتُ رَسُولَ اللَّهِ/,
  /سَمِعْتُ النَّبِيَّ/,
  /قَالَ رَسُولُ اللَّهِ/,
  /عَنِ النَّبِيِّ/,
  /أَنَّ رَسُولَ اللَّهِ/,
  /أَنَّ النَّبِيَّ/,
  /\".*?\"/,
];

function splitChainAndText(arabicText: string): { chain: string; main: string } {
  // Try to find where the isnad ends and main text begins
  let splitIdx = -1;
  for (const marker of MAIN_TEXT_MARKERS) {
    const match = marker.exec(arabicText);
    if (match && match.index && match.index > 0) {
      if (splitIdx === -1 || match.index < splitIdx) {
        splitIdx = match.index;
      }
    }
  }

  if (splitIdx > 10) {
    return {
      chain: arabicText.slice(0, splitIdx).trim(),
      main: arabicText.slice(splitIdx).trim(),
    };
  }

  // Fallback: first 40% is typically chain for longer texts
  const split = Math.floor(arabicText.length * 0.4);
  return { chain: arabicText.slice(0, split), main: arabicText.slice(split) };
}

function extractNarratorsFromChain(chainText: string): Array<{ name: string; verb: string }> {
  const normalized = stripTashkeel(chainText);
  const result: Array<{ name: string; verb: string }> = [];

  // Split on transmission verbs (normalized)
  const verbPattern = /(حدثنا|حدثني|أخبرنا|أخبرني|أنبأنا|أنبأني|سمعت|عن)\s+/g;
  const parts: Array<{ verb: string; text: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = verbPattern.exec(normalized)) !== null) {
    const verb = match[1];
    const afterVerb = normalized.slice(match.index + match[0].length);

    // Extract name: take words until we hit قال, ،, or another verb marker
    const nameEnd = afterVerb.search(/\s*[،,]\s*(قال|حدثنا|حدثني|أخبرنا|أخبرني|سمعت|عن\s)/);
    const rawName = nameEnd > 0
      ? afterVerb.slice(0, nameEnd).trim()
      : afterVerb.slice(0, 60).split(/[،,]/)[0].trim();

    // Clean noise words
    const cleanWords = rawName.split(/\s+/).filter((w) => !NOISE_WORDS.has(w));
    const cleanName = cleanWords.slice(0, 6).join(" ").trim();

    if (cleanName.length > 2) {
      parts.push({ verb, text: cleanName });
    }
    lastIndex = match.index;
  }

  return parts.map((p) => ({ name: p.text, verb: p.verb }));
}

function calculateOverallGrade(narrators: ParsedNarrator[], hadithGrade: string): {
  grade: string;
  analysis: string;
  defects: string[];
} {
  const defects: string[] = [];
  let weakestScore = 10;
  let weakestNarrator: ParsedNarrator | undefined;

  for (const n of narrators) {
    if (!n.entry) continue;
    const { reliability, weaknessReason } = n.entry;

    let score = 10;
    if (reliability === "Thiqa Thabt" || reliability === "Thiqa Hafiz") score = 10;
    else if (reliability === "Thiqa") score = 8;
    else if (reliability === "Saduq") score = 6;
    else if (reliability === "Saduq Yahim") score = 4;
    else if (reliability === "Layyin") score = 3;
    else if (reliability === "Da'if") score = 2;
    else if (reliability === "Da'if Jiddan") score = 1;
    else if (reliability === "Matruk") score = 0;
    else if (reliability === "Kadhdhab" || reliability === "Wadda'") score = -1;
    else if (reliability === "Companion") score = 10;

    if (score < weakestScore) {
      weakestScore = score;
      weakestNarrator = n;
    }

    if (weaknessReason) defects.push(`${n.entry.name}: ${weaknessReason}`);
    if (reliability === "Companion") {
      // No issues
    } else if (n.entry.transmissionMethod?.includes("tadlis")) {
      defects.push(`${n.entry.name}: known for tadlis (concealing hearing) — chain method requires examination`);
    }
  }

  // Check for 'an-'an (mu'an'an) chains — potential weakness
  const anChain = narrators.filter((n) => n.transmissionVerb === "عن").length;
  if (anChain > 2 && narrators.length > 0) {
    defects.push(`Chain uses multiple 'an (عن) transmissions — scholars examine whether narrators confirmed actual hearing`);
  }

  let grade = hadithGrade; // start with the given grade
  let analysis = "";

  if (weakestScore === 10) {
    analysis = "All narrators in this chain are highly reliable (thiqa/thabt). The isnad meets the highest standards.";
  } else if (weakestScore >= 8) {
    analysis = "The chain contains trustworthy narrators. Minor variations in precision do not affect authenticity.";
  } else if (weakestScore >= 6) {
    analysis = "The chain is generally acceptable but contains a narrator graded 'saduq' (truthful but sometimes makes errors). This may affect whether the hadith is classified Sahih or Hasan.";
    if (grade === "Sahih") grade = "Hasan li-dhatihi";
  } else if (weakestScore >= 4) {
    analysis = "The chain contains a narrator who, while truthful, sometimes makes mistakes. The hadith may be classified as Hasan or require corroboration.";
    if (grade === "Sahih") grade = "Hasan li-ghayrihi";
  } else if (weakestScore >= 2) {
    analysis = `The chain contains a weak narrator (${weakestNarrator?.entry?.name ?? "unknown"}). The hadith is considered Da'if unless corroborated by other chains.`;
    grade = "Da'if";
  } else if (weakestScore === 0) {
    analysis = `The chain contains an abandoned narrator (matruk) — ${weakestNarrator?.entry?.name ?? "unknown"}. This narrator was accused of lying or fabricating. The hadith is considered Da'if Jiddan or Matruk.`;
    grade = "Da'if Jiddan";
  } else {
    analysis = `The chain contains a fabricator. This hadith is considered Mawdu' (fabricated).`;
    grade = "Mawdu'";
  }

  return { grade, analysis, defects };
}

export function parseIsnad(arabicText: string, narrator: string, existingGrade: string): ParsedIsnad {
  const { chain, main } = splitChainAndText(arabicText);
  const extracted = extractNarratorsFromChain(chain);

  const parsed: ParsedNarrator[] = extracted.map((e, i) => ({
    rawName: e.name,
    rawNameArabic: e.name,
    entry: findNarratorByName(e.name),
    position: i + 1,
    transmissionVerb: e.verb,
  }));

  // Always add the Prophet ﷺ at the end if not already present
  const hasProphet = parsed.some((n) => n.entry?.id === "prophet");
  if (!hasProphet && narrator) {
    // The Companion who narrated to the first link
    const companionEntry = findNarratorByName(narrator);
    if (companionEntry && !parsed.some((p) => p.entry?.id === companionEntry.id)) {
      parsed.push({
        rawName: narrator,
        rawNameArabic: companionEntry?.nameArabic ?? narrator,
        entry: companionEntry,
        position: parsed.length + 1,
        transmissionVerb: "عن",
      });
    }
    // Add Prophet
    const prophetEntry = findNarratorByName("النبي");
    parsed.push({
      rawName: "Prophet Muhammad ﷺ",
      rawNameArabic: "النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
      entry: prophetEntry,
      position: parsed.length + 1,
      transmissionVerb: "سمعت",
    });
  }

  const { grade, analysis, defects } = calculateOverallGrade(parsed, existingGrade);
  const weakestLink = parsed.find((n) => {
    const r = n.entry?.reliability;
    return r === "Da'if" || r === "Da'if Jiddan" || r === "Matruk" || r === "Kadhdhab";
  });

  return {
    narrators: parsed,
    chainText: chain,
    mainText: main || arabicText,
    overallGrade: grade,
    weakestLink,
    chainAnalysis: analysis,
    defects,
  };
}
