"use client";

import { Button } from "@/components/ui/button";
import { useUserProfileModalStore } from "@/store/user-profile-modal";

type Props = {
    userName: string;
    userId: string;
};

export function UserProfileNameButton({
    userName, userId
}: Props) {

const openUserProfile = useUserProfileModalStore((state) => state.openUserProfileModal);
  

  return (
    <Button type="button" variant={"link"} onClick={() => openUserProfile(userId)}>
      {userName}
    </Button>
  );
}
