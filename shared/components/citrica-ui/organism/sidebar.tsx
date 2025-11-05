"use client";
import type { SidebarProps, MenuItem } from "../../../types/sidebar";

import React from "react";
import { Suspense } from "react";
import { Button } from "@heroui/react";
import { Icon, Text } from "@citrica-ui";
import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { IconName } from "@/shared/components/citrica-ui/atoms/icon";
import { getParamFromPath } from "@/shared/utils/general";
import { siteConfig } from "@/config/site";

const SUBLINK_SEARCH_PARAM = siteConfig.subItemSearchParam;

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: MenuItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get(SUBLINK_SEARCH_PARAM) || "";

  return (
    <div>
      <Button
        className={`w-full justify-between px-4 py-2 transition-colors hover:bg-[var(--color-surface-container-high)]`}
        variant="light"
        onPress={onToggle}
      >
        <span className="flex items-center gap-2">
          <Icon name={item.icon as IconName} size={20} />
          <Text variant="label">{item.title}</Text>
        </span>
        <Icon name="ChevronDown" className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
      {isOpen && item.subItems && (
        <div className="ml-6 mt-2 flex flex-col gap-2">
          {item.subItems.map((subItem) => (
            <Button
              key={subItem.title}
              className={`w-full justify-start px-4 py-2 transition-colors hover:bg-[var(--color-surface-container-high)] ${getParamFromPath(subItem.href, SUBLINK_SEARCH_PARAM) === queryParam ? "bg-[var(--color-surface-container-high)]" : ""}`}
              variant="light"
              onPress={(e) => {
                router.push(subItem.href);
              }}
            >
              <Text variant="label">{subItem.title}</Text>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ items }: SidebarProps) {
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});
  const [isCompact, setIsCompact] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const NavItems = ({ compact = false }: { compact?: boolean }) => (
    <div className={`w-full h-full overflow-y-auto py-4 bg-[var(--color-surface-bright)] ${compact ? 'px-1' : 'px-2'}`}>
      <div className={`${compact ? 'flex justify-center mb-4' : ''}`}>
        {compact ? (
          <div className="w-8 h-8 bg-[#964f20] rounded flex items-center justify-center">
            <Text variant="label" color="white" className="font-bold text-sm">L</Text>
          </div>
        ) : (
          <img src="/img/citrica-logo.png" alt="Citrica Logo" className="m-4 h-10 w-auto" />
        )}
      </div>
      {items.map((item) => (
        <div key={item.title} className="mb-2">
          {item.subItems && !compact ? (
            <Suspense fallback={<div>Cargando...</div>}>
              <AccordionItem
                isOpen={openItems[item.title] || item.href == pathname || false}
                item={item}
                onToggle={() => toggleItem(item.title)}
              />
            </Suspense>
          ) : (
            <Button
              className={`w-full transition-colors hover:bg-[var(--color-surface-container-high)] ${item.href === pathname ? "bg-[var(--color-surface-container-high)]" : ""} ${
                compact 
                  ? 'justify-center p-2 h-10 min-w-10' 
                  : 'justify-start gap-2 px-4 py-2'
              }`}
              variant="light"
              onPress={() => {
                if (item.href && item.href !== "#") {
                  router.push(item.href);
                } else if (item.subItems && compact) {
                  // En modo compacto, expandir temporalmente al hacer clic en items con subItems
                  setIsCompact(false);
                  setTimeout(() => setIsCompact(true), 3000);
                }
              }}
              title={compact ? item.title : undefined}
            >
              <Icon name={item.icon as IconName} size={20} />
              {!compact && (
                <Text color="on-primary" variant="label">
                  {item.title}
                </Text>
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  // Auto-compact on mobile
  React.useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 1279); // 768px is md breakpoint
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Compact Sidebar for Mobile / Full Sidebar for Desktop */}
      <div className={`h-screen border-r bg-[var(--color-surface-bright)] transition-all duration-300 ${
        isCompact ? 'w-16' : 'w-72'
      }`}>
        <NavItems compact={isCompact} />
      </div>
    </>
  );
}
