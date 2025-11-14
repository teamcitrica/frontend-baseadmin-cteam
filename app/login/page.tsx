'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@citrica/objects'
import { UserAuth } from '@/shared/context/auth-context'
import LoginContainer from '@/shared/components/citrica-ui/organism/login-container';

const LoginContainerPage = () => {
  const { userSession } = UserAuth();
  const router = useRouter();

  // Redirigir a admin si ya está autenticado
  useEffect(() => {
    if (userSession) {
      router.push('/admin');
    }
  }, [userSession, router]);

  // Si ya hay sesión, no mostrar el formulario (se redirigirá)
  if (userSession) {
    return null;
  }

  return (
    <Container className='flex justify-center items-center h-screen'>
      <LoginContainer />
    </Container>
  )
}

export default LoginContainerPage
