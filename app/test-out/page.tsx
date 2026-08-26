import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { TEST_OUT_PASS_TOTAL } from "@/lib/types";
import { TestOutStart } from "@/components/test-out-start";

export const dynamic = "force-dynamic";

export default async function TestOutPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const unlocks = await store.listUnlocks(user.id);
  if (unlocks.length > 0) redirect("/home");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="microlabel">Closer Clinic</div>
      <h1 className="display mt-4 text-[28px] leading-tight text-bone">
        Test out of
        <br />
        the curriculum
      </h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-dim">
        Already close cases every day? Prove it. One challenge rep against a
        moderate-difficulty patient on the flagship station — real objections,
        real price, graded like any OSCE.
      </p>

      <div className="mt-5 divide-y divide-hairline">
        <div className="flex items-baseline justify-between py-3">
          <span className="text-[13px] text-dim">Format</span>
          <span className="text-[13px] text-ink">One full encounter, moderate difficulty</span>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <span className="text-[13px] text-dim">Pass bar</span>
          <span className="font-mono text-[13px] font-semibold tabular-nums text-bone">
            {TEST_OUT_PASS_TOTAL}+ / 100
          </span>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <span className="text-[13px] text-dim">On pass</span>
          <span className="text-[13px] text-success">All stations unlock immediately</span>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <span className="text-[13px] text-dim">On miss</span>
          <span className="text-[13px] text-ink">Nothing lost — train, or try again</span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <TestOutStart />
        <a
          href="/train"
          className="mt-2 block w-full py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          I&apos;ll train instead
        </a>
      </div>
    </main>
  );
}
