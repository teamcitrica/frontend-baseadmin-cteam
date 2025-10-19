import SectionTypography from "./components/section-typography";
import SectionSkeleton from "../home/components/section-skeleton";
import { Header, Text } from "@citrica-ui";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const logo = (
    <>
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 bg-[#964f20] rounded-sm flex items-center justify-center">
          <Text variant="label" color="#FFFFFF" weight="bold">L</Text>
        </div>
        <div className="w-2 h-8 bg-[#8d957e] rounded-sm"></div>
      </div>
      <div>
        <Text 
          variant="subtitle" 
          textColor="color-on-surface"
          weight="bold"
        >
          LIENZO
        </Text>
      </div>
    </>
  );

  return (
    <>
      <Header logo={logo} />
      <section>
        <SectionTypography />
        <SectionSkeleton />
      </section>
    </>
  );
}