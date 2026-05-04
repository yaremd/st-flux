import Sidebar from "@/components/Sidebar";
import InsightsClient from "@/components/insights/InsightsClient";

export default function InsightsPage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/insights" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <InsightsClient />
      </main>
    </div>
  );
}
