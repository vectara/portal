import { atom } from "recoil";

type CurrentUserState =
  | {
      id: string;
      email: string;
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
