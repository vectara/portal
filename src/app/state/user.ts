import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const currentUserState = atom<{
  id: number | null;
  email: string | null;
  vectaraCustomerId: string | null;
  vectaraPersonalApiKey: string | null;
  role: string;
  sessionToken: string;
} | null>({
  key: "currentUserState",
  default: null,
  effects: [persistAtom],
});
