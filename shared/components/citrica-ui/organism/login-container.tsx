'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Text from '@ui/atoms/text'
import Input from '@ui/atoms/input'
import { addToast } from "@heroui/toast"
import { UserAuth } from '@/shared/context/auth-context'
import { useForm } from "react-hook-form";
import { Divider, Link } from "@heroui/react";
import { Eye } from "lucide-react";
import Button from '@/shared/components/citrica-ui/molecules/button';

type FormValues = {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  message: string;
};

interface LoginContainerProps {
  logoSrc: string;
  backgroundImage: string;
}

const LoginContainer: React.FC<LoginContainerProps> = ({ logoSrc, backgroundImage }) => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signInWithPassword } = UserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormValues) => {
    if (!data.email || !data.password) {
      addToast({
        title: "Error",
        description: "Por favor completa todos los campos",
        color: "danger",
      })
      return
    }

    setIsLoading(true)

    try {
      const { respData, respError } = await signInWithPassword(data.email, data.password)

      if (respError) {
        addToast({
          title: "Error de autenticación",
          description: respError.message || "Credenciales incorrectas",
          color: "danger",
        })
      } else if (respData?.user) {
        addToast({
          title: "Bienvenido",
          description: "Has iniciado sesión correctamente",
          color: "success",
        })
        router.push('/admin')
      }
    } catch (error) {
      console.error('Login error:', error)
      addToast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        color: "danger",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-[968px] flex justify-center">
      <div className='container-inputs'>
        <img className='w-[80px] pb-3' src={logoSrc} alt="Logo" />
        <Text textColor="white" variant="body">
          <h2>BIENVENIDO</h2>
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-5 my-4'>
            <Input
              type="email"
              placeholder="Email"
              {...register("email")}
              disabled={isLoading}

            />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              {...register("password")}
              disabled={isLoading}

              endContent={
                <Eye
                  className="text-[#66666666] cursor-pointer w-5 h-5"
                  onClick={() => setShowPassword((prev) => !prev)}
                />
              }
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            label={isLoading ? 'Accediendo...' : 'Acceder'}
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth={true}
            className='mt-2'
          />
        </form>

        <div className="w-[312px] h-[94px] mt-4 flex flex-col justify-center items-center">
          <Divider className="max-w-[380px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/forgot-password">
            <Text variant="body">
              ¿Olvidaste tu contraseña?
            </Text>
          </Link>
        </div>
      </div>
      <div
        className='bg-login not-sm'
        //style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
    </div>
  )
}

export default LoginContainer