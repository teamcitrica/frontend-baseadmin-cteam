"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Modal from "@ui/molecules/modal";
import Icon from "@ui/atoms/icon";
import { Switch } from "@heroui/react";

import { useAdminBookings, WeeklyAvailability } from "@/app/hooks/useAdminBookings";

const WeeklyScheduleManager = () => {
  const {
    isLoading,
    weeklyAvailability,
    getWeeklyAvailability,
    updateDayAvailability,
    toggleTimeSlot
  } = useAdminBookings();

  const [hasChanges, setHasChanges] = useState(false);
  const [showStandardHoursModal, setShowStandardHoursModal] = useState(false);
  const [showCloseAllModal, setShowCloseAllModal] = useState(false);
  const [isOpeningAll, setIsOpeningAll] = useState(false);

  useEffect(() => {
    getWeeklyAvailability();
  }, []);

  const daysOfWeek = [
    { id: 1, name: "Lunes", short: "L" },
    { id: 2, name: "Martes", short: "M" },
    { id: 3, name: "Miércoles", short: "X" },
    { id: 4, name: "Jueves", short: "J" },
    { id: 5, name: "Viernes", short: "V" },
    { id: 6, name: "Sábado", short: "S" },
    { id: 0, name: "Domingo", short: "D" }
  ];

  // Generar slots de tiempo (cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleDayToggle = async (dayOfWeek: number, isActive: boolean) => {
    // Actualización optimista del estado local primero
    setHasChanges(true);

    // Llamar al hook que ya tiene actualización optimista integrada
    const result = await updateDayAvailability(dayOfWeek, isActive);

    if (!result.success) {
      console.error('Error updating day availability:', result.error);
    }
  };

  const handleTimeSlotToggle = async (dayOfWeek: number, timeSlot: string, isActive: boolean) => {
    const result = await toggleTimeSlot(dayOfWeek, timeSlot, isActive);

    if (result.success) {
      setHasChanges(true);
    } else {
      console.error('Error toggling slot:', result.error);
    }
  };

  const handleBulkTimeUpdate = async (dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) => {
    const dayConfig = weeklyAvailability.find(day => day.day_of_week === dayOfWeek);
    if (!dayConfig) return;

    const startHour = parseInt(startTime.split(':')[0]);
    const startMin = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMin = parseInt(endTime.split(':')[1]);

    const updatedSlots = dayConfig.time_slots.map(slot => {
      const slotHour = parseInt(slot.slot.split(':')[0]);
      const slotMin = parseInt(slot.slot.split(':')[1]);

      const slotTime = slotHour * 60 + slotMin;
      const startTimeMin = startHour * 60 + startMin;
      const endTimeMin = endHour * 60 + endMin;

      if (slotTime >= startTimeMin && slotTime < endTimeMin) {
        return { ...slot, active: isActive };
      }
      return slot;
    });

    await updateDayAvailability(dayOfWeek, dayConfig.is_active, updatedSlots);
    setHasChanges(true);
  };

  const getDayConfig = (dayOfWeek: number): WeeklyAvailability | undefined => {
    return weeklyAvailability.find(day => day.day_of_week === dayOfWeek);
  };

  const getTimeSlotStatus = (dayOfWeek: number, timeSlot: string): boolean => {
    const dayConfig = getDayConfig(dayOfWeek);
    if (!dayConfig) return false;

    const slot = dayConfig.time_slots.find(slot => slot.slot === timeSlot);
    return slot ? slot.active : false;
  };

  const getActiveTimeCount = (dayOfWeek: number): number => {
    const dayConfig = getDayConfig(dayOfWeek);
    if (!dayConfig) return 0;

    return dayConfig.time_slots.filter(slot => slot.active).length;
  };

  const areAllDaysClosed = (): boolean => {
    return weeklyAvailability.every(day => !day.is_active);
  };

  const handleApplyStandardHours = async () => {
    if (weeklyAvailability.length === 0) {
      alert("Error: No se ha cargado la configuración semanal. Recarga la página.");
      return;
    }

    // Horario estándar: 9:00 - 18:00 L-V, 10:00-16:00 S, cerrado D
    const standardHours = {
      1: { start: "09:00", end: "18:00", active: true }, // Lunes
      2: { start: "09:00", end: "18:00", active: true }, // Martes
      3: { start: "09:00", end: "18:00", active: true }, // Miércoles
      4: { start: "09:00", end: "18:00", active: true }, // Jueves
      5: { start: "09:00", end: "18:00", active: true }, // Viernes
      6: { start: "10:00", end: "16:00", active: true }, // Sábado
      0: { start: "00:00", end: "00:00", active: false }, // Domingo
    };

    try {
      for (const [day, config] of Object.entries(standardHours)) {
        const dayNum = parseInt(day);

        // Primero activar el día
        await handleDayToggle(dayNum, config.active);

        // Luego configurar horarios si está activo
        if (config.active && config.start !== "00:00") {
          await handleBulkTimeUpdate(dayNum, config.start, config.end, true);
        }
      }

      alert("✅ Horario estándar aplicado exitosamente");
      setShowStandardHoursModal(false);
    } catch (error) {
      console.error("Error applying standard hours:", error);
      alert("❌ Error al aplicar horario estándar");
    }
  };

  const handleOpenToggleAllModal = () => {
    const shouldOpen = areAllDaysClosed();
    setIsOpeningAll(shouldOpen);
    setShowCloseAllModal(true);
  };

  const handleToggleAllDays = async () => {
    for (const day of daysOfWeek) {
      await handleDayToggle(day.id, isOpeningAll);
    }

    setShowCloseAllModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones rápidas */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p>
            <Text variant="title" color="#964f20">
              Configuración Semanal de Horarios
            </Text>
            </p>
            <Text variant="body" color="color-on-surface">
              Gestiona los horarios disponibles para cada día de la semana. Cada slot representa 30 minutos.
            </Text>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowStandardHoursModal(true)}
            >
              Horario Estándar
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleOpenToggleAllModal}
            >
              {areAllDaysClosed() ? "Abrir Todo" : "Cerrar Todo"}
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Text variant="body" color="color-on-surface">
              Cargando configuración...
            </Text>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {daysOfWeek.map((day) => {
            const dayConfig = getDayConfig(day.id);
            const activeSlots = getActiveTimeCount(day.id);

            return (
              <Card key={day.id} className="p-6">
                <div className="space-y-4">
                  {/* Header del día */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        isSelected={dayConfig?.is_active || false}
                        onValueChange={(isActive) => handleDayToggle(day.id, isActive)}
                        color="primary"
                      />
                      <div>
                        <p>
                        <Text variant="subtitle" color="color-on-surface">
                          {day.name}
                        </Text>
                        </p>
                        <p>
                        <Text variant="body" color="color-on-surface" className="text-sm">
                          {dayConfig?.is_active
                            ? `${activeSlots} slots activos (${Math.round(activeSlots * 0.5)} horas)`
                            : "Día cerrado"
                          }
                        </Text>
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Grid de horarios */}
                  {dayConfig?.is_active && (
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                      {timeSlots.map((timeSlot) => {
                        const isActive = getTimeSlotStatus(day.id, timeSlot);
                        const hour = parseInt(timeSlot.split(':')[0]);
                        const isBusinessHour = hour >= 8 && hour < 20;

                        return (
                          <div
                            key={timeSlot}
                            className={`
                              p-2 text-center text-xs rounded cursor-pointer transition-colors
                              ${isActive
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : isBusinessHour
                                ? 'bg-red-300 hover:bg-red-400 text-white'
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }
                            `}
                            onClick={() => {
                              handleTimeSlotToggle(day.id, timeSlot, !isActive);
                            }}
                            title={`${timeSlot} - ${String(hour + (timeSlot.includes(':30') ? 1 : 0)).padStart(2, '0')}:${timeSlot.includes(':30') ? '00' : '30'}`}
                          >
                            {timeSlot}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <Card className="p-6">
        <div className="space-y-3">
          <Text variant="subtitle" color="#964f20">
            Leyenda
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <Text variant="body" color="color-on-surface" className="text-sm">
                Slot activo (disponible para reservas)
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded"></div>
              <Text variant="body" color="color-on-surface" className="text-sm">
                Slot inactivo (no disponible)
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <Text variant="body" color="color-on-surface" className="text-sm">
                Horario fuera de horario comercial típico
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal Horario Estándar */}
      <Modal
        isOpen={showStandardHoursModal}
        onClose={() => setShowStandardHoursModal(false)}
        size="lg"
        title="Aplicar Horario Estándar"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="primary"
              onClick={handleApplyStandardHours}
              startContent={<Icon name="Check" size={20} />}
            >
              Sí, aplicar horario estándar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowStandardHoursModal(false)}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5" />
            <div>
              <p>
                <Text variant="body" color="#2563eb" className="font-bold">
                  Configuración de Horario Estándar
                </Text>
              </p>
              <p>
                <Text variant="body" color="#1e40af" className="text-sm mt-1">
                  Esta acción configurará los siguientes horarios:
                </Text>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <Text variant="body" color="color-on-surface">Lunes a Viernes:</Text>
              <Text variant="body" color="#964f20" className="font-semibold">9:00 AM - 6:00 PM</Text>
            </div>
            <div className="flex justify-between py-2 border-b">
              <Text variant="body" color="color-on-surface">Sábado:</Text>
              <Text variant="body" color="#964f20" className="font-semibold">10:00 AM - 4:00 PM</Text>
            </div>
            <div className="flex justify-between py-2">
              <Text variant="body" color="color-on-surface">Domingo:</Text>
              <Text variant="body" color="#dc2626" className="font-semibold">Cerrado</Text>
            </div>
          </div>

          <p>
            <Text variant="body" color="#964f20" className="font-semibold">
              ¿Deseas aplicar esta configuración a toda la semana?
            </Text>
          </p>
        </div>
      </Modal>

      {/* Modal Cerrar/Abrir Todo */}
      <Modal
        isOpen={showCloseAllModal}
        onClose={() => setShowCloseAllModal(false)}
        size="lg"
        title={isOpeningAll ? "Abrir Todos los Días" : "Cerrar Todos los Días"}
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant={isOpeningAll ? "primary" : "danger"}
              onClick={handleToggleAllDays}
              startContent={<Icon name={isOpeningAll ? "Check" : "X"} size={20} />}
            >
              {isOpeningAll ? "Sí, abrir todos los días" : "Sí, cerrar todos los días"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCloseAllModal(false)}
            >
              Cancelar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-start gap-2 ${isOpeningAll ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-3`}>
            <Icon name="AlertCircle" size={20} className={`${isOpeningAll ? 'text-green-600' : 'text-orange-600'} mt-0.5`} />
            <div>
              <p>
                <Text variant="body" color={isOpeningAll ? "#16a34a" : "#ea580c"} className="font-bold">
                  {isOpeningAll ? "Abrir Disponibilidad" : "⚠️ Cerrar Disponibilidad"}
                </Text>
              </p>
              <p>
                <Text variant="body" color={isOpeningAll ? "#15803d" : "#c2410c"} className="text-sm mt-1">
                  {isOpeningAll
                    ? "Esta acción activará todos los días de la semana. Podrás configurar los horarios específicos después."
                    : "Esta acción cerrará todos los días de la semana. Los usuarios no podrán realizar reservas hasta que vuelvas a activar al menos un día."
                  }
                </Text>
              </p>
            </div>
          </div>

          <p>
            <Text variant="body" color="#964f20" className="font-semibold">
              {isOpeningAll
                ? "¿Deseas abrir todos los días de la semana?"
                : "¿Confirmas que deseas cerrar todos los días de la semana?"
              }
            </Text>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default WeeklyScheduleManager;