"use client"
import React from 'react'
import { Container, Col } from '@/styles/07-objects/objects';
import Icon from '@ui/atoms/icon';
import { Button, Text, Sidebar, Input, Select } from '@citrica-ui';
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { addToast } from "@heroui/toast";

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
          <div>
            <Text variant="display" textColor="color-on-container">Display</Text>
          </div>
          <section>
            <h1>
              <Text variant="headline" textColor="color-on-container">Headline</Text>
            </h1>
          </section>
          <div>
            <Text variant="title" textColor="color-on-container">Title</Text>
          </div>
          <div>
            <Text variant="subtitle" color="#F00">Subtitle</Text>
          </div>
          <div>
            <Text variant="body" weight='bold'>Body</Text>
          </div>
          <div>
            <Text variant="label">Label</Text>
          </div>
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
              variant="secondary" />
          </div>
        </Col>
        <div className=''>
          <Input
          label='nombre'
          placeholder='escribe tu nombre aqui'
          variant='primary'/>
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
            <span className="sr-only">Toggle theme</span>
          </button>
        </Col>
      </Container>
    </>
  )
}

export default SectionTypography