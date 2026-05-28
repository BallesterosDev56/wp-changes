import React from "react";

export type IPageMeta = {
  itemCount: number;
  pageCount: number;
  page: number;
  take: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type IPageNoItemCountMeta = {
  page: number;
  take: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type IPageCursorMeta = {
  hasNextPage: boolean;
  nextCursor?: string;
  pageSize: number;
};

export type IPaginationProps = {
  pageMeta: IPageMeta | IPageNoItemCountMeta;
  getElements: (take: number, page: number) => Promise<void>;
};

const DOTS = -42;

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, idx) => idx + start);

const getPaginationRange = (page: number, maxPage: number) => {
  const siblingCount = 1;
  const totalPageNumbers = siblingCount + 5;

  if (totalPageNumbers >= maxPage) {
    return range(1, maxPage);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1);
  const rightSiblingIndex = Math.min(page + siblingCount, maxPage);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < maxPage - 2;

  const firstPageIndex = 1;
  const lastPageIndex = maxPage;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = range(1, 3 + 2 * siblingCount);
    return [...leftRange, DOTS, lastPageIndex];
  } else if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = range(maxPage - (3 + 2 * siblingCount) + 1, maxPage);
    return [firstPageIndex, DOTS, ...rightRange];
  } else {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
};

const ArrowLeft = ({ className = "" }) => (
  <svg
    className={className}
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path
      d="M10 13L5 8l5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = ({ className = "" }) => (
  <svg
    className={className}
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path
      d="M6 3l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaginationTailwind = ({ pageMeta, getElements }: IPaginationProps) => {
  const { page, take, hasPreviousPage, hasNextPage } = pageMeta;
  const isCountMode = "pageCount" in pageMeta;

  const virtualPageCount = isCountMode
    ? pageMeta.pageCount
    : hasNextPage
      ? page + 1
      : page;

  const paginationRange = getPaginationRange(page, virtualPageCount);

  if (paginationRange.length < 2 && !hasNextPage && !hasPreviousPage)
    return null;

  return (
    <ul className="flex items-center justify-center gap-1 mt-4 select-none">
      {/* Previous */}
      <li>
        <button
          className="rounded-lg p-2 bg-white dark:bg-dark-0 border border-gray-200 text-gray-500 dark:text-white hover:bg-primary-30 dark:hover:bg-secondary-20 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => getElements(take, page - 1)}
          disabled={!hasPreviousPage}
          aria-label="Página anterior"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </li>

      {/* Page Buttons */}
      {paginationRange.map((pageNumber, idx) =>
        pageNumber === DOTS ? (
          <li key={`dots-${idx}`}>
            <span className="px-2 text-gray-400">…</span>
          </li>
        ) : (
          <li key={pageNumber}>
            <button
              className={`rounded-lg px-3 py-2 border transition font-medium
                ${
                  page === pageNumber
                    ? "bg-primary-40 dark:bg-secondary-20 text-white border-primary-40 shadow"
                    : "bg-white dark:bg-dark-0 text-gray-700 dark:text-white border-gray-200 hover:bg-primary-30 dark:hover:bg-secondary-20 hover:text-white"
                }
              `}
              onClick={() => getElements(take, pageNumber)}
              aria-current={page === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </button>
          </li>
        )
      )}

      {/* Next */}
      <li>
        <button
          className="rounded-lg p-2 bg-white dark:bg-dark-0 border border-gray-200 text-gray-500 dark:text-white hover:bg-primary-30 dark:hover:bg-secondary-20 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => getElements(take, page + 1)}
          disabled={!hasNextPage}
          aria-label="Página siguiente"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </li>
    </ul>
  );
};

export default PaginationTailwind;
