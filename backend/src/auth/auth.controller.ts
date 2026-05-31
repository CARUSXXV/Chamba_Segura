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

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const data = await this.authService.login(body.email, body.password);
    return data; // Return full object { user, session }
  }
}
