'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  Lock,
  MessageSquare,
  BookOpen,
  Activity,
  History,
  Brain,
  FileText,
  LayoutDashboard,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Risk Assessment',
    url: '/risk-assessment',
    icon: AlertTriangle,
  },
  {
    title: 'Security & Audit',
    url: '/security-audit',
    icon: Lock,
  },
  {
    title: 'Communication Plan',
    url: '/communication',
    icon: MessageSquare,
  },
  {
    title: 'Response Playbook',
    url: '/playbook',
    icon: BookOpen,
  },
  {
    title: 'Active Incidents',
    url: '/incidents/active',
    icon: Activity,
  },
  {
    title: 'Incident History',
    url: '/incidents/history',
    icon: History,
  },
  {
    title: 'AI Analysis',
    url: '/incidents/analysis',
    icon: Brain,
  },
  {
    title: 'Preparedness Report',
    url: '/report',
    icon: FileText,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-8 w-8 text-primary" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Web3 Incident Shield</span>
            <span className="truncate text-xs">Incident Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}