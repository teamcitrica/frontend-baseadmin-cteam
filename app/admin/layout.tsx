'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/citrica-ui/organism/sidebar";
import { siteConfig } from "@/config/site";
import { UserAuth } from "@/shared/context/auth-context";
import "@/styles/globals.scss";
import Navbar from "@/shared/components/citrica-ui/organism/navbar copy";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userSession, userInfo } = UserAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no hay sesión, redirigir a login
    if (userSession === null) {
      router.push('/login');
    }
  }, [userSession, router]);

  // Si no hay sesión, no renderizar nada (se está redirigiendo)
  if (userSession === null || userInfo === null) {
    return null;
  }

  return (
    <div className="container-general-pase-admin w-full flex justify-center">
      <div className="w-full">
        <div className="h-full bg-[#EFE6DC] flex flex-row justify-start min-h-full">
          <Sidebar items={siteConfig.sidebarItems} />
          <div className="bg-[#EFE6DC] flex-1 text-white w-[80%]">
            <Navbar session={userSession} />
            <div className="pt-3 max-h-[90vh] overflow-y-scroll">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
