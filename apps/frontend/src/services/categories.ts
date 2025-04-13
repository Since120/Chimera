import api from './api';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ScopeType,
  CategoryDiscordRolePermissionDto
} from 'shared-types';

/**
 * Get all categories for a specific scope
 */
export const getCategories = async (scopeType: ScopeType, scopeId: string): Promise<CategoryDto[]> => {
  const response = await api.get(`/categories?scopeType=${scopeType}&scopeId=${scopeId}`);
  return response.data;
};

/**
 * Get a category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<CategoryDto> => {
  const response = await api.get(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CreateCategoryDto): Promise<CategoryDto> => {
  const response = await api.post('/categories', categoryData);
  return response.data;
};

/**
 * Update a category
 */
export const updateCategory = async (categoryId: string, categoryData: UpdateCategoryDto): Promise<CategoryDto> => {
  const response = await api.put(`/categories/${categoryId}`, categoryData);
  return response.data;
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: string): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Get category role permissions
 */
export const getCategoryRolePermissions = async (categoryId: string): Promise<CategoryDiscordRolePermissionDto[]> => {
  const response = await api.get(`/categories/${categoryId}/permissions`);
  return response.data;
};
