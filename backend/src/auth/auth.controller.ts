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
      path: '/',
    });

    return { accessToken };
  }

  @Post('refresh-token')
  async refreshToken(@Request() req: RequestWithCookies) {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldRefreshToken);

    req.res?.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: IJwtAuthRequest) {
    await this.authService.logout(req.user.userId);

    req.res.clearCookie('refreshToken');

    return { message: 'Successfully logged out.' };
  }
}
