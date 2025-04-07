import {z} from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Email is required'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF must have 11 digits (only numbers)'),
  phone: z.string().regex(/^\d{10,11}$/, 'Phone must have 10 or 11  digits (only numbers)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type RegisterSchema = z.infer<typeof registerSchema>;