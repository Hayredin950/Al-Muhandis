import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, User, Link2, Info } from "lucide-react";
import { getReliabilityInfo, type HadithGrade } from "@/lib/hadith-grades";
import { cn } from "@/lib/utils";

export interface IsnadNarrator {
  rawName: string;
  rawNameArabic?: string;
  position: number;
  transmissionVerb?: string;
  entry?: {
    id: string;
    name: string;
    nameArabic: string;
    generation: string;
    bornAH?: number;
    diedAH?: number;
    region: string;
    reliability: string;
    reliabilityArabic: string;
    bio: string;
    weaknessReason?: string;
    scholarsOpinions?: Array<{ scholar: string; opinion: string; grade: string }>;
    teachers?: string[];
    students?: string[];
    notableFor?: string;
    transmissionMethod?: string;
  };
}

export interface IsnadData {
  narrators: IsnadNarrator[];
  overallGrade: string;
  chainAnalysis?: string;
  defects?: string[];
}

interface IsnadMapProps {
  isnad: IsnadData;
  className?: string;
}

const VERB_TRANSLATIONS: Record<string, string> = {
  "حدثنا": "Narrated to us (direct)",
  "حَدَّثَنَا": "Narrated to us (direct)",
  "حدثني": "Narrated to me (direct)",
  "حَدَّثَنِي": "Narrated to me (direct)",
  "أخبرنا": "Informed us",
  "أَخْبَرَنَا": "Informed us",
  "أخبرني": "Informed me",
  "أَخْبَرَنِي": "Informed me",
  "سمعت": "I heard (strongest form)",
  "سَمِعْتُ": "I heard (strongest form)",
  "أنبأنا": "Told us",
  "عن": "From (may be indirect)",
  "عَنْ": "From (may be indirect)",
};

function getReliabilityIcon(reliability: string) {
  const r = reliability.toLowerCase();
  if (r === "companion") return { icon: CheckCircle2, color: "text-amber-400" };
  if (r.includes("thiqa")) return { icon: CheckCircle2, color: "text-emerald-400" };
  if (r.includes("saduq")) return { icon: CheckCircle2, color: "text-blue-400" };
  if (r.includes("layyin")) return { icon: AlertTriangle, color: "text-yellow-400" };
  if (r.includes("da'if") || r.includes("daif") || r.includes("weak")) return { icon: AlertTriangle, color: "text-amber-500" };
  if (r.includes("matruk") || r.includes("kadhdhab")) return { icon: XCircle, color: "text-red-500" };
  return { icon: User, color: "text-muted-foreground" };
}

function getLineColor(reliability: string): string {
  const r = reliability.toLowerCase();
  if (r === "companion") return "bg-amber-500/50";
  if (r.includes("thiqa")) return "bg-emerald-500/50";
  if (r.includes("saduq")) return "bg-blue-500/50";
  if (r.includes("layyin")) return "bg-yellow-500/50";
  if (r.includes("da'if") || r.includes("daif") || r.includes("weak")) return "bg-amber-500/50";
  if (r.includes("matruk") || r.includes("kadhdhab")) return "bg-red-500/50";
  return "bg-border";
}

function NarratorNode({ narrator, index, total, isWeakest }: {
  narrator: IsnadNarrator;
  index: number;
  total: number;
  isWeakest: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const entry = narrator.entry;
  const reliability = entry?.reliability ?? "Unknown";
  const reliabilityInfo = getReliabilityInfo(reliability);
  const { icon: ReliabilityIcon, color: iconColor } = getReliabilityIcon(reliability);
  const verbTranslation = narrator.transmissionVerb
    ? (VERB_TRANSLATIONS[narrator.transmissionVerb] ?? narrator.transmissionVerb)
    : null;
  const lineColor = getLineColor(reliability);

  return (
    <div className="relative flex items-start gap-3">
      {/* Connector line */}
      {index < total - 1 && (
        <div className={cn("absolute left-4 top-10 bottom-0 w-0.5 -mb-1", lineColor)} />
      )}

      {/* Node number + icon */}
      <div className="relative z-10 shrink-0 flex flex-col items-center gap-1 mt-1">
        <div className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs",
          isWeakest
            ? "border-amber-500 bg-amber-500/10 text-amber-500"
            : reliabilityInfo.bg,
          !isWeakest && reliabilityInfo.color,
          !isWeakest && "border-border"
        )}>
          {index + 1}
        </div>
        {verbTranslation && index > 0 && (
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap hidden lg:block"
            style={{ writingMode: "horizontal-tb" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        {/* Transmission verb */}
        {narrator.transmissionVerb && index > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Link2 className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" />
            <span className="text-[10px] text-muted-foreground/70" dir="rtl" style={{ fontFamily: "'Amiri Quran', serif" }}>
              {narrator.transmissionVerb}
            </span>
            {verbTranslation && (
              <span className="text-[10px] text-muted-foreground/50">({verbTranslation})</span>
            )}
          </div>
        )}

        <button
          onClick={() => entry && setExpanded((v) => !v)}
          className={cn(
            "w-full text-left rounded-xl border p-3 transition-all",
            isWeakest
              ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10"
              : "border-border bg-card hover:border-primary/30 hover:bg-accent/10",
            !entry && "cursor-default"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-foreground">
                  {entry?.name ?? narrator.rawName}
                </p>
                {isWeakest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                    Weakest Link
                  </span>
                )}
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium border",
                  reliabilityInfo.bg, reliabilityInfo.color,
                  "border-current/20"
                )}>
                  {entry ? entry.reliability : "Unidentified"}
                </span>
              </div>
              {entry && (
                <p
                  className="text-xs text-muted-foreground mt-0.5"
                  dir="rtl"
                  style={{ fontFamily: "'Amiri Quran', serif" }}
                >
                  {entry.nameArabic}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                {entry?.generation && <span className="opacity-70">{entry.generation}</span>}
                {entry?.diedAH && <span>d. {entry.diedAH} AH</span>}
                {entry?.region && <span>{entry.region}</span>}
                {!entry && narrator.rawName && (
                  <span className="text-muted-foreground/50 italic">narrator not in database</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <ReliabilityIcon className={cn("w-4 h-4 shrink-0", iconColor)} />
              {entry && (
                expanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Inline reliability arabic */}
          {entry && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn("text-xs font-medium", reliabilityInfo.color)}
                dir="rtl"
                style={{ fontFamily: "'Amiri Quran', serif" }}
              >
                {entry.reliabilityArabic}
              </span>
            </div>
          )}

          {/* Weakness reason inline */}
          {entry?.weaknessReason && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-400/80 leading-relaxed">{entry.weaknessReason}</p>
            </div>
          )}
        </button>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && entry && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                {/* Biography */}
                <p className="text-xs text-muted-foreground leading-relaxed">{entry.bio}</p>

                {/* Notable for */}
                {entry.notableFor && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notable For</p>
                    <p className="text-xs text-foreground">{entry.notableFor}</p>
                  </div>
                )}

                {/* Transmission method */}
                {entry.transmissionMethod && (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">Transmission Method</p>
                    <p className="text-xs text-muted-foreground">{entry.transmissionMethod}</p>
                  </div>
                )}

                {/* Scholars' opinions */}
                {entry.scholarsOpinions && entry.scholarsOpinions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Scholars' Assessments (Jarh wa Ta'dil)
                    </p>
                    <div className="space-y-2">
                      {entry.scholarsOpinions.map((op, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                          <div>
                            <span className="text-[11px] font-semibold text-foreground">{op.scholar}: </span>
                            <span className="text-[11px] text-muted-foreground">"{op.opinion}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teachers & Students */}
                <div className="grid grid-cols-2 gap-3">
                  {entry.teachers && entry.teachers.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Heard From</p>
                      <div className="space-y-0.5">
                        {entry.teachers.slice(0, 4).map((t) => (
                          <p key={t} className="text-[11px] text-muted-foreground">• {t}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {entry.students && entry.students.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Transmitted To</p>
                      <div className="space-y-0.5">
                        {entry.students.slice(0, 4).map((s) => (
                          <p key={s} className="text-[11px] text-muted-foreground">• {s}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function IsnadMap({ isnad, className }: IsnadMapProps) {
  const [showDefects, setShowDefects] = useState(false);
  const { narrators, overallGrade, chainAnalysis, defects } = isnad;

  if (!narrators || narrators.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Chain of Narration (Isnad)</p>
        </div>
        <p className="text-sm text-muted-foreground">Chain analysis not available for this hadith.</p>
      </div>
    );
  }

  const hasWeakness = (defects?.length ?? 0) > 0;
  const identifiedCount = narrators.filter((n) => n.entry).length;
  const weakestNarrator = narrators.find((n) => {
    const r = n.entry?.reliability ?? "";
    return r === "Da'if" || r === "Da'if Jiddan" || r === "Matruk" || r === "Kadhdhab";
  });

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Chain of Narration (Isnad)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {identifiedCount}/{narrators.length} identified
            </span>
          </div>
        </div>

        {/* Chain analysis */}
        {chainAnalysis && (() => {
          const hasUnidentified = identifiedCount < narrators.length;
          const allReliableClaim = !hasWeakness && chainAnalysis.toLowerCase().includes("reliable");
          const showCaveat = allReliableClaim && hasUnidentified;
          return (
            <div className={cn(
              "mt-3 p-3 rounded-lg text-xs leading-relaxed border",
              hasWeakness
                ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                : showCaveat
                ? "bg-sky-500/10 border-sky-500/20 text-sky-300"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
              <div className="flex items-start gap-1.5">
                {hasWeakness
                  ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                }
                <span>
                  {showCaveat
                    ? `Graded ${overallGrade} by scholars — ${narrators.length - identifiedCount} narrator(s) not found in our database but grading is based on classical scholarship.`
                    : chainAnalysis}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Defects */}
        {defects && defects.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowDefects((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              <AlertTriangle className="w-3 h-3" />
              {defects.length} chain defect{defects.length > 1 ? "s" : ""} identified
              <ChevronDown className={cn("w-3 h-3 transition-transform", showDefects && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showDefects && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-1.5">
                    {defects.map((d, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-400/80">
                        <span className="shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Chain diagram */}
      <div className="p-5">
        {/* Legend */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Legend:</p>
          {[
            { label: "Thiqa/Companion", color: "text-emerald-400 bg-emerald-500/15" },
            { label: "Saduq", color: "text-blue-400 bg-blue-500/15" },
            { label: "Da'if", color: "text-amber-500 bg-amber-500/15" },
            { label: "Unknown", color: "text-muted-foreground bg-muted" },
          ].map((l) => (
            <span key={l.label} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", l.color)}>
              {l.label}
            </span>
          ))}
        </div>

        {/* Narrator nodes */}
        <div className="space-y-0">
          {narrators.map((narrator, i) => (
            <NarratorNode
              key={`${narrator.rawName}-${i}`}
              narrator={narrator}
              index={i}
              total={narrators.length}
              isWeakest={!!(weakestNarrator && weakestNarrator.rawName === narrator.rawName)}
            />
          ))}
        </div>

        {/* Hadith Science Info */}
        <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                About Isnad Analysis (علم الإسناد)
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The chain of narration (isnad) is what makes Islamic hadith science unique. 
                Each narrator was scrutinized for their character (<em>ʿadāla</em>) and precision (<em>ḍabṭ</em>) 
                in the science of <em>al-Jarḥ wa al-Taʿdīl</em> (narrator criticism and authentication). 
                The chain flows from the compiler → narrators → Companion → Prophet ﷺ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
