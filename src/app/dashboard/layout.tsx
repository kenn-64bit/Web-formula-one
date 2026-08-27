import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="min-h-screen">
      <DashboardSidebar email={user.email ?? "driver@apex"} />
      <div className="md:pl-60">
        <main className="mx-auto max-w-canvas p-8">{children}</main>
      </div>
    </div>
  );
}
