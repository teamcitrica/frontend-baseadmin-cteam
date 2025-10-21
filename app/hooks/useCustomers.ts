"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  _count?: {
    bookings: number;
  };
}

export interface CustomerStats {
  total_customers: number;
  new_customers_this_month: number;
  customers_with_bookings: number;
  customers_without_bookings: number;
}

export const useCustomers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // ===================================
  // GESTIÓN DE CLIENTES
  // ===================================

  // Obtener todos los clientes con estadísticas de reservas
  const getAllCustomers = async (limit = 50, offset = 0, search?: string) => {
    try {
      setIsLoading(true);

      // Obtener todos los clientes con el conteo de reservas activas
      let query = supabase
        .from('customers')
        .select(`
          *,
          bookings!left(id, status)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search && search.trim() !== '') {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Procesar los datos para incluir el conteo de reservas activas (excluyendo canceladas)
      const processedCustomers = (data || []).map(customer => {
        const activeBookings = (customer.bookings || []).filter(
          (booking: any) => booking.status !== 'cancelled'
        );

        return {
          ...customer,
          _count: {
            bookings: activeBookings.length
          },
          bookings: undefined // Remover el array de bookings del resultado final
        };
      });

      setCustomers(processedCustomers);
      return { success: true, customers: processedCustomers };

    } catch (error) {
      console.error('Error fetching customers:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener estadísticas de clientes
  const getCustomerStats = async (): Promise<{ success: boolean; stats?: CustomerStats; error?: any }> => {
    try {
      setIsLoading(true);

      // Obtener total de clientes
      const { count: totalCustomers, error: totalError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Obtener clientes nuevos este mes
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayStr = firstDayOfMonth.toISOString();

      const { count: newCustomersThisMonth, error: newError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayStr);

      if (newError) throw newError;

      // Obtener clientes con reservas
      const { data: customersWithBookings, error: bookingsError } = await supabase
        .from('customers')
        .select('id, bookings!inner(id)')
        .neq('bookings.status', 'cancelled');

      if (bookingsError) throw bookingsError;

      const uniqueCustomersWithBookings = new Set(
        customersWithBookings?.map(c => c.id) || []
      ).size;

      const stats: CustomerStats = {
        total_customers: totalCustomers || 0,
        new_customers_this_month: newCustomersThisMonth || 0,
        customers_with_bookings: uniqueCustomersWithBookings,
        customers_without_bookings: (totalCustomers || 0) - uniqueCustomersWithBookings
      };

      return { success: true, stats };

    } catch (error) {
      console.error('Error fetching customer stats:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener detalles de un cliente específico con sus reservas
  const getCustomerDetails = async (customerId: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          bookings(
            *,
            booking_type:booking_types(*)
          )
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;

      return { success: true, customer: data };

    } catch (error) {
      console.error('Error fetching customer details:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo cliente
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | '_count'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local optimísticamente
      setCustomers(prev => [data, ...prev]);

      return { success: true, customer: data };

    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error };
    }
  };

  // Actualizar cliente
  const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local optimísticamente
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === customerId ? { ...customer, ...data } : customer
        )
      );

      return { success: true, customer: data };

    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error };
    }
  };

  // Eliminar cliente (solo si no tiene reservas)
  const deleteCustomer = async (customerId: string) => {
    try {
      // Verificar si el cliente tiene reservas
      const { data: bookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', customerId)
        .neq('status', 'cancelled');

      if (checkError) throw checkError;

      if (bookings && bookings.length > 0) {
        return {
          success: false,
          error: 'No se puede eliminar un cliente que tiene reservas activas'
        };
      }

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      // Actualizar estado local optimísticamente
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));

      return { success: true };

    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error };
    }
  };

  return {
    // Estado
    isLoading,
    customers,

    // Métodos
    getAllCustomers,
    getCustomerStats,
    getCustomerDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};