import { MoviesService } from "../services/MoviesService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "./usePagination";
import { useEffect } from "react";

export function useMovies(per_page = 200) {
  const pagination = usePagination(per_page);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies', { page: pagination.currentPage, per_page }],
    staleTime: Infinity,
    queryFn: async () => {
      const response = await MoviesService.getAll(pagination.currentPage, per_page);
      pagination.setTotalItems(response.total_results);
      return response;
    },
  }, queryClient)

  useEffect(() => {
    if (!pagination.hasNextPage) return;
    const nextPage = pagination.currentPage + 1;
    // prefetchQuery pega os dados da query e armazena em cache para que possa ser usado em outra pagina sem precisar fazer uma nova requisicao
    queryClient.prefetchQuery({
      queryKey: ['movies', { page: nextPage, per_page }],
      staleTime: Infinity,
      queryFn: async () => {
        const response = await MoviesService.getAll(nextPage, per_page);
        pagination.setTotalItems(response.total_results);
        return response;
      },
    })
  }, [pagination.currentPage, pagination.hasNextPage])


  return {
    movies: data ?? [],
    isLoading,
    error,
    pagination,
  }
}

