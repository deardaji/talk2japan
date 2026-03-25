"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, HomeIcon, ReviewIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "首页", icon: HomeIcon, match: (pathname: string) => pathname === "/" || pathname.startsWith("/scenes") },
  { href: "/review", label: "复习", icon: ReviewIcon, match: (pathname: string) => pathname.startsWith("/review") },
  { href: "/cards", label: "词本", icon: BookIcon, match: (pathname: string) => pathname.startsWith("/cards") }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[rgba(255,252,246,0.92)] px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[24px] bg-white/80 px-2 py-2 shadow-soft">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[78px] flex-col items-center gap-1 rounded-[18px] px-3 py-2 text-xs transition",
                active ? "bg-warm text-accentStrong" : "text-soft"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
