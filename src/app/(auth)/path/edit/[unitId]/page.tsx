import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UnitEditor } from "@/components/path/unit-editor";
import type { Lesson, Unit } from "@/types/database";

interface PageProps {
  params: Promise<{ unitId: string }>;
}

export default async function UnitEditPage({ params }: PageProps) {
  const { unitId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: unit } = await supabase
    .from("units")
    .select("*")
    .eq("id", unitId)
    .single();
  if (!unit) notFound();
  // Only the owner can edit. Seeded units have owner_id = null.
  if (unit.owner_id !== user.id) redirect("/path");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index");

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/path" className="text-sm text-muted-foreground hover:underline">
            ← חזרה למסלול
          </Link>
        </div>
        <UnitEditor unit={unit as Unit} lessons={(lessons ?? []) as Lesson[]} />
      </div>
    </main>
  );
}
