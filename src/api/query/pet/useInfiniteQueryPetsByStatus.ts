import { useAtomValue } from "jotai";
import {
  type DefaultError,
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { findPetsByStatus } from "../../generated/sdk.gen";
import type { FindPetsByStatusResponse } from "../../generated/types.gen";
import { petFiltersAtom } from "./petFiltersAtom";

const DEFAULT_PETS_PAGE_SIZE = 20;

export type PetsByStatusPage = {
  items: FindPetsByStatusResponse;
  page: number;
  pageSize: number;
  total: number;
};

export default function useInfiniteQueryPetsByStatus({
  pageSize = DEFAULT_PETS_PAGE_SIZE,
}: {
  pageSize?: number;
} = {}) {
  const { status } = useAtomValue(petFiltersAtom);

  return useInfiniteQuery<
    PetsByStatusPage,
    AxiosError<DefaultError>,
    InfiniteData<PetsByStatusPage>,
    QueryKey,
    number
  >({
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);

      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await findPetsByStatus({
        query: { status },
        signal,
        throwOnError: true,
      });
      const startIndex = (pageParam - 1) * pageSize;

      return {
        items: data.slice(startIndex, startIndex + pageSize),
        page: pageParam,
        pageSize,
        total: data.length,
      };
    },
    queryKey: [
      {
        _id: "findPetsByStatus",
        _infinite: true,
        query: { pageSize, status },
      },
    ],
  });
}

export function flattenPetPages(data?: InfiniteData<PetsByStatusPage>) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}
