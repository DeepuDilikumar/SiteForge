import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "tonal" | "text" | "outlined";
export type ButtonSize = "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[background-color,box-shadow,color,transform] duration-200 ease-standard " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

/* Interactive controls follow a monochrome, high-contrast style: ink pills, quiet outlines. */
const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink hover:bg-ink-hover",
  tonal: "bg-surface-2 text-text hover:bg-border/60",
  text: "text-accent hover:bg-accent-soft",
  outlined: "border border-border text-text hover:bg-surface-2",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-6 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  const padding = variant === "text" ? (size === "md" ? "px-3" : "px-4") : "";
  return `${base} ${variants[variant]} ${sizes[size]} ${padding} ${className}`;
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

function Content({ icon, trailingIcon, loading, children }: CommonProps) {
  return (
    <>
      {loading ? (
        <Icon name="progress_activity" size={18} className="animate-spin-slow" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={18} /> : null}
    </>
  );
}

export function Button({
  variant,
  size,
  icon,
  trailingIcon,
  loading,
  children,
  className,
  type = "button",
  disabled,
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Content icon={icon} trailingIcon={trailingIcon} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  trailingIcon,
  children,
  className,
  href,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Content>
    </Link>
  );
}

export function IconButton({
  icon,
  label,
  className = "",
  size = 40,
  ...rest
}: { icon: IconName; label: string; size?: 32 | 40 | 48 } & Omit<ComponentProps<"button">, "children">) {
  const dims = size === 32 ? "h-8 w-8" : size === 40 ? "h-10 w-10" : "h-12 w-12";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex ${dims} flex-none items-center justify-center rounded-full text-text-2 transition-colors duration-200 ease-standard hover:bg-surface-2 hover:text-text active:bg-border/40 disabled:opacity-40 ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size === 32 ? 18 : 20} />
    </button>
  );
}
