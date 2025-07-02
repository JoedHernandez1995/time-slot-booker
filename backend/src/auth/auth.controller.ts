import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req: Request) {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const token = await this.authService.login(user);
    res.redirect(`http://localhost:3000/auth/google/success?token=${token}`);
    return;
  }

  @Get('google/success')
  async googleSuccess(@Req() req: Request, @Res() res: Response) {
    const token = req.query.token as string;
    res.send(`Authentication successful! Token: ${token}`);
  }
}