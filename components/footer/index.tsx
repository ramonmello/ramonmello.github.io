"use client";

import { usePathname } from "next/navigation";
import { HomeFooter } from "./homeFooter";
import { DefaultFooter } from "./defaultFooter";

export function Footer() {
  const pathname = usePathname();

  console.log("######### pathname ############", pathname);

  if (pathname === "/") {
    return <HomeFooter />;
  }

  return <DefaultFooter />;
}
