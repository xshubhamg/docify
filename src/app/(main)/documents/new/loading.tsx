export default function NewDocumentLoading() {
  return (
    <main className="wrapper container">
      <div className="mx-auto max-w-180 animate-pulse space-y-10 motion-reduce:animate-none">
        <div className="space-y-4">
          <div className="h-10 w-64 rounded bg-(--bg-secondary)" />
          <div className="h-5 w-96 max-w-full rounded bg-(--bg-secondary)" />
        </div>

        <div className="space-y-6">
          <div className="h-40 rounded-lg bg-(--bg-secondary)" />
          <div className="h-40 rounded-lg bg-(--bg-secondary)" />
          <div className="h-12 rounded-lg bg-(--bg-secondary)" />
          <div className="h-12 rounded-lg bg-(--bg-secondary)" />
          <div className="h-28 rounded-lg bg-(--bg-secondary)" />
          <div className="h-14 rounded-[10px] bg-(--bg-secondary)" />
        </div>
      </div>
    </main>
  );
}
