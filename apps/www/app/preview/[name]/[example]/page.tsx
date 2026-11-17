import { notFound } from "next/navigation";

import { examples } from "@www/lib/examples.generated";
import { findItem, items } from "@www/lib/registry";
import { cn } from "@/react/lib/cn";

// One example alone on a page, in the frame the parity app uses: open it at any width.
export function generateStaticParams() {
  return items.flatMap((i) => i.examples.map((e) => ({ name: i.name, example: e.name })));
}

export const metadata = { robots: { index: false } };

export default async function ExamplePage({ params }: { params: Promise<{ name: string; example: string }> }) {
  const { name, example } = await params;
  const item = findItem(name);
  const Example = examples[name]?.[example];
  const meta = item?.examples.find((e) => e.name === example);
  if (!item || !Example || !meta) notFound();
  return (
    <div className={cn("min-h-dvh bg-surface", meta.bleed ? "" : meta.center ? "flex items-center justify-center px-8 py-10" : "p-8 max-sm:p-4")}>
      <div className={meta.center ? "min-w-0 max-w-full" : "min-w-0 max-w-full w-full"}>
        <Example />
      </div>
    </div>
  );
}
