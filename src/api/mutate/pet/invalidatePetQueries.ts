import type { QueryClient } from "@tanstack/react-query";

import { findPetsByStatusOptions } from "../../generated/@tanstack/react-query.gen";
import type { Pet } from "../../generated/types.gen";

type PetStatus = NonNullable<Pet["status"]>;

const petStatuses: PetStatus[] = ["available", "pending", "sold"];

export function invalidatePetQueries(queryClient: QueryClient) {
  return Promise.all(
    petStatuses.map((status) =>
      queryClient.invalidateQueries({
        queryKey: findPetsByStatusOptions({ query: { status } }).queryKey,
      }),
    ),
  );
}
