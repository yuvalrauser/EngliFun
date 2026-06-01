import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewUnitForm } from "@/components/path/new-unit-form";

export default async function NewUnitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">צור יחידה משלך</h1>
          <Link href="/path" className="text-sm text-muted-foreground hover:underline">
            ביטול
          </Link>
        </div>
        <NewUnitForm />
      </div>
    </main>
  );
}
