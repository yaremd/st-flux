import Sidebar from "@/components/Sidebar";
import AlertsClient from "@/components/alerts/AlertsClient";

export default function AlertsPage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/alerts" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AlertsClient />
      </main>
    </div>
  );
}
