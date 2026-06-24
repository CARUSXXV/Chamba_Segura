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
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  async findAll(
    @Query('latitude') latitudeStr?: string,
    @Query('longitude') longitudeStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('oficio') oficio?: string,
  ) {
    const latitude = latitudeStr ? Number(latitudeStr) : undefined;
    const longitude = longitudeStr ? Number(longitudeStr) : undefined;
    const radius = radiusStr ? Number(radiusStr) : undefined;

    if (latitude !== undefined && !isNaN(latitude) && longitude !== undefined && !isNaN(longitude)) {
      return this.serviciosService.findNearby(
        latitude,
        longitude,
        radius,
        oficio,
      );
    }
    return this.serviciosService.findAll(oficio);
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
