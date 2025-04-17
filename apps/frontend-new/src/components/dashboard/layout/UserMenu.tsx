// apps/frontend-new/src/components/dashboard/layout/UserMenu.tsx
"use client";
import { Box } from "@chakra-ui/react";

interface UserMenuProps {
  userName?: string | null;
  avatarUrl?: string | null;
}

export default function UserMenu({ userName, avatarUrl }: UserMenuProps) {
  // TODO: Implement actual Menu logic (logout, profile link) later
  return (
    <Box
      w="10"
      h="10"
      borderRadius="full"
      bg="gray.600" // Neutrale Farbe statt brand.500
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="bold"
      fontSize="md"
      cursor="pointer"
    >
      {userName ? userName.charAt(0).toUpperCase() : "U"}
    </Box>
  );
}
