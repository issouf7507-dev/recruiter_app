"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

interface SidebarBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    subItems?: Array<{
      label: string;
      href: string;
    }>;
  };
}

export function Sidebar({ open, setOpen, children }: SidebarProps) {
  return (
    <motion.div
      animate={{
        width: open ? "280px" : "80px",
        transition: { duration: 0.3, ease: "easeInOut" },
      }}
      className={cn(
        "relative min-h-screen border-r border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 flex flex-col p-4"
      )}
    >
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer absolute -right-3 top-10 rounded-full w-6 h-6 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-neutral-300 dark:hover:bg-neutral-600"
      >
        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </div>
      {children}
    </motion.div>
  );
}

export function SidebarBody({
  children,
  className,
  ...props
}: SidebarBodyProps) {
  return (
    <div className={cn("flex h-full flex-col", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarLink({ link }: SidebarLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Link
        href={link.href}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-500 transition-colors hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
          isHovered && "text-neutral-900 dark:text-neutral-50",
          link.subItems && "cursor-pointer"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          if (link.subItems) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {link.icon}
        <span className="text-sm font-medium">{link.label}</span>
        {link.subItems && (
          <ChevronRight
            className={cn(
              "ml-auto h-4 w-4 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        )}
      </Link>
    </div>
  );
}
