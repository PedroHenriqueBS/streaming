export interface IPaginatedResponse<TData> {
  page: number;
  results: TData;
  total_pages: number;
  total_results: number;
}