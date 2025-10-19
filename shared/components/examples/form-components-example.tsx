'use client';
import React, { useState } from 'react';
import { Input, Textarea, Select, Button, Card, Text } from '@citrica-ui';

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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <div className="p-8">
          <div className="text-center mb-8">
            <Text variant="headline" textColor="color-black">
              Ejemplo de Componentes de Formulario
            </Text>
            <Text variant="body" textColor="color-black" className="mt-2">
              Demostración de los componentes Input, Textarea y Select del Citrica UI System
            </Text>
          </div>

          <div className="space-y-6">
            {/* Input básico */}
            <Input
              label="Nombre completo"
              placeholder="Ingresa tu nombre"
              value={formData.name}
              onValueChange={handleInputChange('name')}
              startIcon="User"
              required
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
            />

            {/* Input de teléfono */}
            <Input
              label="Teléfono"
              placeholder="+51 999 999 999"
              type="tel"
              value={formData.phone}
              onValueChange={handleInputChange('phone')}
              startIcon="Phone"
              description="Incluye el código de país"
            />

            {/* Select simple */}
            <Select
              label="País de origen"
              placeholder="Selecciona tu país"
              options={countryOptions}
              onSelectionChange={(keys:any) => {
                const value = Array.from(keys)[0] as string;
                handleInputChange('country')(value);
              }}
              startIcon="Globe"
              required
            />

            {/* Select con descripciones */}
            <Select
              label="Categoría de interés"
              placeholder="Selecciona una categoría"
              options={categoryOptions}
              onSelectionChange={(keys:any) => {
                const value = Array.from(keys)[0] as string;
                handleInputChange('category')(value);
              }}
              startIcon="BookOpen"
              description="Elige el área de estudio que más te interese"
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
            />

            {/* Botón de envío */}
            <div className="text-center pt-4">
              <Button
                label="Enviar formulario"
                variant="primary"
                textVariant="body"
                startContent={
                  <span>✓</span>
                }
                onClick={() => {
                  console.log('Datos del formulario:', formData);
                  alert('Formulario enviado! Revisa la consola para ver los datos.');
                }}
              />
            </div>
          </div>

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
        </div>
      </Card>
    </div>
  );
};

export default FormComponentsExample;