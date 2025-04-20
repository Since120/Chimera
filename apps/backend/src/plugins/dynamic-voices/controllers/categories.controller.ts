import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ScopeType,
  CategoryDiscordRolePermissionDto
} from 'shared-types';
// JwtAuthGuard wird global registriert

@Controller('categories')
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryDto> {
    try {
      return await this.categoriesService.createCategory(createCategoryDto);
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error creating category',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async getCategories(
    @Query('scopeType') scopeType: ScopeType,
    @Query('scopeId') scopeId: string,
  ): Promise<CategoryDto[]> {
    try {
      if (!scopeType || !scopeId) {
        throw new HttpException(
          'scopeType and scopeId query parameters are required',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.categoriesService.getCategoriesByScope(scopeType, scopeId);
    } catch (error) {
      this.logger.error(`Error getting categories: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting categories',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<CategoryDto> {
    try {
      return await this.categoriesService.getCategoryById(id);
    } catch (error) {
      this.logger.error(`Error getting category: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting category',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    try {
      return await this.categoriesService.updateCategory(id, updateCategoryDto);
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error updating category',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.categoriesService.deleteCategory(id);
      return { success: result, message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting category: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error deleting category',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id/permissions')
  async getCategoryPermissions(@Param('id') id: string): Promise<CategoryDiscordRolePermissionDto[]> {
    try {
      return await this.categoriesService.getCategoryRolePermissions(id);
    } catch (error) {
      this.logger.error(`Error getting category permissions: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting category permissions',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
