"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface TimeSlot {
  slot: string;
  active: boolean;
}

interface AvailableSlot {
  time_slot: string;
  is_available: boolean;
  covers_slots?: string[];
}

interface AvailabilityContextType {
  // Estado
  isLoading: boolean;
  cachedSlots: Map<string, AvailableSlot[]>;

  // Funciones
  getAvailableSlotsForDate: (date: string, displayMode?: '30min' | '1hour') => Promise<{ success: boolean; slots?: AvailableSlot[]; error?: any }>;
  clearCache: () => void;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

export const AvailabilityProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cachedSlots, setCachedSlots] = useState<Map<string, AvailableSlot[]>>(new Map());

  const clearCache = useCallback(() => {
    setCachedSlots(new Map());
  }, []);

  const getAvailableSlotsForDate = useCallback(async (date: string, displayMode: '30min' | '1hour' = '1hour') => {
    try {
      // Verificar cache
      const cacheKey = `${date}-${displayMode}`;
      if (cachedSlots.has(cacheKey)) {
        return { success: true, slots: cachedSlots.get(cacheKey) };
      }

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
      const activeSlots = baseSlots.filter((slot: TimeSlot) => slot.active);

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
      bookings?.forEach((booking: any) => {
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
      let availableSlots: AvailableSlot[] = activeSlots
        .filter((slot: TimeSlot) => !occupiedSlots.has(slot.slot))
        .map((slot: TimeSlot) => ({
          time_slot: slot.slot,
          is_available: true
        }));

      // Convertir a horas completas si es necesario
      if (displayMode === '1hour') {
        const hourSlots: AvailableSlot[] = [];
        const processedHours = new Set<string>();

        availableSlots.forEach((slot: AvailableSlot) => {
          const hour = slot.time_slot.split(':')[0] + ':00';
          const halfHour = hour.replace(':00', ':30');

          if (!processedHours.has(hour)) {
            const has00 = availableSlots.some((s: AvailableSlot) => s.time_slot === hour);
            const has30 = availableSlots.some((s: AvailableSlot) => s.time_slot === halfHour);

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

      // Guardar en cache
      setCachedSlots(prev => new Map(prev).set(cacheKey, availableSlots));

      return { success: true, slots: availableSlots };
    } catch (error) {
      console.error('Error fetching available slots for date:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [cachedSlots]);

  const value = {
    isLoading,
    cachedSlots,
    getAvailableSlotsForDate,
    clearCache
  };

  return (
    <AvailabilityContext.Provider value={value}>
      {children}
    </AvailabilityContext.Provider>
  );
};

export const useAvailability = () => {
  const context = useContext(AvailabilityContext);
  if (context === undefined) {
    throw new Error('useAvailability must be used within an AvailabilityProvider');
  }
  return context;
};
