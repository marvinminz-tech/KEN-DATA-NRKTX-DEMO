import React, { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNav from "@/components/TopNav";
import { PPGS, KPI_ROWS, SECTION_LABELS, generateWeekColumns, generateWeeklyData, formatCellValue, recalculateWeek, WeeklyData } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Download, Upload, FileDown, FileSpreadsheet, Save, Send } from "lucide-react";
import ExcelUploadModal from "@/components/ExcelUploadModal";
import MultiSelectFilter from "@/components/MultiSelectFilter";
import CustomScrollbar from "@/components/CustomScrollbar";
import { useAuth } from "@/context/AuthContext";

export default function PlanningGrid() {
  const { ppgId } = useParams<{ ppgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isManager } = useAuth();

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPPGs, setSelectedPPGs] = useState<string[]>([]);

  const [viewFromCurrentWeek, setViewFromCurrentWeek] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const filterOptions = useMemo(() => ({
    customers: [...new Set(PPGS.map((p) => p.customer))].sort(),
    categories: [...new Set(PPGS.map((p) => p.category))].sort(),
    brands: [...new Set(PPGS.map((p) => p.brand))].sort(),
    ppgNames: [...new Set(PPGS.map((p) => p.ppgName))].sort(),
  }), []);

  const filteredPPGs = useMemo(() => {
    let list = [...PPGS];
    if (selectedCustomers.length > 0) list = list.filter((p) => selectedCustomers.includes(p.customer));
    if (selectedCategories.length > 0) list = list.filter((p) => selectedCategories.includes(p.category));
    if (selectedBrands.length > 0) list = list.filter((p) => selectedBrands.includes(p.brand));
    if (selectedPPGs.length > 0) list = list.filter((p) => selectedPPGs.includes(p.ppgName));
    return list;
  }, [selectedCustomers, selectedCategories, selectedBrands, selectedPPGs]);

  const ppgIndex = filteredPPGs.findIndex((p) => p.id === ppgId);
  const ppg = PPGS.find((p) => p.id === ppgId);
  const prevPPG = ppgIndex > 0 ? filteredPPGs[ppgIndex - 1] : null;
  const nextPPG = ppgIndex < filteredPPGs.length - 1 ? filteredPPGs[ppgIndex + 1] : null;

  // Determine if we're in aggregated (roll-up) mode
  const isAggregated = filteredPPGs.length > 1 && filteredPPGs.length !== PPGS.length;

  // Aggregated data across all filtered PPGs
  const aggregatedData = useMemo<WeeklyData>(() => {
    if (!isAggregated) return {};
    const allData = filteredPPGs.map((p) => generateWeeklyData(p.id));
    const result: WeeklyData = {};
    for (let w = 1; w <= 52; w++) {
      const week = `w${w}`;
      const merged: Record<string, number | string> = {};
      const kpiIds = KPI_ROWS.map((k) => k.id);
      for (const kpiId of kpiIds) {
        const kpi = KPI_ROWS.find((k) => k.id === kpiId)!;
        if (kpi.format === "dropdown") {
          // For dropdowns, show "Mixed" if values differ
          const vals = allData.map((d) => d[week]?.[kpiId]);
          const unique = [...new Set(vals)];
          merged[kpiId] = unique.length === 1 ? unique[0] : "Mixed";
        } else if (kpi.id === "avg_non_promo_price" || kpi.id === "planned_promo_price" || kpi.id === "list_price" || kpi.id === "store_landed_cost" || kpi.id === "margin_per_unit") {
          // Average price-type fields
          const vals = allData.map((d) => Number(d[week]?.[kpiId] || 0));
          merged[kpiId] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
        } else if (kpi.id === "pct_margin") {
          // Weighted average for percentage
          const totalSales = allData.reduce((sum, d) => sum + Number(d[week]?.total_forecasted_sales || 0), 0);
          const totalMargin = allData.reduce((sum, d) => sum + Number(d[week]?.total_margin || 0), 0);
          merged[kpiId] = totalSales > 0 ? Math.round((totalMargin / totalSales) * 1000) / 10 : 0;
        } else {
          // Sum all numeric fields
          merged[kpiId] = allData.reduce((sum, d) => sum + Number(d[week]?.[kpiId] || 0), 0);
        }
      }
      result[week] = merged;
    }
    return result;
  }, [isAggregated, filteredPPGs]);

  const [singlePPGData, setSinglePPGData] = useState<WeeklyData>(() => generateWeeklyData(ppgId || "ppg1"));
  const data = isAggregated ? aggregatedData : singlePPGData;
  const setData = setSinglePPGData;

  const [status, setStatus] = useState(ppg?.status || "Not Started");
  const [hasChanges, setHasChanges] = useState(false);
  const [dateRange, setDateRange] = useState("full");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editingCell, setEditingCell] = useState<{ week: string; kpi: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const weeks = useMemo(() => {
    const all = generateWeekColumns(2026);
    if (dateRange === "full") return all;
    if (dateRange.startsWith("Q")) {
      const q = parseInt(dateRange[1]);
      const start = (q - 1) * 13 + 1;
      return all.filter((w) => w.weekNum >= start && w.weekNum < start + 13);
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mi = months.indexOf(dateRange);
    if (mi >= 0) {
      const approxStart = Math.round((mi / 12) * 52) + 1;
      const approxEnd = Math.round(((mi + 1) / 12) * 52);
      return all.filter((w) => w.weekNum >= approxStart && w.weekNum <= approxEnd);
    }
    return all;
  }, [dateRange]);

  // Find the current week number
  const currentWeekNum = useMemo(() => {
    const allWeeks = generateWeekColumns(2026);
    const now = new Date();
    // Find the first non-past week (current week)
    const current = allWeeks.find((w) => !w.isPast);
    return current ? current.weekNum : 1;
  }, []);

  // Auto-scroll to current week
  useEffect(() => {
    if (viewFromCurrentWeek && gridRef.current) {
      const timer = setTimeout(() => {
        const hScroll = document.getElementById('grid-horizontal-scroll');
        const currentWeekEl = hScroll?.querySelector(`[data-week="${currentWeekNum}"]`) as HTMLElement | null;
        if (currentWeekEl && hScroll) {
          // Offset by the frozen KPI label column width (220px) so current week isn't hidden behind it
          const colOffset = currentWeekEl.offsetLeft - 220;
          hScroll.scrollLeft = Math.max(0, colOffset);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewFromCurrentWeek, currentWeekNum, ppgId, dateRange]);

  const handleCellEdit = useCallback(
    (week: string, kpiId: string, value: string) => {
      setData((prev) => {
        const weekData = { ...prev[week], [kpiId]: kpiId === "planned_promo_mechanic" ? value : parseFloat(value) || 0 };
        const recalced = recalculateWeek(weekData);
        return { ...prev, [week]: recalced };
      });
      setHasChanges(true);
    },
    []
  );

  const handleSave = () => {
    setStatus("Saved");
    setHasChanges(false);
    toast({ title: "Plan Saved", description: `${ppg?.ppgName} has been saved successfully.` });
  };

  const handlePublish = () => {
    setStatus("Published");
    setHasChanges(false);
    toast({ title: "Plan Published", description: `${ppg?.ppgName} has been published.` });
  };

  const tryNavigate = (id: string) => {
    if (hasChanges) {
      setPendingNavId(id);
      setShowUnsavedDialog(true);
    } else {
      navigate(`/plan/${id}`);
    }
  };

  const confirmNavigation = () => {
    setShowUnsavedDialog(false);
    if (pendingNavId) navigate(`/plan/${pendingNavId}`);
  };

  useEffect(() => {
    if (editingCell && inputRef.current) inputRef.current.focus();
  }, [editingCell]);

  // Reset data when ppgId changes
  useEffect(() => {
    if (ppgId) {
      setSinglePPGData(generateWeeklyData(ppgId));
      setStatus(PPGS.find((p) => p.id === ppgId)?.status || "Not Started");
      setHasChanges(false);
    }
  }, [ppgId]);

  if (!ppg) return <div className="p-8 text-center">PPG not found</div>;

  const sections = ["volume", "pricing", "rebates", "margin"] as const;
  const sectionColors: Record<string, string> = {
    volume: "bg-[hsl(var(--grid-section-volume))]",
    pricing: "bg-[hsl(var(--grid-section-pricing))]",
    rebates: "bg-[hsl(var(--grid-section-rebates))]",
    margin: "bg-[hsl(var(--grid-section-margin))]",
  };

  const statusColor: Record<string, string> = {
    "Not Started": "bg-muted text-muted-foreground",
    Saved: "bg-kenvue-yellow/20 text-kenvue-yellow border-kenvue-yellow/30",
    Published: "bg-status-published/15 text-status-published border-status-published/30",
  };

  const renderCell = (week: string, kpi: typeof KPI_ROWS[0], isPast: boolean) => {
    const weekData = data[week];
    if (!weekData) return <td key={`${week}-${kpi.id}`} className="grid-cell grid-cell-readonly" />;

    const value = weekData[kpi.id];
    const isEditable = kpi.editable && !isPast && !isAggregated;
    const isEditing = editingCell?.week === week && editingCell?.kpi === kpi.id;
    const isBold = kpi.id === "total_forecasted_sales" || kpi.id === "total_margin" || kpi.id === "pct_margin";
    const isNegative = typeof value === "number" && value < 0 && (kpi.id === "total_margin" || kpi.id === "margin");

    if (isEditing && kpi.format === "dropdown") {
      const isCustomEntry = kpi.id === "planned_promo_mechanic" && String(value) === "Custom";
      if (isCustomEntry) {
        return (
          <td key={`${week}-${kpi.id}`} className="grid-cell grid-cell-editable p-0">
            <input
              ref={inputRef}
              type="text"
              className="w-full h-full text-xs bg-transparent border-none outline-none px-2"
              placeholder="Enter custom mechanic..."
              onBlur={(e) => { handleCellEdit(week, kpi.id, e.target.value || "None"); setEditingCell(null); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCellEdit(week, kpi.id, (e.target as HTMLInputElement).value || "None");
                  setEditingCell(null);
                }
                if (e.key === "Escape") { handleCellEdit(week, kpi.id, "None"); setEditingCell(null); }
              }}
              autoFocus
            />
          </td>
        );
      }
      return (
        <td key={`${week}-${kpi.id}`} className="grid-cell grid-cell-editable p-0">
          <select
            className="w-full h-full text-xs bg-transparent border-none outline-none px-2"
            value={kpi.dropdownOptions?.includes(String(value)) ? String(value) : "Custom"}
            onChange={(e) => {
              if (e.target.value === "Custom") {
                handleCellEdit(week, kpi.id, "Custom");
              } else {
                handleCellEdit(week, kpi.id, e.target.value);
                setEditingCell(null);
              }
            }}
            onBlur={() => setEditingCell(null)}
            autoFocus
          >
            {kpi.dropdownOptions?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </td>
      );
    }

    if (isEditing) {
      return (
        <td key={`${week}-${kpi.id}`} className="grid-cell grid-cell-editable p-0">
          <input
            ref={inputRef}
            type="number"
            className="w-full h-full text-xs bg-transparent border-none outline-none px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            defaultValue={typeof value === "number" ? value : ""}
            onBlur={(e) => { handleCellEdit(week, kpi.id, e.target.value); setEditingCell(null); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                handleCellEdit(week, kpi.id, (e.target as HTMLInputElement).value);
                setEditingCell(null);
              }
              if (e.key === "Escape") setEditingCell(null);
            }}
          />
        </td>
      );
    }

    const formattedValue = formatCellValue(value as number | string, kpi.format);

    return (
      <td
        key={`${week}-${kpi.id}`}
        className={`grid-cell ${isEditable ? "grid-cell-editable" : isPast ? "grid-cell-past" : "grid-cell-readonly"} ${isBold ? "font-semibold" : ""} ${isNegative ? "text-destructive" : ""}`}
        onClick={() => isEditable && setEditingCell({ week, kpi: kpi.id })}
      >
        {isEditable ? <span className="cell-value">{formattedValue}</span> : formattedValue}
      </td>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30 overflow-hidden">
      <TopNav />
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <button onClick={() => navigate("/dashboard")} className="hover:text-foreground">My Accounts</button>
          <span>/</span>
          {isAggregated ? (
            <span className="text-foreground font-medium">Aggregated View ({filteredPPGs.length} PPGs)</span>
          ) : (
            <>
              <span>{ppg.customer}</span>
              <span>/</span>
              <span>{ppg.category}</span>
              <span>/</span>
              <span>{ppg.brand}</span>
              <span>/</span>
              <span className="text-foreground font-medium">{ppg.ppgName}</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{isAggregated ? `Roll-Up: ${filteredPPGs.length} PPGs` : ppg.ppgName}</h2>
            {!isAggregated && <Badge variant="outline" className={statusColor[status]}>{status}</Badge>}
            {isAggregated && <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Aggregated</Badge>}
            {hasChanges && !isAggregated && <span className="text-xs text-kenvue-yellow font-medium">● Unsaved changes</span>}
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Year</SelectItem>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><Download className="w-3 h-3" /> Template</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setShowUpload(true)}>
              <Upload className="w-3 h-3" /> Upload
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><FileDown className="w-3 h-3" /> PDF</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"><FileSpreadsheet className="w-3 h-3" /> Excel</Button>
            <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave}><Save className="w-3 h-3" /> Save</Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1 bg-kenvue-coral hover:bg-kenvue-coral/90 text-white"
              onClick={handlePublish}
              disabled={status === "Not Started"}
            >
              <Send className="w-3 h-3" /> Publish
            </Button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <MultiSelectFilter label="Customers" options={filterOptions.customers} selected={selectedCustomers} onChange={setSelectedCustomers} singleSelect={!isManager} />
          <MultiSelectFilter label="Categories" options={filterOptions.categories} selected={selectedCategories} onChange={setSelectedCategories} singleSelect={!isManager} />
          <MultiSelectFilter label="Brands" options={filterOptions.brands} selected={selectedBrands} onChange={setSelectedBrands} singleSelect={!isManager} />
          <MultiSelectFilter label="PPGs" options={filterOptions.ppgNames} selected={selectedPPGs} onChange={setSelectedPPGs} singleSelect={!isManager} />

          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              id="viewCurrentWeek"
              checked={viewFromCurrentWeek}
              onCheckedChange={(checked) => setViewFromCurrentWeek(checked === true)}
              className="h-3.5 w-3.5"
            />
            <label htmlFor="viewCurrentWeek" className="text-xs text-muted-foreground cursor-pointer select-none">
              View from Current Week
            </label>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden relative flex flex-col" ref={gridRef}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden" id="grid-vertical-scroll"
          onScroll={(e) => {
            const hScroll = document.getElementById('grid-horizontal-scroll');
            if (hScroll) hScroll.scrollTop = e.currentTarget.scrollTop;
          }}
        >
          <div className="overflow-x-auto grid-scroll-hidden" id="grid-horizontal-scroll"
            onScroll={(e) => {
              const syncBar = document.getElementById('grid-sync-scrollbar');
              if (syncBar) syncBar.scrollLeft = e.currentTarget.scrollLeft;
            }}
          >
            <table className="border-collapse" style={{ minWidth: weeks.length * 90 + 220 }}>
              {/* Sticky header */}
              <thead className="sticky top-0 z-20">
                <tr className="bg-card">
                  <th className="grid-kpi-label bg-card border-b-2 border-border z-30 text-left text-xs font-semibold text-muted-foreground">
                    KPI Metric
                  </th>
                  {weeks.map((w) => (
                    <th
                      key={w.weekNum}
                      data-week={w.weekNum}
                      className={`grid-cell text-center text-[11px] font-medium border-b-2 border-border ${w.isPast ? "grid-cell-past" : "bg-card"} ${w.weekNum === currentWeekNum ? "ring-2 ring-inset ring-primary/40" : ""}`}
                    >
                      <div className="leading-tight">
                        <div className="font-semibold">{w.label}</div>
                        <div className="text-muted-foreground text-[10px]">{w.dateRange}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => {
                  const rows = KPI_ROWS.filter((r) => r.section === section);
                  return (
                    <React.Fragment key={section}>
                      {/* Section header */}
                      <tr>
                        <td
                          className={`grid-section-header ${sectionColors[section]} font-bold text-xs`}
                        >
                          {SECTION_LABELS[section]}
                        </td>
                        {weeks.map((w) => (
                          <td key={w.weekNum} className={`${sectionColors[section]} border-b border-border`} style={{ height: 28 }} />
                        ))}
                      </tr>
                      {/* KPI rows */}
                      {rows.map((kpi) => (
                        <tr key={kpi.id}>
                          <td className={`grid-kpi-label ${kpi.editable ? "" : ""}`}>
                            {kpi.label}
                            {kpi.editable && <span className="text-primary ml-1 text-[10px]">✎</span>}
                          </td>
                          {weeks.map((w) => renderCell(`w${w.weekNum}`, kpi, w.isPast))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Custom always-visible scrollbar */}
        <CustomScrollbar gridScrollId="grid-horizontal-scroll" totalWidth={weeks.length * 90 + 220} />
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-6 py-2 flex items-center justify-between shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1"
          disabled={!prevPPG}
          onClick={() => prevPPG && tryNavigate(prevPPG.id)}
        >
          <ChevronLeft className="w-3 h-3" /> Previous PPG
        </Button>
        <span className="text-xs text-muted-foreground">
          {ppgIndex >= 0 ? ppgIndex + 1 : "—"} of {filteredPPGs.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1"
          disabled={!nextPPG}
          onClick={() => nextPPG && tryNavigate(nextPPG.id)}
        >
          Next PPG <ChevronRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Unsaved Changes Dialog */}
      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>You have unsaved changes. Save before leaving?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={confirmNavigation}>Discard & Leave</Button>
            <Button onClick={() => { handleSave(); confirmNavigation(); }}>Save & Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Modal */}
      <ExcelUploadModal open={showUpload} onClose={() => setShowUpload(false)} onImport={() => {
        toast({ title: "Import Successful", description: "Data has been imported into the planning grid." });
        setShowUpload(false);
        setHasChanges(true);
      }} />
    </div>
  );
}
