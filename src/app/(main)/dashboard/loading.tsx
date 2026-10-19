export default function DashboardLoading() {
  return (
    <div className="wrapper container animate-pulse motion-reduce:animate-none">
      <div className="h-[240px] w-full rounded-2xl bg-(--bg-secondary) md:h-[300px]" />

      <div className="mt-10 flex items-center justify-between gap-4">
        <div className="h-8 w-48 rounded-lg bg-(--bg-secondary)" />
        <div className="h-10 w-72 rounded-lg bg-(--bg-secondary)" />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 md:gap-7 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="h-[205px] rounded-[14px] bg-(--bg-secondary) md:h-[240px]" />
            <div className="h-4 w-3/4 rounded bg-(--bg-secondary)" />
            <div className="h-3 w-1/2 rounded bg-(--bg-secondary)" />
          </div>
        ))}
      </div>
    </div>
  );
}
