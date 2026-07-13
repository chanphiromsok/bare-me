import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePetMutation } from "../../generated/@tanstack/react-query.gen";
import { invalidatePetQueries } from "./invalidatePetQueries";

export default function useMutateDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    ...deletePetMutation(),
    onSuccess: () => invalidatePetQueries(queryClient),
  });
}
