// apps/frontend-new/src/components/core/FilterBar.tsx
import { Flex, Text, FlexProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FilterDropdown, FilterDropdownProps } from './FilterDropdown';

export interface FilterConfig extends Omit<FilterDropdownProps, 'ref'> {
  id: string;
}

export interface FilterBarProps extends FlexProps {
  /**
   * Label for the filter section
   */
  label?: string;
  
  /**
   * Array of filter configurations
   */
  filters: FilterConfig[];
  
  /**
   * Optional custom content to render instead of the default filters
   */
  children?: ReactNode;
}

/**
 * A horizontal bar of filter dropdowns with a label
 */
export const FilterBar = ({ 
  label = 'Aktive Filter:', 
  filters = [], 
  children,
  ...rest 
}: FilterBarProps) => {
  return (
    <Flex
      alignItems="center"
      gap={3}
      flexWrap="wrap"
      my={4}
      {...rest}
    >
      <Flex w="full" align="center">
        {/* Label */}
        <Text fontWeight="medium" color="white" mr={4} fontSize="md">
          {label}
        </Text>

        {/* Filter Container */}
        <Flex flex="1" w="full" gap={2}>
          {children ? (
            children
          ) : (
            <>
              {filters.map((filter) => (
                <FilterDropdown
                  key={filter.id}
                  label={filter.label}
                  options={filter.options}
                  onSelect={filter.onSelect}
                  menuContent={filter.menuContent}
                />
              ))}
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

FilterBar.displayName = 'FilterBar';
