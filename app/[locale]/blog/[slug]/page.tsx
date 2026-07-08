import { redirect } from "next/navigation";
import { posts } from "@/data/blog";
import { Locale, localizedPath } from "@/data/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return posts.flatMap((post) => ["es-cl", "es", "pt-br", "en"].map((locale) => ({ locale, slug: post.slug })));
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  redirect(localizedPath(locale, `news/${slug}`));
}
