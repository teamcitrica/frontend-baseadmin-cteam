"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface TimeSlot {
  slot: string;
  active: boolean;
}

export interface AvailableSlot {
  time_slot: string;
  is_available: boolean;
}

export interface StudioAvailability {
  id: number;
  day_of_week: number;
  is_active: boolean;
  time_slots: TimeSlot[];
}

export const useStudioAvailability = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener disponibilidad semanal del admin
  const getWeeklyAvailability = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .order('day_of_week');

      if (error) throw error;

      return { success: true, availability: data || [] };
    } catch (error) {
      console.error('Error fetching weekly availability:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener disponibilidad para una fecha específica
  const getAvailableSlotsForDate = useCallback(async (date: string, displayMode?: '30min' | '1hour') => {
    try {
      setIsLoading(true);

      const targetDate = new Date(date + 'T00:00:00');
      const dayOfWeek = targetDate.getDay();

      // Obtener la configuración de disponibilidad para este día
      const { data: availabilityConfig, error: configError } = await supabase
        .from('studio_availability')
        .select('is_active, time_slots')
        .eq('day_of_week', dayOfWeek)
        .single();

      if (configError) throw configError;

      if (!availabilityConfig || !availabilityConfig.is_active) {
        return { success: true, slots: [] };
      }

      // Obtener slots activos
      const baseSlots = availabilityConfig.time_slots || [];
      const activeSlots = baseSlots.filter((slot: any) => slot.active);

      if (activeSlots.length === 0) {
        return { success: true, slots: [] };
      }

      // Obtener reservas y bloqueos para esta fecha
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('time_slots, type_id')
        .eq('booking_date', date)
        .neq('status', 'cancelled');

      if (bookingsError) throw bookingsError;

      // Crear set de slots ocupados
      const occupiedSlots = new Set<string>();
      bookings?.forEach(booking => {
        booking.time_slots?.forEach((slot: string) => {
          if (booking.type_id === 2 && booking.time_slots?.includes('00:00')) {
            // Bloqueo de día completo
            for (let hour = 0; hour < 24; hour++) {
              occupiedSlots.add(`${String(hour).padStart(2, '0')}:00`);
              occupiedSlots.add(`${String(hour).padStart(2, '0')}:30`);
            }
          } else {
            occupiedSlots.add(slot);
          }
        });
      });

      // Filtrar slots disponibles
      let availableSlots = activeSlots
        .filter((slot: any) => !occupiedSlots.has(slot.slot))
        .map((slot: any) => ({
          time_slot: slot.slot,
          is_available: true
        }));

      // Convertir a horas completas si es necesario
      if (displayMode === '1hour') {
        const hourSlots: any[] = [];
        const processedHours = new Set<string>();

        availableSlots.forEach((slot: any) => {
          const hour = slot.time_slot.split(':')[0] + ':00';
          const halfHour = hour.replace(':00', ':30');

          if (!processedHours.has(hour)) {
            const has00 = availableSlots.some((s: any) => s.time_slot === hour);
            const has30 = availableSlots.some((s: any) => s.time_slot === halfHour);

            if (has00 && has30) {
              hourSlots.push({
                time_slot: hour,
                is_available: true,
                covers_slots: [hour, halfHour]
              });
            }
            processedHours.add(hour);
          }
        });

        availableSlots = hourSlots;
      }

      return { success: true, slots: availableSlots };
    } catch (error) {
      console.error('Error fetching available slots for date:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener fechas que tienen disponibilidad en un mes
  const getAvailableDatesInMonth = useCallback(async (month: number, year: number) => {
    try {
      setIsLoading(true);

      // Obtener configuración de disponibilidad semanal
      const { data: weeklyConfig, error: configError } = await supabase
        .from('studio_availability')
        .select('day_of_week, is_active, time_slots')
        .eq('is_active', true);

      if (configError) throw configError;

      // Crear mapa de disponibilidad por día de la semana
      const availabilityMap = new Map();
      weeklyConfig?.forEach(config => {
        const hasActiveSlots = config.time_slots?.some((slot: any) => slot.active);
        availabilityMap.set(config.day_of_week, hasActiveSlots);
      });

      // 2. Generar todas las fechas del mes que tienen configuración activa
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const potentialDates: string[] = [];

      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (availabilityMap.get(dayOfWeek)) {
          potentialDates.push(d.toISOString().split('T')[0]);
        }
      }

      if (potentialDates.length === 0) {
        return { success: true, dates: [] };
      }

      // Obtener todas las reservas del mes para filtrar
      const firstDayStr = firstDay.toISOString().split('T')[0];
      const lastDayStr = lastDay.toISOString().split('T')[0];

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_date, time_slots, type_id')
        .gte('booking_date', firstDayStr)
        .lte('booking_date', lastDayStr)
        .neq('status', 'cancelled');

      if (bookingsError) throw bookingsError;

      // Crear mapa de slots ocupados por fecha
      const occupiedSlotsMap = new Map();
      bookings?.forEach(booking => {
        const date = booking.booking_date;
        if (!occupiedSlotsMap.has(date)) {
          occupiedSlotsMap.set(date, new Set());
        }
        booking.time_slots?.forEach((slot: string) => {
          if (booking.type_id === 2 && booking.time_slots?.includes('00:00')) {
            // Bloqueo de día completo
            for (let hour = 0; hour < 24; hour++) {
              occupiedSlotsMap.get(date).add(`${String(hour).padStart(2, '0')}:00`);
              occupiedSlotsMap.get(date).add(`${String(hour).padStart(2, '0')}:30`);
            }
          } else {
            occupiedSlotsMap.get(date).add(slot);
          }
        });
      });

      // Filtrar fechas que tienen al menos un slot disponible
      const availableDates: string[] = [];

      for (const dateStr of potentialDates) {
        const targetDate = new Date(dateStr + 'T00:00:00');
        const dayOfWeek = targetDate.getDay();

        // Obtener configuración de este día
        const dayConfig = weeklyConfig?.find(config => config.day_of_week === dayOfWeek);
        if (!dayConfig) continue;

        const activeSlots = dayConfig.time_slots?.filter((slot: any) => slot.active) || [];
        const occupiedSlots = occupiedSlotsMap.get(dateStr) || new Set();

        // Verificar si hay al menos un slot disponible
        const hasAvailableSlots = activeSlots.some((slot: any) => !occupiedSlots.has(slot.slot));

        if (hasAvailableSlots) {
          availableDates.push(dateStr);
        }
      }

      return { success: true, dates: availableDates };
    } catch (error) {
      console.error('Error fetching available dates in month:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar si una fecha específica tiene disponibilidad
  const isDateAvailable = useCallback(async (date: string) => {
    try {
      const result = await getAvailableSlotsForDate(date);
      const hasAvailableSlots = result.success && (result.slots?.length || 0) > 0;
      return { success: true, isAvailable: hasAvailableSlots };
    } catch (error) {
      console.error('Error checking date availability:', error);
      return { success: false, error };
    }
  }, [getAvailableSlotsForDate]);

  return {
    isLoading,
    getWeeklyAvailability,
    getAvailableSlotsForDate,
    getAvailableDatesInMonth,
    isDateAvailable
  };
};