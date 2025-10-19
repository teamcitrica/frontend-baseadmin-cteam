"use client";
import SectionTypography from "./home/components/section-typography";
import SectionSkeleton from "./home/components/section-skeleton";
import { Header, Text } from "@citrica-ui";
import useHomeHooks from "./home/hooks/hooks-home";
import FormComponentsExample from "@/shared/components/examples/form-components-example";

export const dynamic = 'force-dynamic'

export default function Home() {
  const { ctaOnClick } = useHomeHooks();
  const logo = (
    <>
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 bg-[#964f20] rounded-sm flex items-center justify-center">
          <Text variant="label" color="#FFFFFF" weight="bold">L</Text>
        </div>
      </div>
      <div className="ml-2">
        <Text 
          variant="subtitle" 
          textColor="color-on-surface"
          weight="bold"
        >
          BASE LOGO
        </Text>
      </div>
    </>
  );

  return (
    <>
      <Header logo={logo} variant="split" showButton buttonText="Helo" onButtonClick={ctaOnClick}/>
      <section className="pt-[64px]">
        <SectionTypography />
        <SectionSkeleton />
      </section>
      <section className="pt-[64px]">
        <FormComponentsExample />
      </section>
      <section className="pt-[64px]">
        <SectionTypography />
        <SectionSkeleton />
      </section>
    </>
  );
}