import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  singleSelect?: boolean;
}

export default function MultiSelectFilter({ label, options, selected, onChange, singleSelect = false }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val: string) => {
    if (singleSelect) {
      onChange(selected.includes(val) ? [] : [val]);
      setOpen(false);
    } else {
      onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        className={cn("h-8 text-xs gap-1 min-w-[130px] justify-between", selected.length > 0 && "border-primary")}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">
          {selected.length === 0 ? `All ${label}` : `${label}`}
        </span>
        {selected.length > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px] rounded-sm">
            {selected.length}
          </Badge>
        )}
        {selected.length > 0 ? (
          <X className="w-3 h-3 ml-1 shrink-0" onClick={clearAll} />
        ) : (
          <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
        )}
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md min-w-[180px] max-h-[240px] overflow-auto p-1">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm cursor-pointer hover:bg-accent"
            >
              {singleSelect ? (
                <div className={cn("h-3.5 w-3.5 rounded-full border border-primary flex items-center justify-center", selected.includes(opt) && "bg-primary")}>
                  {selected.includes(opt) && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
              ) : (
                <Checkbox
                  checked={selected.includes(opt)}
                  onCheckedChange={() => toggle(opt)}
                  className="h-3.5 w-3.5"
                />
              )}
              <span onClick={() => toggle(opt)}>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
