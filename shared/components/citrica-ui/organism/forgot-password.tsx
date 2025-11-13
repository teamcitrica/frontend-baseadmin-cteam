'use client';
import React, { useState } from 'react'
import { Container } from '@/styles/07-objects/objects';
import Text from '../atoms/text';
import Input from "../atoms/input";
import { Divider, Link } from "@heroui/react";
import Button from '../molecules/button';
import Modal from '../molecules/modal';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      // Simular envío de email
      setTimeout(() => {
        setIsLoading(false);
        setShowEmailSentModal(true);
      }, 1000);
    }
  };

  return (
    <Container className='w-[968px] flex justify-center items-center !flex-nowrap'>
      <div className='container-inputs'>
        <img className='w-[80px] pb-3 items-center' src="/img/citrica-logo.png" alt="Logo" />
        <h2 className='mb-4'>
          <Text variant='body' weight='bold'>
            ¿Tienes problemas para iniciar sesión?
          </Text>
        </h2>
        <p className='mb-6'>
          <Text variant='label' className="text-forgot-password">
            Ingresa tu correo para recuperar tu contraseña
          </Text>
        </p>
        <form className='flex flex-col justify-center mb-4' onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            description='Te enviaremos un enlace para restablecer tu contraseña.'
            className='mb-3'
          />
          <Button 
            type="submit"
            variant='primary'
            label={isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            disabled={isLoading}
          />
        </form>

        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/login">
            <Text variant="body" textColor='color-secondary'>
              Regresar
            </Text>
          </Link>
        </div>
      </div>
      <div className='bg-login not-sm'></div>

      {/* Modal de Email Enviado */}
      <Modal
        isOpen={showEmailSentModal}
        onClose={() => setShowEmailSentModal(false)}
        size="sm"
        hideCloseButton={true}
        isDismissable={true}
        className="text-center"
      >
        <div className="flex flex-col items-center py-6 px-4">
          {/* Icono de check */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-green-600"
            >
              <path 
                d="M20 6L9 17L4 12" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="mb-3">
            <Text variant="headline" weight="bold">
              Email enviado
            </Text>
          </h3>
          <p className="mb-6">
            <Text variant="body" textColor='color-black'>
              Revisa tu correo electrónico y abre el enlace que te enviamos para continuar.
            </Text>
          </p>
          
          {/* Botón Cerrar */}
          <Button 
            variant="primary"
            label="Cerrar"
            fullWidth
            onClick={() => setShowEmailSentModal(false)}
            className="mb-4"
          />
          
          {/* Link de login */}
          <div className="text-center">
            <Text variant="body" textColor="color-black">
              ¿Ya tienes una cuenta?{' '}
            </Text>
            <Link href="/login">
              <Text variant="body" textColor='color-primary' weight="bold">
                Inicia sesión
              </Text>
            </Link>
          </div>
        </div>
      </Modal>
    </Container>
  )
}

export default ForgotPasswordPage