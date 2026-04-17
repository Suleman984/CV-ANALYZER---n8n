import { CvAnalyzerForm } from "@/components/CvAnalyzerForm";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <header className="border-b border-zinc-200/80 bg-white/80 px-4 py-5 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              CV Analyzer
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Upload &amp; analyze your CV
            </h1>
          </div>
          <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            PDF only. Your file is sent to your n8n workflow for processing.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <CvAnalyzerForm />
      </main>

      <footer className="border-t border-zinc-200 px-4 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
        Configure <code className="rounded bg-zinc-200/80 px-1 py-0.5 dark:bg-zinc-800">N8N_WEBHOOK_URL</code>{" "}
        in <code className="rounded bg-zinc-200/80 px-1 py-0.5 dark:bg-zinc-800">.env.local</code>
      </footer>
    </div>
  );
}
