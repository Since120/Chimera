"use client";

import { Drawer, Flex, Text, Icon, IconButton } from "@chakra-ui/react";
import { LuX, LuFolderKanban, LuLayoutDashboard, LuListTodo, LuActivity, LuSettings } from "react-icons/lu";
import { useRouter } from "next/navigation";

// Gemeinsame Navigationspunkte - identisch mit denen in SideNav
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
  { label: "Categories", href: "/dashboard/categories", icon: LuListTodo },
  { label: "Trading", href: "/dashboard/trading", icon: LuActivity },
  { label: "Settings", href: "/dashboard/settings", icon: LuSettings },
];

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const router = useRouter();

  // Funktion zum Navigieren und Schließen des Drawers
  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} placement="left">
      <Drawer.Backdrop bg="blackAlpha.600" />
      <Drawer.Positioner>
        <Drawer.Content
          bg="#0c111b"
          color="white"
          maxWidth="280px"
          boxShadow="dark-lg"
          h="100vh"
        >
          <Drawer.Header borderBottomWidth="0" py={4} px={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center" gap={2}>
                <Icon as={LuFolderKanban} boxSize={6} />
                <Text fontWeight="bold">Project Chimera</Text>
              </Flex>
              <Drawer.CloseTrigger asChild>
                <IconButton
                  aria-label="Schließen"
                  variant="ghost"
                  size="sm"
                  icon={<Icon as={LuX} boxSize={5} />}
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={onClose} // Explizit onClose aufrufen
                />
              </Drawer.CloseTrigger>
            </Flex>
          </Drawer.Header>

          <Drawer.Body p={0}>
            <Flex direction="column" gap={1} px={3} py={2}>
              {navItems.map((item) => (
                <Flex
                  key={item.label}
                  alignItems="center"
                  gap={3}
                  px={3}
                  py={3}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon as={item.icon} boxSize={5} />
                  <Text fontWeight="medium">{item.label}</Text>
                </Flex>
              ))}
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
