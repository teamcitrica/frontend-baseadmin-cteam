"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Col } from "@citrica/objects";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import Modal from "@ui/molecules/modal";
import { Badge, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Select, SelectItem } from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useAdminBookings, AdminBooking } from "@/app/hooks/useAdminBookings";
import BookingCalendarView from "./components/booking-calendar-view";
import BookingStatsView from "./components/booking-stats-view";
import BookingAvailabilityView from "./components/booking-availability-view";
import { formatTimeSlotsWithDuration } from "@/shared/utils/timeSlotHelpers";

// Componente interno que usa useSearchParams
const ReservasContent = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("page") || "lista";

  const {
    isLoading,
    bookings,
    getAllBookings,
    updateBookingStatus,
    deleteBooking
  } = useAdminBookings();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    getAllBookings(statusFilter === "all" ? undefined : statusFilter);
  }, [statusFilter]);

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

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    console.log('handleStatusChange called with:', { bookingId, newStatus });
    const result = await updateBookingStatus(bookingId, newStatus);
    console.log('updateBookingStatus result:', result);
    // Ya no necesitamos recargar porque el hook actualiza el estado local optimísticamente
  };

  const formatDate = (dateString: string) => {
    // Evitar problemas de zona horaria agregando tiempo específico
    // en lugar de dejar que JavaScript interprete como UTC
    return new Date(dateString + 'T12:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeSlots = (timeSlots: string[]) => {
    if (!timeSlots || timeSlots.length === 0) return "";
    return formatTimeSlotsWithDuration(timeSlots);
  };

  const handleOpenDetails = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setShowDeleteConfirm(false);
    setShowCancelConfirm(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowDeleteConfirm(false);
    setShowCancelConfirm(false);
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const handleCloseAllModals = () => {
    setShowDeleteConfirm(false);
    setShowCancelConfirm(false);
    setShowConfirmModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !showCancelConfirm) return;

    await handleStatusChange(selectedBooking.id, "cancelled");
    addToast({
      title: "Reserva cancelada",
      description: "La reserva ha sido cancelada exitosamente",
      color: "warning",
    });
    handleCloseAllModals();
  };

  const handleConfirmBookingFromDropdown = async () => {
    if (!selectedBooking || !showConfirmModal) return;

    await handleStatusChange(selectedBooking.id, "confirmed");
    addToast({
      title: "Reserva confirmada",
      description: "La reserva ha sido confirmada exitosamente",
      color: "success",
    });
    handleCloseAllModals();
  };

  const handleBookingAction = (action: string, booking: AdminBooking) => {
    setSelectedBooking(booking);

    switch (action) {
      case "view":
        handleOpenDetails(booking);
        break;
      case "confirm":
        setShowConfirmModal(true);
        break;
      case "cancel":
        setShowCancelConfirm(true);
        break;
      case "delete":
        setShowDeleteConfirm(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;

    await handleStatusChange(selectedBooking.id, "confirmed");
    addToast({
      title: "Reserva confirmada",
      description: "La reserva ha sido confirmada exitosamente",
      color: "success",
    });
    handleCloseModal();
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking || !showDeleteConfirm) return;

    const result = await deleteBooking(selectedBooking.id);
    if (result.success) {
      addToast({
        title: "Reserva eliminada",
        description: "La reserva ha sido eliminada exitosamente",
        color: "success",
      });
      handleCloseAllModals();
    } else {
      addToast({
        title: "Error",
        description: "No se pudo eliminar la reserva",
        color: "danger",
      });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "calendario":
        return <BookingCalendarView />;

      case "estadisticas":
        return <BookingStatsView />;

      case "disponibilidad":
        return <BookingAvailabilityView />;

      default: // "lista"
        return (
          <div className="space-y-2">
            {/* Filtros */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <Text variant="title" color="#964f20">
                    Gestión de Reservas
                  </Text>
                  <p>
                    <Text variant="body" color="var(--color-on-surface)">
                      Administra todas las reservas del estudio
                    </Text>
                  </p>
                </div>

                <div className="w-full md:w-64">
                  <Select
                    label="Filtrar por estado"
                    placeholder="Selecciona un estado"
                    size="sm"
                    selectedKeys={[statusFilter]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      setStatusFilter(selectedKey || "all");
                    }}
                  >
                    <SelectItem key="all">
                      Todas
                    </SelectItem>
                    <SelectItem key="pending">
                      Pendientes
                    </SelectItem>
                    <SelectItem key="confirmed">
                      Confirmadas
                    </SelectItem>
                    <SelectItem key="cancelled">
                      Canceladas
                    </SelectItem>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Tabla de reservas */}
            <Card className="p-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <Text variant="body" color="color-on-surface">
                    Cargando reservas...
                  </Text>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Calendar" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p>
                    <Text variant="title" color="color-on-surface" className="mb-2">
                      No hay reservas
                    </Text>
                  </p>
                  <p>
                    <Text variant="body" color="color-on-surface">
                      {statusFilter === "all"
                        ? "Aún no se han realizado reservas"
                        : `No hay reservas con estado "${getStatusLabel(statusFilter)}"`
                      }
                    </Text>
                  </p>
                </div>
              ) : (
                <Table aria-label="Tabla de reservas">
                  <TableHeader>
                    <TableColumn>CLIENTE</TableColumn>
                    <TableColumn>FECHA & HORA</TableColumn>
                    <TableColumn>TIPO SESIÓN</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn className="flex justify-center items-center">ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p>
                              <Text variant="body" color="color-on-surface">
                                {booking.customer ? booking.customer.full_name : 'Bloqueo Administrativo'}
                              </Text>
                            </p>
                            <p>
                              <Text variant="label" color="color-on-surface" className="text-sm">
                                {booking.customer ? booking.customer.email : booking.reason || 'Sin razón especificada'}
                              </Text>
                            </p>
                            {booking.customer?.phone && (
                              <p>
                                <Text variant="label" color="color-on-surface" className="text-sm">
                                  {booking.customer.phone}
                                </Text>
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>
                              <Text variant="body" color="color-on-surface">
                                {formatDate(booking.booking_date)}
                              </Text>
                            </p>
                            <p>
                              <Text variant="label" color="color-on-surface" className="text-sm">
                                {formatTimeSlots(booking.time_slots)}
                              </Text>
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={booking.type_id === 2 ? "warning" : "primary"}
                            variant="flat"
                          >
                            {booking.type_id === 2
                              ? "Bloqueo"
                              : booking.session_type === "fotografia-modelo"
                                ? "Fotografía Modelo"
                                : "Fotografía Producto"
                            }
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={getStatusColor(booking.status)}
                            variant="flat"
                          >
                            {getStatusLabel(booking.status)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-lg cursor-pointer active:opacity-50 text-default-400 hover:text-default-600"
                              onClick={() => handleOpenDetails(booking)}
                              title="Ver detalles"
                            >
                              <Icon className="h-5 w-5" name="Eye" />
                            </button>
                            <Dropdown>
                              <DropdownTrigger>
                                <button className="text-lg cursor-pointer active:opacity-50 text-default-400">
                                  <Icon className="h-5 w-5" name="MoreVertical" />
                                </button>
                              </DropdownTrigger>
                              <DropdownMenu
                                aria-label="Acciones de reserva"
                                onAction={(key) => handleBookingAction(key as string, booking)}
                              >
                                <>
                                  {booking.status === "pending" && (
                                    <DropdownItem
                                      key="confirm"
                                      color="success"
                                      startContent={<Icon className="h-4 w-4" name="Check" />}
                                    >
                                      Confirmar
                                    </DropdownItem>
                                  )}
                                  {(booking.status === "pending" || booking.status === "confirmed") && (
                                    <DropdownItem
                                      key="cancel"
                                      color="warning"
                                      startContent={<Icon className="h-4 w-4" name="X" />}
                                    >
                                      Cancelar
                                    </DropdownItem>
                                  )}
                                </>
                                <DropdownItem
                                  key="delete"
                                  className="text-danger"
                                  color="danger"
                                  startContent={<Icon className="h-4 w-4" name="Trash2" />}
                                >
                                  Eliminar
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        );
    }
  };

  return (
    <>
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Icon name="Calendar" size={24} className="text-[#964f20]" />
            <div>
              <Text variant="title" color="#964f20">
                {activeTab === "lista" && "Lista de Reservas"}
                {activeTab === "calendario" && "Calendario de Reservas"}
                {activeTab === "estadisticas" && "Estadísticas de Reservas"}
                {activeTab === "disponibilidad" && "Gestión de Disponibilidad"}
              </Text>
              <p>
                <Text variant="body" color="var(--color-on-surface)">
                  {activeTab === "lista" && "Gestiona todas las reservas del estudio"}
                  {activeTab === "calendario" && "Vista mensual de reservas y disponibilidad"}
                  {activeTab === "estadisticas" && "Métricas y análisis de reservas"}
                  {activeTab === "disponibilidad" && "Configura horarios disponibles y bloqueos específicos"}
                </Text>
              </p>
            </div>
          </div>

          {/* Contenido */}
          {renderContent()}
        </Col>
      </Container>

      {/* Modal de detalles */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        title="Detalles de la Reserva"
        // footer={
        //   <div className="flex justify-end gap-2 w-full">
        //     <Button variant="secondary" onClick={handleCloseModal}>
        //       Cerrar
        //     </Button>
        //   </div>
        // }
      >
        {selectedBooking && (
          <div className="space-y-4">
            {/* Cliente */}
            <div>
              <Text variant="subtitle" color="#964f20">
                Información del Cliente
              </Text>
              <div className="mt-2 space-y-2">
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Nombre:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {selectedBooking.customer?.full_name || 'Bloqueo Administrativo'}
                  </Text>
                </div>
                {selectedBooking.customer?.email && (
                  <div>
                    <Text variant="label" color="color-on-surface" className="font-semibold">
                      Email:
                    </Text>
                    <Text variant="body" color="color-on-surface" className="ml-2">
                      {selectedBooking.customer.email}
                    </Text>
                  </div>
                )}
                {selectedBooking.customer?.phone && (
                  <div>
                    <Text variant="label" color="color-on-surface" className="font-semibold">
                      Teléfono:
                    </Text>
                    <Text variant="body" color="color-on-surface" className="ml-2">
                      {selectedBooking.customer.phone}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de la reserva */}
            <div>
              <Text variant="subtitle" color="#964f20">
                Detalles de la Reserva
              </Text>
              <div className="mt-2 space-y-2">
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Fecha:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {formatDate(selectedBooking.booking_date)}
                  </Text>
                </div>
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Horario:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {formatTimeSlots(selectedBooking.time_slots)}
                  </Text>
                </div>
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Tipo de sesión:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {selectedBooking.type_id === 2
                      ? "Bloqueo Administrativo"
                      : selectedBooking.session_type === "fotografia-modelo"
                        ? "Fotografía de Modelo"
                        : "Fotografía de Producto"
                    }
                  </Text>
                </div>
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Estado:
                  </Text>
                  <Chip
                    size="sm"
                    color={getStatusColor(selectedBooking.status)}
                    variant="flat"
                    className="ml-2"
                  >
                    {getStatusLabel(selectedBooking.status)}
                  </Chip>
                </div>
                {selectedBooking.project_details && (
                  <div>
                    <Text variant="label" color="color-on-surface" className="font-semibold">
                      Detalles del proyecto:
                    </Text>
                    <Text variant="body" color="color-on-surface" className="mt-1">
                      {selectedBooking.project_details}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            {/* <div>
              <Text variant="subtitle" color="#964f20">
                Información Adicional
              </Text>
              <div className="mt-2 space-y-2">
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Creada:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {new Date(selectedBooking.created_at).toLocaleString('es-ES')}
                  </Text>
                </div>
                <div>
                  <Text variant="label" color="color-on-surface" className="font-semibold">
                    Última actualización:
                  </Text>
                  <Text variant="body" color="color-on-surface" className="ml-2">
                    {new Date(selectedBooking.updated_at).toLocaleString('es-ES')}
                  </Text>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </Modal>

      {/* Modal de confirmación para confirmar reserva */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCloseAllModals}
        size="md"
        title="Confirmar Reserva"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={handleCloseAllModals}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmBookingFromDropdown}>
              Confirmar
            </Button>
          </div>
        }
      >
        <Text variant="body" color="color-on-surface">
          ¿Estás seguro de que deseas confirmar esta reserva?
        </Text>
      </Modal>

      {/* Modal de confirmación para cancelar */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={handleCloseAllModals}
        size="md"
        title="Cancelar Reserva"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={handleCloseAllModals}>
              No, mantener
            </Button>
            <Button variant="primary" onClick={handleCancelBooking}>
              Sí, cancelar
            </Button>
          </div>
        }
      >
        <Text variant="body" color="color-on-surface">
          ¿Estás seguro de que deseas cancelar esta reserva?
        </Text>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCloseAllModals}
        size="md"
        title="Eliminar Reserva"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={handleCloseAllModals}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleDeleteBooking}>
              Eliminar
            </Button>
          </div>
        }
      >
        <Text variant="body" color="color-on-surface">
          ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
        </Text>
      </Modal>
    </>
  );
};

// Componente principal envuelto en Suspense
const ReservasAdminPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ReservasContent />
    </Suspense>
  );
};

export default ReservasAdminPage;