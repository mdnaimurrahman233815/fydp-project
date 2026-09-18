import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{kicker}</p> : null}
        <h1 className="font-display mt-1 text-3xl text-[#12324d] md:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#5d564b]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Alert({ type, children }: { type: "error" | "success"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border px-4 py-3 text-sm",
        type === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="card px-6 py-12 text-center">
      <p className="font-display text-2xl text-[#12324d]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#6b6256]">{text}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <span className={cn("badge", `badge-${key}`)}>{status}</span>;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a7164]">{label}</p>
      <p className="font-display mt-2 text-3xl text-[#12324d]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#7a7164]">{hint}</p> : null}
    </div>
  );
}

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  query,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const hrefFor = (next: number) => {
    const params = new URLSearchParams();
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value) params.set(key, value);
      }
    }
    params.set("page", String(next));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-5 flex items-center justify-between text-sm">
      <p className="text-[#6b6256]">
        Page {page} of {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className="btn btn-ghost" href={hrefFor(page - 1)}>
            Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link className="btn btn-ghost" href={hrefFor(page + 1)}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function Field({
  label,
  name,
  children,
}: {
  label: string;
  name?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm" htmlFor={name}>
      <span className="mb-1.5 block font-medium text-[#12324d]">{label}</span>
      {children}
    </label>
  );
}
