import Sidebar from "@/components/Sidebar";
import ScalingClient from "@/components/scaling/ScalingClient";

export default function ScalingPage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/scaling" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ScalingClient />
      </main>
    </div>
  );
}
