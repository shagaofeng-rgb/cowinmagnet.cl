import Link from "next/link";

type Meta = { page?: number; pageSize?: number; total?: number; totalPages?: number };

type Props = {
  meta: Meta;
  pathname: string;
  params?: Record<string, string | string[] | undefined>;
  locale?: "es-cl" | "es" | "pt-br" | "en";
  className?: string;
  pageParam?: string;
};

function copy(locale?: Props["locale"]) {
  if (locale === "en") return { total: "items", page: "Page", previous: "Previous", next: "Next" };
  if (locale === "pt-br") return { total: "itens", page: "Página", previous: "Anterior", next: "Próxima" };
  return { total: "registros", page: "Página", previous: "Anterior", next: "Siguiente" };
}

function href(pathname: string, params: Props["params"], page: number, pageParam = "page") {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (key === pageParam || value === undefined) return;
    if (Array.isArray(value)) value.forEach((entry) => query.append(key, entry));
    else query.set(key, value);
  });
  if (page > 1) query.set(pageParam, String(page));
  const suffix = query.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}

export function PaginationNav({ meta, pathname, params, locale, className = "", pageParam = "page" }: Props) {
  const labels = copy(locale);
  const page = Number(meta.page || 1);
  const totalPages = Number(meta.totalPages || 1);
  if (!meta.total || totalPages <= 1) return <p className={`list-pagination-summary ${className}`.trim()}>{meta.total || 0} {labels.total}</p>;
  return <nav className={`list-pagination ${className}`.trim()} aria-label="Pagination">
    <span>{meta.total.toLocaleString()} {labels.total} · {labels.page} {page}/{totalPages}</span>
    <div>
      {page > 1 ? <Link href={href(pathname, params, page - 1, pageParam)}>{labels.previous}</Link> : <span aria-disabled="true">{labels.previous}</span>}
      {page < totalPages ? <Link href={href(pathname, params, page + 1, pageParam)}>{labels.next}</Link> : <span aria-disabled="true">{labels.next}</span>}
    </div>
  </nav>;
}
