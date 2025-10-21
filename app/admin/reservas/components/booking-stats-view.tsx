"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import { Progress } from "@heroui/react";

import { useAdminBookings, BookingStats } from "@/app/hooks/useAdminBookings";

const BookingStatsView = () => {
  const { isLoading, getMonthStats } = useAdminBookings();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<BookingStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [currentDate]);

  const loadStats = async () => {
    const result = await getMonthStats(currentDate.getMonth(), currentDate.getFullYear());
    if (result.success && result.stats) {
      setStats(result.stats);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  // Calcular porcentajes con los nuevos campos
  const reservationPercentage = stats && stats.total_days > 0
    ? Math.round((stats.days_with_bookings / stats.total_days) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Text variant="title" color="#964f20" className="capitalize">
              Estadísticas - {monthYear}
            </Text>
            <Text variant="body" color="color-on-surface">
              Métricas de reservas del estudio
            </Text>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={goToPreviousMonth}
              startContent={<Icon name="ChevronLeft" size={16} />}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={goToCurrentMonth}
            >
              Actual
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={goToNextMonth}
              endContent={<Icon name="ChevronRight" size={16} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      {isLoading ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Text variant="body" color="color-on-surface">
              Cargando estadísticas...
            </Text>
          </div>
        </Card>
      ) : !stats ? (
        <Card className="p-6">
          <div className="text-center py-8">
            <Icon name="AlertCircle" size={48} className="mx-auto text-gray-400 mb-4" />
            <Text variant="title" color="color-on-surface" className="mb-2">
              No se pudieron cargar las estadísticas
            </Text>
            <Text variant="body" color="color-on-surface">
              Intenta recargar la página o seleccionar otro mes
            </Text>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Días del mes */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={24} className="text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <Text variant="title" color="color-on-surface" className="text-2xl font-bold">
                  {stats.total_days}
                </Text>
                <Text variant="subtitle" color="color-on-surface">
                  Días del Mes
                </Text>
                <Text variant="body" color="color-on-surface" className="text-sm">
                  Total de días en {monthYear}
                </Text>
              </div>
            </div>
          </Card>

          {/* Días con reservas */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <Text variant="title" color="color-on-surface" className="text-2xl font-bold">
                  {stats.days_with_bookings}
                </Text>
                <Text variant="subtitle" color="color-on-surface">
                  Días con Reservas
                </Text>
                <Text variant="body" color="color-on-surface" className="text-sm">
                  {reservationPercentage}% de días ocupados
                </Text>
                <div className="mt-2">
                  <Progress
                    value={reservationPercentage}
                    color="success"
                    className="max-w-md"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Total reservas */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={24} className="text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <Text variant="title" color="color-on-surface" className="text-2xl font-bold">
                  {stats.total_bookings}
                </Text>
                <Text variant="subtitle" color="color-on-surface">
                  Total Reservas
                </Text>
                <Text variant="body" color="color-on-surface" className="text-sm">
                  Reservas confirmadas en el mes
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Summary Card */}
      {stats && (
        <Card className="p-6">
          <Text variant="subtitle" color="#964f20" className="mb-4">
            Resumen del Mes
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text variant="body" color="color-on-surface" className="text-sm">
                • Días con actividad: {stats.days_with_bookings} de {stats.total_days} días
              </Text>
              <Text variant="body" color="color-on-surface" className="text-sm">
                • Promedio de reservas por día activo: {stats.days_with_bookings > 0 ? Math.round(stats.total_bookings / stats.days_with_bookings * 10) / 10 : 0}
              </Text>
              <Text variant="body" color="color-on-surface" className="text-sm">
                • Días libres: {stats.total_days - stats.days_with_bookings} días
              </Text>
            </div>
            <div>
              <Text variant="body" color="color-on-surface" className="text-sm">
                • Nivel de ocupación: {reservationPercentage}%
              </Text>
              <Text variant="body" color="color-on-surface" className="text-sm">
                • Total de sesiones: {stats.total_bookings}
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookingStatsView;