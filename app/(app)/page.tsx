import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Lock,
  MessageSquare,
  BookOpen,
  Activity,
  Brain,
  Shield,
  CheckCircle,
} from 'lucide-react';

const quickActions = [
  {
    title: 'Risk Assessment',
    description: 'Identify and prioritize potential security risks',
    icon: AlertTriangle,
    href: '/risk-assessment',
    color: 'text-orange-600',
  },
  {
    title: 'Security Checklist',
    description: 'Track security compliance and audit status',
    icon: Lock,
    href: '/security-audit',
    color: 'text-blue-600',
  },
  {
    title: 'Communication Plan',
    description: 'Manage communication channels and protocols',
    icon: MessageSquare,
    href: '/communication',
    color: 'text-green-600',
  },
  {
    title: 'Response Playbook',
    description: 'Define incident response procedures and team roles',
    icon: BookOpen,
    href: '/playbook',
    color: 'text-purple-600',
  },
  {
    title: 'Active Incidents',
    description: 'Monitor and manage ongoing security incidents',
    icon: Activity,
    href: '/incidents/active',
    color: 'text-red-600',
  },
  {
    title: 'AI Analysis',
    description: 'Generate AI-powered incident analysis and insights',
    icon: Brain,
    href: '/incidents/analysis',
    color: 'text-indigo-600',
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 p-6 flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Web3 Incident Shield</h2>
            <p className="text-muted-foreground">Comprehensive incident preparedness and response management</p>
          </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-6 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">System Status</h3>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-6 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Active Incidents</h3>
            <p className="text-sm text-muted-foreground">0 incidents requiring attention</p>
          </div>
        </div>
      </div>
      
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome to Web3 Incident Shield</h1>
          <p className="text-muted-foreground mt-2">
            Your comprehensive platform for Web3 incident preparedness, response, and management.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {action.description}
                </CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>
                    Get Started
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span>Complete your Risk Assessment to identify potential vulnerabilities</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span>Set up your Communication Plan with team roles and channels</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span>Configure your Response Playbook with incident procedures</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span>Review the Security Checklist to ensure compliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}