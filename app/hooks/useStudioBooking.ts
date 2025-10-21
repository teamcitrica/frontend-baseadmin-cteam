// ⚠️ LEGACY HOOK - YA NO SE USA
// Este hook usa la estructura antigua con studio_slots
// Usar useStudioAvailability y useBookingManagement en su lugar

"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface TimeSlot {
  slot: string;
  active: boolean;
}

export interface AvailableSlot {
  date: string;
  time_slot: string;
  is_available: boolean;
  is_active: boolean;
}

export interface Customer {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id?: string;
  customer_id: string;
  session_type: string;
  booking_date: string;
  time_slots: string[];
  project_details?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  sessionType: string;
  preferredDate: Date | null;
  selectedTimes: string[];
  projectDetails: string;
}

export const useStudioBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Generar slots para un rango de fechas
  const generateSlotsForDateRange = async (startDate: Date, endDate: Date) => {
    try {
      console.log('Generating slots for range:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

      const { data, error } = await supabase.rpc('generate_slots_for_range', {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      console.log('Slots generated:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error generating slots:', error);
      return { success: false, error };
    }
  };

  // Obtener fechas disponibles para el calendario
  const getAvailableDates = async (month: number, year: number) => {
    try {
      setIsLoading(true);

      // Primero generar slots para el mes solicitado
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      console.log('Getting available dates for:', { month: month + 1, year, firstDay, lastDay });

      const generateResult = await generateSlotsForDateRange(firstDay, lastDay);
      console.log('Generate slots result:', generateResult);

      // Luego obtener las fechas que tienen al menos un slot disponible
      const { data, error } = await supabase
        .from('studio_slots')
        .select('date')
        .eq('is_available', true)
        .eq('is_active', true)
        .gte('date', firstDay.toISOString().split('T')[0])
        .lte('date', lastDay.toISOString().split('T')[0]);

      if (error) throw error;

      console.log('Available slots found:', data);

      const uniqueDates = Array.from(new Set(data.map(slot => slot.date)));
      console.log('Unique available dates:', uniqueDates);

      setAvailableDates(uniqueDates);

      return { success: true, dates: uniqueDates };
    } catch (error) {
      console.error('Error fetching available dates:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener slots disponibles para una fecha específica
  const getAvailableSlotsForDate = async (date: string) => {
    try {
      setIsLoading(true);

      console.log('🔍 Consultando slots para fecha:', date);

      // Primero verificar si ya existen slots para esta fecha
      const { data: existingSlots, error: checkError } = await supabase
        .from('studio_slots')
        .select('*')
        .eq('date', date)
        .limit(1);

      if (checkError) throw checkError;

      // Solo generar si NO existen slots para esta fecha
      if (!existingSlots || existingSlots.length === 0) {
        console.log('📅 No existen slots para esta fecha, generando...');
        const targetDate = new Date(date);
        await generateSlotsForDateRange(targetDate, targetDate);
      } else {
        console.log('✅ Slots ya existen para esta fecha, usando los existentes');
      }

      // Obtener TODOS los slots para esta fecha (debug)
      const { data: allSlots, error: allSlotsError } = await supabase
        .from('studio_slots')
        .select('*')
        .eq('date', date)
        .order('time_slot');

      if (allSlotsError) throw allSlotsError;

      console.log(`📊 TODOS los slots para ${date}:`, allSlots?.length || 0);
      console.log('   Activos:', allSlots?.filter(s => s.is_active).length || 0);
      console.log('   Disponibles:', allSlots?.filter(s => s.is_available).length || 0);
      console.log('   Activos Y Disponibles:', allSlots?.filter(s => s.is_active && s.is_available).length || 0);

      // Obtener slots disponibles y activos
      const { data, error } = await supabase
        .from('studio_slots')
        .select('*')
        .eq('date', date)
        .eq('is_available', true)
        .eq('is_active', true)
        .order('time_slot');

      if (error) throw error;

      console.log(`🎯 Encontrados ${data?.length || 0} slots disponibles para ${date}:`,
                  data?.map(s => s.time_slot.substring(0, 5)));

      setAvailableSlots(data || []);
      return { success: true, slots: data || [] };
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Crear cliente (siempre crea un nuevo registro por cada reserva)
  const createOrGetCustomer = async (customerData: Customer): Promise<{ success: boolean; customer?: Customer; error?: any }> => {
    try {
      // Siempre crear un nuevo registro de cliente por cada reserva
      // Esto permite mantener un snapshot de los datos del cliente en el momento de la reserva
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (createError) throw createError;
      return { success: true, customer: newCustomer };

    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error };
    }
  };

  // Crear reserva
  const createBooking = async (bookingData: BookingFormData): Promise<{ success: boolean; booking?: Booking; error?: any }> => {
    try {
      setIsLoading(true);

      // 1. Crear o obtener cliente
      const customerResult = await createOrGetCustomer({
        full_name: bookingData.fullName,
        email: bookingData.email,
        phone: bookingData.phone
      });

      if (!customerResult.success || !customerResult.customer) {
        throw new Error('Error creating customer');
      }

      // 2. Verificar que los slots siguen disponibles
      let bookingDateStr = '';

      // Manejar diferentes tipos de objetos de fecha
      if (bookingData.preferredDate instanceof Date) {
        bookingDateStr = bookingData.preferredDate.toISOString().split('T')[0];
      } else if (typeof bookingData.preferredDate === 'object' && bookingData.preferredDate && 'year' in bookingData.preferredDate) {
        const heroDate = bookingData.preferredDate as any;
        bookingDateStr = `${heroDate.year}-${String(heroDate.month).padStart(2, '0')}-${String(heroDate.day).padStart(2, '0')}`;
      } else {
        throw new Error('Formato de fecha no válido');
      }
      const { data: slotsCheck, error: slotsError } = await supabase
        .from('studio_slots')
        .select('*')
        .eq('date', bookingDateStr)
        .in('time_slot', bookingData.selectedTimes)
        .eq('is_available', true)
        .eq('is_active', true);

      if (slotsError) throw slotsError;

      if (slotsCheck.length !== bookingData.selectedTimes.length) {
        throw new Error('Algunos slots ya no están disponibles');
      }

      // 3. Crear la reserva
      const booking: Omit<Booking, 'id'> = {
        customer_id: customerResult.customer.id!,
        session_type: bookingData.sessionType,
        booking_date: bookingDateStr!,
        time_slots: bookingData.selectedTimes,
        project_details: bookingData.projectDetails,
        status: 'pending'
      };

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 4. Marcar slots como no disponibles
      const { error: updateError } = await supabase
        .from('studio_slots')
        .update({ is_available: false })
        .eq('date', bookingDateStr)
        .in('time_slot', bookingData.selectedTimes);

      if (updateError) {
        // Si falla la actualización de slots, eliminar la reserva
        await supabase.from('bookings').delete().eq('id', newBooking.id);
        throw updateError;
      }

      return { success: true, booking: newBooking };

    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar reserva (liberar slots)
  const cancelBooking = async (bookingId: string): Promise<{ success: boolean; error?: any }> => {
    try {
      setIsLoading(true);

      // 1. Obtener detalles de la reserva
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // 2. Marcar reserva como cancelada
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateBookingError) throw updateBookingError;

      // 3. Liberar slots
      const { error: freeSlotsError } = await supabase
        .from('studio_slots')
        .update({ is_available: true })
        .eq('date', booking.booking_date)
        .in('time_slot', booking.time_slots);

      if (freeSlotsError) throw freeSlotsError;

      return { success: true };

    } catch (error) {
      console.error('Error canceling booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener reservas de un cliente
  const getCustomerBookings = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('customer.email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, bookings: data };

    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      return { success: false, error };
    }
  };

  return {
    isLoading,
    availableDates,
    availableSlots,
    getAvailableDates,
    getAvailableSlotsForDate,
    createBooking,
    cancelBooking,
    getCustomerBookings,
    generateSlotsForDateRange
  };
};