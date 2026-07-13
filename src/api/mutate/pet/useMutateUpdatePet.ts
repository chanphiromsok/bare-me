import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePetMutation } from "../../generated/@tanstack/react-query.gen";
import { invalidatePetQueries } from "./invalidatePetQueries";

export default function useMutateUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    ...updatePetMutation(),
    onSuccess: () => invalidatePetQueries(queryClient),
  });
}
