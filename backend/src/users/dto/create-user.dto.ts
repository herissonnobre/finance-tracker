import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must have at least 8 characters, one uppercase letter, and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must have exactly 11 digits' })
  cpf: string;
}
