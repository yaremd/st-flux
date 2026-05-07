import { Suspense } from "react";
import ThemesClient from "@/components/themes/ThemesClient";

export default function ThemesPage() {
  return (
    <div className="h-full">
      <Suspense>
        <ThemesClient />
      </Suspense>
    </div>
  );
}
