"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";

export default function ToastDeletedAccount() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("account") === "deleted") {
      // use setTimeout to avoid double rendering
      const timer = setTimeout(() => {
        toast("Votre compte a été supprimé avec succès.");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [params]);

  return <Toaster position="top-right" />;
}
