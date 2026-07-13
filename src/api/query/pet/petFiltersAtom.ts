import { atom } from "jotai";

import type { Pet } from "../../generated/types.gen";

export type PetStatus = NonNullable<Pet["status"]>;

export type PetFilters = {
  status: PetStatus;
};

export const defaultPetFilters: PetFilters = {
  status: "available",
};

export const petFiltersAtom = atom<PetFilters>(defaultPetFilters);
