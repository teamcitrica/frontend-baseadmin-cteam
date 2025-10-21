/**
 * Helpers para manejo de slots de tiempo
 */

/**
 * Convierte un array de slots de 30min a un rango de tiempo legible
 * @param slots - Array de slots en formato "HH:MM"
 * @returns String en formato "HH:MM - HH:MM" o múltiples rangos si hay gaps
 */
export const formatTimeRange = (slots: string[]): string => {
  if (!slots || slots.length === 0) return '';

  if (slots.length === 1) return slots[0];

  // Ordenar slots
  const sortedSlots = [...slots].sort((a, b) => {
    const [hourA, minA] = a.split(':').map(Number);
    const [hourB, minB] = b.split(':').map(Number);
    return (hourA * 60 + minA) - (hourB * 60 + minB);
  });

  // Agrupar slots consecutivos
  const ranges: string[][] = [];
  let currentRange: string[] = [sortedSlots[0]];

  for (let i = 1; i < sortedSlots.length; i++) {
    const [prevHour, prevMin] = sortedSlots[i - 1].split(':').map(Number);
    const [currHour, currMin] = sortedSlots[i].split(':').map(Number);

    const prevMinutes = prevHour * 60 + prevMin;
    const currMinutes = currHour * 60 + currMin;

    // Si son consecutivos (diferencia de 30 min), agregar al rango actual
    if (currMinutes - prevMinutes === 30) {
      currentRange.push(sortedSlots[i]);
    } else {
      // Si no son consecutivos, guardar el rango actual e iniciar uno nuevo
      ranges.push(currentRange);
      currentRange = [sortedSlots[i]];
    }
  }

  // Agregar el último rango
  ranges.push(currentRange);

  // Formatear cada rango: mostrar solo inicio y fin sin guiones
  const formattedRanges = ranges.map(range => {
    const startTime = range[0];

    // Calcular hora de fin (último slot + 30 minutos)
    const lastSlot = range[range.length - 1];
    const [lastHour, lastMin] = lastSlot.split(':').map(Number);

    let endHour = lastHour;
    let endMin = lastMin + 30;

    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }

    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    return `${startTime} ${endTime}`;
  });

  // Unir los rangos con espacios
  return formattedRanges.join(' ');
};

/**
 * Calcula la duración total en horas de un conjunto de slots
 * @param slots - Array de slots en formato "HH:MM"
 * @returns Duración en horas (ejemplo: "2.5 hrs")
 */
export const calculateDuration = (slots: string[]): string => {
  if (!slots || slots.length === 0) return '0 hrs';

  const totalSlots = slots.length;
  const hours = totalSlots * 0.5; // Cada slot es 30 minutos = 0.5 horas

  if (hours === 1) return '1 hr';

  return `${hours} hrs`;
};

/**
 * Obtiene el rango de tiempo y duración en un solo objeto
 * @param slots - Array de slots en formato "HH:MM"
 * @returns Objeto con timeRange y duration
 */
export const getTimeRangeInfo = (slots: string[]): { timeRange: string; duration: string } => {
  return {
    timeRange: formatTimeRange(slots),
    duration: calculateDuration(slots)
  };
};

/**
 * Formatea slots mostrando rangos separados para reservas no consecutivas con duración
 * @param slots - Array de slots en formato "HH:MM"
 * @returns String en formato "HH:MM - HH:MM, HH:MM - HH:MM (X minutos)" para múltiples rangos
 */
export const formatTimeSlotsWithDuration = (slots: string[]): string => {
  if (!slots || slots.length === 0) return '';

  // Ordenar slots
  const sortedSlots = [...slots].sort((a, b) => {
    const [hourA, minA] = a.split(':').map(Number);
    const [hourB, minB] = b.split(':').map(Number);
    return (hourA * 60 + minA) - (hourB * 60 + minB);
  });

  // Agrupar slots consecutivos
  const ranges: string[][] = [];
  let currentRange: string[] = [sortedSlots[0]];

  for (let i = 1; i < sortedSlots.length; i++) {
    const [prevHour, prevMin] = sortedSlots[i - 1].split(':').map(Number);
    const [currHour, currMin] = sortedSlots[i].split(':').map(Number);

    const prevMinutes = prevHour * 60 + prevMin;
    const currMinutes = currHour * 60 + currMin;

    // Si son consecutivos (diferencia de 30 min), agregar al rango actual
    if (currMinutes - prevMinutes === 30) {
      currentRange.push(sortedSlots[i]);
    } else {
      // Si no son consecutivos, guardar el rango actual e iniciar uno nuevo
      ranges.push(currentRange);
      currentRange = [sortedSlots[i]];
    }
  }

  // Agregar el último rango
  ranges.push(currentRange);

  // Formatear cada rango con su inicio y fin
  const formattedRanges = ranges.map(range => {
    const startTime = range[0];

    // Calcular hora de fin (último slot + 30 minutos)
    const lastSlot = range[range.length - 1];
    const [lastHour, lastMin] = lastSlot.split(':').map(Number);

    let endHour = lastHour;
    let endMin = lastMin + 30;

    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }

    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    return `${startTime} - ${endTime}`;
  });

  // Calcular duración total en minutos
  const totalMinutes = slots.length * 30;

  // Unir los rangos con comas y agregar duración total al final
  return `${formattedRanges.join(', ')} (${totalMinutes} min)`;
};
