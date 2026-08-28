/**
 * Honesty marker for demo captures: the figures on this screen are seeded
 * sample data, not a real clinic's results. Only rendered when a page is
 * opened with ?demo=1, so it never appears for a real user.
 */
export function SampleDataChip() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-[4.25rem] right-3 z-30 text-[8.5px] font-semibold
                 uppercase tracking-[0.18em] text-ink/30"
    >
      Sample data
    </div>
  );
}
