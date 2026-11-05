export type InteriorIconName =
  | "arrow-right" | "search" | "menu-2" | "magnet" | "filter" | "recycle"
  | "building-factory-2" | "map-pin" | "file-download" | "settings" | "shield-check"
  | "mail" | "brand-whatsapp" | "file-text" | "package" | "truck" | "pick"
  | "zoom-in" | "book" | "calendar" | "adjustments-horizontal" | "world" | "tool"
  | "x" | "alert-circle" | "route" | "building";

export function InteriorIcon({ name }: { name: InteriorIconName }) {
  return <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <use href={"/assets/interior/icons.svg#" + name} />
  </svg>;
}
