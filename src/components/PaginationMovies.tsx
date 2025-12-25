import { useMovies } from "@/hooks/useMovie";
import { Pagination, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationContent, PaginationEllipsis } from "./ui/Pagination";
import { useMemo } from "react";
import { generateEllipsisPagination } from "@/lib/utils";

export function PaginationMovies() {
  const { pagination } = useMovies();

  const pages = useMemo(() => {
    return generateEllipsisPagination(pagination.currentPage, pagination.totalPages);
  }, [pagination.currentPage, pagination.totalPages])

  return (
    <Pagination className="w-full">
      <PaginationContent>

        <PaginationItem>
          <PaginationPrevious
            onClick={pagination.previousPage}
            disabled={!pagination.hasPreviousPage} />
        </PaginationItem>

        {pages.map((page) => {
          const isEllipsisPosition = typeof page === 'string'; // se for string, é um ellipsis

          if (isEllipsisPosition) { // se for ellipsis, renderiza o ellipsis
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  disabled
                >
                  <PaginationEllipsis />
                </PaginationLink>
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={page}> {/* se for número, renderiza o número */}
              <PaginationLink
                onClick={() => pagination.setPage(page)}
                isActive={pagination.currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            onClick={pagination.nextPage}
            disabled={!pagination.hasNextPage} />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  )
}