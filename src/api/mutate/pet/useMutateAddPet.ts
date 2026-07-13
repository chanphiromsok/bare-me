import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addPetMutation } from "../../generated/@tanstack/react-query.gen";
import { invalidatePetQueries } from "./invalidatePetQueries";

export default function useMutateAddPet() {
  const queryClient = useQueryClient();

  return useMutation({
    ...addPetMutation(),
    onSuccess: () => invalidatePetQueries(queryClient),
  });
}
