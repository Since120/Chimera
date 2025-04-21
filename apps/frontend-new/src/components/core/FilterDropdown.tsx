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
              bg="#151A26"
              color="gray.300"
              borderRadius="full"
              h="50px"
              w="full"
              flex="1"
              minW={0}
              boxShadow="0 12px 28px -6px rgba(0,0,0,0.35), 0 8px 12px -8px rgba(0,0,0,0.25)"
              backdropFilter="blur(5px)"
              transition="all 0.2s ease"
              _hover={{ bg: "#1D2433" }}
              _active={{ bg: "#232A3D" }}
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
                bg="#1E2536"
                borderRadius="full"
                boxSize="50px"
                minW="38px"
                flexShrink={0}
              >
                <Icon as={LuChevronDown} color="white" boxSize="18px" />
              </Flex>
            </Flex>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content
              bg="#1A202C"
              borderColor="gray.700"
              borderRadius="xl"
              boxShadow="lg"
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
                      _hover={{ bg: "#1D2433" }}
                      _focus={{ bg: "#232A3D" }}
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
