export type TajweedCategory =
  | "qalqalah"
  | "ghunna"
  | "madd"
  | "ikhfa"
  | "idgham"
  | "iqlab"
  | "izhar"
  | "default";

export interface TajweedToken {
  text: string;
  category: TajweedCategory;
}

const SUKUN = "\u0652";
const SHADDAH = "\u0651";
const TANWIN_FATH = "\u064B";
const TANWIN_DAMM = "\u064C";
const TANWIN_KASR = "\u064D";
const MADDAH = "\u0653";
const SUPERSCRIPT_ALIF = "\u0670";

const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";

const QALQALAH_LETTERS = new Set(["ق", "ط", "ب", "ج", "د"]);

const IKHFA_LETTERS = new Set([
  "ت", "ث", "ج", "د", "ذ", "ز", "س", "ش", "ص",
  "ض", "ط", "ظ", "ف", "ق", "ك",
]);

const IDGHAM_GHUNNA_LETTERS = new Set(["ي", "ن", "م", "و"]);
const IDGHAM_NO_GHUNNA_LETTERS = new Set(["ل", "ر"]);
const IZHAR_LETTERS = new Set(["ء", "ه", "ع", "ح", "غ", "خ"]);

const COMBINING_RANGE_START = 0x064b;
const COMBINING_RANGE_END = 0x065f;

function isCombining(cp: number): boolean {
  return (
    (cp >= COMBINING_RANGE_START && cp <= COMBINING_RANGE_END) ||
    cp === 0x0670
  );
}

function isArabicBase(cp: number): boolean {
  return (cp >= 0x0600 && cp <= 0x06ff) && !isCombining(cp);
}

interface CharToken {
  base: string;
  diacritics: string;
}

function tokenizeChars(text: string): CharToken[] {
  const tokens: CharToken[] = [];
  const codepoints = [...text];
  let i = 0;
  while (i < codepoints.length) {
    const ch = codepoints[i]!;
    const cp = ch.codePointAt(0)!;
    if (isArabicBase(cp)) {
      let diacritics = "";
      let j = i + 1;
      while (j < codepoints.length) {
        const nc = codepoints[j]!;
        const ncp = nc.codePointAt(0)!;
        if (isCombining(ncp)) {
          diacritics += nc;
          j++;
        } else {
          break;
        }
      }
      tokens.push({ base: ch, diacritics });
      i = j;
    } else {
      tokens.push({ base: ch, diacritics: "" });
      i++;
    }
  }
  return tokens;
}

function hasTanwin(diacritics: string): boolean {
  return (
    diacritics.includes(TANWIN_FATH) ||
    diacritics.includes(TANWIN_DAMM) ||
    diacritics.includes(TANWIN_KASR)
  );
}

function classifyToken(
  token: CharToken,
  nextBase: string | null
): TajweedCategory {
  const { base, diacritics } = token;
  const hasSukun = diacritics.includes(SUKUN);
  const hasShaddah = diacritics.includes(SHADDAH);
  const hasMaddah = diacritics.includes(MADDAH);
  const hasSuperAlif = diacritics.includes(SUPERSCRIPT_ALIF);

  if (hasMaddah || hasSuperAlif) return "madd";

  if (hasShaddah && (base === "ن" || base === "م")) return "ghunna";

  if (hasSukun && QALQALAH_LETTERS.has(base)) return "qalqalah";

  const tanwin = hasTanwin(diacritics);
  const isNoon = base === "ن";
  const noonSukun = isNoon && hasSukun;

  if ((noonSukun || tanwin) && nextBase !== null) {
    if (IZHAR_LETTERS.has(nextBase)) return "izhar";
    if (nextBase === "ب") return "iqlab";
    if (IDGHAM_GHUNNA_LETTERS.has(nextBase)) return "idgham";
    if (IDGHAM_NO_GHUNNA_LETTERS.has(nextBase)) return "idgham";
    if (IKHFA_LETTERS.has(nextBase)) return "ikhfa";
  }

  const hasFatha = diacritics.includes(FATHA);
  const hasDamma = diacritics.includes(DAMMA);
  const hasKasra = diacritics.includes(KASRA);

  if (hasFatha && nextBase === "ا") return "madd";
  if (hasDamma && nextBase === "و") return "madd";
  if (hasKasra && nextBase === "ي") return "madd";

  if ((base === "ا" || base === "و" || base === "ي") && hasSukun) {
    return "madd";
  }

  return "default";
}

export function applyTajweed(text: string): TajweedToken[] {
  const charTokens = tokenizeChars(text);
  const result: TajweedToken[] = [];

  let i = 0;
  while (i < charTokens.length) {
    const token = charTokens[i]!;
    const cp = token.base.codePointAt(0)!;

    if (!isArabicBase(cp)) {
      if (result.length > 0 && result[result.length - 1]!.category === "default") {
        result[result.length - 1]!.text += token.base + token.diacritics;
      } else {
        result.push({ text: token.base + token.diacritics, category: "default" });
      }
      i++;
      continue;
    }

    let nextBase: string | null = null;
    for (let j = i + 1; j < charTokens.length; j++) {
      const ncp = charTokens[j]!.base.codePointAt(0)!;
      if (isArabicBase(ncp)) {
        nextBase = charTokens[j]!.base;
        break;
      }
    }

    const category = classifyToken(token, nextBase);
    const fullText = token.base + token.diacritics;

    const last = result[result.length - 1];
    if (last && last.category === category) {
      last.text += fullText;
    } else {
      result.push({ text: fullText, category });
    }
    i++;
  }

  return result;
}

export const TAJWEED_COLORS: Record<TajweedCategory, string> = {
  qalqalah: "#C8860A",
  ghunna: "#2D9E5D",
  madd: "#2A6EBB",
  ikhfa: "#7A5FA8",
  idgham: "#3DAA66",
  iqlab: "#B84A4A",
  izhar: "inherit",
  default: "inherit",
};

export const TAJWEED_LABELS: Record<TajweedCategory, string> = {
  qalqalah: "Qalqalah",
  ghunna: "Ghunna",
  madd: "Madd",
  ikhfa: "Ikhfa",
  idgham: "Idgham",
  iqlab: "Iqlab",
  izhar: "Izhar",
  default: "",
};
