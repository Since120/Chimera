'use client';

import {
  Dialog,
  Portal,
  Flex,
} from "@chakra-ui/react";
import { ReactNode, RefObject } from "react";
import { LuX } from "react-icons/lu";
import { LightMode, DarkMode } from "@/components/ui/color-mode";


export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footerContent?: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideCloseButton?: boolean;
  initialFocusRef?: RefObject<any>;
  forceMode?: 'light' | 'dark';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footerContent,
  size = 'xl',
  hideCloseButton = false,
  initialFocusRef, // Wird derzeit nicht verwendet, aber für zukünftige Erweiterungen beibehalten
  forceMode,
}: ModalProps) => {
  const ModalContent = () => (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
      size={size}
    >
      <Portal>
        <Dialog.Backdrop
          bg="blackAlpha.600"
          backdropFilter="blur(3px)"
          zIndex="overlay"
          pointerEvents="auto"
          position="fixed"
          inset="0"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          userSelect="none"
        />
        <Dialog.Positioner
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="100vh"
          zIndex="modal"
        >
          <Dialog.Content
            color="fg"
            borderRadius="xl" // Angepasst an ContentBox
            boxShadow="overlay"
            p={0}
            overflow="hidden"
            bg="#111822" // Basis-Hintergrundfarbe ohne Gradienten
          >
            <Dialog.Header
              px={6}
              py={4}
              bg="#111822" // Gleiche Farbe wie Modal-Hintergrund
              position="relative"
              zIndex={1}
            >
              <Flex justify="space-between" align="center">
                <Dialog.Title color="inherit">{title}</Dialog.Title>
                {!hideCloseButton && (
                  <Dialog.CloseTrigger asChild>
                    <button
                      aria-label="Close"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <LuX />
                    </button>
                  </Dialog.CloseTrigger>
                )}
              </Flex>
            </Dialog.Header>

            <Dialog.Body px={6} py={5}>
              {children}
            </Dialog.Body>

            {footerContent && (
              <Dialog.Footer
                px={6}
                py={4}
                bg="#111822" // Gleiche Farbe wie Modal-Hintergrund
                justifyContent="flex-end"
                gap={3}
                position="relative"
                zIndex={1}
              >
                {footerContent}
              </Dialog.Footer>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );

  // Wenn ein bestimmter Modus erzwungen werden soll
  if (forceMode === 'light') {
    return (
      <LightMode>
        <ModalContent />
      </LightMode>
    );
  } else if (forceMode === 'dark') {
    return (
      <DarkMode>
        <ModalContent />
      </DarkMode>
    );
  }

  // Standardmäßig keinen Modus erzwingen
  return <ModalContent />;
};
