import { redirect } from "next/navigation";

/**
 * Legacy lesson URLs (pre module-doc refactor) redirect to the module page.
 * Old slugs were `{module}-{topic}`; new tracking records are `{module}-core`.
 */
export default async function LegacyLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moduleSlug = slug.split("-")[0];
  redirect(
    ["mindset", "rapport", "framing", "price", "objections", "close"].includes(moduleSlug)
      ? `/train/module/${moduleSlug}`
      : "/train"
  );
}
