// apps/frontend-new/src/components/dashboard/layout/UserMenu.tsx
"use client";
import {
  Box,
  Text,
  Flex,
  Icon
} from "@chakra-ui/react";
import { useAuth } from "@/context/auth-context";
import { LuLogOut } from "react-icons/lu";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const userName = user?.username || null;

  const handleLogout = () => {
    logout(true); // Mit Redirect zur Login-Seite
  };

  return (
    <Box
      w="10"
      h="10"
      borderRadius="full"
      bg="gray.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="bold"
      fontSize="md"
      cursor="pointer"
      border="2px solid"
      borderColor="whiteAlpha.300"
      _hover={{ borderColor: "nav.activeGreen" }}
      transition="all 0.2s"
      overflow="hidden"
      onClick={handleLogout}
      position="relative"
    >
      {userName ? userName.charAt(0).toUpperCase() : "U"}

      <Flex
        position="absolute"
        bottom="-20px"
        left="50%"
        transform="translateX(-50%)"
        bg="#0c111b"
        color="white"
        fontSize="xs"
        py={1}
        px={2}
        borderRadius="md"
        opacity={0}
        _hover={{ opacity: 1 }}
        transition="opacity 0.2s"
        pointerEvents="none"
        boxShadow="md"
        alignItems="center"
      >
        <Icon as={LuLogOut} boxSize={3} mr={1} />
        <Text>Abmelden</Text>
      </Flex>
    </Box>
  );
}
