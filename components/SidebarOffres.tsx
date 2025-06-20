"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarOffresProps {
  offres: any[];
  selectedId: string | number;
  isLoading?: boolean;
}

export default function SidebarOffres({
  offres,
  selectedId,
  isLoading = false,
}: SidebarOffresProps) {
  const pathname = usePathname();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    // Reset loading state when pathname changes
    setLoadingId(null);
  }, [pathname]);

  const handleClick = (id: string) => {
    setLoadingId(id);
  };

  return (
    <div className="w-3xs border p-2 h-full overflow-y-auto">
      <div className="p-4 font-bold text-lg ">Mes Offres</div>

      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
            Chargement...
          </div>
        ) : (
          offres?.map((offre) => (
            <div key={offre.id}>
              <div
                className={`
                  cursor-pointer p-1 rounded-md

                  ${
                    String(selectedId) === String(offre.id)
                      ? "bg-primary text-white"
                      : "hover:bg-muted"
                  }`}
              >
                <Link
                  href={`/mesoffres/${offre.id}`}
                  //   onClick={() => handleClick(offre.id)}
                  className="flex items-center justify-between"
                >
                  <span className="text-[14px]">{offre.title}</span>
                  {/* {loadingId === offre.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )} */}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
