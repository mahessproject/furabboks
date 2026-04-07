import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserNavbar from "@/components/layout/user-navbar";
import Footer from "@/components/layout/footer";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ! DEVELOPMENT OVERRIDE: Disable auth check
  // if (!user) redirect("/?auth=login");

  return (
    <div className="flex min-h-screen flex-col font-sans bg-white selection:bg-violet-200">
      <UserNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 mt-24 mb-12">{children}</main>
      <Footer />
    </div>
  );
}
