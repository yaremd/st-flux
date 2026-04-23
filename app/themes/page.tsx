import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import ThemesClient from "@/components/themes/ThemesClient";

export default function ThemesPage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/themes" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Suspense>
          <ThemesClient />
        </Suspense>
      </main>
    </div>
  );
}
