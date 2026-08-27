import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { PREVIEW_MODE } from "@/lib/preview";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email = "driver@apex.preview";

  if (!PREVIEW_MODE) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard");
    email = user.email ?? "driver@apex";
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar email={email} />
      <div className="md:pl-60">
        <main className="mx-auto max-w-canvas p-8">{children}</main>
      </div>
    </div>
  );
}
