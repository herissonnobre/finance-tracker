'use client';

import { RegisterSchema, registerSchema } from '@/lib/validation/registerSchema';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm(){
  const [loading, setLoading] = useState(false);
  const {register, handleSubmit, formState: {errors}} = useForm<RegisterSchema>({resolver: zodResolver(registerSchema)});

  const onSubmit = async (data: RegisterSchema) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);

      // TODO: redirecionar, mostrar toast ou limpar formulário
    } catch (error) {
      console.error("Erro ao registrar:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <Input label='First Name' {...register("firstName")} error={errors.firstName?.message} />
      <Input label='Last Name' {...register("lastName")} error={errors.lastName?.message} />
      <Input label='Email' {...register('email')} error={errors.email?.message} />
      <Input label='CPF' {...register('cpf')} error={errors.cpf?.message} />
      <Input label='Phone' {...register('phone')} error={errors.phone?.message} />
      <Input label='Password' type='password' {...register('password')} error={errors.password?.message} />
      <Input label='Confirm Password' type='password' {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      <Button type='submit' className='w-full' disabled={loading}>
        {loading ? 'Registering...' : "Register"}
      </Button>
    </form>
  )
}