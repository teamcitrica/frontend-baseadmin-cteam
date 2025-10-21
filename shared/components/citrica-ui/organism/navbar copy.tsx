'use client'
import React, { useEffect, useRef, useState } from "react";
import { Col, Container } from '@citrica/objects';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { siteConfig } from "@/config/site";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import Icon from "../atoms/icon";
import { UserBox } from "@/app/hooks/user-box";
import { type Session } from "@supabase/auth-helpers-nextjs";
import { UserAuth } from "@/shared/context/auth-context";

const Navbar = ({ session }: { session: Session | null }) => {
  const [active, setActive] = useState("Inicio");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathname = usePathname();
  const { signOut, getUserInfo, userInfo } = UserAuth();

  useEffect(() => {
    if (session) {
      getUserInfo(session.user.id);
    }
  }, []);

  // Scroll background change
  const [colorbg, setcolorbg] = useState(false);
  const changeColor = () => {
    setcolorbg(window.scrollY >= 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', changeColor);
    return () => window.removeEventListener('scroll', changeColor);
  }, []);

  const menuRef = useRef<HTMLDivElement | null>(null);
  

  return (
    <>
      <Container>
        <Col cols={{ lg: 12, md: 6, sm: 4 }} className=" flex justify-between items-center pt-3 pb-3">
          {/* Logo o UserBox */}
          {session ? (
            <div className="w-full flex flex-col items-end">
              <UserBox />
            </div>
          ) : (
            <Link href="/login">
              <span className="text-sm text-[#F7BB58] font-medium hover:underline">
                Iniciar sesión
              </span>
            </Link>
          )}

          {/* Navegación Desktop */}
          {/* <ul className="only-lg-flex list-none gap-9">
            {siteConfig.navLinks.map((nav, index) => (
              <li
                key={index}
                className={`flex cursor-pointer nav_link ${active === nav.href ? "nav_link_active" : ""}`}
                onClick={() => setActive(nav.href)}
              >
                <Link
                  className={`text-white ${
                    pathname === '/'
                      ? (active === nav.href ? 'text-[#F7BB58]' : 'text-[#FFFFFF]')
                      : colorbg
                      ? (active === nav.href ? 'text-[#F7BB58]' : 'text-[#FFFFFF]')
                      : (active === nav.href ? 'text-[#F7BB58]' : 'text-[#000000]')
                  }`}
                  href={nav.href}
                >
                  {nav.title}
                </Link>
              </li>
            ))}
          </ul> */}

          {/* Botón del menú móvil - actualmente comentado */}
          {/*
          <div ref={menuRef} className="only-sm-md-flex justify-end items-center p-1 flex-1">
            <Button size="sm" variant="light" onPress={onOpen}>
              <Icon name="Menu" color="#FFF" size={24} strokeWidth={2} />
            </Button>
          </div>
          */}
        </Col>
      </Container>

      {/* Menú Móvil */}
      <Drawer isOpen={isOpen} size="xs" onClose={onClose}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">Menú</DrawerHeader>
              <DrawerBody>
                <ul className="list-none flex flex-col">
                  {siteConfig.navLinks.map((nav, index) => (
                    <li
                      key={index}
                      className={`font-medium cursor-pointer text-[16px] ${
                        index === siteConfig.navLinks.length - 1 ? "mb-0" : "mb-4"
                      }`}
                      onClick={() => {
                        setActive(nav.href);
                        onClose();
                      }}
                    >
                      <Link href={nav.href}>{nav.title}</Link>
                    </li>
                  ))}
                </ul>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
