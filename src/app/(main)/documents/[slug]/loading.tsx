export default function DocumentLoading() {
  return (
    <main className="wrapper pt-[calc(var(--navbar-height)+24px)] pb-8">
      <div className="grid animate-pulse gap-6 motion-reduce:animate-none xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-h-[calc(100vh-140px)] rounded-[24px] border border-(--border-subtle) bg-(--bg-secondary) p-6">
          <div className="h-6 w-40 rounded bg-(--bg-tertiary)" />
          <div className="mt-4 h-9 w-2/3 rounded bg-(--bg-tertiary)" />
          <div className="mt-3 h-4 w-1/2 rounded bg-(--bg-tertiary)" />
          <div className="mt-8 h-[calc(100%-120px)] min-h-96 rounded-[20px] bg-(--bg-primary)" />
        </section>

        <aside className="rounded-[24px] border border-(--border-subtle) bg-(--bg-secondary) p-5">
          <div className="h-10 w-full rounded-lg bg-(--bg-tertiary)" />
          <div className="mt-6 h-40 rounded-[20px] bg-(--bg-tertiary)" />
          <div className="mt-4 h-24 rounded-[20px] bg-(--bg-tertiary)" />
          <div className="mt-4 h-64 rounded-[20px] bg-(--bg-tertiary)" />
        </aside>
      </div>
    </main>
  );
}
