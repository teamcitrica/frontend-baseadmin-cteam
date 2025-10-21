export type SiteConfig = typeof siteConfig;
import { Home, ClipboardCheck, Settings, Users, Bell, ShieldCheck } from "lucide-react"

const SUBITEM_SEARCH_PARAM = "page";

export const siteConfig = {
	name: "Proyecto Web",
	description: "Descripción Proyecto Web",
	navLinks: [
		{
			title: "Inicio",
			href: "/",
		},
		{
			title: "Item2",
			href: "#proyect",
		},
		{
			title: "Panel3",
			href: "/panel",
		},
				{
			title: "Inicio4",
			href: "/",
		},
		{
			title: "Proyectos5",
			href: "#proyect",
		},
		{
			title: "Panel6",
			href: "/panel",
		}
	],
	subItemSearchParam: SUBITEM_SEARCH_PARAM, // FOR SUBSECTIONS IN SIDEBAR
	sidebarItems: [
		{
			title: "Home",
			icon: "Settings",
			href: "/",
		},
    {
      title: "Clientes",
      icon: "Users",
      href: "/admin/clientes",
    },
		{
			title: "Reservas",
			icon: "Settings",
			href: "/admin/reservas", // ONLY TO DETERMINE ACTIVE, IS NOT LINKING
			subItems: [
        {
          title: "Ver Reservas",
          href: "/admin/reservas?" + SUBITEM_SEARCH_PARAM + "=lista",
        },
        {
          title: "Calendario",
          href: "/admin/reservas?" + SUBITEM_SEARCH_PARAM + "=calendario",
        },
        {
          title: "Gestión de Disponibilidad",
          href: "/admin/reservas?" + SUBITEM_SEARCH_PARAM + "=disponibilidad",
        },
			],
		},
		{
			title: "Roles de la app",
			icon: "Users",
			href: "/users",
		},
		{
			title: "Alertas",
			icon: "Bell",
			href: "/alerts",
		},
		{
			title: "Seguridad",
			icon: "ShieldCheck",
			href: "/secutiry",
		},
	],
	links: {
		github: "https://github.com/nextui-org/nextui",
		twitter: "https://twitter.com/getnextui",
		docs: "https://nextui.org",
		discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev"
	},
};
