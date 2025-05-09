import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react"
import * as React from "react"

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  content: React.ReactNode
  contentProps?: ChakraTooltip.ContentProps
  disabled?: boolean
  placement?: 'top' | 'right' | 'bottom' | 'left'
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      placement = 'top',
      ...rest
    } = props

    if (disabled) return children

    return (
      <ChakraTooltip.Root openDelay={300} closeDelay={100} positioning={{ placement }} {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              bg="#1f2c40"
              color="white"
              px={3}
              py={2}
              borderRadius="md"
              fontSize="sm"
              boxShadow="md"
              {...contentProps}>
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip bg="#1f2c40" />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    )
  },
)

Tooltip.displayName = "Tooltip";
