import { atom } from "recoil";

type CurrentUserState =
  | {
      id: number | null;
      email: string | null;
      vectaraCustomerId: string | null;
      vectaraPersonalApiKey: string | null;
      vectaraOAuth2ClientId: string | null;
      vectaraOAuth2ClientSecret: string | null;
      role: string;
    }
  | null
  | undefined;

export const currentUserState = atom<CurrentUserState>({
  key: "currentUser",
  default: undefined,
});
