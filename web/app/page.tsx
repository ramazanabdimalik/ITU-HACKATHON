export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section
        aria-labelledby="project-title"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"
      >
        <h1
          id="project-title"
          className="text-4xl font-semibold tracking-tight text-slate-900"
        >
          SafeTransfer
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          A safer way to send money. Coming soon.
        </p>
      </section>
    </main>
  );
}
