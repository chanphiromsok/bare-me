import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";

import { findPetsByStatusOptions } from "../../generated/@tanstack/react-query.gen";
import { petFiltersAtom } from "./petFiltersAtom";

export default function useQueryPetsByStatus() {
  const { status } = useAtomValue(petFiltersAtom);

  return useQuery({
    ...findPetsByStatusOptions({ query: { status } }),
  });
}
