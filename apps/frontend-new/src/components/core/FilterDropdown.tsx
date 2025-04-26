// apps/frontend-new/src/components/core/FilterDropdown.tsx
import { Box, Button, Flex, Icon, BoxProps } from '@chakra-ui/react';
import { Menu } from '@chakra-ui/react';
import { ReactNode, forwardRef } from 'react';
import { LuChevronDown } from 'react-icons/lu';

export interface FilterDropdownProps extends Omit<BoxProps, 'onSelect'> {
  /**
   * The label text to display in the dropdown
   */
  label: string;

  /**
   * Optional array of menu items to display in the dropdown
   */
  options?: Array<{
    value: string;
    label: string;
  }>;

  /**
   * Optional callback when an option is selected
   */
  onSelect?: (value: string) => void;

  /**
   * Optional custom menu content
   */
  menuContent?: ReactNode;
}

/**
 * A styled dropdown filter component with a pill shape and circular icon
 */
export const FilterDropdown = forwardRef<HTMLDivElement, FilterDropdownProps>(
  ({ label, options = [], onSelect, menuContent, ...rest }, ref) => {
    return (
      <Box ref={ref} flex="1" minW={0} w="full" display="flex" {...rest}>
        <Menu.Root positioning={{ sameWidth: true, placement: 'bottom-start', gutter: 4 }}>
          <Menu.Trigger style={{ width: '100%', flex: 1 }}>
            <Flex
              as="div"
              role="button"
              bg="button.filter.bg"
              color="button.filter.textColor"
              borderRadius="full"
              h="50px"
              w="full"
              flex="1"
              minW={0}
              boxShadow="card"
              backdropFilter="blur(5px)"
              transition="all 0.2s ease"
              _hover={{ bg: "button.filter.hoverBg" }}
              _active={{ bg: "button.filter.activeBg" }}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px={0}
              py={0}
              textAlign="left"
              overflow="hidden"
              cursor="pointer"
            >
              {/* Text-Bereich */}
              <Box
                pl="4"
                pr="2"
                flexGrow={1}
                textOverflow="ellipsis"
                overflow="hidden"
                whiteSpace="nowrap"
              >
                {label}
              </Box>

              {/* Icon-Kreis-Bereich */}
              <Flex
                alignItems="center"
                justifyContent="center"
                bg="button.filter.iconCircleBg"
                borderRadius="full"
                boxSize="50px"
                minW="38px"
                flexShrink={0}
              >
                <Icon as={LuChevronDown} color="button.filter.iconColor" boxSize="18px" />
              </Flex>
            </Flex>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content
              bg="dark.800"
              borderColor="gray.700"
              borderRadius="xl"
              boxShadow="card"
              zIndex="popover"
              p="1"
            >
              {menuContent ? (
                menuContent
              ) : (
                <>
                  {options.map((option) => (
                    <Menu.Item
                      key={option.value}
                      value={option.value}
                      bg="transparent"
                      _hover={{ bg: "button.filter.hoverBg" }}
                      _focus={{ bg: "button.filter.activeBg" }}
                      color="gray.300"
                      fontSize="sm"
                      borderRadius="lg"
                      px="3"
                      h="32px"
                      onClick={() => onSelect?.(option.value)}
                    >
                      {option.label}
                    </Menu.Item>
                  ))}
                </>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Box>
    );
  }
);

FilterDropdown.displayName = 'FilterDropdown';
