import {
  ChartPieSlice,
  Bell,
  ChartLineUp,
  Database,
  Gear,
  User,
} from "@phosphor-icons/react/dist/ssr";

const navItems = [
  { label: "Overview", icon: ChartPieSlice, href: "/" },
  { label: "Alerts", icon: Bell, href: "/alerts", badge: 3 },
  { label: "Theme View", icon: ChartLineUp, href: "/themes" },
  { label: "Pipeline Health", icon: Database, href: "/pipeline" },
];

export default function Sidebar({ activePath = "/" }: { activePath?: string }) {
  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {/* Wordmark */}
      <div className="flex h-14 items-center border-b border-zinc-200 px-5 dark:border-zinc-800">
        <span className="font-mono text-sm font-semibold tracking-widest text-zinc-900 dark:text-zinc-100">
          STELLAR
          <span className="text-blue-500">FLUX</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {navItems.map(({ label, icon: Icon, href, badge }) => {
          const active = href === activePath;
          return (
          <a
            key={href}
            href={href}
            className={[
              "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300",
            ].join(" ")}
          >
            <Icon
              size={16}
              weight={active ? "fill" : "regular"}
              className={
                active
                  ? "text-blue-500"
                  : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-600 dark:group-hover:text-zinc-400"
              }
            />
            <span className="flex-1">{label}</span>
            {badge !== undefined && (
              <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500/15 px-1 font-mono text-[10px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                {badge}
              </span>
            )}
          </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center gap-3 rounded-md px-3 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <User size={12} className="text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Autonomy Capital
            </p>
            <p className="truncate font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
              analyst
            </p>
          </div>
          <Gear
            size={14}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400"
          />
        </div>
      </div>
    </aside>
  );
}
