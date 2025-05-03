'use client';

import {
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Zone } from "./ZonenTabelle";

export interface ZoneFormProps {
  initialData?: Zone | null;
  onSubmit: (data: Partial<Zone>) => void;
  onCancel: () => void;
}

export const ZoneForm = ({
  initialData,
  onSubmit,
  onCancel,
}: ZoneFormProps) => {
  const [formData, setFormData] = useState<Partial<Zone>>({
    name: "",
    key: "",
    points: 100,
    minutes: 30,
  });

  // Formular mit initialData befüllen, wenn vorhanden
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        key: initialData.key,
        points: initialData.points,
        minutes: initialData.minutes,
      });
    }
  }, [initialData]);

  // Handler für Änderungen an Textfeldern
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler für Änderungen an NumberInputs wurde durch direkte Inline-Funktionen ersetzt

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
          helperText="Der Name der Zone, wie er im Dashboard angezeigt wird."
        >
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Zonenname eingeben"
          />
        </Field>

        <Field
          required
          label="Zonen-Key"
          helperText="Ein eindeutiger Schlüssel zur Identifizierung der Zone."
        >
          <Input
            name="key"
            value={formData.key}
            onChange={handleInputChange}
            placeholder="Eindeutiger Schlüssel für die Zone"
          />
        </Field>

        <Field
          required
          label="Punkte"
          helperText="Anzahl der Punkte, die für diese Zone vergeben werden."
        >
          <Input
            name="points"
            type="number"
            min={0}
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
            placeholder="Punkte eingeben"
          />
        </Field>

        <Field
          required
          label="Minuten für Punkte"
          helperText="Zeitintervall in Minuten, nach dem Punkte vergeben werden."
        >
          <Input
            name="minutes"
            type="number"
            min={1}
            value={formData.minutes}
            onChange={(e) => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 1 }))}
            placeholder="Minuten eingeben"
          />
        </Field>

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
