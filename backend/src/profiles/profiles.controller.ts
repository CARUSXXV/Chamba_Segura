import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ProfilesService, ProfileUpdatePayload } from './profiles.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('perfiles') // <-- El nombre debe coincidir con la URL del frontend
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // Ruta para obtener: GET /api/v1/perfiles/:id
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.profilesService.getProfileById(id);
  }

  // Ruta para actualizar: PUT /api/v1/perfiles/:id
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: ProfileUpdatePayload,
  ) {
    return this.profilesService.updateProfile(id, payload);
  }

  // Ruta para eliminar: DELETE /api/v1/perfiles/:id
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.profilesService.deleteProfile(id);
  }
}
