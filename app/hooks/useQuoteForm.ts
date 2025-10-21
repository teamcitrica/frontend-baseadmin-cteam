"use client";
import { useState } from "react";
import { useBookingManagement } from "./useBookingManagement";
import { useStudioConfig } from "./useStudioConfig";
import { useAvailability } from "../api/contexts/AvailabilityContext";

export interface QuoteFormData {
  fullName: string;
  email: string;
  phoneCode: string;
  phone: string;
  sessionType: "fotografia-modelo" | "fotografia-producto" | "";
  preferredDate: any; // Para el calendario de HeroUI
  selectedTimes: string[];
  projectDetails: string;
}

interface HeroUIDate {
  year: number;
  month: number;
  day: number;
}

export const useQuoteForm = () => {
  const { getAvailableSlotsForDate, isLoading: availabilityLoading } = useAvailability();
  const { createBooking, isLoading: bookingLoading } = useBookingManagement();
  const { getUserDisplayMode, getAllowMultipleTimeSlots } = useStudioConfig();

  const [formData, setFormData] = useState<QuoteFormData>({
    fullName: "",
    email: "",
    phoneCode: "+51",
    phone: "",
    sessionType: "",
    preferredDate: null,
    selectedTimes: [],
    projectDetails: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimesForSelectedDate, setAvailableTimesForSelectedDate] = useState<string[]>([]);
  const [allowMultipleTimeSlots, setAllowMultipleTimeSlots] = useState(true);

  const updateField = async (field: keyof QuoteFormData, value: string | string[] | Date | HeroUIDate) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Cuando se selecciona una fecha, cargar los horarios disponibles
    if (field === 'preferredDate' && value) {
      let dateStr = '';

      // Manejar diferentes tipos de objetos de fecha
      if (value instanceof Date) {
        const year = value.getFullYear();
        const month = value.getMonth() + 1;
        const day = value.getDate();
        dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (typeof value === 'object' && value && 'year' in value && 'month' in value && 'day' in value) {
        const heroDate = value as HeroUIDate;
        dateStr = `${heroDate.year}-${String(heroDate.month).padStart(2, '0')}-${String(heroDate.day).padStart(2, '0')}`;
      } else {
        console.error('Tipo de fecha no reconocido:', value);
        return;
      }

      // Obtener modo de visualización configurado por el admin
      const modeResult = await getUserDisplayMode();
      const displayMode = modeResult.success ? modeResult.mode : '1hour';

      // Obtener configuración de selección múltiple
      const multipleResult = await getAllowMultipleTimeSlots();
      const allowMultiple = multipleResult.success ? multipleResult.allowed : true;
      setAllowMultipleTimeSlots(allowMultiple ?? true);

      const result = await getAvailableSlotsForDate(dateStr, displayMode);

      if (result.success) {
        const availableTimes = result.slots
          ?.filter((slot: any) => slot.is_available)
          ?.map((slot: any) => slot.time_slot) || [];
        setAvailableTimesForSelectedDate(availableTimes);

        // Limpiar selecciones previas que ya no están disponibles
        setFormData(prev => ({
          ...prev,
          selectedTimes: prev.selectedTimes.filter(time => availableTimes.includes(time))
        }));
      } else {
        console.error('Error obteniendo slots:', result.error);
        setAvailableTimesForSelectedDate([]);
      }
    }
  };

  const toggleTimeSelection = (time: string) => {
    setFormData((prev) => {
      // Si NO se permite selección múltiple (solo una hora)
      if (!allowMultipleTimeSlots) {
        // Si la hora clickeada ya está seleccionada, deseleccionarla
        if (prev.selectedTimes.includes(time)) {
          return {
            ...prev,
            selectedTimes: []
          };
        }
        // Si no, reemplazar la selección actual con la nueva hora
        return {
          ...prev,
          selectedTimes: [time]
        };
      }

      // Si SÍ se permite selección múltiple (comportamiento original)
      return {
        ...prev,
        selectedTimes: prev.selectedTimes.includes(time)
          ? prev.selectedTimes.filter(t => t !== time)
          : [...prev.selectedTimes, time]
      };
    });
  };

  const selectAllTimes = () => {
    setFormData((prev) => ({
      ...prev,
      selectedTimes: prev.selectedTimes.length === availableTimesForSelectedDate.length
        ? []
        : [...availableTimesForSelectedDate]
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phoneCode: "+51",
      phone: "",
      sessionType: "",
      preferredDate: null,
      selectedTimes: [],
      projectDetails: "",
    });
    setAvailableTimesForSelectedDate([]);
  };

  const submitForm = async () => {
    setIsSubmitting(true);

    try {
      // Validar que todos los campos requeridos estén completos
      if (!isFormValid() || !formData.preferredDate || formData.selectedTimes.length === 0) {
        throw new Error("Por favor completa todos los campos requeridos");
      }

      // Crear la reserva en Supabase
      const result = await createBooking({
        fullName: formData.fullName,
        email: formData.email,
        phoneCode: formData.phoneCode,
        phone: formData.phone,
        sessionType: formData.sessionType,
        preferredDate: formData.preferredDate,
        selectedTimes: formData.selectedTimes,
        projectDetails: formData.projectDetails
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error al crear la reserva");
      }

      resetForm();

      return { success: true, booking: result.booking };
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.email.includes("@")
    );
  };

  return {
    formData,
    isSubmitting: isSubmitting || availabilityLoading || bookingLoading,
    isLoadingAvailability: availabilityLoading,
    availableTimesForSelectedDate,
    allowMultipleTimeSlots,
    updateField,
    toggleTimeSelection,
    selectAllTimes,
    resetForm,
    submitForm,
    isFormValid,
  };
};
