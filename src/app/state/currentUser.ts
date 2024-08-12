import { atom } from "recoil";

type CurrentUserState =
  | {
      id: string;
      email: string;
      vectaraCustomerId: string | null;
      vectaraPersonalApiKey: string | null;
      vectaraOAuth2ClientId: string | null;
      vectaraOAuth2ClientSecret: string | null;
      isVectaraScaleUser: boolean
      role: string;
    }
  | null
  | undefined;

export const currentUserState = atom<CurrentUserState>({
  key: "currentUser",
  default: undefined,
});
