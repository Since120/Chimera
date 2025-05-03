'use client';

import {
  VStack,
  Button,
  Flex,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Kategorie } from "./KategorieTabelle";

export interface CategoryFormProps {
  initialData?: Kategorie | null;
  onSubmit: (data: Partial<Kategorie>) => void;
  onCancel: () => void;
}

export const CategoryForm = ({
  initialData,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<Partial<Kategorie>>({
    name: "",
    visible: true,
    tracking: true,
    setup: false,
    roles: "",
  });

  // Formular mit initialData befüllen, wenn vorhanden
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        visible: initialData.visible,
        tracking: initialData.tracking,
        setup: initialData.setup,
        roles: initialData.roles,
      });
    }
  }, [initialData]);

  // Handler für Änderungen an Textfeldern
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler für Änderungen an Switches wurde durch direkte Inline-Funktionen ersetzt

  // Zustandsvariablen für Rollenverwaltung
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Initialisierung der ausgewählten Rollen aus formData.roles
  useEffect(() => {
    if (formData.roles) {
      setSelectedRoles(formData.roles.split(',').filter(Boolean));
    }
  }, []);

  // Formular absenden
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack gap={5} align="stretch">
        <Field
          required
          label="Name"
          helperText="Der Name der Kategorie, wie er im Dashboard angezeigt wird."
        >
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Kategoriename eingeben"
          />
        </Field>



        <Field
          label="Rollen"
          helperText="Wählen Sie Rollen aus, die Zugriff auf diese Kategorie haben."
        >
          <Box w="full">
            <Box
              position="relative"
              w="full"
              h="120px"
              p="8px"
              borderRadius="12px"
              border="none"
              bg="button.filter.bg"
              color="button.filter.textColor"
              boxShadow="card"
              backdropFilter="blur(5px)"
              overflowY="auto"
              className="custom-scrollbar"
            >
              {/* Klickbare Rollenoptionen */}
              {[
                "Admin",
                "Moderator",
                "User",
                "Guest",
                "Developer",
                "Support",
                "ContentCreator",
                "Subscriber",
                "VIP",
                "Tester",
                "Analyst",
                "Manager",
                "Owner",
                "Bot"
              ].map((role) => (
                <Box
                  key={role}
                  p={2}
                  mb={1}
                  borderRadius="md"
                  cursor="pointer"
                  bg={selectedRoles.includes(role) ? "button.filter.activeBg" : "transparent"}
                  color={selectedRoles.includes(role) ? "button.filter.activeColor" : "inherit"}
                  _hover={{
                    bg: selectedRoles.includes(role) ? "button.filter.activeBg" : "button.filter.hoverBg"
                  }}
                  onClick={() => {
                    // Toggle Rolle in der Auswahl
                    const newRoles = selectedRoles.includes(role)
                      ? selectedRoles.filter(r => r !== role)
                      : [...selectedRoles, role];

                    setSelectedRoles(newRoles);
                    setFormData((prev) => ({ ...prev, roles: newRoles.join(',') }));
                  }}
                >
                  {role}
                </Box>
              ))}
            </Box>
            <Flex wrap="wrap" gap={1} mt={1} w="full">
              {selectedRoles.map((role) => (
                <Box
                  key={role}
                  bg="button.roleChip.bg"
                  color="button.roleChip.color"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                  display="flex"
                  alignItems="center"
                  mb={0.5}
                  mr={1}
                  boxShadow="sm"
                  height="22px"
                  minWidth="auto"
                >
                  {role}
                  <CloseButton
                    size="xs"
                    ml={0.5}
                    boxSize="14px"
                    cursor="pointer"
                    _hover={{ bg: "transparent" }}
                    onClick={() => {
                      const newRoles = selectedRoles.filter((r) => r !== role);
                      setSelectedRoles(newRoles);
                      setFormData((prev) => ({ ...prev, roles: newRoles.join(',') }));
                    }}
                  />
                </Box>
              ))}
            </Flex>
          </Box>
        </Field>

        <Box mt={4}>
          <Flex justifyContent="space-between" wrap="wrap" gap={2}>
            <Flex alignItems="center">
              <Switch
                checked={formData.visible}
                inputProps={{
                  id: "visible",
                  name: "visible",
                  onChange: (e) => setFormData((prev) => ({ ...prev, visible: e.target.checked }))
                }}
                mr={2}
              >
                Sichtbar
              </Switch>
            </Flex>

            <Flex alignItems="center">
              <Switch
                checked={formData.tracking}
                inputProps={{
                  id: "tracking",
                  name: "tracking",
                  onChange: (e) => setFormData((prev) => ({ ...prev, tracking: e.target.checked }))
                }}
                mr={2}
              >
                Tracking
              </Switch>
            </Flex>

            <Flex alignItems="center">
              <Switch
                checked={formData.setup}
                inputProps={{
                  id: "setup",
                  name: "setup",
                  onChange: (e) => setFormData((prev) => ({ ...prev, setup: e.target.checked }))
                }}
                mr={2}
              >
                Setup
              </Switch>
            </Flex>
          </Flex>
        </Box>

        <Flex justifyContent="flex-end" gap={3} mt={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            borderRadius="full"
            borderColor="button.modalSecondary.borderColor"
            color="button.modalSecondary.color"
            _hover={{
              bg: "button.modalSecondary.hoverBg",
              boxShadow: "cardHover"
            }}
            _active={{
              bg: "button.modalSecondary.activeBg"
            }}
            size="md"
            px={5}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            bg="button.modalPrimary.bg"
            color="button.modalPrimary.color"
            borderRadius="full"
            boxShadow="card"
            _hover={{
              bg: "button.modalPrimary.hoverBg",
              boxShadow: "cardHover"
            }}
            _active={{
              bg: "button.modalPrimary.activeBg"
            }}
            size="md"
            px={5}
          >
            {initialData ? "Aktualisieren" : "Speichern"}
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};
