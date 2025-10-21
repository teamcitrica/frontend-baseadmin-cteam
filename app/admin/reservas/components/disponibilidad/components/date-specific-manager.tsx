"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import { Calendar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip } from "@heroui/react";
import { CalendarDate, today, getLocalTimeZone, type DateValue } from "@internationalized/date";

import { useAdminBookings } from "@/app/hooks/useAdminBookings";
import { useStudioAvailability } from "@/app/hooks/useStudioAvailability";
import { supabase } from "@/lib/supabase";

const DateSpecificManager = () => {
  const {
    createBlockedPeriod,
    createSlotBlock,
    deleteBlockedPeriod,
    getBlockedPeriods,
    blockedPeriods
  } = useAdminBookings();

  const { getAvailableSlotsForDate } = useStudioAvailability();

  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);

  // Generar slots de tiempo (cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  useEffect(() => {
    getBlockedPeriods();
  }, []);

  const handleDateSelect = async (date: any) => {
    console.log('handleDateSelect called with:', date);
    setSelectedDate(date);
    setIsLoading(true);
    setIsModalOpen(true);

    // Convertir CalendarDate a string
    const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    console.log('Converted date string:', dateStr);

    try {
      // Obtener configuración semanal para este día
      const targetDate = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = targetDate.getDay();

      // Obtener configuración de disponibilidad para este día de la semana
      const { data: availabilityConfig, error: configError } = await supabase
        .from('studio_availability')
        .select('is_active, time_slots')
        .eq('day_of_week', dayOfWeek)
        .single();

      if (configError) {
        console.error('Error loading availability config:', configError);
      }

      // Crear lista de todos los slots con su estado de disponibilidad semanal
      const weeklyAvailableSlots = new Set<string>();
      if (availabilityConfig?.is_active && availabilityConfig.time_slots) {
        availabilityConfig.time_slots.forEach((slot: any) => {
          if (slot.active) {
            weeklyAvailableSlots.add(slot.slot);
          }
        });
      }

      // Crear array de daySlots para todos los slots de 30 minutos
      const allDaySlots = allTimeSlots.map(timeSlot => ({
        time_slot: timeSlot,
        is_available: weeklyAvailableSlots.has(timeSlot)
      }));

      setDaySlots(allDaySlots);

      // Obtener bloques específicos desde Supabase para este día
      const { data: dayBlocks, error: blocksError } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 2) // Solo bloqueos
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');

      if (blocksError) {
        console.error('Error loading day blocks:', blocksError);
      }

      // Extraer todos los time slots bloqueados
      const blocked: string[] = [];
      dayBlocks?.forEach(block => {
        if (block.time_slots && Array.isArray(block.time_slots)) {
          // Si time_slots es ['00:00'], significa bloqueo completo del día
          if (block.time_slots.includes('00:00') || block.time_slots.length === 0) {
            blocked.push(...allTimeSlots);
          } else {
            // Agregar slots específicos bloqueados
            blocked.push(...block.time_slots);
          }
        }
      });

      setBlockedSlots(Array.from(new Set(blocked))); // Remover duplicados
    } catch (error) {
      console.error('Error loading day slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para recargar datos del día seleccionado
  const refreshDayData = async () => {
    if (!selectedDate) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    try {
      // Obtener configuración semanal para este día
      const targetDate = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = targetDate.getDay();

      // Obtener configuración de disponibilidad para este día de la semana
      const { data: availabilityConfig, error: configError } = await supabase
        .from('studio_availability')
        .select('is_active, time_slots')
        .eq('day_of_week', dayOfWeek)
        .single();

      if (configError) {
        console.error('Error loading availability config:', configError);
      }

      // Crear lista de todos los slots con su estado de disponibilidad semanal
      const weeklyAvailableSlots = new Set<string>();
      if (availabilityConfig?.is_active && availabilityConfig.time_slots) {
        availabilityConfig.time_slots.forEach((slot: any) => {
          if (slot.active) {
            weeklyAvailableSlots.add(slot.slot);
          }
        });
      }

      // Crear array de daySlots para todos los slots de 30 minutos
      const allDaySlots = allTimeSlots.map(timeSlot => ({
        time_slot: timeSlot,
        is_available: weeklyAvailableSlots.has(timeSlot)
      }));

      setDaySlots(allDaySlots);

      // Recargar bloques específicos desde Supabase
      const { data: dayBlocks, error: blocksError } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 2)
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');

      if (!blocksError && dayBlocks) {
        const blocked: string[] = [];
        dayBlocks.forEach(block => {
          if (block.time_slots && Array.isArray(block.time_slots)) {
            if (block.time_slots.includes('00:00') || block.time_slots.length === 0) {
              blocked.push(...allTimeSlots);
            } else {
              blocked.push(...block.time_slots);
            }
          }
        });
        setBlockedSlots(Array.from(new Set(blocked)));
      }
    } catch (error) {
      console.error('Error refreshing day data:', error);
    }
  };

  const toggleSlotBlock = async (timeSlot: string) => {
    if (!selectedDate) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
    const isCurrentlyBlocked = blockedSlots.includes(timeSlot);

    try {
      if (isCurrentlyBlocked) {
        // Desbloquear: encontrar y eliminar el bloqueo específico
        const { data: blocksToRemove, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('type_id', 2)
          .eq('booking_date', dateStr)
          .neq('status', 'cancelled');

        if (error) {
          console.error('Error finding blocks to remove:', error);
          return;
        }

        // Buscar bloques que contengan este timeSlot
        const targetBlocks = blocksToRemove?.filter(block =>
          block.time_slots && (
            block.time_slots.includes(timeSlot) ||
            block.time_slots.includes('00:00') // Bloqueo completo del día
          )
        );

        if (targetBlocks && targetBlocks.length > 0) {
          for (const block of targetBlocks) {
            if (block.time_slots.includes('00:00')) {
              // Si es un bloqueo completo del día, no lo eliminamos por un solo slot
              console.log('No se puede desbloquear un slot de un bloqueo completo del día');
              alert('Este slot forma parte de un bloqueo completo del día. Usa "Desbloquear Todo el Día" para eliminarlo.');
              return;
            } else {
              // Eliminar el bloqueo específico
              await deleteBlockedPeriod(block.id);
            }
          }
        }

        setBlockedSlots(prev => prev.filter(slot => slot !== timeSlot));
        // Refrescar datos del día para actualizar visualmente
        await refreshDayData();
      } else {
        // Bloquear: crear un nuevo bloqueo para este slot específico
        const result = await createSlotBlock(
          dateStr,
          timeSlot,
          `Slot ${timeSlot} bloqueado específicamente`
        );

        if (result.success) {
          setBlockedSlots(prev => [...prev, timeSlot]);
          console.log('✅ Slot bloqueado y estado actualizado:', timeSlot);
          // Refrescar datos del día para actualizar visualmente
          await refreshDayData();
        } else {
          console.error('Error bloqueando slot:', result.error);
          alert('Error al bloquear el horario. Verifica la consola.');
        }
      }

      // Recargar bloques
      await getBlockedPeriods();

    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  const blockEntireDay = async () => {
    if (!selectedDate) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    try {
      await createBlockedPeriod(
        dateStr,
        dateStr,
        'Día completo bloqueado'
      );

      setBlockedSlots([...allTimeSlots]);
      await refreshDayData();
      await getBlockedPeriods();
    } catch (error) {
      console.error('Error blocking entire day:', error);
    }
  };

  const unblockEntireDay = async () => {
    if (!selectedDate) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    try {
      // Encontrar todos los bloqueos para este día directamente desde la BD
      const { data: dayBlocks, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 2)
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error finding day blocks:', error);
        return;
      }

      // Eliminar todos los bloqueos
      if (dayBlocks && dayBlocks.length > 0) {
        for (const block of dayBlocks) {
          await deleteBlockedPeriod(block.id);
        }
      }

      setBlockedSlots([]);
      await refreshDayData();
      await getBlockedPeriods();
    } catch (error) {
      console.error('Error unblocking entire day:', error);
    }
  };

  const formatDateForDisplay = (date: any) => {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    return jsDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayStatus = (date: any) => {
    const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    const hasBlocks = blockedPeriods.some(period =>
      period.start_date === dateStr && period.end_date === dateStr
    );

    if (hasBlocks) {
      return { color: 'danger' as const, text: 'Bloqueado' };
    }

    return { color: 'success' as const, text: 'Disponible' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div>
          <Text variant="title" color="#964f20">
            Gestión por Fechas Específicas
          </Text>
          <Text variant="body" color="color-on-surface">
            Selecciona un día en el calendario para gestionar sus horarios específicos.
            Esto anulará la configuración semanal para ese día.
          </Text>
        </div>
      </Card>

      {/* Calendario */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4">
          <Text variant="subtitle" color="#964f20">
            Calendario de Disponibilidad
          </Text>

          {/* Botón de prueba para verificar el modal */}
          <Button
            variant="secondary"
            onClick={() => {
              const testDate = today(getLocalTimeZone());
              handleDateSelect(testDate);
            }}
          >
            Probar Modal (Hoy)
          </Button>

          <Calendar
            aria-label="Seleccionar fecha para gestionar"
            value={selectedDate as any}
            onChange={(date: any) => {
              console.log('Calendar onChange triggered:', date);
              if (date) {
                setSelectedDate(date);
                handleDateSelect(date);
              }
            }}
            minValue={today(getLocalTimeZone())}
            classNames={{
              base: "max-w-none",
              content: "w-full"
            }}
          />

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <Text variant="body" color="color-on-surface">Disponible (configuración semanal)</Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <Text variant="body" color="color-on-surface">Tiene bloqueos específicos</Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal para gestión de horarios */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div>
              <Text variant="title" color="#964f20">
                Gestionar Horarios
              </Text>
              {selectedDate && (
                <Text variant="body" color="color-on-surface">
                  {formatDateForDisplay(selectedDate)}
                </Text>
              )}
            </div>
          </ModalHeader>

          <ModalBody>
            {isLoading ? (
              <div className="text-center py-8">
                <Text variant="body" color="color-on-surface">
                  Cargando horarios...
                </Text>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Acciones rápidas */}
                <div className="flex gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={blockEntireDay}
                  >
                    Bloquear Todo el Día
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={unblockEntireDay}
                  >
                    Desbloquear Todo el Día
                  </Button>
                </div>

                {/* Grid de horarios */}
                <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                  {allTimeSlots.map((timeSlot) => {
                    const isBlocked = blockedSlots.includes(timeSlot);
                    // Buscar si este slot específico está disponible en la configuración semanal
                    const slotInfo = daySlots.find(slot => slot.time_slot === timeSlot);
                    const isAvailableByDefault = slotInfo?.is_available || false;
                    const hour = parseInt(timeSlot.split(':')[0]);
                    const isBusinessHour = hour >= 8 && hour < 20;

                    return (
                      <Button
                        key={timeSlot}
                        size="sm"
                        variant={
                          isBlocked ? "danger" :
                          isAvailableByDefault ? "success" :
                          "flat"
                        }
                        onClick={() => toggleSlotBlock(timeSlot)}
                        className={`
                          !min-w-0 text-xs transition-all
                          ${!isBusinessHour ? 'opacity-50' : ''}
                          ${isBlocked ? 'bg-red-500 text-white hover:bg-red-600' :
                            isAvailableByDefault ? 'bg-green-500 text-white hover:bg-green-600' :
                            'bg-gray-300 text-gray-700 hover:bg-gray-400'}
                        `}
                      >
                        {timeSlot}
                      </Button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="space-y-2 text-xs">
                  <Text variant="subtitle" color="#964f20">
                    Leyenda
                  </Text>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 hover:bg-green-600 rounded border"></div>
                      <Text variant="body" color="color-on-surface" className="text-xs">
                        Disponible (configuración semanal)
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded border"></div>
                      <Text variant="body" color="color-on-surface" className="text-xs">
                        No disponible (configuración semanal)
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 hover:bg-red-600 rounded border"></div>
                      <Text variant="body" color="color-on-surface" className="text-xs">
                        Bloqueado específicamente
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DateSpecificManager;