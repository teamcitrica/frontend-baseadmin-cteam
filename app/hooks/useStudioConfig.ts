"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export interface StudioConfig {
  config_key: string;
  config_value: string;
  description?: string;
}

export const useStudioConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Obtener configuración específica
  const getConfig = async (key: string): Promise<{ success: boolean; value?: string; error?: any }> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('studio_config')
        .select('config_value')
        .eq('config_key', key)
        .single();

      if (error) {
        // Si el error es "no rows" significa que no existe el config, retornar null silenciosamente
        if (error.code === 'PGRST116') {
          return { success: true, value: null };
        }
        console.error(`Error getting config ${key}:`, error);
        return { success: false, error };
      }

      return { success: true, value: data?.config_value };
    } catch (error) {
      console.error(`Error getting config ${key}:`, error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar configuración específica
  const updateConfig = async (key: string, value: string): Promise<{ success: boolean; error?: any }> => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('studio_config')
        .update({ config_value: value })
        .eq('config_key', key);

      if (error) {
        console.error(`Error updating config ${key}:`, error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating config ${key}:`, error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener modo de visualización para usuarios
  const getUserDisplayMode = async (): Promise<{ success: boolean; mode?: '30min' | '1hour'; error?: any }> => {
    const result = await getConfig('user_display_mode');
    if (result.success) {
      return { success: true, mode: result.value as '30min' | '1hour' };
    }
    return { success: false, error: result.error };
  };

  // Actualizar modo de visualización para usuarios
  const updateUserDisplayMode = async (mode: '30min' | '1hour'): Promise<{ success: boolean; error?: any }> => {
    return await updateConfig('user_display_mode', mode);
  };

  // Obtener configuración de selección múltiple de horarios
  const getAllowMultipleTimeSlots = async (): Promise<{ success: boolean; allowed?: boolean; error?: any }> => {
    const result = await getConfig('allow_multiple_time_slots');
    if (result.success) {
      return { success: true, allowed: result.value === 'true' };
    }
    return { success: false, error: result.error };
  };

  // Actualizar configuración de selección múltiple de horarios
  const updateAllowMultipleTimeSlots = async (allowed: boolean): Promise<{ success: boolean; error?: any }> => {
    return await updateConfig('allow_multiple_time_slots', allowed ? 'true' : 'false');
  };

  return {
    isLoading,
    getConfig,
    updateConfig,
    getUserDisplayMode,
    updateUserDisplayMode,
    getAllowMultipleTimeSlots,
    updateAllowMultipleTimeSlots
  };
};