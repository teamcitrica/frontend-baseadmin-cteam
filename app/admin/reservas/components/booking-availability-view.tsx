"use client";
import React, { useState } from "react";
import Button from "@ui/molecules/button";
import Icon from "@ui/atoms/icon";
import UnifiedAvailabilityManager from "./disponibilidad/components/unified-availability-manager";
import WeeklyScheduleManager from "./disponibilidad/components/weekly-schedule-manager";

const BookingAvailabilityView = () => {
  const [activeSubTab, setActiveSubTab] = useState<"disponibilidad" | "semanal">("disponibilidad");

  const renderContent = () => {
    switch (activeSubTab) {
      case "semanal":
        return <WeeklyScheduleManager />;
      case "disponibilidad":
      default:
        return <UnifiedAvailabilityManager />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Navegación de sub-pestañas */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant={activeSubTab === "disponibilidad" ? "primary" : "secondary"}
          onClick={() => setActiveSubTab("disponibilidad")}
          startContent={<Icon name="Calendar" size={16} />}
        >
          Gestión de Disponibilidad
        </Button>
        <Button
          size="sm"
          variant={activeSubTab === "semanal" ? "primary" : "secondary"}
          onClick={() => setActiveSubTab("semanal")}
          startContent={<Icon name="Clock" size={16} />}
        >
          Configuración Semanal
        </Button>
      </div>

      {/* Contenido de la sub-pestaña activa */}
      {renderContent()}
    </div>
  );
};

export default BookingAvailabilityView;
