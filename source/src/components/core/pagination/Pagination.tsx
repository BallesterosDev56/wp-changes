import React from "react";
import wizy_hide_side_menu_outline from "../../../images/wizy_hide_side_menu_outline.svg";
import "./Pagination.css";

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

// Always show first, middle, and last with optional dots
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

const Pagination = ({ pageMeta, getElements }: IPaginationProps) => {
  const { page, take, hasPreviousPage, hasNextPage } = pageMeta;
  const isCountMode = "pageCount" in pageMeta;

  // If count mode, use total pageCount; otherwise, grow until current+1 or current
  const virtualPageCount = isCountMode
    ? pageMeta.pageCount
    : hasNextPage
      ? page + 1
      : page;

  const paginationRange = getPaginationRange(page, virtualPageCount);

  if (paginationRange.length < 2 && !hasNextPage && !hasPreviousPage)
    return null;

  return (
    <ul className="Wizy__pagination__container">
      {/* Previous */}
      <li>
        <button
          className="Wizy__button__8"
          onClick={() => getElements(take, page - 1)}
          disabled={!hasPreviousPage}
        >
          <img
            className="Wizy__previous__page__arrow"
            src={wizy_hide_side_menu_outline}
            alt="Previous Page"
          />
        </button>
      </li>

      {/* Page Buttons */}
      {paginationRange.map((pageNumber, idx) =>
        pageNumber === DOTS ? (
          <li key={`dots-${idx}`}>&#8230;</li>
        ) : (
          <li key={pageNumber}>
            <button
              className={
                page === pageNumber ? "Wizy__button__9" : "Wizy__button__8"
              }
              onClick={() => getElements(take, pageNumber)}
            >
              {pageNumber}
            </button>
          </li>
        )
      )}

      {/* Next */}
      <li>
        <button
          className="Wizy__button__8"
          onClick={() => getElements(take, page + 1)}
          disabled={!hasNextPage}
        >
          <img
            className="Wizy__next__page__arrow"
            src={wizy_hide_side_menu_outline}
            alt="Next Page"
          />
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
