'use client';
import React, { useState } from 'react'
import { Container } from '@/styles/07-objects/objects';
import Text from '../atoms/text';
import Input from "../atoms/input";
import { Divider, Link } from "@heroui/react";
import Button from '../molecules/button';
import Modal from '../molecules/modal';
import Icon from '../atoms/icon';

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
            ¿No puedes iniciar sesión?
          </Text>
        </h2>
        <p className='mb-4'>
          <Text variant='label' className="text-forgot-password">
            Escribe tu correo para recuperar el acceso.
          </Text>
        </p>
        <form className='flex flex-col justify-center' onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            description='Te enviaremos un enlace para restablecerla.'
            className='mb-2'
          />
          <Button 
            type="submit"
            variant='primary'
            label={isLoading ? 'Enviando...' : 'Enviar enlace'}
            disabled={isLoading}
          />
        </form>

        <div className="w-[312px] mt-4 flex flex-col justify-center items-center">
          <Divider className="w-[210px] h-[1px] bg-[#E5E7EB] mt-[14px] mb-2"></Divider>
          <Link href="/login">
            <Text variant="label" textColor='color-primary'>
              Volver al inicio de sesión
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
          <div className="flex items-center justify-center mb-4">
            <Icon name='CircleCheckBig' size={32} color="var(--color-primary)"/>
          </div>
          <h3 className="mb-3">
            <Text variant="title" weight="bold">
              Correo enviado
            </Text>
          </h3>
          <p className="mb-6">
            <Text variant="body" textColor='color-on-secondary'>
              Revisa tu bandeja y sigue el enlace para restablecer tu contraseña.
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
            <Text variant="label" textColor="color-on-secondary">
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