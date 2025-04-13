'use client';

// apps/dashboard/src/components/dashboard/category-management/components/CategoryList.tsx

import React from 'react';
import { Box, Stack, Paper, Typography, Button, Skeleton } from '@mui/material';
import { PlusCircle } from 'lucide-react';
import CategoryItem from './CategoryItem';
import { EnhancedCategory } from '../hooks/useCategories';
interface CategoryListProps {
  categories: EnhancedCategory[];
  expandedCategories: string[];
  loading: boolean;
  onToggleExpand: (categoryId: string) => void;
  onEditCategory: (category: EnhancedCategory | null) => void;
  onDeleteCategory: (categoryId: string, e: React.MouseEvent) => void;
  onAddZone: (categoryId: string) => void;
  onEditZone: (categoryId: string, zoneId: string) => void;
  onDeleteZone: (zoneId: string, e: React.MouseEvent) => void;
  updatingCategories?: string[];
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  expandedCategories,
  loading,
  onToggleExpand,
  onEditCategory,
  onDeleteCategory,
  onAddZone,
  onEditZone,
  onDeleteZone
}) => {
  if (loading) {
    return (
      <Stack spacing={2} sx={{ py: 4 }}>
        {[1, 2, 3].map((item) => (
          <Paper key={item} sx={{ p: 2 }}>
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
          </Paper>
        ))}
      </Stack>
    );
  }

  if (categories.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Keine Kategorien gefunden</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusCircle size={18} />}
          onClick={() => onEditCategory(null)}
        >
          Erste Kategorie erstellen
        </Button>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          isExpanded={expandedCategories.includes(category.id)}
          onToggleExpand={onToggleExpand}
          onEdit={() => onEditCategory(category)}
          onDelete={(e) => onDeleteCategory(category.id, e)}
          onAddZone={() => onAddZone(category.id)}
          onEditZone={(zoneId: string) => onEditZone(category.id, zoneId)}
          onDeleteZone={onDeleteZone}
        />
      ))}
    </Stack>
  );
};

export default CategoryList;