import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5">
      <div className="microlabel text-primary">404</div>
      <h1 className="display mt-3 text-[32px] text-ink">
        That room
        <br />
        doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-dim">
        The encounter or page you&apos;re looking for isn&apos;t here — it may belong to another
        account.
      </p>
      <Link
        href="/home"
        className="display mt-6 inline-block w-fit bg-primary px-6 py-3 text-[14px] tracking-wide text-white"
      >
        Back to stations
      </Link>
    </main>
  );
}
