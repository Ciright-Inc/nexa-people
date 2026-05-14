export default function AppLoading() {
  return (
    <div className="nexa-login-canvas flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="glass-panel w-full max-w-md space-y-5 p-7 sm:p-8">
        <div className="space-y-3 text-center">
          <div className="nexa-skeleton mx-auto h-10 w-40 rounded-lg" />
          <div className="nexa-skeleton mx-auto h-4 w-56 rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="nexa-skeleton h-11 w-full rounded-xl" />
          <div className="nexa-skeleton h-11 w-full rounded-xl" />
          <div className="nexa-skeleton mt-2 h-11 w-full rounded-xl" />
        </div>
        <p className="text-center text-xs font-medium text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
