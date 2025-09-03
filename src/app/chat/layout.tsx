import { Sidebar } from "@/app/chat/_components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar />
      {children}
    </SidebarProvider>
  );
}
