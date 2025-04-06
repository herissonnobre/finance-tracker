import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  Validate,
} from 'class-validator';
import { Match } from '../../common/validators/match.validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Reset token is required.' })
  @IsString()
  token: string;

  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number.',
  })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one special character.',
  })
  newPassword: string;

  @IsNotEmpty({ message: 'Password confirmation is required.' })
  @Validate(Match, ['newPassword'], {
    message: 'Password confirmation does not match the new password.',
  })
  confirmPassword: string;
}
