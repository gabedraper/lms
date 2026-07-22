import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Map,
  GraduationCap,
  Award,
  LogOut,
} from "lucide-react";
import { getRoleLabel } from "@/lib/roles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: string): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { href: "/admin/role-training", label: "Role Training", icon: <Map className="h-4 w-4" /> },
      { href: "/admin/courses", label: "All Courses", icon: <BookOpen className="h-4 w-4" /> },
    ];
  }
  // BDM, OBDM, SDR — all get the learner view
  return [
    { href: "/learner", label: "My Training", icon: <GraduationCap className="h-4 w-4" /> },
    { href: "/learner/certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
  ];
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "learner";
  const navItems = getNavItems(role);
  const lmsName = process.env.NEXT_PUBLIC_LMS_NAME || "Team Learning Academy";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Image
              src="https://facturmfg.com/wp-content/uploads/2022/11/Factur-Logo-300x94.png"
              alt="Factur logo"
              width={100}
              height={31}
              className="object-contain"
            />
            <span className="font-semibold text-sm leading-tight">Learning Academy</span>
          </div>
        </div>

        <Separator />

        <div className="px-3 py-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-muted">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel(role)}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3">
          <Separator className="mb-3" />
          <form action={signOut}>
            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
