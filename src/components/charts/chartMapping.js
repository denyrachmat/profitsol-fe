// Value-column definitions for dashboard charts.
//
// A value entry can be:
// - a plain column-name string (legacy — dashboards saved before per-series
//   labels/colors existed), or
// - an object { column, label, color }.
//
// Always run entries through normalizeValueDefs() before use.

export const APEX_FALLBACK_PALETTE = [
  "#008FFB",
  "#00E396",
  "#FEB019",
  "#FF4560",
  "#775DD0",
  "#3F51B5",
  "#546E7A",
  "#D4526E",
  "#8D5B4C",
  "#F86624",
  "#D7263D",
  "#1B998B",
  "#2BC0E4",
  "#5793F3",
  "#DEE154",
  "#ED6D85",
  "#5574A6",
  "#39E6C3",
];

export function normalizeValueDefs(values) {
  const list = Array.isArray(values) ? values : values ? [values] : [];
  return list
    .map((v) => {
      if (typeof v === "string") {
        return v ? { column: v, label: "", color: "" } : null;
      }
      if (v && typeof v === "object") {
        const column = String(v.column || "");
        if (!column) return null;
        return {
          column,
          label: String(v.label || ""),
          color: String(v.color || ""),
        };
      }
      return null;
    })
    .filter(Boolean);
}

// Display name of a series: custom label, falling back to the column name.
export function defLabel(def) {
  return def.label || def.column;
}
