"use client";
import React, { useState } from "react";
import Text from "@ui/atoms/text";
import Button from "@ui/molecules/button";
import Card from "@ui/atoms/card";
import Icon from "@ui/atoms/icon";
import Input from "@ui/atoms/input";
import { Input as DateInput, Select, SelectItem } from "@heroui/react";

import { useAdminBookings } from "@/app/hooks/useAdminBookings";

const QuickConfigManager = () => {
  const {
    isLoading,
    applyWeeklyPreset,
    togglePeriodBatch,
    emergencyCloseAll
  } = useAdminBookings();

  const [batchConfig, setBatchConfig] = useState({
    startDate: "",
    endDate: "",
    action: "generate" // "generate", "activate", "deactivate"
  });

  const [presets] = useState([
    {
      name: "7 Días (10-18)",
      description: "Todos los días 10:00-18:00",
      config: {
        everyday: { start: "10:00", end: "18:00", active: true }
      }
    }
  ]);

  const handleBatchAction = async () => {
    if (!batchConfig.startDate || !batchConfig.endDate) {
      alert("Por favor selecciona las fechas");
      return;
    }

    if (new Date(batchConfig.startDate) > new Date(batchConfig.endDate)) {
      alert("La fecha de inicio debe ser anterior a la fecha de fin");
      return;
    }

    try {
      let result;

      if (batchConfig.action === "activate") {
        result = await togglePeriodBatch(batchConfig.startDate, batchConfig.endDate, 'activate');
        if (result.success) {
          alert("Período activado exitosamente");
        } else {
          alert("Error al activar el período");
        }
      } else if (batchConfig.action === "deactivate") {
        result = await togglePeriodBatch(batchConfig.startDate, batchConfig.endDate, 'deactivate');
        if (result.success) {
          alert("Período desactivado exitosamente");
        } else {
          alert("Error al desactivar el período");
        }
      } else if (batchConfig.action === "generate") {
        // Para generar slots, simplemente activamos el período
        result = await togglePeriodBatch(batchConfig.startDate, batchConfig.endDate, 'activate');
        if (result.success) {
          alert("Período activado para generar slots automáticamente");
        } else {
          alert("Error al activar el período");
        }
      }
    } catch (error) {
      console.error('Error in batch action:', error);
      alert("Error al procesar la acción");
    }
  };

  const calculateDaysBetween = (start: string, end: string) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div>
          <p>
            <Text variant="title" color="#964f20">
              Configuración Rápida
            </Text>
          </p>
          <p>
            <Text variant="body" color="color-on-surface">
              Herramientas para configurar disponibilidad masiva y aplicar cambios a múltiples días
            </Text>
          </p>
        </div>
      </Card>

      {/* Presets de configuración */}
      <Card className="p-6">
        <div className="space-y-4">
          <p>
            <Text variant="subtitle" color="#964f20">
              Configuraciones Predefinidas
            </Text>
          </p>
          <p>
            <Text variant="body" color="color-on-surface" className="text-sm">
              Aplica configuraciones comunes a toda la semana
            </Text>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#964f20] transition-colors cursor-pointer"
                onClick={async () => {
                  if (confirm(`¿Aplicar la configuración "${preset.name}"?\n\nEsto afectará la disponibilidad semanal actual.`)) {
                    try {
                      const result = await applyWeeklyPreset(preset.config);
                      if (result.success) {
                        alert(`Configuración "${preset.name}" aplicada exitosamente`);
                      } else {
                        alert(`Error al aplicar la configuración "${preset.name}"`);
                      }
                    } catch (error) {
                      console.error('Error applying preset:', error);
                      alert(`Error al aplicar la configuración "${preset.name}"`);
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p>
                      <Text variant="subtitle" color="color-on-surface">
                        {preset.name}
                      </Text>
                    </p>
                    <p>
                      <Text variant="body" color="color-on-surface" className="text-sm mt-1">
                        {preset.description}
                      </Text>
                    </p>

                  </div>
                  <Icon name="ChevronRight" size={20} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Acciones por lotes */}
      <Card className="p-6">
        <div className="space-y-4">
          <p>
            <Text variant="subtitle" color="#964f20">
              Acciones por Lotes
            </Text>
          </p>
          <p>
            <Text variant="body" color="color-on-surface" className="text-sm">
              Aplica cambios a un rango de fechas específico
            </Text>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DateInput
              label="Fecha de inicio"
              type="date"
              value={batchConfig.startDate}
              onChange={(e) => setBatchConfig({ ...batchConfig, startDate: e.target.value })}
              className="input-citrica-ui input-primary"
              variant="bordered"
              color="default"
            />

            <DateInput
              label="Fecha de fin"
              type="date"
              value={batchConfig.endDate}
              onChange={(e) => setBatchConfig({ ...batchConfig, endDate: e.target.value })}
              className="input-citrica-ui input-primary"
              variant="bordered"
              color="default"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción
              </label>
              <Select
                placeholder="Selecciona una acción"
                value={batchConfig.action}
                onChange={(e) => setBatchConfig({ ...batchConfig, action: e.target.value })}
              >
                <SelectItem key="generate">
                  Generar Slots
                </SelectItem>
                <SelectItem key="activate">
                  Activar Período
                </SelectItem>
                <SelectItem key="deactivate">
                  Desactivar Período
                </SelectItem>
              </Select>
            </div>
          </div>

          {batchConfig.startDate && batchConfig.endDate && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <Text variant="body" color="color-on-surface" className="text-sm">
                <strong>Resumen:</strong> Se aplicará la acción "{batchConfig.action === 'generate' ? 'Generar Slots' : batchConfig.action === 'activate' ? 'Activar' : 'Desactivar'}"
                a {calculateDaysBetween(batchConfig.startDate, batchConfig.endDate)} días
                (desde {new Date(batchConfig.startDate).toLocaleDateString('es-ES')} hasta {new Date(batchConfig.endDate).toLocaleDateString('es-ES')})
              </Text>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleBatchAction}
            disabled={!batchConfig.startDate || !batchConfig.endDate || isLoading}
            startContent={<Icon name="Play" size={16} />}
          >
            {isLoading ? "Procesando..." : "Aplicar Acción"}
          </Button>
        </div>
      </Card>

      {/* Herramientas útiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generación automática */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={20} className="text-[#964f20]" />
              <Text variant="subtitle" color="#964f20">
                Generación Automática
              </Text>
            </div>

            <Text variant="body" color="color-on-surface" className="text-sm">
              Genera slots automáticamente para los próximos meses basándose en tu configuración semanal
            </Text>

            <div className="space-y-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const today = new Date();
                  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                  const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);

                  if (confirm("¿Activar disponibilidad para el próximo mes?\n\nEsto eliminará cualquier bloqueo existente en ese período.")) {
                    try {
                      const result = await togglePeriodBatch(
                        nextMonth.toISOString().split('T')[0],
                        endOfNextMonth.toISOString().split('T')[0],
                        'activate'
                      );
                      if (result.success) {
                        alert("✅ Próximo mes activado para reservas");
                      } else {
                        alert("❌ Error al activar el próximo mes");
                      }
                    } catch (error) {
                      console.error('Error activating next month:', error);
                      alert("❌ Error al activar el próximo mes");
                    }
                  }
                }}
                fullWidth
              >
                Próximo Mes
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const today = new Date();
                  const next3Months = new Date(today.getFullYear(), today.getMonth() + 3, 0);

                  if (confirm("¿Activar disponibilidad para los próximos 3 meses?\n\nEsto eliminará cualquier bloqueo existente en ese período.")) {
                    try {
                      const result = await togglePeriodBatch(
                        today.toISOString().split('T')[0],
                        next3Months.toISOString().split('T')[0],
                        'activate'
                      );
                      if (result.success) {
                        alert("✅ Próximos 3 meses activados para reservas");
                      } else {
                        alert("❌ Error al activar los próximos 3 meses");
                      }
                    } catch (error) {
                      console.error('Error activating next 3 months:', error);
                      alert("❌ Error al activar los próximos 3 meses");
                    }
                  }
                }}
                fullWidth
              >
                Próximos 3 Meses
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const today = new Date();
                  const nextYear = new Date(today.getFullYear() + 1, 0, 1);
                  const endOfNextYear = new Date(today.getFullYear() + 1, 11, 31);

                  if (confirm("¿Activar disponibilidad para el próximo año?\n\nEsto eliminará cualquier bloqueo existente en ese período.")) {
                    try {
                      const result = await togglePeriodBatch(
                        nextYear.toISOString().split('T')[0],
                        endOfNextYear.toISOString().split('T')[0],
                        'activate'
                      );
                      if (result.success) {
                        alert("✅ Próximo año activado para reservas");
                      } else {
                        alert("❌ Error al activar el próximo año");
                      }
                    } catch (error) {
                      console.error('Error activating next year:', error);
                      alert("❌ Error al activar el próximo año");
                    }
                  }
                }}
                fullWidth
              >
                Próximo Año
              </Button>
            </div>
          </div>
        </Card>

        {/* Acciones de emergencia */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-orange-500" />
              <Text variant="subtitle" color="#964f20">
                Acciones de Emergencia
              </Text>
            </div>

            <Text variant="body" color="color-on-surface" className="text-sm">
              Herramientas para situaciones especiales (usar con precaución)
            </Text>

            <div className="space-y-2">
              <Button
                size="sm"
                variant="warning"
                onClick={async () => {
                  if (confirm("⚠️ ¿Cerrar el estudio MAÑANA?\n\nEsto bloqueará todo el día siguiente.")) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const dateStr = tomorrow.toISOString().split('T')[0];

                    try {
                      const result = await togglePeriodBatch(dateStr, dateStr, 'deactivate');
                      if (result.success) {
                        alert("✅ Estudio cerrado para mañana");
                      } else {
                        alert("❌ Error al cerrar el estudio para mañana");
                      }
                    } catch (error) {
                      console.error('Error closing tomorrow:', error);
                      alert("❌ Error al cerrar el estudio para mañana");
                    }
                  }
                }}
                fullWidth
              >
                ⚠️ Cerrar Mañana
              </Button>

              <Button
                size="sm"
                variant="warning"
                onClick={async () => {
                  if (confirm("⚠️ ¿Cerrar el estudio esta SEMANA?\n\nEsto bloqueará los próximos 7 días.")) {
                    const today = new Date();
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);

                    try {
                      const result = await togglePeriodBatch(
                        today.toISOString().split('T')[0],
                        nextWeek.toISOString().split('T')[0],
                        'deactivate'
                      );
                      if (result.success) {
                        alert("✅ Estudio cerrado para esta semana");
                      } else {
                        alert("❌ Error al cerrar el estudio para esta semana");
                      }
                    } catch (error) {
                      console.error('Error closing this week:', error);
                      alert("❌ Error al cerrar el estudio para esta semana");
                    }
                  }
                }}
                fullWidth
              >
                ⚠️ Cerrar Esta Semana
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  if (confirm("🚨 ¿CERRAR TODO?\n\nEsto desactivará TODOS los horarios de la semana.\n\n¡Esta acción no se puede deshacer fácilmente!")) {
                    try {
                      const result = await emergencyCloseAll();
                      if (result.success) {
                        alert("🚨 ¡ESTUDIO CERRADO COMPLETAMENTE! Todos los horarios semanales han sido desactivados.");
                      } else {
                        alert("❌ Error al cerrar completamente el estudio");
                      }
                    } catch (error) {
                      console.error('Error in emergency close all:', error);
                      alert("❌ Error al cerrar completamente el estudio");
                    }
                  }
                }}
                fullWidth
              >
                🚨 Cerrar Todo
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Información */}
      <Card className="p-6">
        <div className="space-y-3">
          <Text variant="subtitle" color="#964f20">
            Información Importante
          </Text>
          <div className="space-y-2 text-sm">
            <Text variant="body" color="color-on-surface" className="text-sm">
              • <strong>Configuraciones Predefinidas:</strong> Aplican horarios estándar a toda la semana
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • <strong>Generar Slots:</strong> Activa un período eliminando bloqueos existentes
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • <strong>Activar Período:</strong> Elimina bloqueos y permite reservas en el rango seleccionado
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • <strong>Desactivar Período:</strong> Bloquea completamente un rango de fechas
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • <strong>Acciones de Emergencia:</strong> Cierran inmediatamente días o toda la disponibilidad
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • Los slots se generan dinámicamente basándose en la configuración semanal
            </Text>
            <Text variant="body" color="color-on-surface" className="text-sm">
              • Siempre verifica las fechas antes de aplicar cambios masivos
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuickConfigManager;