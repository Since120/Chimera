// apps/dashboard/src/app/dashboard/categories/page.tsx
import type * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';

import { appConfig } from '@/config/app';
import { CategoryManagement } from '@/components/dashboard/category-management';

export const metadata = { title: `Kategorie & Zonen Manager | Dashboard | ${appConfig.name}` } satisfies Metadata;

export default function CategoriesPage(): React.JSX.Element {
  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <CategoryManagement />
    </Box>
  );
}