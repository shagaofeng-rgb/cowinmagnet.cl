export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZES = [25, 50, 100];

export function publicPageNumber(value) {
  if (value == null || value === "") return 1;
  return typeof value === "string" && /^[1-9]\d{0,5}$/.test(value) ? Number(value) : null;
}

export function parseListPagination(params = {}, { defaultPageSize = DEFAULT_PAGE_SIZE, allowedPageSizes = PAGE_SIZES } = {}) {
  const requestedPage = publicPageNumber(params?.page);
  const requestedSize = Number.parseInt(String(params?.pageSize || defaultPageSize), 10);
  return {
    page: requestedPage || 1,
    pageSize: allowedPageSizes.includes(requestedSize) ? requestedSize : defaultPageSize
  };
}

export function listIndexing({ query = {}, total, pageSize, alternates, indexable = true, filterKeys = [] }) {
  const page = publicPageNumber(query.page);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const filtered = filterKeys.some((key) => Boolean(query[key]));
  const valid = page !== null && page <= lastPage;
  const cleanPage = valid && !filtered ? page : 1;
  const addPage = (url) => cleanPage > 1 ? url + "?page=" + cleanPage : url;
  return {
    robots: { index: indexable && !filtered && valid, follow: true },
    alternates: {
      canonical: addPage(alternates.canonical),
      languages: Object.fromEntries(Object.entries(alternates.languages || {}).map(([key, url]) => [key, addPage(url)]))
    }
  };
}

export function paginateList(items, { page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const collection = Array.isArray(items) ? items : [];
  const total = collection.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const offset = (currentPage - 1) * pageSize;
  return {
    items: collection.slice(offset, offset + pageSize),
    meta: { page: currentPage, pageSize, total, totalPages, offset }
  };
}
