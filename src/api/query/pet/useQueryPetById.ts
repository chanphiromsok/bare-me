import { useQuery } from "@tanstack/react-query";
import { getPetByIdOptions } from "../../generated/@tanstack/react-query.gen";

export default function useQueryPetById(petId: number) {
  return useQuery({
    ...getPetByIdOptions({ path: { petId } }),
  });
}
