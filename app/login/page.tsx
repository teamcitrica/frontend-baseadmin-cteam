'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@citrica/objects'
import { UserAuth } from '@/shared/context/auth-context'
import LoginContainer from '@/shared/components/citrica-ui/organism/login-container';

const LoginPage = () => {
  const { userSession, loading } = UserAuth();
  const router = useRouter();

  // Redirigir a admin si ya está autenticado
  useEffect(() => {
    if (!loading && userSession) {
      router.push('/admin');
    }
  }, [userSession, loading, router]);

  // Mostrar loading mientras se verifica
  if (loading) {
    return null;
  }

  // Si ya hay sesión, no mostrar el formulario (se redirigirá)
  if (userSession) {
    return null;
  }

  return (
    <Container className='flex justify-center items-center h-screen'>
      <LoginContainer
        logoSrc="/img/citrica-logo.png"
        backgroundImage=""
      />
    </Container>
  )
}

export default LoginPage
