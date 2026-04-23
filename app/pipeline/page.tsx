import Sidebar from "@/components/Sidebar";
import PipelineClient from "@/components/pipeline/PipelineClient";

export default function PipelinePage() {
  return (
    <div className="flex h-full bg-zinc-100 dark:bg-zinc-950">
      <Sidebar activePath="/pipeline" />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PipelineClient />
      </main>
    </div>
  );
}
