import { getAdminDateRange } from "@/lib/adminDateRange";
import { getSearchConsoleSnapshot } from "@/lib/analyticsStore";
import AdminDateRangeFilter from "@/components/admin/AdminDateRangeFilter";
import AdminSearchConsoleLivePanel from "@/components/admin/AdminSearchConsoleLivePanel";

const t = {
  eyebrow: "SEO \u6570\u636e",
  title: "\u641c\u7d22\u8868\u73b0\u4e0e\u6536\u5f55\u72b6\u6001",
  desc: "\u5c55\u793a Google Search Console \u641c\u7d22\u70b9\u51fb\u3001\u5c55\u793a\u3001CTR\u3001\u5e73\u5747\u6392\u540d\u548c\u6838\u5fc3 URL \u68c0\u67e5\u7ed3\u679c\u3002"
};

export const dynamic = "force-dynamic";
export const metadata = { title: `${t.eyebrow} | Cowinmagnet.cl` };

export default async function AdminSearchConsolePage({ searchParams }) {
  const params = await searchParams;
  const range = getAdminDateRange(params);
  const searchConsole = await getSearchConsoleSnapshot(range);

  return (
    <>
      <section className="admin-page-head">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>
        <AdminDateRangeFilter range={range} />
      </section>
      <AdminSearchConsoleLivePanel searchConsole={searchConsole} />
    </>
  );
}
