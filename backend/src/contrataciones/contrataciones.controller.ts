import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { User } from '@supabase/supabase-js';
import {
  ContratacionesService,
  ContratacionPayload,
  EstadoContratacion,
} from './contrataciones.service';
import { AuthGuard } from '../auth/auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('contrataciones')
@UseGuards(AuthGuard)
export class ContratacionesController {
  constructor(private readonly contratacionesService: ContratacionesService) {}

  @Post()
  async create(
    @Body() payload: ContratacionPayload,
    @Request() req: RequestWithUser,
  ) {
    return this.contratacionesService.create(payload, req.user.id);
  }

  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.contratacionesService.findByUserId(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.contratacionesService.findOne(id, req.user.id);
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body('nuevo_estado') nuevoEstado: EstadoContratacion,
    @Request() req: RequestWithUser,
  ) {
    return this.contratacionesService.updateEstado(
      id,
      nuevoEstado,
      req.user.id,
    );
  }

  @Post(':id/documento')
  async uploadDocumento(
    @Param('id') id: string,
    @Body('url') url: string,
    @Request() req: RequestWithUser,
  ) {
    return this.contratacionesService.uploadDocumento(id, url, req.user.id);
  }
}
