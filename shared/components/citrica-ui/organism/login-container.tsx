'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@ui/atoms/input'
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { useForm } from "react-hook-form"
import { Divider, Link } from "@heroui/react"
import Button from '@/shared/components/citrica-ui/molecules/button'
import { Icon, Text } from '@/shared/components/citrica-ui'
import { Container } from '@/styles/07-objects/objects'

type FormValues = {
  password: string;
  email: string;
};

const LoginPage = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signInWithPassword, userSession, isInitializing } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir a admin si ya está autenticado (solo una vez)
  useEffect(() => {
    if (!isInitializing && userSession) {
      router.replace('/admin');
    }
  }, [userSession, isInitializing, router]);

  // Si está inicializando o ya hay sesión, no mostrar el formulario
  if (isInitializing || userSession) {
    return null;
  }

  const onSubmit = async (data: FormValues) => {
    if (!data.email || !data.password) {
      addToast({
        title: "Error",
        description: "Por favor ingresa tu correo y contraseña.",
        color: "danger",
      })
      return
    }

    setIsLoading(true)

    try {
      const { respData, respError } = await signInWithPassword(data.email, data.password)

      if (respError) {
        addToast({
          title: "Error al iniciar sesión",
          description: respError.message || "Correo o contraseña incorrectos.",
          color: "danger",
        })
      } 
    } catch (error) {
      console.error('Login error:', error)
      addToast({
        title: "Error",
        description: "Intenta nuevamente más tarde.",
        color: "danger",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="w-[968px] flex justify-center !flex-nowrap">
      <div className='container-inputs'>
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />
        <h2 className='text-center mb-4'>
          <Text textColor="white" variant="body">
            ¡Bienvenido!
          </Text>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col justify-center'>
          <Input
            type="email"
            placeholder="Correo electónico"
            {...register("email")}
            disabled={isLoading}
            required
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            {...register("password")}
            disabled={isLoading}
            required
            endContent={
              <Icon name="Eye"
                className="text-[#66666666] cursor-pointer w-5 h-5"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            }
          />
          <Button
            type="submit"
            variant="primary"
            label={isLoading ? 'Accediendo...' : 'Iniciar sesión'}
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth={true}
            className='mt-2'
          />
        </form>

        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/forgot-password">
            <Text variant="label" textColor='color-primary'>
              ¿Olvidaste tu contraseña?
            </Text>
          </Link>
        </div>
      </div>
      <div className='bg-login not-sm'></div>
    </Container>
  )
}

export default LoginPage