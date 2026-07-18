import { Controller, Get, Delete, Param, Request, Query, UseGuards } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('publicaciones')
@UseGuards(AuthGuard)
export class PublicacionesController {
    constructor(private readonly publicacionesService: PublicacionesService) { }

    // ==========================================
    // BUSCAR (GET)
    // ==========================================

    @Get('trabajos')
    findAllJobs(
        @Query('contractor_id') contractor_id?: string, // Aquí atrapamos tu ID
        @Query('category') category?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Le enviamos el ID al servicio para que filtre la base de datos
        return this.publicacionesService.findAllJobs(contractor_id, category,);
    }

    @Get('servicios')
    findAllServicios(
        @Query('trabajador_id') trabajador_id?: string,
        @Query('oficio') oficio?: string,
        @Query('tipo_de_oficio') tipo_de_oficio?: string,
    ) {
        // Le enviamos el ID al servicio para que filtre la base de datos
        return this.publicacionesService.findAllServicios(trabajador_id, oficio, tipo_de_oficio);
    }

    @Get('trabajos')
    getMisTrabajos(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Si decides usar page y limit para paginar más adelante, ya los estás recibiendo
        return this.publicacionesService.getMisTrabajos(req.user.id);
    }

    @Get('servicios')
    getMisServicios(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.publicacionesService.getMisServicios(req.user.id);
    }

    // ==========================================
    // ELIMINAR (DELETE) - Para que funcione el CRUD básico
    // ==========================================

    @Delete('trabajos/:id')
    deleteTrabajo(@Request() req: any, @Param('id') id: string) {
        return this.publicacionesService.deleteTrabajo(id, req.user.id);
    }

    @Delete('servicios/:id')
    deleteServicio(@Request() req: any, @Param('id') id: string) {
        return this.publicacionesService.deleteServicio(id, req.user.id);
    }
}