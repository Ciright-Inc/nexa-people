export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="sticky top-0 z-[1000] bg-[var(--canvas-0)]">
        <div className="nexa-app-header">
          <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5 lg:px-6">
            <div className="nexa-skeleton h-9 w-28 rounded-lg" />
            <div className="ml-auto flex items-center gap-3">
              <div className="nexa-skeleton h-9 w-36 rounded-xl" />
              <div className="nexa-skeleton h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
        <div className="nexa-active-filters-slab relative z-[20]">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-2.5 lg:px-8">
            <div className="nexa-skeleton h-8 max-w-md rounded-full" />
            <div className="nexa-skeleton hidden h-9 w-32 rounded-full sm:block" />
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-8 px-4 py-6 sm:px-5 lg:space-y-10 lg:px-8 lg:py-8">
        <div className="nexa-skeleton aspect-[16/9] w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="nexa-skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="nexa-skeleton h-64 w-full rounded-2xl" />
      </main>
    </div>
  );
}
