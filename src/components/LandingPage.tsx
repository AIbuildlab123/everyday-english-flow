"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  MessageCircle,
  Layers3,
  Globe,
  Briefcase,
  Plane,
  Users,
  SlidersHorizontal,
  PenLine,
  Sparkles,
  Play,
} from "lucide-react";

const categoryCards = [
  {
    label: "Workplace",
    icon: <Briefcase size={44} className="text-blue-500" />,
    desc: "Professional dialogues. Master meetings, presentations & emails.",
  },
  {
    label: "Travel",
    icon: <Plane size={44} className="text-emerald-500" />,
    desc: "Seamless journeys. Navigate airports, hotels & restaurants.",
  },
  {
    label: "Social",
    icon: <Users size={44} className="text-violet-500" />,
    desc: "American culture tips. Chat with friends, date & network.",
  },
];

export function LandingPage() {
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setAuthError(decodeURIComponent(error));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleSignInWithGoogle() {
    const supabase = createClient();
    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${baseUrl}/auth/callback` },
    });
    if (error) {
      console.error("Sign in error:", error);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-slate-100 text-[#16213C] dark:from-gray-950 dark:to-slate-900 dark:text-zinc-100">
      <main className="w-full flex flex-col items-center px-4 py-16 md:px-6 md:py-20">
        {/* HERO SECTION */}
        <section className="w-full flex flex-col items-center gap-6 pb-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="sr-only">Everyday English Flow</h1>
            <img
              src="/logo.png"
              alt="Everyday English Flow"
              className="w-full max-w-[280px] md:max-w-[420px] lg:max-w-[520px] h-auto object-contain"
            />
            <div className="w-full max-w-2xl mx-auto px-6 md:px-8 text-center">
              <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300">
                Master real-life conversations with AI-powered lessons. Tailored to your level to create custom, instant English lessons. Start practicing today!
              </p>
            </div>
          </div>

          {/* YouTube demo video - facade: thumbnail + play, load iframe on click */}
          <div className="w-full flex justify-center px-4">
            <div className="relative w-full max-w-xl aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
              <YouTubeVideoFacade
                videoId="JAvN0YQuve0"
                thumbnailSrc="https://img.youtube.com/vi/JAvN0YQuve0/maxresdefault.jpg"
              />
            </div>
          </div>

          {/* Inline Pricing box under hero copy */}
          <div className="w-full flex justify-center">
            <div className="mx-auto w-full max-w-xl">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 px-6 py-7 md:px-8 md:py-8 text-center">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
                  Premium Access
                </h2>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-indigo-700 dark:text-indigo-300">
                    $4.99
                  </span>
                  <span className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                    / month
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                  Billed monthly. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleSignInWithGoogle}
                className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-600 px-10 py-4 text-xl font-semibold text-white focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:outline-none"
              >
                <GoogleIcon className="h-6 w-6" />
                Sign in with Google
              </button>
              <span className="rounded-xl border border-slate-200 bg-slate-50 px-10 py-4 text-xl font-semibold text-indigo-800 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-200 flex items-center justify-center">
                5-day Free Trial — No Credit Card Required
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Start learning in seconds. No strings attached.
            </p>
          </div>
          {authError && (
            <p className="mt-4 rounded-lg bg-rose-100 px-3 py-2 text-base text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
              {authError}
            </p>
          )}
        </section>

        {/* How it Works - directly below sign in */}
        <section className="w-full border-y border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40 py-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-indigo-900 dark:text-indigo-100 mb-10 tracking-tight">
            How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <SlidersHorizontal className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">1. Pick a Level</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Choose Beginner, Intermediate, or Advanced.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <PenLine className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">2. Describe a Situation</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Tell the AI exactly what you want to practice.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">3. Master the Flow</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Get custom dialogues, vocabulary, and culture tips instantly.</p>
            </div>
          </div>
        </section>

        {/* FEATURE SECTION */}
        <section className="w-full py-14">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-indigo-500" />}
              title="Realistic Scenarios"
              desc="Dialogues for work, travel, and social life—based on real conversations, not textbooks."
            />
            <FeatureCard
              icon={<Layers3 className="h-10 w-10 text-green-500" />}
              title="Tiered Learning"
              desc="Choose your level and get content that matches your skills—never too easy or too hard."
            />
            <FeatureCard
              icon={<Globe className="h-10 w-10 text-amber-500" />}
              title="Culture Insights"
              desc="American culture tips and quizzes to help you truly fit in."
            />
          </div>
        </section>

        {/* Category cards: Workplace, Travel, Social */}
        <section className="w-full py-14 grid grid-cols-1 gap-6 md:grid-cols-3 px-4 md:px-6">
          {categoryCards.map((card) => (
            <div
              key={card.label}
              className="flex flex-col items-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 p-8"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                {card.icon}
              </div>
              <span className="font-bold text-2xl text-indigo-900 dark:text-indigo-200">
                {card.label}
              </span>
              <p className="mt-3 text-center text-lg text-slate-600 dark:text-slate-400 leading-snug">
                {card.desc}
              </p>
            </div>
          ))}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800 py-12">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10 text-sm">
            {/* Column 1: Brand */}
            <div className="flex flex-col gap-2">
              <span className="font-bold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                Everyday English Flow
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Mastering American English through realistic AI dialogues.
              </p>
            </div>
            {/* Column 2: Legal */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Legal
              </span>
              <a
                href="https://sites.google.com/view/everyday-english-flow-privacy/home"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://sites.google.com/view/everyday-english-flow-privacy/terms-of-service"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="https://sites.google.com/view/everyday-english-flow-privacy/data-safety"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Data Safety
              </a>
            </div>
            {/* Column 3: Support */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Support
              </span>
              <a
                href="https://sites.google.com/view/everyday-english-flow-privacy/support"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
              >
                Help &amp; Support
              </a>
              <a
                href="mailto:contact@eslspeakingcorner.com"
                className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors break-all"
              >
                contact@eslspeakingcorner.com
              </a>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              © 2026 Everyday English Flow by ESL SPEAKING CORNER. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Facade: show thumbnail + play button until click, then load YouTube iframe (youtube-nocookie.com, autoplay). */
function YouTubeVideoFacade({
  videoId,
  thumbnailSrc,
}: {
  videoId: string;
  thumbnailSrc: string;
}) {
  const [showIframe, setShowIframe] = useState(false);
  const [thumb, setThumb] = useState(thumbnailSrc);
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  const fallbackThumb = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;

  if (showIframe) {
    return (
      <iframe
        src={embedUrl}
        title="Everyday English Flow demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowIframe(true)}
      className="relative block h-full w-full cursor-pointer border-0 p-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label="Play demo video"
    >
      <img
        src={thumb}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setThumb(fallbackThumb)}
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-indigo-600 shadow-lg transition-transform hover:scale-110 md:h-20 md:w-20">
          <Play className="h-8 w-8 md:h-10 md:w-10 fill-current" aria-hidden />
        </span>
      </span>
    </button>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 p-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 [&>svg]:h-10 [&>svg]:w-10">
        {icon}
      </div>
      <span className="font-bold text-2xl text-indigo-900 dark:text-indigo-200">{title}</span>
      <p className="mt-3 text-center text-lg text-slate-600 dark:text-slate-400 leading-snug">{desc}</p>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
