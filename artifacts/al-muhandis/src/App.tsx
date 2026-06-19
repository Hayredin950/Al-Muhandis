import { useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { AudioPlayerProvider } from "@/contexts/audio-player";
import { AudioPlayer } from "@/components/audio-player";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
import Home from "@/pages/home";
import Quran from "@/pages/quran";
import SurahPage from "@/pages/surah";
import HadithPage from "@/pages/hadith";
import HadithCollection from "@/pages/hadith-collection";
import HadithChapter from "@/pages/hadith-chapter";
import HadithDetail from "@/pages/hadith-detail";
import SearchPage from "@/pages/search";
import BookmarksPage from "@/pages/bookmarks";
import SettingsPage from "@/pages/settings";
import TopicsPage from "@/pages/topics";
import AskScholar from "@/pages/ask-scholar";
import MushafPage from "@/pages/mushaf";
import HifzPage from "@/pages/hifz";
import KhatmahPage from "@/pages/khatmah";
import AnalyticsPage from "@/pages/analytics";
import HadithGradePage from "@/pages/hadith-grade";
import TopicDetailPage from "@/pages/topic-detail";
import HadithFlashcards from "@/pages/hadith-flashcards";
import WeakHadithsPage from "@/pages/weak-hadiths";
import HadithJournalPage from "@/pages/hadith-journal";
import CollectionsPage from "@/pages/collections";
import CollectionDetailPage from "@/pages/collection-detail";
import AdminCollectionsPage from "@/pages/admin-collections";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL || undefined;
const clerkPubKey =
  publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  ) || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk" as const,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#d97706",
    colorForeground: "#f8fafc",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#ef4444",
    colorBackground: "#0f1117",
    colorInput: "#1e2330",
    colorInputForeground: "#f8fafc",
    colorNeutral: "#334155",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0f1117] border border-[#1e2330] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold text-xl",
    headerSubtitle: "text-slate-400 text-sm",
    socialButtonsBlockButtonText: "text-slate-200 text-sm font-medium",
    formFieldLabel: "text-slate-300 text-sm font-medium",
    footerActionLink: "text-amber-500 hover:text-amber-400 font-medium",
    footerActionText: "text-slate-400 text-sm",
    dividerText: "text-slate-500 text-xs",
    identityPreviewEditButton: "text-amber-500",
    formFieldSuccessText: "text-emerald-400 text-xs",
    alertText: "text-slate-200 text-sm",
    logoBox: "flex justify-center mb-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-[#2d3748] bg-[#1a2130] hover:bg-[#232d40] text-slate-200 rounded-xl transition-all",
    formButtonPrimary: "bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-all",
    formFieldInput: "bg-[#1e2330] border border-[#2d3748] text-white rounded-xl placeholder:text-slate-600 focus:border-amber-600 focus:ring-1 focus:ring-amber-600/30",
    footerAction: "border-t border-[#1e2330]",
    dividerLine: "bg-[#1e2330]",
    alert: "border border-[#2d3748] bg-[#1a2130] rounded-xl",
    otpCodeFieldInput: "bg-[#1e2330] border border-[#2d3748] text-white rounded-xl",
    formFieldRow: "space-y-1.5",
    main: "px-6 py-4",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useRef(
    (() => {
      const unlisten = addListener(({ user }) => {
        const userId = user?.id ?? null;
        if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
          void qc.invalidateQueries();
        }
        prevUserIdRef.current = userId;
      });
      return unlisten;
    }) as unknown as undefined,
  );

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground text-xl font-bold">م</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to Al-Muhandis</p>
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          appearance={clerkAppearance}
          fallbackRedirectUrl={`${basePath}/`}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground text-xl font-bold">م</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Create account</h2>
          <p className="text-sm text-muted-foreground mt-1">Join Al-Muhandis — Islamic Intelligence Platform</p>
        </div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          appearance={clerkAppearance}
          fallbackRedirectUrl={`${basePath}/`}
        />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/" component={() => (
        <Layout>
          <AudioPlayerProvider>
            <Home />
            <AudioPlayer />
          </AudioPlayerProvider>
        </Layout>
      )} />
      <Route path="/quran" component={() => <Layout><AudioPlayerProvider><Quran /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/quran/:surahId" component={() => <Layout><AudioPlayerProvider><SurahPage /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hadith" component={() => <Layout><AudioPlayerProvider><HadithPage /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hadith/grade/:grade" component={() => <Layout><AudioPlayerProvider><HadithGradePage /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hadith/flashcards" component={() => <Layout><HadithFlashcards /></Layout>} />
      <Route path="/hadith/weak" component={() => <Layout><WeakHadithsPage /></Layout>} />
      <Route path="/journal" component={() => <Layout><HadithJournalPage /></Layout>} />
      <Route path="/hadith/:collectionId" component={() => <Layout><AudioPlayerProvider><HadithCollection /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hadith/:collectionId/chapter/:chapterId" component={() => <Layout><AudioPlayerProvider><HadithChapter /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hadith/:collectionId/:hadithId" component={() => <Layout><AudioPlayerProvider><HadithDetail /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/search" component={() => <Layout><SearchPage /></Layout>} />
      <Route path="/bookmarks" component={() => <Layout><BookmarksPage /></Layout>} />
      <Route path="/topics/:topicId" component={() => <Layout><TopicDetailPage /></Layout>} />
      <Route path="/topics" component={() => <Layout><TopicsPage /></Layout>} />
      <Route path="/settings" component={() => <Layout><AudioPlayerProvider><SettingsPage /></AudioPlayerProvider></Layout>} />
      <Route path="/ask-scholar" component={() => <Layout><AskScholar /></Layout>} />
      <Route path="/mushaf" component={() => <Layout><AudioPlayerProvider><MushafPage /><AudioPlayer /></AudioPlayerProvider></Layout>} />
      <Route path="/hifz" component={() => <Layout><HifzPage /></Layout>} />
      <Route path="/hifz/:surahNumber" component={() => <Layout><HifzPage /></Layout>} />
      <Route path="/khatmah" component={() => <Layout><KhatmahPage /></Layout>} />
      <Route path="/analytics" component={() => <Layout><AnalyticsPage /></Layout>} />
      <Route path="/collections" component={() => <Layout><CollectionsPage /></Layout>} />
      <Route path="/collections/:id" component={() => <Layout><CollectionDetailPage /></Layout>} />
      <Route path="/admin/collections" component={() => <Layout><AdminCollectionsPage /></Layout>} />
      <Route path="/profile" component={() => <Layout><ProfilePage /></Layout>} />
      <Route component={() => <Layout><NotFound /></Layout>} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="al-muhandis-theme">
      <QueryClientProvider client={queryClient}>
        <ClerkProvider
          publishableKey={clerkPubKey ?? ""}
          proxyUrl={clerkProxyUrl}
          routerPush={(to) => {
            window.history.pushState({}, "", to);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          routerReplace={(to) => {
            window.history.replaceState({}, "", to);
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        >
          <ClerkQueryClientCacheInvalidator />
          <TooltipProvider>
            <WouterRouter base={basePath}>
              <Router />
            </WouterRouter>
          </TooltipProvider>
          <Toaster />
        </ClerkProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
