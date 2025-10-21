"use client";
import React, { useState, useEffect } from "react";
import { Container, Col } from "@citrica/objects";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import {
  Badge,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Spinner
} from "@heroui/react";

import { useCustomers, Customer } from "@/app/hooks/useCustomers";

const ClientesAdminPage = () => {
  const {
    isLoading,
    customers,
    getAllCustomers,
    deleteCustomer,
    getCustomerStats
  } = useCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAllCustomers();
    loadStats();
  }, []);

  const loadStats = async () => {
    const result = await getCustomerStats();
    if (result.success && result.stats) {
      setStats(result.stats);
    }
  };

  const handleSearch = async (search: string) => {
    setSearchTerm(search);
    await getAllCustomers(50, 0, search);
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (confirm(`¿Estás seguro de eliminar el cliente "${customerName}"?`)) {
      const result = await deleteCustomer(customerId);
      if (result.success) {
        getAllCustomers(50, 0, searchTerm);
        loadStats();
      } else {
        alert(result.error || "Error al eliminar el cliente");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Icon name="Users" size={24} className="text-[#964f20]" />
          <div>
            <Text variant="title" color="#964f20">
              Gestión de Clientes
            </Text>
            <p>
              <Text variant="body" color="var(--color-on-surface)">
                Administra la base de datos de clientes del estudio
              </Text>
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon name="Users" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p>
                    <Text variant="label" color="color-on-surface" className="text-sm">
                      Total Clientes
                    </Text>
                  </p>
                  <p>
                    <Text variant="title" color="color-on-surface">
                      {stats.total_customers}
                    </Text>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Icon name="UserPlus" size={20} className="text-green-600" />
                </div>
                <div>
                  <p>
                    <Text variant="label" color="color-on-surface" className="text-sm">
                      Nuevos este mes
                    </Text>
                  </p>
                  <p>
                    <Text variant="title" color="color-on-surface">
                      {stats.new_customers_this_month}
                    </Text>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Icon name="Calendar" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p>
                    <Text variant="label" color="color-on-surface" className="text-sm">
                      Con Reservas
                    </Text>
                  </p>
                  <p>
                    <Text variant="title" color="color-on-surface">
                      {stats.customers_with_bookings}
                    </Text>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon name="UserX" size={20} className="text-gray-600" />
                </div>
                <div>
                  <p>
                  <Text variant="label" color="color-on-surface" className="text-sm">
                    Sin Reservas
                  </Text>
                  </p>
                  <p>
                  <Text variant="title" color="color-on-surface">
                    {stats.customers_without_bookings}
                  </Text>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Controles y búsqueda */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Text variant="title" color="#964f20">
                Lista de Clientes
              </Text>
              <p>
                <Text variant="body" color="var(--color-on-surface)">
                  {customers.length} clientes registrados
                </Text>
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<Icon name="Search" size={16} />}
                className="w-full md:w-80"
                size="sm"
              />

              {/* Botón para agregar cliente en futuras versiones */}
              {/* <Button
                size="sm"
                variant="primary"
                startContent={<Icon name="UserPlus" size={16} />}
              >
                Nuevo Cliente
              </Button> */}
            </div>
          </div>
        </Card>

        {/* Tabla de clientes */}
        <Card className="p-2">
          {isLoading ? (
            <div className="text-center py-8">
              <Spinner size="lg" color="primary" />
              <Text variant="body" color="color-on-surface" className="mt-4">
                Cargando clientes...
              </Text>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
              <Text variant="title" color="color-on-surface" className="mb-2">
                No hay clientes
              </Text>
              <Text variant="body" color="color-on-surface">
                {searchTerm
                  ? `No se encontraron clientes que coincidan con "${searchTerm}"`
                  : "Aún no hay clientes registrados en el sistema"
                }
              </Text>
            </div>
          ) : (
            <Table aria-label="Tabla de clientes">
              <TableHeader>
                <TableColumn>CLIENTE</TableColumn>
                <TableColumn>CONTACTO</TableColumn>
                <TableColumn>RESERVAS</TableColumn>
                <TableColumn>REGISTRO</TableColumn>
                <TableColumn className="flex justify-center items-center">ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#964f20] text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {getInitials(customer.full_name)}
                        </div>
                        <div>
                          <p>
                            <Text variant="body" color="color-on-surface">
                              {customer.full_name}
                            </Text>
                          </p>
                          <p>
                            <Text variant="label" color="color-on-surface" className="text-sm opacity-70">
                              ID: {customer.id.slice(0, 8)}...
                            </Text>
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p>
                          <Text variant="body" color="color-on-surface">
                            {customer.email}
                          </Text>
                        </p>
                        {customer.phone && (
                          <p>
                            <Text variant="label" color="color-on-surface" className="text-sm">
                              {customer.phone}
                            </Text>
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Chip
                          size="sm"
                          color={customer._count?.bookings ? "primary" : "default"}
                          variant="flat"
                        >
                          {customer._count?.bookings || 0} reservas
                        </Chip>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Text variant="body" color="color-on-surface">
                        {formatDate(customer.created_at)}
                      </Text>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // TODO: Implementar vista de detalles del cliente
                            alert("Funcionalidad de detalles en desarrollo");
                          }}
                          className="!min-w-0 !px-4"
                        >
                          <Icon name="Eye" size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            // TODO: Implementar edición de cliente
                            alert("Funcionalidad de edición en desarrollo");
                          }}
                          className="!min-w-0 !px-4"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteCustomer(customer.id, customer.full_name)}
                          className="!min-w-0 !px-4"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </Col>
    </Container>
  );
};

export default ClientesAdminPage;