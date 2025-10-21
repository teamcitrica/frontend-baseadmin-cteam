import "@/styles/globals.scss";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from "../shared/providers";
import SupabaseProvider from "./context/supabase-context";
import { AuthContextProvider } from "./context/auth-context";
import { AvailabilityProvider } from "./api/contexts/AvailabilityContext";
// import { Toaster } from 'react-hot-toast';

 
// import Header from "@ui/organism/header";



export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s -${siteConfig.name}`,
	},
	description: siteConfig.description,
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head />
			<body
			>
				{/* <Toaster/>  SE CAMBIÓ POR HEROUI TOAST*/}
				<SupabaseProvider>
					<AuthContextProvider>
						<AvailabilityProvider>
							<Providers themeProps={{ attribute: "data-theme", defaultTheme: "light" }}>
								{/* <Navbar /> */}
								{children}
							</Providers>
						</AvailabilityProvider>
					</AuthContextProvider>
				</SupabaseProvider>
			</body>
		</html>
	);
}
					
						
