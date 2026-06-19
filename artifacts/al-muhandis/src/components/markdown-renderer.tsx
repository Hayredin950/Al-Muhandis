import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  size?: "sm" | "base";
}

export function MarkdownRenderer({ content, className, size = "sm" }: MarkdownRendererProps) {
  const textSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn("markdown-body leading-relaxed", textSize, className)}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold text-foreground mt-5 mb-2 first:mt-0 pb-1 border-b border-border">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mt-3 mb-1.5 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-primary mt-2 mb-1">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-muted-foreground leading-relaxed mb-3 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-foreground/80">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="my-2 space-y-1 pl-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 space-y-1 pl-4 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1.5 shrink-0 text-xs">▸</span>
            <span>{children}</span>
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-3 pl-4 border-l-2 border-primary/40 bg-primary/5 rounded-r-lg py-2 pr-3">
            <div className="text-muted-foreground italic">{children}</div>
          </blockquote>
        ),
        code: ({ children, className: cls }) => {
          const isInline = !cls;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded-md bg-muted text-primary text-[0.8em] font-mono">{children}</code>
            );
          }
          return (
            <pre className="my-3 p-4 rounded-xl bg-muted/50 border border-border overflow-x-auto">
              <code className="text-xs font-mono text-foreground">{children}</code>
            </pre>
          );
        },
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-4 border-border" />,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-xs font-semibold text-foreground border-b border-border">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-muted-foreground border-b border-border last:border-0 text-xs">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
