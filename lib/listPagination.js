export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZES = [25, 50, 100];

export function parseListPagination(params = {}, { defaultPageSize = DEFAULT_PAGE_SIZE, allowedPageSizes = PAGE_SIZES } = {}) {
  const requestedPage = Number.parseInt(String(params?.page || "1"), 10);
  const requestedSize = Number.parseInt(String(params?.pageSize || defaultPageSize), 10);
  return {
    page: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    pageSize: allowedPageSizes.includes(requestedSize) ? requestedSize : defaultPageSize
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
