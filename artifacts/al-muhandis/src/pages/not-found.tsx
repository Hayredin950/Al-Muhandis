import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
        <p className="text-6xl font-bold text-primary mb-4" style={{ fontFamily: "'Amiri Quran', serif" }}>٤٠٤</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
          The page you are looking for does not exist. Return home and continue your journey.
        </p>
        <Link href="/">
          <button className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
            <Home className="w-4 h-4" />
            Return Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
