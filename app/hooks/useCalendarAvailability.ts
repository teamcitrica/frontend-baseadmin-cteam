"use client";
import { useState, useEffect, useCallback } from "react";
import { useStudioAvailability } from "./useStudioAvailability";

export interface CalendarAvailabilityProps {
  onDateChange?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export const useCalendarAvailability = ({ onDateChange, selectedDate }: CalendarAvailabilityProps = {}) => {
  const { getAvailableDatesInMonth, isLoading } = useStudioAvailability();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(selectedDate || null);

  // Función para cargar fechas disponibles del mes actual
  const loadAvailableDates = useCallback(async () => {
    const result = await getAvailableDatesInMonth(currentMonth, currentYear);
    if (result.success) {
      setAvailableDates(result.dates || []);
    }
  }, [currentMonth, currentYear, getAvailableDatesInMonth]);

  // Cargar fechas cuando cambia el mes/año
  useEffect(() => {
    loadAvailableDates();
  }, [loadAvailableDates]);

  // Función para verificar si una fecha está disponible
  const isDateAvailable = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr);
  }, [availableDates]);

  // Función para verificar si una fecha está deshabilitada
  const isDateDisabled = useCallback((date: Date): boolean => {
    // Deshabilitado si:
    // 1. Es una fecha pasada
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return true;
    }

    // 2. No está en la lista de fechas disponibles
    return !isDateAvailable(date);
  }, [isDateAvailable]);

  // Función para obtener el estilo de una fecha
  const getDateClassName = useCallback((date: Date): string => {
    if (isDateDisabled(date)) {
      return "text-gray-300 cursor-not-allowed";
    }

    if (isDateAvailable(date)) {
      return "text-green-600 hover:bg-green-50 cursor-pointer";
    }

    return "text-gray-400 cursor-not-allowed";
  }, [isDateAvailable, isDateDisabled]);

  // Manejar cambio de fecha
  const handleDateChange = useCallback((date: Date | null) => {
    if (date && isDateDisabled(date)) {
      return; // No permitir seleccionar fechas deshabilitadas
    }

    setInternalSelectedDate(date);
    onDateChange?.(date);
  }, [isDateDisabled, onDateChange]);

  // Manejar cambio de mes
  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Obtener información del mes actual
  const getMonthInfo = useCallback(() => {
    const totalAvailable = availableDates.length;
    const monthName = new Date(currentYear, currentMonth).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });

    return {
      monthName,
      totalAvailable,
      isLoading
    };
  }, [availableDates.length, currentMonth, currentYear, isLoading]);

  // Obtener fechas destacadas para el calendario
  const getHighlightedDates = useCallback(() => {
    return availableDates.map(dateStr => new Date(dateStr + 'T00:00:00'));
  }, [availableDates]);

  // Función para navegar al siguiente mes
  const goToNextMonth = useCallback(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    handleMonthChange(nextMonth, nextYear);
  }, [currentMonth, currentYear, handleMonthChange]);

  // Función para navegar al mes anterior
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    handleMonthChange(prevMonth, prevYear);
  }, [currentMonth, currentYear, handleMonthChange]);

  // Función para ir al mes actual
  const goToCurrentMonth = useCallback(() => {
    const now = new Date();
    handleMonthChange(now.getMonth(), now.getFullYear());
  }, [handleMonthChange]);

  return {
    // Estado
    currentMonth,
    currentYear,
    availableDates,
    selectedDate: internalSelectedDate,
    isLoading,

    // Funciones de verificación
    isDateAvailable,
    isDateDisabled,
    getDateClassName,

    // Manejadores
    handleDateChange,
    handleMonthChange,

    // Información
    getMonthInfo,
    getHighlightedDates,

    // Navegación
    goToNextMonth,
    goToPreviousMonth,
    goToCurrentMonth,

    // Utilidades
    loadAvailableDates
  };
};