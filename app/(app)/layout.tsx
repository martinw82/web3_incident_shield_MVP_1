import { DataProvider } from '@/src/context/data-context';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/src/components/layout/sidebar-nav';
import { Toaster } from '@/components/ui/sonner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <SidebarProvider>
        <SidebarNav />
        <SidebarInset>
          <div className="flex h-full flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </DataProvider>
  );
}