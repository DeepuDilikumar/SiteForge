export const ICON_NAMES = [
  "account_circle",
  "add",
  "arrow_back",
  "arrow_forward",
  "arrow_upward",
  "call",
  "chat",
  "check",
  "check_circle",
  "close",
  "content_copy",
  "credit_card",
  "dark_mode",
  "desktop_windows",
  "download",
  "edit",
  "error",
  "expand_more",
  "info",
  "language",
  "light_mode",
  "link",
  "link_off",
  "location_on",
  "lock",
  "logout",
  "mail",
  "map",
  "more_vert",
  "open_in_new",
  "palette",
  "progress_activity",
  "refresh",
  "schedule",
  "search",
  "send",
  "smartphone",
  "star",
  "storefront",
  "swap_horiz",
  "travel_explore",
  "tune",
  "workspace_premium",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_FONT_HREF = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400,0..1,0&icon_names=${[
  ...ICON_NAMES,
]
  .sort()
  .join(",")}&display=block`;

type IconProps = {
  name: IconName;
  size?: 16 | 18 | 20 | 24 | 32 | 48;
  filled?: boolean;
  className?: string;
  label?: string;
};

export function Icon({ name, size = 20, filled = false, className = "", label }: IconProps) {
  return (
    <span
      className={`icon ${filled ? "icon-filled" : ""} ${className}`}
      style={{ fontSize: size }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {name}
    </span>
  );
}
