import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../common/entities/user.entity';
import { Response, Request as ExpressRequest } from 'express';

interface ILocalAuthRequest {
  user: Partial<User>;
  res: Response;
}

interface IJwtAuthRequest {
  user: { userId: string };
  res: Response;
}

interface RequestWithCookies extends ExpressRequest {
  cookies: { refreshToken?: string };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: ILocalAuthRequest): Promise<any> {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    req.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @Post('refresh-token')
  async refreshToken(@Request() req: RequestWithCookies) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: IJwtAuthRequest) {
    req.res.clearCookie('refreshToken');

    await this.authService.logout(req.user.userId);

    return { message: 'Successfully logged out.' };
  }
}
