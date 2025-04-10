import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../common/entities/user.entity';
import { Response, Request as ExpressRequest } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface IAuthRequest extends ExpressRequest {
  user?: Partial<User> | { userId: string };
  cookies: { refreshToken?: string };
  res?: Response;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: IAuthRequest): Promise<{ accessToken: string }> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.authService.login(
      req.user as Partial<User>,
    );

    req.res?.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return { accessToken };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @Request() req: IAuthRequest,
  ): Promise<{ accessToken: string }> {
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

  @UseGuards(RefreshAuthGuard)
  @Post('logout')
  async logout(@Request() req: IAuthRequest): Promise<{ message: string }> {
    if (!req.user || typeof req.user !== 'object' || !('userId' in req.user)) {
      throw new UnauthorizedException('Invalid user');
    }

    await this.authService.logout(req.user.userId);

    req.res?.clearCookie('refreshToken');

    return { message: 'Successfully logged out.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.sendResetPasswordEmail(forgotPasswordDto.email);

    return {
      message:
        'If this email is registered, we have sent password reset instructions.',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return {
      message: 'Your password has been successfully reset.',
    };
  }
}
