"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { Container } from "@/styles/07-objects/objects";
import Text from "../atoms/text";
import Input from "../atoms/input";
import Icon from "../atoms/icon";
import Button from "../molecules/button";
import Modal from "../molecules/modal";
import { Divider, Link } from "@heroui/react";

type FormValues = {
  password: string;
};

const NewPasswordPage = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      // Aquí iría la lógica para cambiar la contraseña
      console.log('Nueva contraseña:', data.password);
      // Simular éxito y mostrar modal
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(true);
      }, 1000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessModal(false);
    router.push('/login');
  };

  return (
    <Container className="w-[968px] flex justify-center !flex-nowrap">
      <div className="container-inputs">
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />
        <h2 className='text-center mb-4'>
          <Text textColor="white" variant="body">
            Crea una nueva contraseña
          </Text>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col justify-center gap-4'>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            {...register("password")}
            disabled={isLoading}
            required
            endContent={
              <Icon name="Eye"
                size={12}
                className="text-[#66666666] cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              />
            }
          />
          <Button
            type="submit"
            variant="primary"
            label={isLoading ? 'Guardando...' : 'Guardar contraseña'}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </form>
        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/login">
            <Text variant="body" textColor='color-primary'>
              Cancelar
            </Text>
          </Link>
        </div>
      </div>
      <div className="bg-login not-sm"></div>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        size="sm"
        hideCloseButton={true}
        isDismissable={true}
        className="text-center"
      >
        <div className="flex flex-col items-center py-6 px-4">
          {/* Icono de check */}
          <div className="flex items-center justify-center mb-4">
            <Icon name='CircleCheckBig' size={32} color="var(--color-primary)"/>
          </div>
          <h3 className="mb-3">
            <Text variant="title" weight="bold">
              ¡Contraseña reestablecida exitosamente!
            </Text>
          </h3>
          <p className="mb-6">
            <Text variant="body" textColor='color-on-secondary'>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Text>
          </p>

          {/* Botón para ir al login */}
          <Button
            variant="primary"
            label="Ir al inicio de sesión"
            fullWidth
            className="mb-4"
            onClick={handleGoToLogin}
          />
        </div>
      </Modal>
    </Container>
  )
}

export default NewPasswordPage