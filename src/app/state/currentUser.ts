import { atom } from "recoil";

type CurrentUserState =
  | {
      id: number | null;
      email: string | null;
      vectaraCustomerId: string | null;
      vectaraPersonalApiKey: string | null;
      role: string;
    }
  | null
  | undefined;

export const currentUserState = atom<CurrentUserState>({
  key: "currentUser",
  default: undefined,
});
