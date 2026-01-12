"use client"
import React from 'react'
import { Container, Col } from '@/styles/07-objects/objects';
import Icon from '@ui/atoms/icon';
import { Button, Text, Sidebar,  Select } from '@citrica-ui';
import { useTheme } from "next-themes";
import { addToast } from "@heroui/toast";
import {  Input } from 'citrica-ui-toolkit'
const SectionTypography = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }}>
          <div>
            <Icon name="AlarmClockMinus" size={40} />
            <Icon name="ChevronLeft" size={80} />
          </div>
          <h1>
            <Text variant="display" textColor="color-on-container">Display</Text>
          </h1>
          <section>
            <h2>
              <Text variant="headline" textColor="color-on-container">Headline</Text>
            </h2>
          </section>
          <h3>
            <Text variant="title" textColor="color-on-container">Title</Text>
          </h3>
          <h4>
            <Text variant="subtitle" color="#F00">Subtitle</Text>
          </h4>
          <p>
            <Text variant="body" weight='bold'>Body</Text>
          </p>
          <p className='mb-8'>
            <Text variant="label">Label</Text>
          </p>
          <div>
            <Button
              onClick={() => {
                addToast({
                  title: "Toast title",
                  description: "Toast displayed successfully",
                  color: "success",
                  radius: "sm",
                });
              }}
              label="New Toast Test"
              variant="primary" />
          </div>
        </Col>
        <div className='flex flex-col gap-4 mb-6'>
          <p className="text-lg font-bold">Inputs con Citrica Design System:</p>

          <Input
            label='Nombre completo'
            placeholder='Escribe tu nombre aquí'
            variant='primary'
          />

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            type="email"
            variant="secondary"
            startIcon="Mail"
            required
          />

          <Input
            label="Teléfono"
            placeholder="+51 999 999 999"
            type="tel"
            variant="primary"
            startIcon="Phone"
          />
        </div>
        <div>
          <Select
            variant="primary"
            label="País"
            placeholder="prueba de que sirve johan"
            startIcon="Globe"
            required
            options={[
              { value: "es", label: "España" },
              { value: "mx", label: "México" },
              { value: "ar", label: "Argentina" }
            ]}
            onSelectionChange={(keys) => {
              console.log('Seleccionado:', keys);
            }}
          />
        </div>
      </Container>
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }}>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="rounded-md p-2 hover:bg-accent"
          >
            <Icon name="Sun" size={24} strokeWidth={1.4} className="text-on-accent" />
            <Text variant='label' className="sr-only">Toggle theme</Text>
          </button>
        </Col>
      </Container>
    </>
  )
}

export default SectionTypography