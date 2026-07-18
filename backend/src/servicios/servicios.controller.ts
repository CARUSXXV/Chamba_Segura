import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ServiciosService, ServicioPayload } from './servicios.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) { }

  @Get()
  async findAll(
    @Query('latitude') latitudeStr?: string,
    @Query('longitude') longitudeStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('oficio') oficio?: string,
    @Query('page') pageStr?: number,
    @Query('limit') limitStr?: string,
    @Query('trabajador_id') trabajador_id?: string,
  ) {
    const latitude = latitudeStr ? Number(latitudeStr) : undefined;
    const longitude = longitudeStr ? Number(longitudeStr) : undefined;
    const radius = radiusStr ? Number(radiusStr) : undefined;
    const page = pageStr ? Math.max(1, Number(pageStr)) : 1;
    const limit = limitStr ? Math.min(100, Math.max(1, Number(limitStr))) : 20;

    if (latitude !== undefined && !isNaN(latitude) && longitude !== undefined && !isNaN(longitude)) {
      return this.serviciosService.findNearby(
        latitude,
        longitude,
        radius,
        oficio,
        page,
        limit,
      );
    }
    return this.serviciosService.findAll(trabajador_id, oficio, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() payload: ServicioPayload) {
    return this.serviciosService.create(payload);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: Partial<ServicioPayload>,
  ) {
    return this.serviciosService.update(id, payload);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.serviciosService.remove(id);
  }
}
