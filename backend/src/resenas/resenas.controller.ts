import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('resenas')
export class ResenasController {
    constructor(private readonly resenasService: ResenasService) { }

    // POST /api/v1/resenas (Para enviar la calificación al terminar un trabajo)
    @UseGuards(AuthGuard)
    @Post()
    async crearResena(
        @Request() req: any,
        @Body() body: { evaluado_id: string; contrataciones_id: string; calificacion: number; comentario?: string }
    ) {
        // req.user.id viene del token de quien está conectado (el que califica)
        return this.resenasService.crearResena(
            req.user.id,
            body.evaluado_id,
            body.contrataciones_id,
            body.calificacion,
            body.comentario
        );
    }

    // GET /api/v1/resenas/usuario/:id (Para la lista de comentarios en el perfil)
    @Get('usuario/:id')
    async obtenerResenas(@Param('id') evaluado_id: string) {
        return this.resenasService.obtenerResenasDeUsuario(evaluado_id);
    }

    // GET /api/v1/resenas/usuario/:id/promedio (Para los badges de estrellas)
    @Get('usuario/:id/promedio')
    async obtenerPromedio(@Param('id') evaluado_id: string) {
        return this.resenasService.obtenerPromedioUsuario(evaluado_id);
    }
}