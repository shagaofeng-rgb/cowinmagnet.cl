import { redirect } from "next/navigation";
import { Locale, localizedPath } from "@/data/site";

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  redirect(localizedPath(locale, "news"));
}
