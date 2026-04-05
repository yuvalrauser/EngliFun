"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MascotWithBubble } from "@/components/ui/mascot";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <MascotWithBubble size="lg" message={message} />
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button className="h-12 px-8 text-base font-semibold rounded-xl shadow-md shadow-primary/20">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
