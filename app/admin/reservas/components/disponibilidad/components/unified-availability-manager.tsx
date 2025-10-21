"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import { Calendar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { today, getLocalTimeZone } from "@internationalized/date";

import { useAdminBookings } from "@/app/hooks/useAdminBookings";
import { useStudioConfig } from "@/app/hooks/useStudioConfig";

import { supabase } from "@/lib/supabase";
import { Col, Container } from "@/styles/07-objects/objects";
import { useAvailability } from "@/app/api/contexts/AvailabilityContext";

const UnifiedAvailabilityManager = () => {
  const {
    createBlockedPeriod,
    createSlotBlock,
    deleteBlockedPeriod,
    getBlockedPeriods,
    blockedPeriods
  } = useAdminBookings();

  const { getUserDisplayMode, updateUserDisplayMode, getAllowMultipleTimeSlots, updateAllowMultipleTimeSlots } = useStudioConfig();
  const { clearCache } = useAvailability();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedDate, setSelectedDate] = useState<any>(today(getLocalTimeZone()));
  const [isLoading, setIsLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [reservedSlots, setReservedSlots] = useState<string[]>([]);
  const [weeklyActiveSlots, setWeeklyActiveSlots] = useState<string[]>([]);

  // Configuración de horario de oficina
  const [officeStartHour, setOfficeStartHour] = useState(9);
  const [officeEndHour, setOfficeEndHour] = useState(18);

  // Configuración de modo de visualización para usuarios
  const [userDisplayMode, setUserDisplayMode] = useState<'30min' | '1hour'>('1hour');

  // Configuración de selección múltiple de horarios
  const [allowMultipleTimeSlots, setAllowMultipleTimeSlots] = useState(true);

  // Estado para el modal de bloqueo
  const [modalData, setModalData] = useState<{
    timeSlot: string;
    dateStr: string;
    dayName: string;
  } | null>(null);

  // Generar todos los slots de 30 minutos
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

    // Cargar configuración de modo de visualización desde la base de datos
    const loadDisplayMode = async () => {
      const result = await getUserDisplayMode();
      if (result.success && result.mode) {
        setUserDisplayMode(result.mode);
      }
    };

    // Cargar configuración de selección múltiple desde la base de datos
    const loadMultipleTimeSlotsConfig = async () => {
      const result = await getAllowMultipleTimeSlots();
      if (result.success && result.allowed !== undefined) {
        setAllowMultipleTimeSlots(result.allowed);
      }
    };

    loadDisplayMode();
    loadMultipleTimeSlotsConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  useEffect(() => {
    if (selectedDate) {
      handleDateSelect(selectedDate);
    }
  }, [selectedDate]);

  const handleDateSelect = async (date: any) => {
    setIsLoading(true);

    const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;

    try {
      // 1. Obtener configuración semanal para este día
      const targetDate = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = targetDate.getDay();

      const { data: availabilityConfig, error: configError } = await supabase
        .from('studio_availability')
        .select('is_active, time_slots')
        .eq('day_of_week', dayOfWeek)
        .single();

      if (configError) {
        console.error('Error loading availability config:', configError);
      }

      // 2. Obtener configuración semanal para determinar slots base activos
      const weeklyAvailableSlots = new Set<string>();
      if (availabilityConfig?.is_active && availabilityConfig.time_slots) {
        availabilityConfig.time_slots.forEach((slot: any) => {
          if (slot.active) {
            weeklyAvailableSlots.add(slot.slot);
          }
        });
      }

      setWeeklyActiveSlots(Array.from(weeklyAvailableSlots));

      // 3. Obtener reservas para esta fecha
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
      }

      // 4. Separar slots bloqueados y reservados
      const blocked: string[] = [];
      const reserved: string[] = [];

      bookings?.forEach(booking => {
        if (booking.time_slots && Array.isArray(booking.time_slots)) {
          const slots = booking.time_slots;

          if (booking.type_id === 2) {
            // Es un bloqueo administrativo
            if (slots.includes('00:00') || slots.length === 0) {
              blocked.push(...allTimeSlots); // Bloqueo completo del día
            } else {
              blocked.push(...slots); // Bloqueo específico
            }
          } else {
            // Es una reserva normal
            reserved.push(...slots);
          }
        }
      });

      setBlockedSlots(Array.from(new Set(blocked)));
      setReservedSlots(Array.from(new Set(reserved)));

    } catch (error) {
      console.error('Error loading day data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSlotState = async (timeSlot: string) => {
    if (!selectedDate) return;

    const currentState = getSlotState(timeSlot);
    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    try {
      if (currentState === 'blocked') {
        // Desbloquear slot
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

        const targetBlocks = blocksToRemove?.filter(block =>
          block.time_slots && (
            block.time_slots.includes(timeSlot) ||
            block.time_slots.includes('00:00')
          )
        );

        if (targetBlocks && targetBlocks.length > 0) {
          for (const block of targetBlocks) {
            if (block.time_slots.includes('00:00')) {
              alert('Este slot forma parte de un bloqueo completo del día. Usa "Desbloquear Todo el Día" para eliminarlo.');
              return;
            } else {
              await deleteBlockedPeriod(block.id);
            }
          }
        }

        setBlockedSlots(prev => prev.filter(slot => slot !== timeSlot));

        // Si no estaba en configuración semanal, agregarlo
        if (!weeklyActiveSlots.includes(timeSlot)) {
          const newActiveSlots = [...weeklyActiveSlots, timeSlot];
          setWeeklyActiveSlots(newActiveSlots);
          await updateWeeklyConfiguration(newActiveSlots);
        }

      } else if (currentState === 'available') {
        // Abrir modal para elegir tipo de bloqueo
        const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][new Date(dateStr + 'T00:00:00').getDay()];
        setModalData({ timeSlot, dateStr, dayName });
        onOpen();
        return; // No continuar, esperar decisión del modal

      } else if (currentState === 'inactive' || currentState === 'outside_office') {
        // Activar slot inactivo o fuera de horario
        const newActiveSlots = [...weeklyActiveSlots, timeSlot];
        setWeeklyActiveSlots(newActiveSlots);
        await updateWeeklyConfiguration(newActiveSlots);
      }

      await getBlockedPeriods();
    } catch (error) {
      console.error('Error toggling slot state:', error);
    }
  };

  const handleBlockForToday = async () => {
    if (!modalData) return;

    const { timeSlot, dateStr } = modalData;

    try {
      const result = await createSlotBlock(
        dateStr,
        timeSlot,
        `Slot ${timeSlot} bloqueado específicamente para ${dateStr}`
      );

      if (result.success) {
        setBlockedSlots(prev => [...prev, timeSlot]);
        await getBlockedPeriods();
      } else {
        console.error('Error bloqueando slot:', result.error);
        alert('Error al bloquear el horario.');
      }
    } catch (error) {
      console.error('Error en bloqueo temporal:', error);
      alert('Error al bloquear el horario.');
    } finally {
      onClose();
      setModalData(null);
    }
  };

  const handleDeactivatePermanently = async () => {
    if (!modalData) return;

    const { timeSlot } = modalData;

    try {
      const newActiveSlots = weeklyActiveSlots.filter(slot => slot !== timeSlot);
      setWeeklyActiveSlots(newActiveSlots);
      await updateWeeklyConfiguration(newActiveSlots);
      await getBlockedPeriods();
    } catch (error) {
      console.error('Error en desactivación permanente:', error);
      alert('Error al desactivar el horario.');
    } finally {
      onClose();
      setModalData(null);
    }
  };

  const applyOfficeHours = async () => {
    // Filtrar solo slots dentro del horario de oficina
    const officeHourSlots = allTimeSlots.filter(slot => {
      const hour = parseInt(slot.split(':')[0]);
      return hour >= officeStartHour && hour < officeEndHour;
    });

    setWeeklyActiveSlots(officeHourSlots);
    await updateWeeklyConfiguration(officeHourSlots);
  };

  const activateAllSlots = async () => {
    // Activar todos los 48 slots
    setWeeklyActiveSlots([...allTimeSlots]);
    await updateWeeklyConfiguration([...allTimeSlots]);
  };

  const updateWeeklyConfiguration = async (newActiveSlots: string[]) => {
    if (!selectedDate) return;

    const targetDate = new Date(`${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}T00:00:00`);
    const dayOfWeek = targetDate.getDay();

    try {
      // Crear el nuevo array de time_slots con el formato correcto
      const timeSlots = allTimeSlots.map(slot => ({
        slot: slot,
        active: newActiveSlots.includes(slot)
      }));

      // Actualizar la configuración semanal en la base de datos
      const { error } = await supabase
        .from('studio_availability')
        .update({
          time_slots: timeSlots,
          is_active: true
        })
        .eq('day_of_week', dayOfWeek);

      if (error) {
        console.error('Error updating weekly configuration:', error);
        alert('Error al guardar la configuración semanal');
        return false;
      }

      // Limpiar cache de disponibilidad
      clearCache();

      return true;
    } catch (error) {
      console.error('Error updating weekly configuration:', error);
      alert('Error al guardar la configuración semanal');
      return false;
    }
  };

  const updateDisplayModeConfiguration = async (mode: '30min' | '1hour') => {
    try {
      const result = await updateUserDisplayMode(mode);

      if (result.success) {
        setUserDisplayMode(mode);
        return true;
      } else {
        console.error('Error updating display mode:', result.error);
        alert('Error al guardar el modo de visualización');
        return false;
      }
    } catch (error) {
      console.error('Error updating display mode:', error);
      alert('Error al guardar el modo de visualización');
      return false;
    }
  };

  const updateMultipleTimeSlotsConfiguration = async (allowed: boolean) => {
    try {
      const result = await updateAllowMultipleTimeSlots(allowed);

      if (result.success) {
        setAllowMultipleTimeSlots(allowed);
        return true;
      } else {
        console.error('Error updating multiple time slots config:', result.error);
        alert('Error al guardar la configuración de selección múltiple');
        return false;
      }
    } catch (error) {
      console.error('Error updating multiple time slots config:', error);
      alert('Error al guardar la configuración de selección múltiple');
      return false;
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
      await getBlockedPeriods();
    } catch (error) {
      console.error('Error blocking entire day:', error);
    }
  };

  const unblockEntireDay = async () => {
    if (!selectedDate) return;

    const dateStr = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    try {
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

      if (dayBlocks && dayBlocks.length > 0) {
        for (const block of dayBlocks) {
          await deleteBlockedPeriod(block.id);
        }
      }

      setBlockedSlots([]);
      await getBlockedPeriods();
    } catch (error) {
      console.error('Error unblocking entire day:', error);
    }
  };

  const blockEntireMonth = async () => {
    if (!selectedDate) return;

    const monthConfirm = confirm(
      `¿Estás seguro de bloquear TODOS los días del mes ${selectedDate.month}/${selectedDate.year}? Esta acción bloqueará completamente el estudio durante este mes.`
    );

    if (!monthConfirm) return;

    try {
      setIsLoading(true);

      // Obtener primer y último día del mes
      const year = selectedDate.year;
      const month = selectedDate.month;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // Bloquear cada día del mes
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Verificar si ya está bloqueado
        const { data: existingBlocks } = await supabase
          .from('bookings')
          .select('*')
          .eq('type_id', 2)
          .eq('booking_date', dateStr)
          .eq('status', 'confirmed');

        // Si no hay bloqueo completo, crearlo
        const hasFullDayBlock = existingBlocks?.some(block =>
          block.time_slots?.includes('00:00')
        );

        if (!hasFullDayBlock) {
          await createBlockedPeriod(
            dateStr,
            dateStr,
            `Mes ${month}/${year} bloqueado completamente`
          );
        }
      }

      await getBlockedPeriods();

      // Refrescar el día actual
      if (selectedDate) {
        handleDateSelect(selectedDate);
      }

      alert(`✅ Mes ${month}/${year} bloqueado completamente`);
    } catch (error) {
      console.error('Error blocking entire month:', error);
      alert('Error al bloquear el mes. Verifica la consola.');
    } finally {
      setIsLoading(false);
    }
  };

  const unblockEntireMonth = async () => {
    if (!selectedDate) return;

    const monthConfirm = confirm(
      `¿Estás seguro de desbloquear TODOS los bloqueos del mes ${selectedDate.month}/${selectedDate.year}?`
    );

    if (!monthConfirm) return;

    try {
      setIsLoading(true);

      // Obtener primer y último día del mes
      const year = selectedDate.year;
      const month = selectedDate.month;
      const firstDayStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0);
      const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      // Obtener todos los bloqueos del mes
      const { data: monthBlocks, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('type_id', 2)
        .gte('booking_date', firstDayStr)
        .lte('booking_date', lastDayStr)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error finding month blocks:', error);
        return;
      }

      // Eliminar todos los bloqueos
      if (monthBlocks && monthBlocks.length > 0) {
        for (const block of monthBlocks) {
          await deleteBlockedPeriod(block.id);
        }
      }

      await getBlockedPeriods();

      // Refrescar el día actual
      if (selectedDate) {
        handleDateSelect(selectedDate);
      }

      alert(`✅ Mes ${month}/${year} desbloqueado completamente`);
    } catch (error) {
      console.error('Error unblocking entire month:', error);
      alert('Error al desbloquear el mes. Verifica la consola.');
    } finally {
      setIsLoading(false);
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

  const getSlotState = (timeSlot: string) => {
    // Si está reservado, no se puede cambiar
    if (reservedSlots.includes(timeSlot)) return 'reserved';

    // Si está bloqueado, se puede desbloquear
    if (blockedSlots.includes(timeSlot)) return 'blocked';

    // Si está en la configuración semanal, está disponible
    if (weeklyActiveSlots.includes(timeSlot)) return 'available';

    // Verificar si está dentro del horario de oficina
    const hour = parseInt(timeSlot.split(':')[0]);
    const isWithinOfficeHours = hour >= officeStartHour && hour < officeEndHour;

    // Si está fuera del horario de oficina, marcarlo como tal
    if (!isWithinOfficeHours) return 'outside_office';

    // Si no está en configuración semanal pero está en horario de oficina, está inactivo
    return 'inactive';
  };

  const getSlotButtonStyle = (state: string) => {
    switch (state) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600 text-white border-green-600 cursor-pointer';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600 cursor-not-allowed';
      case 'blocked':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-600 cursor-pointer';
      case 'inactive':
        return 'bg-red-300 hover:bg-red-400 text-white border-red-400 cursor-pointer';
      case 'outside_office':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-700 cursor-pointer';
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-gray-700 border-gray-400 cursor-not-allowed';
    }
  };

  return (
    <Container noPadding>
      {/* Header */}
      <Col className="pb-4" cols={{ lg: 12, md: 6, sm: 4 }}>
        <Card className="p-6">
          <div>
            <p>
              <Text variant="title" color="#964f20">
                Gestión Unificada de Disponibilidad
              </Text>
            </p>
            <p>
              <Text variant="body" color="color-on-surface">
                Selecciona un día en el calendario y gestiona su disponibilidad slot por slot.
              </Text>
            </p>
          </div>
        </Card>
      </Col>
      {/* Lado izquierdo: Calendario */}
      <Col cols={{ lg: 6, md: 3, sm: 4 }}>
        <Card className="p-6">
          <div className="space-y-4">
            <p>
              <Text variant="subtitle" color="#964f20">
                Calendario
              </Text>
            </p>
            <div className="w-full flex justify-center">
              <Calendar
                aria-label="Seleccionar fecha para gestionar"
                value={selectedDate as any}
                onChange={(date: any) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                minValue={today(getLocalTimeZone())}
                classNames={{
                  base: "max-w-none",
                  content: "w-full"
                }}
              />
            </div>


            {/* Controles de horario */}
            <div className="space-y-3">
              <div className="flex gap-2 items-center flex-wrap">
                <Text variant="body" color="#964f20" className="font-semibold">
                  Horario de Oficina:
                </Text>
                <select
                  value={officeStartHour}
                  onChange={(e) => setOfficeStartHour(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
                <Text variant="body" color="color-on-surface">-</Text>
                <select
                  value={officeEndHour}
                  onChange={(e) => setOfficeEndHour(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="flat" onClick={applyOfficeHours}>
                  🕘 Aplicar Horario de Oficina
                </Button>
                <Button size="sm" variant="flat" onClick={activateAllSlots}>
                  🌐 Activar Todos los Slots
                </Button>
              </div>

              {/* Configuración de modo de visualización para usuarios */}
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Text variant="body" color="#1e40af" className="font-semibold">
                  🎛️ Configuración del Formulario Público:
                </Text>
                <div className="flex gap-2 items-center flex-wrap">
                  <Text variant="body" color="color-on-surface" className="text-sm">
                    Los usuarios verán:
                  </Text>
                  <Button
                    size="sm"
                    variant={userDisplayMode === '30min' ? 'primary' : 'flat'}
                    onClick={() => updateDisplayModeConfiguration('30min')}
                  >
                    Slots de 30min
                  </Button>
                  <Button
                    size="sm"
                    variant={userDisplayMode === '1hour' ? 'primary' : 'flat'}
                    onClick={() => updateDisplayModeConfiguration('1hour')}
                  >
                    Horas completas
                  </Button>
                </div>
                <Text variant="body" color="color-on-surface" className="text-xs">
                  {userDisplayMode === '1hour'
                    ? '👥 Usuarios ven: 10:00, 11:00, 12:00 (cada hora reserva 2 slots de 30min)'
                    : '👥 Usuarios ven: 10:00, 10:30, 11:00, 11:30 (control granular)'
                  }
                </Text>

                {/* Configuración de selección múltiple */}
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Text variant="body" color="color-on-surface" className="text-sm">
                      Permitir selección:
                    </Text>
                    <Button
                      size="sm"
                      variant={allowMultipleTimeSlots ? 'primary' : 'flat'}
                      onClick={() => updateMultipleTimeSlotsConfiguration(true)}
                    >
                      Múltiples horarios
                    </Button>
                    <Button
                      size="sm"
                      variant={!allowMultipleTimeSlots ? 'primary' : 'flat'}
                      onClick={() => updateMultipleTimeSlotsConfiguration(false)}
                    >
                      Un solo horario
                    </Button>
                  </div>
                  <Text variant="body" color="color-on-surface" className="text-xs mt-1">
                    {allowMultipleTimeSlots
                      ? '✅ Los usuarios pueden reservar múltiples horarios en una misma cita'
                      : '⚠️ Los usuarios solo pueden seleccionar UN horario por cita'
                    }
                  </Text>
                </div>
              </div>
            </div>

            <div className="flex gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Text variant="body" color="color-on-surface">Disponible</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <Text variant="body" color="color-on-surface">Reservado</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <Text variant="body" color="color-on-surface">Bloqueado</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                <Text variant="body" color="color-on-surface">Inactivo</Text>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <Text variant="body" color="color-on-surface">Fuera de horario</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
      <Col cols={{ lg: 6, md: 3, sm: 4 }}>
        {/* Lado derecho: Gestión de slots */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text variant="subtitle" color="#964f20">
                Horarios - {selectedDate && formatDateForDisplay(selectedDate)}
              </Text>
            </div>

            {/* Acciones rápidas */}
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={blockEntireDay}
                  disabled={isLoading}
                >
                  Bloquear Todo el Día
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={unblockEntireDay}
                  disabled={isLoading}
                >
                  Desbloquear Todo el Día
                </Button>
              </div>

              {/* <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={blockEntireMonth}
                  disabled={isLoading}
                  className="bg-red-700 hover:bg-red-800"
                >
                  🗓️ Bloquear Mes Completo
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={unblockEntireMonth}
                  disabled={isLoading}
                  className="bg-green-700 hover:bg-green-800"
                >
                  🗓️ Desbloquear Mes Completo
                </Button>
              </div> */}
            </div>

            {/* Grid de slots */}
            {isLoading ? (
              <div className="text-center py-8">
                <Text variant="body" color="color-on-surface">
                  Cargando horarios...
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                {allTimeSlots.map((timeSlot) => {
                  const state = getSlotState(timeSlot);
                  const isClickable = state !== 'reserved';

                  return (
                    <button
                      key={timeSlot}
                      onClick={() => isClickable ? toggleSlotState(timeSlot) : null}
                      disabled={!isClickable}
                      className={`
                        p-2 text-xs rounded border transition-all
                        ${getSlotButtonStyle(state)}
                      `}
                      title={
                        state === 'available' ? 'Click: OK=Bloquear hoy | Cancelar=Desactivar permanentemente' :
                          state === 'blocked' ? 'Click para desbloquear' :
                            state === 'inactive' ? 'Click para activar permanentemente' :
                              state === 'outside_office' ? 'Click para activar (fuera de horario)' :
                                'Reservado - no modificable'
                      }
                    >
                      {timeSlot}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t text-center">
              <div>
                <Text variant="body" color="color-on-surface" className="font-semibold">
                  {allTimeSlots.filter(slot => getSlotState(slot) === 'available').length}
                </Text>
                <Text variant="label" color="color-on-surface" className="text-xs">
                  Disponibles
                </Text>
              </div>
              <div>
                <Text variant="body" color="color-on-surface" className="font-semibold">
                  {reservedSlots.length}
                </Text>
                <Text variant="label" color="color-on-surface" className="text-xs">
                  Reservados
                </Text>
              </div>
              <div>
                <Text variant="body" color="color-on-surface" className="font-semibold">
                  {blockedSlots.length}
                </Text>
                <Text variant="label" color="color-on-surface" className="text-xs">
                  Bloqueados
                </Text>
              </div>
              <div>
                <Text variant="body" color="color-on-surface" className="font-semibold">
                  {allTimeSlots.filter(slot => ['inactive', 'outside_office'].includes(getSlotState(slot))).length}
                </Text>
                <Text variant="label" color="color-on-surface" className="text-xs">
                  Inactivos
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>

      {/* Modal de confirmación para bloqueo */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            <Text variant="subtitle" color="#964f20">
              ¿Desea Bloquear la hora {modalData?.timeSlot}?
            </Text>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <button
                onClick={handleBlockForToday}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer text-left"
              >
                <p>
                  <Text variant="body" color="color-on-surface" className="font-semibold mb-2">
                    📅 Bloquear solo para hoy
                  </Text>
                </p>
                <p>
                  <Text variant="body" color="color-on-surface" className="text-sm">
                    El slot {modalData?.timeSlot} se bloqueará únicamente para el día {modalData?.dateStr}.
                    Los demás {modalData?.dayName}s seguirán teniendo este horario disponible.
                  </Text>
                </p>
              </button>

              {/* <button
                onClick={handleDeactivatePermanently}
                className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer text-left"
              >
                <p>
                  <Text variant="body" color="color-on-surface" className="font-semibold mb-2">
                    🔒 Desactivar permanentemente
                  </Text>
                </p>
                <p>
                  <Text variant="body" color="color-on-surface" className="text-sm">
                    El slot {modalData?.timeSlot} se desactivará de la configuración semanal.
                    Ya no estará disponible para ningún {modalData?.dayName} hasta que lo reactives.
                  </Text>
                </p>
              </button> */}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onClose}
              size="sm"
              fullWidth
            >
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UnifiedAvailabilityManager;