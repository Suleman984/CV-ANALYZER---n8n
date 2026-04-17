"use client";

import { useCallback, useId, useState } from "react";

const PDF_MIME = "application/pdf";
// validatePdfMagicBytes validates the magic bytes of a PDF file
async function validatePdfMagicBytes(file: File): Promise<boolean> {
  const sample = file.slice(0, Math.min(5, file.size));
  const buf = new Uint8Array(await sample.arrayBuffer());
  if (buf.length < 4) return false;
  const header = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
  return header === "%PDF";
}

function validatePdfFrontend(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".pdf")) {
    return "File must use the .pdf extension.";
  }
  if (file.type && file.type !== PDF_MIME) {
    return "Only PDF files are accepted (MIME type check).";
  }
  return null;
}

export function CvAnalyzerForm() {
  const nameId = useId();
  const fileId = useId();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const resetFile = useCallback(() => {
    setFile(null);
    setMagicError(null);
  }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setResult(null);
      setMagicError(null);
      const f = e.target.files?.[0];
      e.target.value = "";

      if (!f) {
        resetFile();
        return;
      }

      const quick = validatePdfFrontend(f);
      if (quick) {
        console.log("quick", quick);
        setError(quick);
        resetFile();
        return;
      }

      const okMagic = await validatePdfMagicBytes(f);
      if (!okMagic) {
        setMagicError("This file does not look like a valid PDF (header check).");
        resetFile();
        return;
      }

      setFile(f);
    },
    [resetFile],
  );

  const canSubmit =
    name.trim().length > 0 && file !== null && !magicError;

  async function onAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!file) {
      setError("Please upload a PDF CV.");
      return;
    }

    const again = validatePdfFrontend(file);
    if (again) {
      setError(again);
      return;
    }
    const okMagic = await validatePdfMagicBytes(file);
    if (!okMagic) {
      setMagicError("Invalid PDF file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let display = text;
      try {
        const json = JSON.parse(text) as unknown;
        display = JSON.stringify(json, null, 2);
      } catch {
        // keep raw text
      }

      if (!res.ok) {
        setError(display || `Request failed (${res.status})`);
        return;
      }
      setResult(display);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onAnalyze}
      className="flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="space-y-2">
        <label
          htmlFor={nameId}
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Full name
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900 outline-none ring-zinc-400 transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor={fileId}
          className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          CV (PDF only)
        </label>
        <input
          id={fileId}
          name="file"
          type="file"
          accept={PDF_MIME}
          onChange={onFileChange}
          className="block w-full cursor-pointer text-sm text-zinc-600 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:text-zinc-400 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Only <span className="font-medium">.pdf</span> files. We verify type,
          extension, and PDF header before upload.
        </p>
        {file && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Selected: <span className="font-medium">{file.name}</span> (
            {(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {(error || magicError) && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
        >
          {magicError ?? error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>

      {result && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Response
          </h2>
          <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 sm:text-sm">
            {result}
          </pre>
        </div>
      )}
    </form>
  );
}
