import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { User } from '@supabase/supabase-js';
import {
  PostulacionesService,
  PostulacionPayload,
  EstadoPostulacion,
} from './postulaciones.service';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('postulaciones')
@UseGuards(AuthGuard)
export class PostulacionesController {
  constructor(
    private readonly postulacionesService: PostulacionesService,
  ) {}

  @Post()
  async create(
    @Body() payload: PostulacionPayload,
    @Request() req: RequestWithUser,
  ) {
    return this.postulacionesService.create(payload, req.user.id);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    const metadata = req.user.user_metadata as Record<string, unknown> | null;
    const esTrabajador = metadata?.es_trabajador === true;
    return this.postulacionesService.findByUser(req.user.id, esTrabajador);
  }

  @Get('trabajo/:trabajoId')
  async findByJobId(@Param('trabajoId') trabajoId: string) {
    return this.postulacionesService.findByJobId(trabajoId);
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body('nuevo_estado') nuevoEstado: EstadoPostulacion,
    @Request() req: RequestWithUser,
  ) {
    return this.postulacionesService.updateEstado(
      id,
      nuevoEstado,
      req.user.id,
    );
  }
}
