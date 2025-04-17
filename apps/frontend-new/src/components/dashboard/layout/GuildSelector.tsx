// apps/frontend-new/src/components/dashboard/layout/GuildSelector.tsx
"use client";
import { Button } from "@chakra-ui/react";

interface GuildSelectorProps {
  currentGuildName?: string;
}

// TODO: Implement actual Dropdown/Menu logic later
export default function GuildSelector({ currentGuildName = "Wähle Server" }: GuildSelectorProps) {
  return (
    <Button variant="ghost" size="sm">
      {currentGuildName} ▼
    </Button>
  );
}
