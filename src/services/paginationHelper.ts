export function calculateSkip(page: number, limit: number) {
  return Math.max(0, (page - 1) * limit);
}

export function buildPagination(
  page: number,
  limit: number,
  totalCount: number
) {
  return {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}
