import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

export type UserProfileModalState = {
  isOpen: boolean;
  userId: string | null;
};

export type UserProfileModalActions = {
  openUserProfileModal: (userId: string) => void;
  closeUserProfileModal: () => void;
};

export type UserProfileModalStore = UserProfileModalState & UserProfileModalActions;

export const defaultInitState: UserProfileModalState = {
    isOpen: false,
    userId: null,
};

export const useUserProfileModalStore = create<UserProfileModalStore>()(
  devtools(
    subscribeWithSelector((set) => ({
      ...defaultInitState,
      openUserProfileModal: (userId) => set({ isOpen: true, userId }),
      closeUserProfileModal: () => set(() => ({ isOpen: false })),
    }))
  )
);
