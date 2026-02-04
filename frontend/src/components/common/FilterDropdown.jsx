import { ChevronDown } from "lucide-react";

/**
 * options format:
 * {
 *   KEY: { label: "Texte", color: "bg-... text-... border-...", icon: IconComponent }
 * }
 */
export default function FilterDropdown({
  value,
  onChange,
  options,
  openKey,
  setOpenKey,
  dropdownKey,
  widthClass = "w-[180px]",
  allKey = "ALL",
}) {
  const current = options[value] || options[allKey];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenKey(openKey === dropdownKey ? null : dropdownKey)}
        className={[
          "flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm transition-all",
          "focus:outline-none focus:ring-2 focus:ring-slate-950",
          widthClass,
          current.color,
          value === allKey ? "border-slate-200" : "border",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon ? <Icon className="h-4 w-4" /> : null}
          <span className="truncate">{current.label}</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {openKey === dropdownKey && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpenKey(null)} />
          <div className="absolute top-full mt-2 left-0 z-20 rounded-md border border-slate-200 bg-white shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
            <div className={["", widthClass].join(" ")}>
              {Object.entries(options).map(([key, style]) => {
                const OptIcon = style.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onChange(key);
                      setOpenKey(null);
                    }}
                    className={[
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors",
                      value === key ? "bg-slate-100 font-medium" : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "p-1 rounded-full border",
                        key === allKey ? "bg-slate-100 border-slate-200" : style.color,
                      ].join(" ")}
                    >
                      {OptIcon ? <OptIcon className="h-3 w-3" /> : null}
                    </div>
                    <span className="text-slate-700">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
