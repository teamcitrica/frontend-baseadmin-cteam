"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Input from "@ui/atoms/input";
import Select from "@ui/atoms/select";
import Textarea from "@ui/atoms/textarea";
import Icon from "@ui/atoms/icon";
import { addToast } from "@heroui/toast";
import { Checkbox, Spinner } from "@heroui/react";


import { useQuoteForm } from "@/app/hooks/useQuoteForm";
import { useStudioConfig } from "@/app/hooks/useStudioConfig";

import { PHONE_CODES } from "@/shared/constants/phone-codes";
import CalendarComponent from "./calendar";
import AnimatedContent from "../components/citrica-ui/animated-content";

interface QuoteFormProps {
  className?: string;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ className = "" }) => {
  const {
    formData,
    isSubmitting,
    isLoadingAvailability,
    availableTimesForSelectedDate,
    allowMultipleTimeSlots,
    updateField,
    toggleTimeSelection,
    selectAllTimes,
    submitForm,
    isFormValid
  } = useQuoteForm();

  const { getUserDisplayMode } = useStudioConfig();
  const [displayMode, setDisplayMode] = useState<'30min' | '1hour'>('1hour');
  const [currentStep, setCurrentStep] = useState(1);

  // Cargar modo de visualización al montar el componente
  useEffect(() => {
    const loadDisplayMode = async () => {
      const result = await getUserDisplayMode();
      if (result.success && result.mode) {
        setDisplayMode(result.mode);
      }
    };
    loadDisplayMode();
  }, []);

  const isStep1Valid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.sessionType.trim() !== ""
    );
  };

  const isStep2Valid = () => {
    return formData.preferredDate !== null;
  };

  const isStep3Valid = () => {
    return formData.selectedTimes.length > 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && isStep2Valid()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && isStep3Valid()) {
      setCurrentStep(4);
    } else {
      let message = "Por favor completa los campos requeridos";

      if (currentStep === 1)
        message = "Por favor completa tu nombre, email y tipo de fotografía";
      if (currentStep === 2) message = "Por favor selecciona una fecha";
      if (currentStep === 3) message = "Por favor selecciona un horario";

      addToast({
        title: "Campos requeridos",
        description: message,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContactSubmit = async () => {
    if (!isFormValid()) {
      addToast({
        title: "Error en el formulario",
        description: "Por favor completa los campos obligatorios",
      });

      return;
    }

    const result = await submitForm();

    if (result.success) {
      // Resetear al paso 1 después del envío exitoso
      setCurrentStep(1);

      addToast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
        color: "success",
      });
    } else {
      addToast({
        title: "Error",
        description:
          "Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.",
        color: "danger",
      });
    }
  };

  return (
    <Card className={`p-2 ${className}`} radius="none">
      <h3 className="mb-6">
        <Text color="#964f20" variant="title">
          Solicitar Cotización
        </Text>
      </h3>

      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-2">
            <Input
              required
              label="Nombre completo"
              placeholder="Tu nombre"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />

            <Input
              required
              label="Email"
              placeholder="tu@email.com"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />

            <Select
              required
              label="Tipo de fotografía"
              options={[
                {
                  value: "fotografia-modelo",
                  label: "Fotografía de Modelo",
                },
                {
                  value: "fotografia-producto",
                  label: "Fotografía de Producto",
                },
              ]}
              placeholder="Selecciona el tipo de sesión"
              selectedKeys={
                formData.sessionType ? [formData.sessionType] : []
              }
              onSelectionChange={(keys: any) => {
                const selectedKey = Array.from(keys)[0] as string;
                updateField("sessionType", selectedKey || "");
              }}
            />
          </div>
        )}

        {currentStep === 2 && (
          <AnimatedContent
            direction="vertical"
            distance={50}
            duration={0.6}
            threshold={0}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <Text color="#964f20" variant="subtitle">
                Selecciona la fecha de tu sesión
              </Text>
              <CalendarComponent
                variant="primary"
                className="mx-auto"
                value={formData.preferredDate}
                onChange={(date) => updateField("preferredDate", date)}
              />
            </div>
          </AnimatedContent>
        )}

        {currentStep === 3 && (
          <AnimatedContent
            direction="vertical"
            distance={50}
            duration={0.6}
            threshold={0}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Text
                  className="text-center"
                  color="#964f20"
                  variant="subtitle"
                >
                  {allowMultipleTimeSlots ? 'Selecciona tus horarios' : 'Selecciona tu horario'}
                </Text>
                {availableTimesForSelectedDate.length > 0 && allowMultipleTimeSlots && (
                  <Checkbox
                    isSelected={formData.selectedTimes.length === availableTimesForSelectedDate.length}
                    onValueChange={selectAllTimes}
                    color="default"
                    classNames={{
                      base: "max-w-none",
                      wrapper: "border-[#978C2C] !p-0",
                      icon: "w-full h-full group-data-[selected=true]:!bg-[#978C2C] group-data-[selected=true]:!text-white"
                    }}
                  >
                    Seleccionar todos los horarios
                  </Checkbox>
                )}
              </div>

              {isLoadingAvailability ? (
                <div className="text-center py-8">
                  <Spinner color="default" />
                </div>
              ) : availableTimesForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <Text color="color-on-surface" variant="body">
                    {formData.preferredDate
                      ? "No hay horarios disponibles para esta fecha"
                      : "Selecciona una fecha para ver los horarios disponibles"
                    }
                  </Text>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                  {availableTimesForSelectedDate
                    .sort((a, b) => a.localeCompare(b)) // Ordenar las horas cronológicamente
                    .map((time) => {
                    const isSelected = formData.selectedTimes.includes(time);
                    const [hours, minutes] = time.split(':').map(Number);
                    const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                    // Calcular hora de fin según el modo de visualización
                    const minutesToAdd = displayMode === '1hour' ? 60 : 30;
                    let endHours = hours;
                    let endMinutes = minutes + minutesToAdd;

                    if (endMinutes >= 60) {
                      endHours += Math.floor(endMinutes / 60);
                      endMinutes = endMinutes % 60;
                    }

                    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

                    return (
                      <div
                        key={time}
                        className={`w-full cursor-pointer transition-all duration-200 border-2 rounded-lg p-3 text-center ${
                          isSelected
                            ? 'border-[#978C2C] bg-[#978C2C] text-white'
                            : 'border-[#978C2C] bg-transparent text-[#978C2C] hover:bg-[#978C2C]/10'
                        }`}
                        onClick={() => toggleTimeSelection(time)}
                      >
                        <Text variant="body" color={isSelected ? "white" : "#978C2C"}>
                          {`${startTime} - ${endTime}`}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedContent>
        )}

        {currentStep === 4 && (
          <AnimatedContent
            direction="vertical"
            distance={50}
            duration={0.6}
            threshold={0}
          >
            <div className="space-y-6">
              <div className="flex gap-2">
                <div className="w-1/3">
                  <Select
                    label="Código"
                    options={PHONE_CODES}
                    placeholder="Código"
                    selectedKeys={formData.phoneCode ? [formData.phoneCode] : []}
                    onSelectionChange={(keys: any) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      updateField("phoneCode", selectedKey || "+51");
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Teléfono"
                    placeholder="999 999 999"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              <Textarea
                label="Detalles del proyecto"
                placeholder="Describe tu proyecto, número de productos, estilo deseado, etc."
                rows={4}
                value={formData.projectDetails}
                onChange={(e) =>
                  updateField("projectDetails", e.target.value)
                }
                className="!p-0"
              />
            </div>
          </AnimatedContent>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4">
          {currentStep > 1 && (
            <Button
              label="Anterior"
              startContent={<Icon name="ChevronLeft" size={20} />}
              variant="secondary"
              onClick={handlePrevStep}
            />
          )}

          {currentStep < 4 ? (
            <Button
              disabled={
                (currentStep === 1 && !isStep1Valid()) ||
                (currentStep === 2 && !isStep2Valid()) ||
                (currentStep === 3 && !isStep3Valid())
              }
              endContent={<Icon name="ChevronRight" size={20} />}
              fullWidth={currentStep === 1}
              label="Siguiente"
              variant="primary"
              onClick={handleNextStep}
            />
          ) : (
            <Button
              fullWidth
              disabled={isSubmitting || !isFormValid()}
              label={isSubmitting ? "Enviando..." : "Enviar Solicitud"}
              startContent={<Icon name="Send" size={20} />}
              variant="primary"
              onClick={handleContactSubmit}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuoteForm;