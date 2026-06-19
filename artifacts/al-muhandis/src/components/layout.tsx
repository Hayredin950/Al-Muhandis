import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ScrollText, Search, Bookmark, Moon, Sun, Menu, X,
  Home, Tag, Settings2, Sparkles, BookText, Target, CalendarDays, BarChart2,
  LogIn, Pencil, Library, Shield,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Show, UserButton } from "@clerk/react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/quran", label: "Quran Reader", icon: BookOpen },
  { href: "/mushaf", label: "Mushaf", icon: BookText },
  { href: "/hifz", label: "Memorization", icon: Target },
  { href: "/khatmah", label: "Khatmah", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/hadith", label: "Hadith", icon: ScrollText },
  { href: "/collections", label: "Collections", icon: Library },
  { href: "/search", label: "Search", icon: Search },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/journal", label: "My Journal", icon: Pencil },
  { href: "/topics", label: "Topics", icon: Tag },
  { href: "/ask-scholar", label: "Ask Scholar", icon: Sparkles },
];

const BOTTOM_NAV = [
  { href: "/admin/collections", label: "Admin", icon: Shield },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

function UserSection() {
  return (
    <div className="px-3 py-3 border-t border-border">
      <Show when="signed-in">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-7 h-7",
                userButtonPopoverCard: "bg-card border border-border shadow-2xl",
                userButtonPopoverActionButton: "text-sm text-foreground hover:bg-accent/30",
                userButtonPopoverActionButtonText: "text-foreground",
                userButtonPopoverFooter: "hidden",
              },
            }}
          />
          <span className="text-sm text-sidebar-foreground font-medium truncate">Account</span>
        </div>
      </Show>
      <Show when="signed-out">
        <Link href="/sign-in">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all cursor-pointer">
            <LogIn className="w-4 h-4 shrink-0" />
            Sign In
          </div>
        </Link>
      </Show>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevLocation = useRef("/");

  useEffect(() => {
    if (!location.startsWith("/settings")) {
      prevLocation.current = location;
    }
  }, [location]);

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-border bg-sidebar fixed top-0 bottom-0 left-0 z-30">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">م</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-none">Al-Muhandis</p>
            <p className="text-xs text-muted-foreground mt-0.5">Islamic Intelligence</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-2 space-y-1">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
            const active = location.startsWith(href);
            return (
              <div
                key={href}
                onClick={() => navigate(href)}
                onDoubleClick={(e) => { e.preventDefault(); e.stopPropagation(); if (active) navigate(prevLocation.current); }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer select-none",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
            );
          })}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <UserSection />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-sidebar/90 backdrop-blur-md flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">م</span>
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">Al-Muhandis</span>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in">
              <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-all">
                <LogIn className="w-4 h-4 text-sidebar-foreground" />
              </button>
            </Link>
          </Show>
          <Link href="/settings">
            <button className="p-2 rounded-lg hover:bg-sidebar-accent transition-all">
              <Settings2 className="w-4 h-4 text-sidebar-foreground" />
            </button>
          </Link>
          <button onClick={() => setTheme(isDark ? "light" : "dark")} className="p-2 rounded-lg hover:bg-sidebar-accent transition-all">
            {isDark ? <Sun className="w-4 h-4 text-sidebar-foreground" /> : <Moon className="w-4 h-4 text-sidebar-foreground" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-sidebar-accent transition-all">
            {mobileOpen ? <X className="w-4 h-4 text-sidebar-foreground" /> : <Menu className="w-4 h-4 text-sidebar-foreground" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="md:hidden fixed inset-0 z-40 bg-sidebar pt-14"
          >
            <nav className="px-3 py-4 space-y-1">
              {[...NAV_ITEMS, ...BOTTOM_NAV].map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? location === "/" : location.startsWith(href);
                return (
                  <Link key={href} href={href}>
                    <div
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="px-6 py-4 border-t border-border">
              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                  <span className="text-sm text-sidebar-foreground">My Account</span>
                </div>
              </Show>
              <Show when="signed-out">
                <Link href="/sign-in">
                  <div
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    Sign In / Register
                  </div>
                </Link>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14 md:ml-60">
        {children}
      </main>
    </div>
  );
}
