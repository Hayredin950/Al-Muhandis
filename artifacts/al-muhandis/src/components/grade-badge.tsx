import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, ShieldAlert, ShieldX, CircleDot, Info } from "lucide-react";
import { getGradeInfo, type GradeCategory } from "@/lib/hadith-grades";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<GradeCategory, React.ElementType> = {
  authentic: ShieldCheck,
  good: ShieldCheck,
  weak: ShieldAlert,
  fabricated: ShieldX,
  disconnected: CircleDot,
  special: Info,
};

interface GradeBadgeProps {
  grade: string;
  showExpanded?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GradeBadge({ grade, showExpanded = false, size = "md", className }: GradeBadgeProps) {
  const [expanded, setExpanded] = useState(showExpanded);
  const info = getGradeInfo(grade);
  const Icon = CATEGORY_ICONS[info.category] ?? Info;

  return (
    <div className={cn("rounded-xl border overflow-hidden", info.borderColor, className)}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-3 transition-all",
          info.bgColor,
          "hover:brightness-110"
        )}
      >
        <Icon className={cn("shrink-0", info.textColor, size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-bold", info.textColor, size === "sm" ? "text-xs" : "text-sm")}>
              {info.name}
            </span>
            <span
              className={cn("font-medium opacity-80", info.textColor, size === "sm" ? "text-xs" : "text-sm")}
              style={{ fontFamily: "'Amiri Quran', serif", direction: "rtl" }}
            >
              {info.nameArabic}
            </span>
          </div>
          <p className={cn("text-muted-foreground mt-0.5 truncate", size === "sm" ? "text-[10px]" : "text-xs")}>
            {info.shortDesc}
          </p>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 shrink-0 transition-transform",
          info.textColor,
          expanded ? "rotate-180" : ""
        )} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 bg-card border-t border-border space-y-3">
              {/* Arabic name */}
              <div className="text-right" dir="rtl">
                <p
                  className={cn("text-xl font-bold", info.textColor)}
                  style={{ fontFamily: "'Amiri Quran', serif" }}
                >
                  {info.nameArabicVocalized}
                </p>
              </div>

              {/* Full description */}
              <p className="text-sm text-foreground leading-relaxed">{info.fullDesc}</p>

              {/* Usable as evidence */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
                info.usableAsEvidence
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              )}>
                {info.usableAsEvidence
                  ? "✓ Used as Islamic legal evidence (hujja)"
                  : "✗ Not used as standalone evidence in Islamic law"
                }
              </div>

              {/* Criteria */}
              {info.criteria.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Criteria / Conditions
                  </p>
                  <ul className="space-y-1.5">
                    {info.criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className={cn("mt-0.5 shrink-0 text-xs", info.textColor)}>•</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Example */}
              {info.example && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Example
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{info.example}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InlineGradeBadge({ grade, className }: { grade: string; className?: string }) {
  const info = getGradeInfo(grade);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold",
      info.bgColor, info.textColor, info.borderColor, "border",
      className
    )}>
      {info.name}
    </span>
  );
}
