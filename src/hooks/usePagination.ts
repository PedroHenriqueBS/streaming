import { useCallback, useEffect, useState } from "react";

export function usePagination(per_page = 200, initialPage = 1) {
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search); // pega os parametros da url
    const page = searchParams.get('page'); // pega o parametro page

    if (!page) { // se nao tiver page
      return initialPage; // retorna a pagina inicial
    }
    return Number(page) // transforma o page em numero
  });

  const totalPages = Math.ceil(totalItems / per_page); // arredonda para cima
  const hasPreviousPage = currentPage > 1; // se a pagina atual for maior que 1
  const hasNextPage = currentPage < totalPages; // se a pagina atual for menor que a ultima pagina

  useEffect(() => {
    const url = new URL(window.location.href); // url atual
    url.searchParams.set('page', String(currentPage)); // seta o parametro page e transforma o currentPage em string
    const newUrl = url.origin + url.pathname + '?' + url.searchParams.toString(); // cria uma nova url com os parametros da url atual

    window.history.replaceState({}, '', newUrl); // atualiza a url
  }, [currentPage]);

  const nextPage = useCallback(() => {
    setCurrentPage(prevState => prevState + 1);
  }, [])

  const previousPage = useCallback(() => {
    setCurrentPage(prevState => prevState - 1);

    if (currentPage === 1) {
      setCurrentPage(1);
    }
  }, [])

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, [])

  return {
    currentPage,
    nextPage,
    previousPage,
    setPage,
    totalPages,
    setTotalItems,
    hasPreviousPage,
    hasNextPage,
  }
}