import { format, startOfYear, addWeeks, addDays } from "date-fns";

export type UserRole = "KAM" | "Manager" | "Admin";
export type PPGStatus = "Not Started" | "Saved" | "Published";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedCustomers: string[];
  assignedCategories: string[];
  assignedBrands: string[];
  active: boolean;
}

export interface PPG {
  id: string;
  customer: string;
  category: string;
  brand: string;
  ppgName: string;
  status: PPGStatus;
  lastEdited: string;
  assignedUser: string;
  lastPublished?: string;
}

export interface WeekColumn {
  weekNum: number;
  label: string;
  dateRange: string;
  isPast: boolean;
}

export interface KPIRow {
  id: string;
  label: string;
  section: "volume" | "pricing" | "rebates" | "margin";
  editable: boolean;
  format: "number" | "currency" | "percent" | "dropdown";
  dropdownOptions?: string[];
}

export const USERS: User[] = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@kenvue.com", role: "KAM", assignedCustomers: ["Walmart", "Target"], assignedCategories: ["Skin Health", "Self Care"], assignedBrands: ["Neutrogena", "Tylenol", "Aveeno"], active: true },
  { id: "u2", name: "James Wilson", email: "james.wilson@kenvue.com", role: "Manager", assignedCustomers: ["Walmart", "Target", "CVS"], assignedCategories: ["Skin Health", "Self Care", "Essential Health", "Baby Care"], assignedBrands: ["Neutrogena", "Tylenol", "Aveeno", "Band-Aid", "Johnson's"], active: true },
  { id: "u3", name: "Maria Garcia", email: "maria.garcia@kenvue.com", role: "Admin", assignedCustomers: ["Walmart", "Target", "CVS"], assignedCategories: ["Skin Health", "Self Care", "Essential Health", "Baby Care"], assignedBrands: ["Neutrogena", "Tylenol", "Aveeno", "Band-Aid", "Johnson's"], active: true },
];

export const PPGS: PPG[] = [
  { id: "ppg1", customer: "Walmart", category: "Skin Health", brand: "Neutrogena", ppgName: "Hydro Boost Gel Cream 1.7oz", status: "Published", lastEdited: "2026-02-20", assignedUser: "u1", lastPublished: "2026-02-18" },
  { id: "ppg2", customer: "Walmart", category: "Skin Health", brand: "Neutrogena", ppgName: "Ultra Sheer SPF 70 3oz", status: "Saved", lastEdited: "2026-02-22", assignedUser: "u1" },
  { id: "ppg3", customer: "Walmart", category: "Self Care", brand: "Tylenol", ppgName: "Extra Strength 500mg 100ct", status: "Not Started", lastEdited: "", assignedUser: "u1" },
  { id: "ppg4", customer: "Walmart", category: "Self Care", brand: "Tylenol", ppgName: "Rapid Release Gels 225mg 80ct", status: "Saved", lastEdited: "2026-02-15", assignedUser: "u1" },
  { id: "ppg5", customer: "Walmart", category: "Skin Health", brand: "Aveeno", ppgName: "Daily Moisturizing Lotion 18oz", status: "Published", lastEdited: "2026-02-10", assignedUser: "u1", lastPublished: "2026-02-10" },
  { id: "ppg6", customer: "Target", category: "Skin Health", brand: "Neutrogena", ppgName: "Makeup Remover Wipes 25ct Twin", status: "Not Started", lastEdited: "", assignedUser: "u1" },
  { id: "ppg7", customer: "Target", category: "Self Care", brand: "Tylenol", ppgName: "Cold & Flu Severe 24ct", status: "Saved", lastEdited: "2026-02-19", assignedUser: "u1" },
  { id: "ppg8", customer: "Target", category: "Skin Health", brand: "Aveeno", ppgName: "Positively Radiant SPF 30 2.5oz", status: "Not Started", lastEdited: "", assignedUser: "u1" },
  { id: "ppg9", customer: "Target", category: "Essential Health", brand: "Band-Aid", ppgName: "Flexible Fabric 100ct", status: "Published", lastEdited: "2026-02-05", assignedUser: "u1", lastPublished: "2026-02-05" },
  { id: "ppg10", customer: "Target", category: "Baby Care", brand: "Johnson's", ppgName: "Baby Shampoo 20.3oz", status: "Saved", lastEdited: "2026-02-21", assignedUser: "u1" },
  { id: "ppg11", customer: "CVS", category: "Skin Health", brand: "Neutrogena", ppgName: "Rapid Wrinkle Repair Serum 1oz", status: "Not Started", lastEdited: "", assignedUser: "u1" },
  { id: "ppg12", customer: "CVS", category: "Self Care", brand: "Tylenol", ppgName: "PM Extra Strength 150ct", status: "Saved", lastEdited: "2026-02-17", assignedUser: "u1" },
  { id: "ppg13", customer: "CVS", category: "Essential Health", brand: "Band-Aid", ppgName: "Hydro Seal Large 6ct", status: "Published", lastEdited: "2026-02-12", assignedUser: "u1", lastPublished: "2026-02-12" },
  { id: "ppg14", customer: "CVS", category: "Baby Care", brand: "Johnson's", ppgName: "CottonTouch Wash & Shampoo 13.6oz", status: "Not Started", lastEdited: "", assignedUser: "u1" },
  { id: "ppg15", customer: "CVS", category: "Skin Health", brand: "Aveeno", ppgName: "Calm + Restore Oat Serum 1oz", status: "Saved", lastEdited: "2026-02-23", assignedUser: "u1" },
];

export const KPI_ROWS: KPIRow[] = [
  // Volume & Sales
  { id: "py_actuals_units", label: "PY Actuals Units", section: "volume", editable: false, format: "number" },
  { id: "cy_actuals_units", label: "CY Actuals Units", section: "volume", editable: false, format: "number" },
  { id: "baseline_units", label: "Baseline Units", section: "volume", editable: false, format: "number" },
  { id: "incremental_units", label: "Incremental Units", section: "volume", editable: true, format: "number" },
  { id: "total_forecasted_units", label: "Total Forecasted Units", section: "volume", editable: false, format: "number" },
  { id: "py_sales", label: "PY Sales $", section: "volume", editable: false, format: "currency" },
  { id: "cy_sales", label: "CY Sales $", section: "volume", editable: false, format: "currency" },
  { id: "baseline_sales", label: "Baseline $", section: "volume", editable: false, format: "currency" },
  { id: "incremental_sales", label: "Incremental $", section: "volume", editable: false, format: "currency" },
  { id: "total_forecasted_sales", label: "Total Forecasted $", section: "volume", editable: false, format: "currency" },
  // Pricing & Mechanics
  { id: "avg_non_promo_price", label: "Avg Non Promo Price", section: "pricing", editable: false, format: "currency" },
  { id: "planned_promo_price", label: "Planned Promo Price Point", section: "pricing", editable: true, format: "currency" },
  { id: "planned_promo_mechanic", label: "Planned Promo Mechanic", section: "pricing", editable: true, format: "dropdown", dropdownOptions: ["None", "TPR", "BOGO", "% Off", "Coupon", "Display", "Feature", "Feature + Display", "Custom"] },
  // Rebates & Allowances
  { id: "py_pos_rebate", label: "PY POS Rebate", section: "rebates", editable: false, format: "currency" },
  { id: "cy_pos_rebate", label: "CY POS Rebate", section: "rebates", editable: false, format: "currency" },
  { id: "planned_pos_rebate", label: "Planned POS Rebate", section: "rebates", editable: true, format: "currency" },
  { id: "acode", label: "ACODE", section: "rebates", editable: true, format: "number" },
  { id: "list_price", label: "List Price", section: "rebates", editable: false, format: "currency" },
  { id: "store_landed_cost", label: "Store Landed Cost", section: "rebates", editable: false, format: "currency" },
  // Margin
  { id: "margin_per_unit", label: "Margin/Unit", section: "margin", editable: false, format: "currency" },
  { id: "margin", label: "Margin", section: "margin", editable: false, format: "currency" },
  { id: "direct_allowance", label: "Direct Allowance", section: "margin", editable: true, format: "currency" },
  { id: "markdowns", label: "Markdowns", section: "margin", editable: true, format: "currency" },
  { id: "forecasted_rebate_spend", label: "Forecasted Rebate Spend", section: "margin", editable: false, format: "currency" },
  { id: "actual_rebate_spend", label: "Actual Rebate Spend", section: "margin", editable: false, format: "currency" },
  { id: "incremental_rebate_spend", label: "Incremental Rebate Spend", section: "margin", editable: false, format: "currency" },
  { id: "total_margin", label: "Total Margin", section: "margin", editable: false, format: "currency" },
  { id: "pct_margin", label: "% Margin", section: "margin", editable: false, format: "percent" },
];

export const SECTION_LABELS: Record<string, string> = {
  volume: "Volume & Sales",
  pricing: "Pricing & Mechanics",
  rebates: "Rebates & Allowances",
  margin: "Margin",
};

export function generateWeekColumns(year: number = 2026): WeekColumn[] {
  const weeks: WeekColumn[] = [];
  const jan1 = startOfYear(new Date(year, 0, 1));
  const currentDate = new Date();

  for (let i = 0; i < 52; i++) {
    const weekStart = addWeeks(jan1, i);
    const weekEnd = addDays(weekStart, 6);
    weeks.push({
      weekNum: i + 1,
      label: `CW ${i + 1}`,
      dateRange: `${format(weekStart, "MMM d")}–${format(weekEnd, "MMM d")}`,
      isPast: weekEnd < currentDate,
    });
  }
  return weeks;
}

// Seed-based pseudo random for deterministic data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export type WeeklyData = Record<string, Record<string, number | string>>;

export function generateWeeklyData(ppgId: string): WeeklyData {
  const seed = ppgId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  const data: WeeklyData = {};
  const basePrice = 8 + rand() * 20;
  const listPrice = basePrice * 1.3;

  for (let w = 1; w <= 52; w++) {
    const week = `w${w}`;
    const isPast = w <= 8; // First 8 weeks of 2026 are past
    const pyUnits = Math.round(800 + rand() * 1200);
    const cyUnits = isPast ? Math.round(pyUnits * (0.9 + rand() * 0.3)) : 0;
    const baselineUnits = Math.round(700 + rand() * 900);
    const incrementalUnits = Math.round(rand() * 400);
    const totalUnits = baselineUnits + incrementalUnits;
    const avgPrice = basePrice * (0.95 + rand() * 0.1);
    const promoPrice = basePrice * 0.85;
    const posRebatePY = Math.round(rand() * 500);
    const posRebateCY = isPast ? Math.round(rand() * 600) : 0;
    const plannedRebate = Math.round(rand() * 400);
    const storeLandedCost = listPrice * 1.04;
    const marginPerUnit = avgPrice - storeLandedCost;
    const totalMargin = marginPerUnit * totalUnits;
    const directAllowance = Math.round(rand() * 200);
    const markdowns = Math.round(rand() * 150);
    const forecastedRebateSpend = plannedRebate * totalUnits * 0.01;
    const actualRebateSpend = isPast ? posRebateCY * cyUnits * 0.01 : 0;
    const incrementalRebateSpend = plannedRebate * incrementalUnits * 0.01;
    const netMargin = totalMargin - directAllowance - markdowns - forecastedRebateSpend;
    const pctMargin = totalUnits > 0 ? (netMargin / (totalUnits * avgPrice)) * 100 : 0;

    data[week] = {
      py_actuals_units: pyUnits,
      cy_actuals_units: cyUnits,
      baseline_units: baselineUnits,
      incremental_units: incrementalUnits,
      total_forecasted_units: totalUnits,
      py_sales: Math.round(pyUnits * avgPrice),
      cy_sales: isPast ? Math.round(cyUnits * avgPrice) : 0,
      baseline_sales: Math.round(baselineUnits * avgPrice),
      incremental_sales: Math.round(incrementalUnits * avgPrice),
      total_forecasted_sales: Math.round(totalUnits * avgPrice),
      avg_non_promo_price: Math.round(avgPrice * 100) / 100,
      planned_promo_price: Math.round(promoPrice * 100) / 100,
      planned_promo_mechanic: "None",
      py_pos_rebate: posRebatePY,
      cy_pos_rebate: posRebateCY,
      planned_pos_rebate: plannedRebate,
      acode: 1000 + Math.round(rand() * 9000),
      list_price: Math.round(listPrice * 100) / 100,
      store_landed_cost: Math.round(storeLandedCost * 100) / 100,
      margin_per_unit: Math.round(marginPerUnit * 100) / 100,
      margin: Math.round(totalMargin),
      direct_allowance: directAllowance,
      markdowns: markdowns,
      forecasted_rebate_spend: Math.round(forecastedRebateSpend),
      actual_rebate_spend: Math.round(actualRebateSpend),
      incremental_rebate_spend: Math.round(incrementalRebateSpend),
      total_margin: Math.round(netMargin),
      pct_margin: Math.round(pctMargin * 10) / 10,
    };
  }
  return data;
}

export function formatCellValue(value: number | string, fmt: string): string {
  if (typeof value === "string") return value;
  if (fmt === "currency") return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (fmt === "percent") return `${value.toFixed(1)}%`;
  if (fmt === "number") return value.toLocaleString("en-US");
  return String(value);
}

export function recalculateWeek(weekData: Record<string, number | string>): Record<string, number | string> {
  const d = { ...weekData };
  const baselineUnits = Number(d.baseline_units) || 0;
  const incrementalUnits = Number(d.incremental_units) || 0;
  const avgPrice = Number(d.avg_non_promo_price) || 0;
  const listPrice = Number(d.list_price) || 0;
  const plannedRebate = Number(d.planned_pos_rebate) || 0;
  const directAllowance = Number(d.direct_allowance) || 0;
  const markdowns = Number(d.markdowns) || 0;

  d.total_forecasted_units = baselineUnits + incrementalUnits;
  d.baseline_sales = Math.round(baselineUnits * avgPrice);
  d.incremental_sales = Math.round(incrementalUnits * avgPrice);
  d.total_forecasted_sales = Math.round(Number(d.total_forecasted_units) * avgPrice);
  d.store_landed_cost = Math.round(listPrice * 1.04 * 100) / 100;
  const marginPerUnit = avgPrice - Number(d.store_landed_cost);
  d.margin_per_unit = Math.round(marginPerUnit * 100) / 100;
  const totalUnits = Number(d.total_forecasted_units);
  d.margin = Math.round(marginPerUnit * totalUnits);
  d.forecasted_rebate_spend = Math.round(plannedRebate * totalUnits * 0.01);
  d.incremental_rebate_spend = Math.round(plannedRebate * incrementalUnits * 0.01);
  const netMargin = Number(d.margin) - directAllowance - markdowns - Number(d.forecasted_rebate_spend);
  d.total_margin = Math.round(netMargin);
  d.pct_margin = totalUnits > 0 ? Math.round((netMargin / (totalUnits * avgPrice)) * 1000) / 10 : 0;

  return d;
}
