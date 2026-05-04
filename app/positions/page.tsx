import Sidebar from "@/components/Sidebar";
import PositionsClient from "@/components/positions/PositionsClient";

export default function PositionsPage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/positions" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PositionsClient />
      </main>
    </div>
  );
}
