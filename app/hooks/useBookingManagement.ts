"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useStudioConfig } from "./useStudioConfig";

export interface Customer {
  id?: string;
  full_name: string;
  email: string;
  phone_code?: string;
  phone?: string;
}

export interface Booking {
  id?: string;
  customer_id: string | null;
  type_id: number;
  session_type?: string;
  booking_date: string;
  time_slots: string[];
  project_details?: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface HeroUIDate {
  year: number;
  month: number;
  day: number;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phoneCode: string;
  phone: string;
  sessionType: string;
  preferredDate: Date | HeroUIDate | null;
  selectedTimes: string[];
  projectDetails: string;
}

export const useBookingManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getUserDisplayMode } = useStudioConfig();

  // Crear cliente (siempre crea un nuevo registro por cada reserva)
  const createOrGetCustomer = useCallback(async (customerData: Customer): Promise<{ success: boolean; customer?: Customer; error?: any }> => {
    try {
      // Siempre crear un nuevo registro de cliente por cada reserva
      // Esto permite mantener un snapshot de los datos del cliente en el momento de la reserva
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([{
          full_name: customerData.full_name,
          email: customerData.email,
          phone_code: customerData.phone_code,
          phone: customerData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        throw createError;
      }

      return { success: true, customer: newCustomer };

    } catch (error) {
      console.error('Error in createOrGetCustomer:', error);
      return { success: false, error };
    }
  }, []);

  // Verificar disponibilidad de slots antes de reservar
  const verifySlotAvailability = useCallback(async (date: string, timeSlots: string[]) => {
    try {
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
        return {
          success: true,
          allAvailable: false,
          availableSlots: [],
          requestedSlots: timeSlots,
          unavailableReasons: timeSlots.map(slot => `${slot}: Día no activo`)
        };
      }

      // Obtener slots activos de la configuración
      const baseSlots = availabilityConfig.time_slots || [];
      const activeSlots = baseSlots
        .filter((slot: any) => slot.active)
        .map((slot: any) => slot.slot);

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
      const availableTimeSlots = activeSlots.filter(
        (slot: string) => !occupiedSlots.has(slot)
      );

      // Verificar disponibilidad de los slots solicitados
      const allSlotsAvailable = timeSlots.every(slot =>
        availableTimeSlots.includes(slot)
      );

      const unavailableReasons = timeSlots
        .filter(slot => !availableTimeSlots.includes(slot))
        .map(slot => {
          if (!activeSlots.includes(slot)) {
            return `${slot}: No está en la configuración semanal`;
          }
          if (occupiedSlots.has(slot)) {
            return `${slot}: Ya está ocupado o bloqueado`;
          }
          return `${slot}: No disponible`;
        });

      return {
        success: true,
        allAvailable: allSlotsAvailable,
        availableSlots: availableTimeSlots,
        requestedSlots: timeSlots,
        unavailableReasons
      };

    } catch (error) {
      console.error('Error verifying slot availability:', error);
      return { success: false, error };
    }
  }, []);

  // Crear reserva
  const createBooking = useCallback(async (bookingData: BookingFormData): Promise<{ success: boolean; booking?: Booking; error?: any }> => {
    try {
      setIsLoading(true);

      // 1. Crear o obtener cliente
      const customerResult = await createOrGetCustomer({
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone_code: bookingData.phoneCode,
        phone: bookingData.phone
      });

      if (!customerResult.success || !customerResult.customer) {
        throw new Error(`Error creating customer: ${customerResult.error?.message || 'Unknown error'}`);
      }

      // 2. Preparar fecha
      let bookingDateStr = '';
      if (bookingData.preferredDate instanceof Date) {
        const year = bookingData.preferredDate.getFullYear();
        const month = bookingData.preferredDate.getMonth() + 1;
        const day = bookingData.preferredDate.getDate();
        bookingDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (typeof bookingData.preferredDate === 'object' && bookingData.preferredDate && 'year' in bookingData.preferredDate) {
        const heroDate = bookingData.preferredDate as HeroUIDate;
        bookingDateStr = `${heroDate.year}-${String(heroDate.month).padStart(2, '0')}-${String(heroDate.day).padStart(2, '0')}`;
      } else {
        throw new Error('Formato de fecha no válido');
      }

      // 3. Convertir horas completas a slots de 30min si es necesario
      const modeResult = await getUserDisplayMode();
      const displayMode = modeResult.success ? modeResult.mode : '1hour';
      let finalTimeSlots = [...bookingData.selectedTimes];

      if (displayMode === '1hour') {
        finalTimeSlots = [];
        bookingData.selectedTimes.forEach(timeSlot => {
          if (timeSlot.endsWith(':00')) {
            const hour = timeSlot.split(':')[0];
            finalTimeSlots.push(`${hour}:00`);
            finalTimeSlots.push(`${hour}:30`);
          } else {
            finalTimeSlots.push(timeSlot);
          }
        });
      }

      // 4. Verificar disponibilidad
      const verificationResult = await verifySlotAvailability(bookingDateStr, finalTimeSlots);
      if (!verificationResult.success) {
        throw new Error('Error verificando disponibilidad');
      }

      if (!verificationResult.allAvailable) {
        throw new Error('Algunos slots ya no están disponibles');
      }

      // 5. Crear la reserva usando los slots finales (convertidos si es necesario)
      const booking: Omit<Booking, 'id'> = {
        customer_id: customerResult.customer.id!,
        type_id: 1, // 1 = reservation
        session_type: bookingData.sessionType,
        booking_date: bookingDateStr,
        time_slots: finalTimeSlots, // Usar los slots convertidos
        project_details: bookingData.projectDetails,
        status: 'pending'
      };

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (bookingError) throw bookingError;

      return { success: true, booking: newBooking };

    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [createOrGetCustomer, verifySlotAvailability]);

  // Crear bloqueo administrativo
  const createAdminBlock = useCallback(async (date: string, timeSlots: string[], reason: string): Promise<{ success: boolean; booking?: Booking; error?: any }> => {
    try {
      setIsLoading(true);

      const blocking: Omit<Booking, 'id'> = {
        customer_id: null as any, // NULL para bloqueos administrativos
        type_id: 2, // 2 = block
        booking_date: date,
        time_slots: timeSlots,
        reason: reason,
        status: 'confirmed'
      };

      const { data: newBlock, error } = await supabase
        .from('bookings')
        .insert([blocking])
        .select()
        .single();

      if (error) throw error;

      return { success: true, booking: newBlock };

    } catch (error) {
      console.error('Error creating admin block:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancelar reserva
  const cancelBooking = useCallback(async (bookingId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error canceling booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener reservas de un cliente
  const getCustomerBookings = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          booking_type:booking_types(*)
        `)
        .eq('customer.email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, bookings: data };

    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      return { success: false, error };
    }
  }, []);

  return {
    isLoading,
    createOrGetCustomer,
    verifySlotAvailability,
    createBooking,
    createAdminBlock,
    cancelBooking,
    getCustomerBookings
  };
};