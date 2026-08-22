// ShopPilot AI — Header Component

interface HeaderProps {
  apiStatus: "unknown" | "ok" | "error";
}

export function Header({ apiStatus }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg
              className="w-4.5 h-4.5 text-white"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-white text-sm tracking-tight">ShopPilot</span>
            <span className="font-semibold text-indigo-400 text-sm tracking-tight"> AI</span>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              apiStatus === "ok"
                ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400"
                : apiStatus === "error"
                  ? "bg-red-950/60 border-red-800/60 text-red-400"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === "ok"
                  ? "bg-emerald-400"
                  : apiStatus === "error"
                    ? "bg-red-400"
                    : "bg-slate-500"
              }`}
            />
            {apiStatus === "ok" ? "API Connected" : apiStatus === "error" ? "API Offline" : "Connecting…"}
          </div>
        </div>
      </div>
    </header>
  );
}
