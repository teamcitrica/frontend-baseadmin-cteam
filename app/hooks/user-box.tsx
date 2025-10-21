"use client";
import { DropCitrica, DropdownItemConfig } from "@/shared/components/citrica-ui/organism/drop-citrica";
import { UserAuth } from "@/shared/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";


export const UserBox = () => {
  const { userInfo, signOut } = UserAuth();
  const router = useRouter();

  const handleLogout = async () => {
    // signOut() ya redirige a /logout, que se encarga de todo
    await signOut();
  };

  const fullName = `${userInfo?.first_name || ""} ${userInfo?.last_name || ""}`.trim();

  // Configurar los items del dropdown
  const dropdownItems: DropdownItemConfig[] = [
    {
      key: "logout",
      label: "Cerrar sesión",
      onClick: handleLogout,
      icon: "LogOut",
      color: "danger",
      className: "flex justify-center pl-[16px] py-[13px] text-danger"
    }
  ];

  const handleItemClick = (key: string, item: DropdownItemConfig) => {
    // El manejo ya está en las funciones específicas de cada item
    // Pero puedes agregar lógica adicional aquí si necesitas
    console.log(`Clicked on: ${key}`);
  };

  return (
    <DropCitrica
      userName={fullName || "Usuario"}
      userAvatar={undefined} // Si tienes avatar del usuario, pásalo aquí
      items={dropdownItems}
      onItemClick={handleItemClick}
      triggerBackgroundColor="#E9E6DD"
      avatarSize={40}
      dropdownWidth="241px"
      dropdownHeight="96px"
      placement="bottom-start"
      showUserName={true}
      triggerClassName=""
    />
  );
};