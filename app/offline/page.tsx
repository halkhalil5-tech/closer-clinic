export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <div className="microlabel text-primary">Closer Clinic</div>
      <h1 className="display mt-3 text-[32px] text-ink">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-dim">
        Encounters need a connection — the patient is an AI on the other end. Your history and
        scores are safe; reconnect and pull this page down to refresh.
      </p>
    </main>
  );
}
