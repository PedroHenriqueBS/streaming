import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateEllipsisPagination(currentPage: number, totalPages: number, surroundingPages = 1) {

  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const isFirstPage = i === 1; // Primeira página
    const isLastPage = i === totalPages; // Ultima página
    const isWithinLowerBound = i >= (currentPage - surroundingPages); // Página dentro do limite inferior
    const isWithinUpperBound = i <= (currentPage + surroundingPages); // Página dentro do limite superior
    const isEllipsisPosition = i === currentPage - surroundingPages - 1 || i === currentPage + surroundingPages + 1; // Página com ellipsis

    if (isEllipsisPosition && !isFirstPage && !isLastPage) {
      pages.push('...');
      continue;
    }

    if ((isFirstPage || isLastPage) || (isWithinLowerBound && isWithinUpperBound)) {
      pages.push(i);
    }
  }

  return pages
}