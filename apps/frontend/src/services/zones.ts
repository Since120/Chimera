import api from './api';
import { ZoneDto, CreateZoneDto, UpdateZoneDto } from 'shared-types';

/**
 * Get all zones for a category
 */
export const getZonesByCategory = async (categoryId: string): Promise<ZoneDto[]> => {
  const response = await api.get(`/categories/${categoryId}/zones`);
  return response.data;
};

/**
 * Get a zone by ID
 */
export const getZoneById = async (zoneId: string): Promise<ZoneDto> => {
  const response = await api.get(`/zones/${zoneId}`);
  return response.data;
};

/**
 * Create a new zone
 */
export const createZone = async (categoryId: string, zoneData: CreateZoneDto): Promise<ZoneDto> => {
  const response = await api.post(`/categories/${categoryId}/zones`, zoneData);
  return response.data;
};

/**
 * Update a zone
 */
export const updateZone = async (zoneId: string, zoneData: UpdateZoneDto): Promise<ZoneDto> => {
  const response = await api.put(`/zones/${zoneId}`, zoneData);
  return response.data;
};

/**
 * Delete a zone
 */
export const deleteZone = async (zoneId: string): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/zones/${zoneId}`);
  return response.data;
};
