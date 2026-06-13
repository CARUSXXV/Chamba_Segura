import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      username: string;
      nombre_completo: string;
      es_trabajador: boolean;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.username,
      body.nombre_completo,
      body.es_trabajador,
    );
  }
}
