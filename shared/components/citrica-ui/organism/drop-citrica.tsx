import React from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from '@heroui/react';
import Icon, { IconName } from "@/shared/components/citrica-ui/atoms/icon";
import { useRouter } from 'next/navigation';

// Tipos para los items del dropdown
export interface DropdownItemConfig {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: IconName; // Cambiar de string a IconName
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
  isDisabled?: boolean;
}

// Props del componente principal
export interface DropCitricaProps {
  // Props para el usuario
  userName?: string;
  userAvatar?: string;
  
  // Props para estilos personalizables
  triggerClassName?: string;
  triggerBackgroundColor?: string;
  avatarSize?: number;
  dropdownWidth?: string;
  dropdownHeight?: string;
  
  // Props para los items del dropdown
  items?: DropdownItemConfig[];
  
  // Props para eventos
  onItemClick?: (key: string, item: DropdownItemConfig) => void;
  
  // Props para el comportamiento
  isDisabled?: boolean;
  disabledKeys?: string[];
  placement?: "bottom" | "bottom-start" | "bottom-end" | "top" | "top-start" | "top-end";
  
  // Mostrar el nombre del usuario como primer item
  showUserName?: boolean;
}

export const DropCitrica: React.FC<DropCitricaProps> = ({
  userName = "Usuario",
  userAvatar,
  triggerClassName = "",
  triggerBackgroundColor = "#E9E6DD",
  avatarSize = 40,
  dropdownWidth = "241px",
  dropdownHeight = "auto",
  items = [],
  onItemClick,
  isDisabled = false,
  disabledKeys = [],
  placement = "bottom-start",
  showUserName = true
}) => {
  const router = useRouter();
  
  const handleItemClick = (item: DropdownItemConfig) => {
    // Si el item tiene un href, navegar usando Next.js router
    if (item.href) {
      router.push(item.href);
    }
    
    // Si el item tiene un onClick personalizado, ejecutarlo
    if (item.onClick) {
      item.onClick();
    }
    
    // Llamar al callback general si existe
    if (onItemClick) {
      onItemClick(item.key, item);
    }
  };

  const defaultTriggerStyle = {
    backgroundColor: triggerBackgroundColor
  };

  // Crear set de keys deshabilitadas basado en la configuración de items
  const computedDisabledKeys = React.useMemo(() => {
    const keys = new Set<string>();
    
    // Agregar keys de items marcados como disabled
    items.forEach(item => {
      if (item.isDisabled) {
        keys.add(item.key);
      }
    });
    
    // Agregar keys adicionales si se proporcionan
    disabledKeys.forEach(key => keys.add(key));
    
    return keys;
  }, [items, disabledKeys]);

  // Crear un array consolidado de todos los items
  const allItems = React.useMemo(() => {
    const itemsArray: DropdownItemConfig[] = [];
    
    // Agregar item del usuario si está habilitado
    if (showUserName) {
      itemsArray.push({
        key: "user-name",
        label: userName,
        className: "bg-[#FAF9F6] pl-[16px] py-[13px] w-full text-name-users",
        isDisabled: true // El nombre del usuario no debe ser clickeable
      });
    }
    
    // Agregar los items proporcionados
    itemsArray.push(...items);
    
    return itemsArray;
  }, [userName, items, showUserName]);

  return (
    <Dropdown placement={placement} isDisabled={isDisabled}>
      <DropdownTrigger>
        <div 
          className={`flex items-center justify-between gap-2 rounded-full p-2 w-[60px] cursor-pointer ${triggerClassName}`}
          style={defaultTriggerStyle}
        >
          <div className="bg-white rounded-full p-[2px]">
            <Avatar
              src={userAvatar}
              isBordered={false}
              className={`w-[${avatarSize}px] h-[${avatarSize}px]`}
              name={userName}
            />
          </div>
          <Icon name="ChevronDown" size={16} className="text-gray-600" />
        </div>
      </DropdownTrigger>

      <DropdownMenu 
        aria-label="Opciones de usuario"
        classNames={{
          base: `p-0`,
        }}
        style={{ 
          width: dropdownWidth, 
          height: dropdownHeight 
        }}
        disabledKeys={computedDisabledKeys}
        onAction={(key) => {
          const item = allItems.find(item => item.key === key.toString());
          if (item && !item.isDisabled) {
            handleItemClick(item);
          }
        }}
      >
        {allItems.map((item) => (
          <DropdownItem
            key={item.key}
            className={`flex justify-center pl-[16px] py-[13px] ${item.className || ''}`}
            color={item.color || "default"}
            textValue={item.label}
          >
            {item.key === "user-name" ? (
              // Renderizado especial para el item del usuario
              <span>{item.label}</span>
            ) : (
              // Renderizado normal para otros items
              <div className="flex items-center gap-2">
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>{item.label}</span>
              </div>
            )}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

// Hook personalizado para usar con Next.js Router
export const useDropCitricaNavigation = () => {
  const router = useRouter();
  
  const handleNavigation = (key: string, item: DropdownItemConfig) => {
    if (item.href) {
      router.push(item.href);
    }
  };
  
  return { handleNavigation };
};