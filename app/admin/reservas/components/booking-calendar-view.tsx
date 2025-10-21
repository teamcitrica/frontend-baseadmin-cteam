"use client";
import React, { useState, useEffect } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import { Chip } from "@heroui/react";

import { useAdminBookings } from "@/app/hooks/useAdminBookings";
import { formatTimeSlotsWithDuration } from "@/shared/utils/timeSlotHelpers";


const BookingCalendarView = () => {
  const { isLoading, bookings, getAllBookings } = useAdminBookings();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    getAllBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "warning";
      case "confirmed": return "success";
      case "cancelled": return "danger";
      default: return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "confirmed": return "Confirmada";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  // Obtener primer día del mes y configuración del calendario
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generar días del calendario
  const calendarDays = [];

  // Días vacíos al inicio
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Obtener reservas de una fecha específica
  const getBookingsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(booking => booking.booking_date === dateStr);
  };

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Formatear mes y año - capitalizar solo la primera letra
  const monthYear = currentDate.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());

  // Obtener reservas del día seleccionado
  const selectedDateBookings = selectedDate ? bookings.filter(b => b.booking_date === selectedDate) : [];

  return (
    <div className="space-y-2">
      {/* Controles del calendario */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <Text variant="title" color="#964f20">
              {monthYear}
            </Text>
            <p>
              <Text variant="body" color="color-on-surface">
                Vista de calendario de reservas
              </Text>
            </p>
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
              onClick={goToToday}
            >
              Hoy
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="p-2">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center p-2">
                  <Text variant="label" color="color-on-surface">
                    {day}
                  </Text>
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-20" />;
                }

                const dayBookings = getBookingsForDate(day);
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                return (
                  <div
                    key={`day-${dateStr}`}
                    className={`
                      h-20 border rounded-lg p-2 cursor-pointer transition-colors
                      ${isSelected ? 'border-[#964f20] bg-[#964f20]/10' : 'border-gray-200 hover:border-gray-300'}
                      ${isToday ? 'ring-2 ring-[#964f20]/30' : ''}
                    `}
                    onClick={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  >
                    <div className="flex flex-col h-full">
                      <span className={`text-sm ${isToday ? 'font-bold text-[#964f20]' : 'text-gray-700'}`}>
                        {day}
                      </span>

                      <div className="flex-1 flex flex-col gap-1 mt-1">
                        {dayBookings.slice(0, 2).map((booking, i) => (
                          <div
                            key={booking.id}
                            className={`
                              text-xs px-1 py-0.5 rounded-full text-white text-center
                              ${booking.status === 'confirmed' ? 'bg-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}
                            `}
                          >
                            {/* {booking.time_slots[0]} */}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayBookings.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Panel lateral con detalles */}
        <div className="order-1 lg:order-  ">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon name="Info" size={20} className="text-[#964f20]" />
                <Text variant="subtitle" color="#964f20">
                  {selectedDate ? 'Detalles del día' : 'Información'}
                </Text>
              </div>

              {selectedDate ? (
                <div className="space-y-4">
                  <div>
                    <p>
                      <Text variant="body" color="color-on-surface">
                        <strong>Fecha seleccionada:</strong>
                      </Text>
                    </p>
                    <p>
                      <Text variant="body" color="color-on-surface">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </p>
                  </div>

                  <div>
                    <Text variant="body" color="color-on-surface">
                      <strong>Reservas ({selectedDateBookings.length}):</strong>
                    </Text>

                    {selectedDateBookings.length === 0 ? (
                      <Text variant="body" color="color-on-surface" className="text-gray-500">
                        No hay reservas para este día
                      </Text>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {selectedDateBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="p-3 border rounded-lg border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <Text variant="label" color="color-on-surface">
                                {booking.customer ? booking.customer.full_name : 'Bloqueo Administrativo'}
                              </Text>
                              <Chip
                                size="sm"
                                color={getStatusColor(booking.status)}
                                variant="flat"
                              >
                                {getStatusLabel(booking.status)}
                              </Chip>
                            </div>
                            <p>
                              <Text variant="body" color="color-on-surface" className="text-sm">
                                {formatTimeSlotsWithDuration(booking.time_slots)}
                              </Text>
                            </p>
                            <p>
                              <Text variant="body" color="color-on-surface" className="text-sm text-gray-500">
                                {booking.session_type === "fotografia-modelo" ? "Fotografía Modelo" : "Fotografía Producto"}
                              </Text>
                            </p>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Text variant="body" color="color-on-surface">
                    Haz clic en cualquier día del calendario para ver los detalles de las reservas.
                  </Text>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <Text variant="body" color="color-on-surface" className="text-sm">
                        Pendiente
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <Text variant="body" color="color-on-surface" className="text-sm">
                        Confirmada
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <Text variant="body" color="color-on-surface" className="text-sm">
                        Cancelada
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarView;