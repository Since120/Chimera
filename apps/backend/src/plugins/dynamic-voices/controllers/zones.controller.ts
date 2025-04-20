import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { ZonesService } from '../services/zones.service';
import { ZoneDto, CreateZoneDto, UpdateZoneDto } from 'shared-types';
// JwtAuthGuard wird global registriert

@Controller()
export class ZonesController {
  private readonly logger = new Logger(ZonesController.name);

  constructor(private readonly zonesService: ZonesService) {}

  @Post('categories/:categoryId/zones')
  async createZone(
    @Param('categoryId') categoryId: string,
    @Body() createZoneDto: CreateZoneDto,
  ): Promise<ZoneDto> {
    try {
      return await this.zonesService.createZone(categoryId, createZoneDto);
    } catch (error) {
      this.logger.error(`Error creating zone: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error creating zone',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('categories/:categoryId/zones')
  async getZonesByCategory(@Param('categoryId') categoryId: string): Promise<ZoneDto[]> {
    try {
      return await this.zonesService.getZonesByCategory(categoryId);
    } catch (error) {
      this.logger.error(`Error getting zones: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting zones',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('zones/:id')
  async getZoneById(@Param('id') id: string): Promise<ZoneDto> {
    try {
      return await this.zonesService.getZoneById(id);
    } catch (error) {
      this.logger.error(`Error getting zone: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error getting zone',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('zones/:id')
  async updateZone(
    @Param('id') id: string,
    @Body() updateZoneDto: UpdateZoneDto,
  ): Promise<ZoneDto> {
    try {
      return await this.zonesService.updateZone(id, updateZoneDto);
    } catch (error) {
      this.logger.error(`Error updating zone: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error updating zone',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('zones/:id')
  async deleteZone(@Param('id') id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const result = await this.zonesService.deleteZone(id);
      return { success: result, message: 'Zone deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting zone: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Error deleting zone',
        error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
