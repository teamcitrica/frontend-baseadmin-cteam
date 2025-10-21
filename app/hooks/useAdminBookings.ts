"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface AdminBooking {
  id: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  type_id: number;
  session_type?: string;
  booking_date: string;
  time_slots: string[];
  project_details?: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  booking_type?: {
    name: string;
    description: string;
    color: string;
  };
}

export interface WeeklyAvailability {
  day_of_week: number;
  is_active: boolean;
  time_slots: Array<{
    slot: string;
    active: boolean;
  }>;
}

export interface BlockedPeriod {
  id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  is_active: boolean;
}

export interface BookingStats {
  total_days: number;
  days_with_bookings: number;
  total_bookings: number;
  total_revenue: number;
}

export const useAdminBookings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability[]>([]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);

  // ===================================
  // GESTIÓN DE RESERVAS
  // ===================================

  // Obtener todas las reservas con paginación
  const getAllBookings = async (status?: string, limit = 50, offset = 0) => {
    try {
      setIsLoading(true);

      console.log('📋 Fetching bookings with status:', status);

      let query = supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          booking_type:booking_types(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Bookings fetched successfully:', data?.length || 0, 'records');
      setBookings(data || []);
      return { success: true, bookings: data || [] };

    } catch (error: any) {
      console.error('❌ Error fetching bookings:', {
        message: error?.message || 'Unknown error',
        name: error?.name,
        stack: error?.stack,
        fullError: error
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar estado de una reserva
  const updateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      console.log('updateBookingStatus called with:', { bookingId, newStatus });

      // Si se está cancelando, obtener los detalles para liberar slots
      if (newStatus === 'cancelled') {
        const { data: booking, error: fetchError } = await supabase
          .from('bookings')
          .select('booking_date, time_slots')
          .eq('id', bookingId)
          .single();

        if (fetchError) throw fetchError;

        // Actualizar estado de la reserva
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', bookingId);

        if (updateError) throw updateError;
        console.log('Booking cancelled successfully');

        // Los slots se liberan automáticamente cuando se cancela la reserva
        // ya que la función get_available_slots considera solo reservas no canceladas

      } else {
        // Solo actualizar estado
        const { error } = await supabase
          .from('bookings')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', bookingId);

        if (error) throw error;
        console.log('Booking status updated successfully to:', newStatus);
      }

      // Actualizar el estado local optimísticamente
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
            : booking
        )
      );

      console.log('Status update completed successfully');
      return { success: true };

    } catch (error) {
      console.error('Error updating booking status:', error);
      return { success: false, error };
    }
  };

  // Eliminar reserva (solo para admin)
  const deleteBooking = async (bookingId: string) => {
    try {
      // Eliminar físicamente
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Actualizar el estado local optimísticamente
      setBookings(prevBookings =>
        prevBookings.filter(booking => booking.id !== bookingId)
      );

      return { success: true };

    } catch (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error };
    }
  };

  // ===================================
  // GESTIÓN DE DISPONIBILIDAD SEMANAL
  // ===================================

  // Obtener configuración semanal
  const getWeeklyAvailability = async () => {
    try {
      setIsLoading(true);

      // Forzar bypass de caché añadiendo timestamp
      const { data, error } = await supabase
        .from('studio_availability')
        .select('*')
        .order('day_of_week');

      if (error) throw error;


      setWeeklyAvailability(data || []);
      return { success: true, availability: data || [] };

    } catch (error) {
      console.error('Error fetching weekly availability:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar disponibilidad de un día
  const updateDayAvailability = async (dayOfWeek: number, isActive: boolean, timeSlots?: Array<{ slot: string; active: boolean }>) => {
    try {
      // 1. Actualización optimista del estado local
      setWeeklyAvailability(prev =>
        prev.map(day =>
          day.day_of_week === dayOfWeek
            ? { ...day, is_active: isActive, ...(timeSlots && { time_slots: timeSlots }) }
            : day
        )
      );

      // 2. Actualizar en la base de datos
      const updateData: any = { is_active: isActive };

      if (timeSlots) {
        updateData.time_slots = timeSlots;
      }

      const { error } = await supabase
        .from('studio_availability')
        .update(updateData)
        .eq('day_of_week', dayOfWeek);

      if (error) {
        // Revertir cambio optimista en caso de error
        await getWeeklyAvailability();
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('Error updating day availability:', error);
      return { success: false, error };
    }
  };

  // Activar/desactivar horario específico de un día
  const toggleTimeSlot = async (dayOfWeek: number, timeSlot: string, isActive: boolean) => {
    try {
      console.log('toggleTimeSlot called:', { dayOfWeek, timeSlot, isActive });

      // Usar el estado local actual
      const currentDayConfig = weeklyAvailability.find(day => day.day_of_week === dayOfWeek);
      if (!currentDayConfig) {
        throw new Error(`Day configuration not found for day ${dayOfWeek}`);
      }

      console.log('Current day config found:', currentDayConfig);

      // Verificar si el slot existe
      const existingSlot = currentDayConfig.time_slots.find((slot: any) => slot.slot === timeSlot);
      console.log('Existing slot found:', existingSlot);

      // Si el slot no existe, lo agregamos a la configuración
      let updatedSlots: Array<{ slot: string; active: boolean }>;
      if (!existingSlot) {
        console.log('Slot does not exist, adding it');
        updatedSlots = [...currentDayConfig.time_slots, { slot: timeSlot, active: isActive }];
      } else {
        // Crear los slots actualizados
        updatedSlots = currentDayConfig.time_slots.map((slot: any) =>
          slot.slot === timeSlot ? { ...slot, active: isActive } : slot
        );
      }

      console.log('Updated slots:', updatedSlots.filter(s => s.slot === timeSlot));

      // 1. PRIMERO actualizar la UI inmediatamente (optimistic update)
      setWeeklyAvailability(prev =>
        prev.map(day =>
          day.day_of_week === dayOfWeek
            ? { ...day, time_slots: updatedSlots }
            : day
        )
      );

      // 2. LUEGO guardar en BD en background
      const { data: updateResult, error } = await supabase
        .from('studio_availability')
        .update({ time_slots: updatedSlots })
        .eq('day_of_week', dayOfWeek)
        .select();

      if (error) {
        // Si falla, revertir el cambio optimista
        setWeeklyAvailability(prev =>
          prev.map(day =>
            day.day_of_week === dayOfWeek
              ? { ...day, time_slots: currentDayConfig.time_slots }
              : day
          )
        );
        console.error('Error updating time slot:', error);
        throw error;
      }

      if (!updateResult || updateResult.length === 0) {
        // Si no se actualizó, revertir el cambio optimista
        setWeeklyAvailability(prev =>
          prev.map(day =>
            day.day_of_week === dayOfWeek
              ? { ...day, time_slots: currentDayConfig.time_slots }
              : day
          )
        );
        throw new Error(`No row found for day_of_week: ${dayOfWeek}`);
      }

      // Los cambios se reflejan automáticamente en las próximas consultas

      return { success: true };

    } catch (error) {
      console.error('Error toggling time slot:', error);
      return { success: false, error };
    }
  };

  // ===================================
  // GESTIÓN DE PERÍODOS BLOQUEADOS
  // ===================================

  // Obtener períodos bloqueados (ahora usando bookings con type_id = 2)
  const getBlockedPeriods = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          booking_type:booking_types(*)
        `)
        .eq('type_id', 2) // type_id = 2 es para bloqueos
        .neq('status', 'cancelled')
        .order('booking_date');

      if (error) throw error;

      const periods = data?.map(booking => ({
        id: booking.id,
        start_date: booking.booking_date,
        end_date: booking.booking_date, // Para períodos de un día
        reason: booking.project_details || '', // Usar project_details en lugar de reason
        is_active: booking.status !== 'cancelled'
      })) || [];

      setBlockedPeriods(periods);
      return { success: true, periods };

    } catch (error) {
      console.error('Error fetching blocked periods:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Crear bloqueo específico por slot
  const createSlotBlock = async (date: string, timeSlot: string, reason?: string) => {
    try {
      const blocking = {
        customer_id: null,
        type_id: 2, // 2 = block
        session_type: 'admin-block',
        booking_date: date,
        time_slots: [timeSlot],
        project_details: reason || `Slot ${timeSlot} bloqueado`,
        status: 'confirmed'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert([blocking])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Slot bloqueado exitosamente:', data);
      return { success: true, booking: data };

    } catch (error) {
      console.error('Error creating slot block:', error);
      return { success: false, error };
    }
  };

  // Crear período bloqueado (ahora usando bookings)
  const createBlockedPeriod = async (startDate: string, endDate: string, reason?: string) => {
    try {
      setIsLoading(true);

      // Para simplicidad, crear un bloqueo por día en el rango
      const start = new Date(startDate);
      const end = new Date(endDate);
      const bookings = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        bookings.push({
          customer_id: null,
          type_id: 2, // 2 = block
          session_type: 'admin-block', // Requerido según tu esquema
          booking_date: d.toISOString().split('T')[0],
          time_slots: ['00:00'], // Bloqueo completo del día
          project_details: reason || 'Bloqueo administrativo',
          status: 'confirmed'
        });
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookings)
        .select();

      if (error) throw error;

      // Recargar períodos bloqueados
      await getBlockedPeriods();

      return { success: true, periods: data };

    } catch (error) {
      console.error('Error creating blocked period:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar período bloqueado (cancelar booking)
  const deleteBlockedPeriod = async (periodId: string) => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', periodId);

      if (error) throw error;

      // Recargar períodos bloqueados
      await getBlockedPeriods();

      return { success: true };

    } catch (error) {
      console.error('Error deleting blocked period:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================
  // ESTADÍSTICAS
  // ===================================

  // Obtener estadísticas de un mes (calculadas directamente)
  const getMonthStats = async (month: number, year: number): Promise<{ success: boolean; stats?: BookingStats; error?: any }> => {
    try {
      setIsLoading(true);

      // Calcular primer y último día del mes
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const totalDays = lastDay.getDate();

      const firstDayStr = firstDay.toISOString().split('T')[0];
      const lastDayStr = lastDay.toISOString().split('T')[0];

      // Obtener todas las reservas del mes (solo type_id = 1, que son reservas, no bloqueos)
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, booking_date')
        .eq('type_id', 1) // Solo reservas, no bloqueos
        .neq('status', 'cancelled')
        .gte('booking_date', firstDayStr)
        .lte('booking_date', lastDayStr);

      if (error) throw error;

      // Calcular estadísticas
      const totalBookings = bookings?.length || 0;
      const uniqueDates = Array.from(new Set(bookings?.map(b => b.booking_date) || []));
      const daysWithBookings = uniqueDates.length;

      const stats: BookingStats = {
        total_days: totalDays,
        days_with_bookings: daysWithBookings,
        total_bookings: totalBookings,
        total_revenue: 0 // Placeholder para revenue futuro
      };

      return { success: true, stats };

    } catch (error) {
      console.error('Error fetching month stats:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar configuración preset a la semana
  const applyWeeklyPreset = async (presetConfig: any) => {
    try {
      setIsLoading(true);

      // Mapear configuraciones del preset a días de la semana
      if (presetConfig.weekdays) {
        // Lunes a Viernes (1-5)
        const slots = presetConfig.weekdays.active && presetConfig.weekdays.start && presetConfig.weekdays.end
          ? generateTimeSlotsForRange(presetConfig.weekdays.start, presetConfig.weekdays.end)
          : [];

        for (let day = 1; day <= 5; day++) {
          await updateDayAvailability(day, presetConfig.weekdays.active, slots);
        }
      }

      if (presetConfig.saturday) {
        // Sábado (6)
        const slots = presetConfig.saturday.active && presetConfig.saturday.start && presetConfig.saturday.end
          ? generateTimeSlotsForRange(presetConfig.saturday.start, presetConfig.saturday.end)
          : [];
        await updateDayAvailability(6, presetConfig.saturday.active, slots);
      }

      if (presetConfig.sunday) {
        // Domingo (0)
        const slots = presetConfig.sunday.active && presetConfig.sunday.start && presetConfig.sunday.end
          ? generateTimeSlotsForRange(presetConfig.sunday.start, presetConfig.sunday.end)
          : [];
        await updateDayAvailability(0, presetConfig.sunday.active, slots);
      }

      if (presetConfig.everyday) {
        // Todos los días
        for (let day = 0; day <= 6; day++) {
          await updateDayAvailability(day, presetConfig.everyday.active, generateTimeSlotsForRange(presetConfig.everyday.start, presetConfig.everyday.end));
        }
      }

      if (presetConfig.weekend) {
        // Viernes a Domingo (5, 6, 0)
        const weekendDays = [5, 6, 0];
        for (const day of weekendDays) {
          await updateDayAvailability(day, presetConfig.weekend.active, generateTimeSlotsForRange(presetConfig.weekend.start, presetConfig.weekend.end));
        }
        // Desactivar días de semana si se especifica
        if (presetConfig.weekdays && !presetConfig.weekdays.active) {
          for (let day = 1; day <= 4; day++) {
            await updateDayAvailability(day, false, []);
          }
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Error applying weekly preset:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Generar slots de tiempo para un rango
  const generateTimeSlotsForRange = (startTime: string, endTime: string) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    for (let time = new Date(start); time < end; time.setMinutes(time.getMinutes() + 60)) {
      const timeStr = time.toTimeString().slice(0, 5);
      slots.push({ slot: timeStr, active: true });
    }

    return slots;
  };

  // Activar/Desactivar período por lotes
  const togglePeriodBatch = async (startDate: string, endDate: string, action: 'activate' | 'deactivate') => {
    try {
      setIsLoading(true);

      if (action === 'activate') {
        // Activar: eliminar bloqueos existentes en ese rango
        const { data: existingBlocks, error: fetchError } = await supabase
          .from('bookings')
          .select('id')
          .eq('type_id', 2)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate)
          .neq('status', 'cancelled');

        if (fetchError) throw fetchError;

        if (existingBlocks && existingBlocks.length > 0) {
          const blockIds = existingBlocks.map(block => block.id);
          const { error: cancelError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .in('id', blockIds);

          if (cancelError) throw cancelError;
        }

      } else {
        // Desactivar: crear bloqueos para el período
        await createBlockedPeriod(startDate, endDate, 'Bloqueo masivo por administrador');
      }

      return { success: true };

    } catch (error) {
      console.error('Error toggling period batch:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Función de emergencia: cerrar todo
  const emergencyCloseAll = async () => {
    try {
      setIsLoading(true);

      // Desactivar todos los días de la semana
      for (let day = 0; day <= 6; day++) {
        await updateDayAvailability(day, false, []);
      }

      return { success: true };

    } catch (error) {
      console.error('Error in emergency close all:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado
    isLoading,
    bookings,
    weeklyAvailability,
    blockedPeriods,

    // Gestión de reservas
    getAllBookings,
    updateBookingStatus,
    deleteBooking,

    // Gestión de disponibilidad
    getWeeklyAvailability,
    updateDayAvailability,
    toggleTimeSlot,

    // Períodos bloqueados
    getBlockedPeriods,
    createBlockedPeriod,
    createSlotBlock,
    deleteBlockedPeriod,

    // Estadísticas
    getMonthStats,

    // Configuración rápida
    applyWeeklyPreset,
    togglePeriodBatch,
    emergencyCloseAll,
  };
};