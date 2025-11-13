'use client';
import React, { useState } from 'react';
import { Input, Textarea, Select, Button, Card, Text, Icon } from '@citrica-ui';
import { Container, Col } from '@/styles/07-objects/objects';

const FormComponentsExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
    category: '',
  });

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const countryOptions = [
    { value: 'pe', label: 'Perú' },
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'ar', label: 'Argentina' },
    { value: 'cl', label: 'Chile' },
    { value: 'br', label: 'Brasil' },
  ];

  const categoryOptions = [
    { value: 'medicina', label: 'Medicina', description: 'Ciencias de la salud' },
    { value: 'gastronomia', label: 'Gastronomía', description: 'Artes culinarias' },
    { value: 'historia', label: 'Historia', description: 'Ciencias históricas' },
    { value: 'arqueologia', label: 'Arqueología', description: 'Ciencias arqueológicas' },
    { value: 'ingenieria', label: 'Ingeniería', description: 'Ciencias exactas' },
  ];

  return (
    <Container className='flex justify-center'>
      <Card className='p-8'>
        <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className="mb-4">
          <h3>
            <Text variant="title" textColor="color-on-surface" className="mb-6">
              Ejemplo de Componentes de Formulario
            </Text>
          </h3>
          <p>
            <Text variant="body" textColor="color-black" className="mt-2">
              Demostración de los componentes Input, Textarea y Select del Citrica UI System
            </Text>
          </p>
        </Col>

        <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Input básico */}
          <Input
            label="Nombre completo"
            placeholder="Ingresa tu nombre"
            value={formData.name}
            onValueChange={handleInputChange('name')}
            startIcon="User"
            fullWidth
            required
            className="!p-0"
          />

          {/* Input con validación de email */}
          <Input
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            type="email"
            value={formData.email}
            onValueChange={handleInputChange('email')}
            startIcon="Mail"
            required
            fullWidth
            className="!p-0"
          />
        </Col>

        <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className="flex flex-col lg:flex-row gap-4 sm:mb-4">
          {/* Input de teléfono */}
          <Input
            label="Teléfono"
            placeholder="+51 999 999 999"
            type="tel"
            value={formData.phone}
            onValueChange={handleInputChange('phone')}
            startIcon="Phone"
            description="Incluye el código de país"
            fullWidth
            className="!p-0"
          />

          {/* Select simple */}
          <Select
            label="País de origen"
            placeholder="Selecciona tu país"
            options={countryOptions}
            onSelectionChange={(keys: any) => {
              const value = Array.from(keys)[0] as string;
              handleInputChange('country')(value);
            }}
            startIcon="Globe"
            required
            fullWidth
            className="!p-0"
          />
        </Col>

        <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className="flex flex-col lg:flex-row gap-4 sm:mb-4">
          {/* Select con descripciones */}
          <Select
            label="Categoría de interés"
            placeholder="Selecciona una categoría"
            options={categoryOptions}
            onSelectionChange={(keys: any) => {
              const value = Array.from(keys)[0] as string;
              handleInputChange('category')(value);
            }}
            startIcon="BookOpen"
            description="Elige el área de estudio que más te interese"
            fullWidth
            className="!p-0 mb-4"
          />

          {/* Textarea */}
          <Textarea
            label="Mensaje adicional"
            placeholder="Cuéntanos más sobre tus intereses..."
            value={formData.message}
            onValueChange={handleInputChange('message')}
            rows={4}
            maxLength={500}
            description={`${formData.message.length}/500 caracteres`}
            fullWidth
            className="!p-0"
          />
        </Col>

        <Col cols={{ lg: 12, md: 6, sm: 4 }} noPadding className=" flex justify-end item-end flex-col mt-4">
          {/* Botón de envío */}
          <div className="text-center pt-4">
            <Button
              label="Enviar formulario"
              variant="primary"
              textVariant="body"
              startContent={<Icon name="Check" size={24} />}
              onClick={() => {
                console.log('Datos del formulario:', formData);
                alert('Formulario enviado! Revisa la consola para ver los datos.');
              }}
            />
          </div>
        </Col>

        {/* Vista previa de datos */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <Text variant="subtitle" textColor="color-black" className="mb-4">
              Vista previa de los datos:
            </Text>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </Card>
      </Card>
    </Container>
  );
};

export default FormComponentsExample;