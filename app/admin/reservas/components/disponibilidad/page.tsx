"use client";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, Col } from "@citrica/objects";
import Text from "@ui/atoms/text";
import Icon from "@ui/atoms/icon";
import Button from "@ui/molecules/button";

import WeeklyScheduleManager from "./components/weekly-schedule-manager";
import UnifiedAvailabilityManager from "./components/unified-availability-manager";

const DisponibilidadAdminPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams?.get("page") || "disponibilidad";

  const renderContent = () => {
    switch (activeTab) {
      case "semanal":
        return <WeeklyScheduleManager />;
      case "disponibilidad":
      default:
        return <UnifiedAvailabilityManager />;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "semanal":
        return "Configura los horarios base de toda la semana";
      case "disponibilidad":
      default:
        return "Gestiona bloqueos específicos por fecha y visualiza disponibilidad en tiempo real";
    }
  };

  return (
    <Container>
      <Col cols={{ lg: 12, md: 6, sm: 4 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={24} className="text-[#964f20]" />
            <div>
              <p>
              <Text variant="headline" color="#964f20">
                Horarios
              </Text>
              </p>
              <Text variant="body" color="black">
                {getTabDescription()}
              </Text>
            </div>
          </div>

          {/* Navegación de pestañas */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activeTab === "disponibilidad" ? "primary" : "secondary"}
              onClick={() => router.push("/admin/disponibilidad?page=disponibilidad")}
              startContent={<Icon name="Calendar" size={16} />}
            >
              Gestión de Disponibilidad
            </Button>
            <Button
              size="sm"
              variant={activeTab === "semanal" ? "primary" : "secondary"}
              onClick={() => router.push("/admin/disponibilidad?page=semanal")}
              startContent={<Icon name="Clock" size={16} />}
            >
              Configuración Semanal
            </Button>
          </div>
        </div>

        {/* Contenido de la pestaña activa */}
        {renderContent()}
      </Col>
    </Container>
  );
};

export default DisponibilidadAdminPage;