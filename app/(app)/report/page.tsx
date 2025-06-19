'use client';

import React, { useState } from 'react';
import { useData } from '@/src/context/data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, Share2, Eye, BarChart3, Shield, AlertTriangle, CheckCircle, Clock, Users, MessageSquare, BookOpen, TrendingUp, Target, Zap, Calendar, FileCheck, Globe, Printer, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  sections: string[];
  content: Record<string, any>;
  format: 'json' | 'html' | 'markdown' | 'pdf';
}

const REPORT_SECTIONS: ReportSection[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    description: 'High-level overview of preparedness status',
    icon: BarChart3,
    required: true,
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Comprehensive risk analysis and mitigation strategies',
    icon: AlertTriangle,
    required: true,
  },
  {
    id: 'security-audit',
    title: 'Security & Compliance',
    description: 'Security checklist status and audit results',
    icon: Shield,
    required: true,
  },
  {
    id: 'team-readiness',
    title: 'Team Readiness',
    description: 'Team structure, roles, and communication setup',
    icon: Users,
    required: true,
  },
  {
    id: 'incident-playbooks',
    title: 'Incident Response Playbooks',
    description: 'Response procedures and escalation paths',
    icon: BookOpen,
    required: true,
  },
  {
    id: 'communication-plan',
    title: 'Communication Strategy',
    description: 'Communication channels, templates, and protocols',
    icon: MessageSquare,
    required: true,
  },
  {
    id: 'historical-analysis',
    title: 'Historical Incident Analysis',
    description: 'Past incidents, lessons learned, and trends',
    icon: TrendingUp,
    required: false,
  },
  {
    id: 'vulnerability-tracking',
    title: 'Vulnerability Management',
    description: 'Known vulnerabilities and remediation status',
    icon: Target,
    required: false,
  },
  {
    id: 'recommendations',
    title: 'Improvement Recommendations',
    description: 'Actionable recommendations for enhanced preparedness',
    icon: Zap,
    required: false,
  },
  {
    id: 'compliance-matrix',
    title: 'Compliance Matrix',
    description: 'Regulatory compliance status and requirements',
    icon: FileCheck,
    required: false,
  },
];

const REPORT_TYPES = [
  {
    id: 'comprehensive',
    title: 'Comprehensive Preparedness Report',
    description: 'Complete assessment including all available sections',
    defaultSections: REPORT_SECTIONS.map(s => s.id),
  },
  {
    id: 'executive',
    title: 'Executive Summary Report',
    description: 'High-level overview for leadership and stakeholders',
    defaultSections: ['executive-summary', 'risk-assessment', 'team-readiness', 'recommendations'],
  },
  {
    id: 'technical',
    title: 'Technical Assessment Report',
    description: 'Detailed technical analysis for security teams',
    defaultSections: ['security-audit', 'vulnerability-tracking', 'incident-playbooks', 'historical-analysis'],
  },
  {
    id: 'compliance',
    title: 'Compliance & Audit Report',
    description: 'Focused on regulatory compliance and audit requirements',
    defaultSections: ['security-audit', 'compliance-matrix', 'risk-assessment', 'vulnerability-tracking'],
  },
  {
    id: 'readiness',
    title: 'Incident Readiness Report',
    description: 'Assessment of incident response capabilities',
    defaultSections: ['team-readiness', 'incident-playbooks', 'communication-plan', 'historical-analysis'],
  },
];

const OUTPUT_FORMATS = [
  { id: 'html', label: 'HTML Report', description: 'Interactive web-based report' },
  { id: 'markdown', label: 'Markdown', description: 'Structured text format' },
  { id: 'json', label: 'JSON Data', description: 'Machine-readable data format' },
  { id: 'pdf', label: 'PDF Document', description: 'Print-ready document format' },
];

export default function PreparednessReportPage() {
  const {
    getRisks,
    getTeamMembers,
    getSeverityLevels,
    getIncidentTypes,
    getCommunicationChannels,
    getCommunicationRoles,
    getCommunicationPrinciples,
    getCommunicationTemplates,
    getSecurityChecklistItems,
    getSecurityChecklistStatus,
    getAudits,
    getVulnerabilities,
    getActiveIncidents,
    getPostIncidentReviews,
    exportDataAsJson,
  } = useData();

  // State management
  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [selectedSections, setSelectedSections] = useState<string[]>(REPORT_TYPES[0].defaultSections);
  const [selectedFormat, setSelectedFormat] = useState('html');
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('web3-shield-reports');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Data collection
  const risks = getRisks();
  const teamMembers = getTeamMembers();
  const severityLevels = getSeverityLevels();
  const incidentTypes = getIncidentTypes();
  const communicationChannels = getCommunicationChannels();
  const communicationRoles = getCommunicationRoles();
  const communicationPrinciples = getCommunicationPrinciples();
  const communicationTemplates = getCommunicationTemplates();
  const checklistItems = getSecurityChecklistItems();
  const checklistStatus = getSecurityChecklistStatus();
  const audits = getAudits();
  const vulnerabilities = getVulnerabilities();
  const activeIncidents = getActiveIncidents();
  const postIncidentReviews = getPostIncidentReviews();

  // Handle report type change
  const handleReportTypeChange = (reportTypeId: string) => {
    setSelectedReportType(reportTypeId);
    const reportType = REPORT_TYPES.find(t => t.id === reportTypeId);
    if (reportType) {
      setSelectedSections(reportType.defaultSections);
      setReportTitle(reportType.title);
      setReportDescription(reportType.description);
    }
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSections([...selectedSections, sectionId]);
    } else {
      // Don't allow unchecking required sections
      const section = REPORT_SECTIONS.find(s => s.id === sectionId);
      if (section?.required) {
        toast.error('This section is required and cannot be removed');
        return;
      }
      setSelectedSections(selectedSections.filter(id => id !== sectionId));
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const checklistProgress = (Object.values(checklistStatus).filter(Boolean).length / checklistItems.length) * 100;
    const riskStats = {
      total: risks.length,
      critical: risks.filter(r => {
        const impactScore = { Low: 1, Medium: 2, High: 3 }[r.impact] || 1;
        const likelihoodScore = { Low: 1, Medium: 2, High: 3 }[r.likelihood] || 1;
        return impactScore * likelihoodScore >= 6;
      }).length,
    };
    const vulnStats = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
      resolved: vulnerabilities.filter(v => v.status === 'Resolved').length,
    };
    const incidentStats = {
      total: activeIncidents.length,
      active: activeIncidents.filter(i => i.currentStatus === 'Active').length,
      resolved: activeIncidents.filter(i => i.currentStatus === 'Resolved').length,
      withReviews: postIncidentReviews.length,
    };

    return {
      checklistProgress,
      riskStats,
      vulnStats,
      incidentStats,
      teamSize: teamMembers.length,
      communicationChannels: communicationChannels.length,
      playbooks: incidentTypes.length,
      auditsCompleted: audits.filter(a => a.status === 'Completed').length,
    };
  };

  // Generate report content
  const generateReportContent = (sections: string[]) => {
    const stats = calculateStats();
    const content: Record<string, any> = {};

    sections.forEach(sectionId => {
      switch (sectionId) {
        case 'executive-summary':
          content[sectionId] = {
            title: 'Executive Summary',
            overallReadiness: Math.round((stats.checklistProgress + 
              (stats.riskStats.critical === 0 ? 100 : 50) + 
              (stats.vulnStats.critical === 0 ? 100 : 50) + 
              (stats.teamSize > 0 ? 100 : 0)) / 4),
            keyMetrics: {
              securityCompliance: `${Math.round(stats.checklistProgress)}%`,
              criticalRisks: stats.riskStats.critical,
              teamReadiness: `${stats.teamSize} members`,
              incidentResponse: `${stats.playbooks} playbooks`,
            },
            summary: `This report provides a comprehensive assessment of our Web3 incident preparedness capabilities. Our current readiness score is ${Math.round((stats.checklistProgress + (stats.riskStats.critical === 0 ? 100 : 50) + (stats.vulnStats.critical === 0 ? 100 : 50) + (stats.teamSize > 0 ? 100 : 0)) / 4)}%, indicating ${Math.round((stats.checklistProgress + (stats.riskStats.critical === 0 ? 100 : 50) + (stats.vulnStats.critical === 0 ? 100 : 50) + (stats.teamSize > 0 ? 100 : 0)) / 4) > 80 ? 'strong' : Math.round((stats.checklistProgress + (stats.riskStats.critical === 0 ? 100 : 50) + (stats.vulnStats.critical === 0 ? 100 : 50) + (stats.teamSize > 0 ? 100 : 0)) / 4) > 60 ? 'moderate' : 'limited'} preparedness for incident response.`,
          };
          break;

        case 'risk-assessment':
          content[sectionId] = {
            title: 'Risk Assessment',
            totalRisks: stats.riskStats.total,
            criticalRisks: stats.riskStats.critical,
            riskMatrix: risks.map(risk => ({
              name: risk.riskName,
              impact: risk.impact,
              likelihood: risk.likelihood,
              score: ({ Low: 1, Medium: 2, High: 3 }[risk.impact] || 1) * ({ Low: 1, Medium: 2, High: 3 }[risk.likelihood] || 1),
              mitigation: risk.mitigationNotes,
            })),
            topRisks: risks
              .map(risk => ({
                ...risk,
                score: ({ Low: 1, Medium: 2, High: 3 }[risk.impact] || 1) * ({ Low: 1, Medium: 2, High: 3 }[risk.likelihood] || 1),
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 5),
          };
          break;

        case 'security-audit':
          content[sectionId] = {
            title: 'Security & Compliance',
            complianceScore: Math.round(stats.checklistProgress),
            checklistItems: checklistItems.map(item => ({
              ...item,
              completed: checklistStatus[item.id] || false,
            })),
            audits: audits.map(audit => ({
              auditor: audit.auditorName,
              status: audit.status,
              reportTitle: audit.reportTitle,
              startDate: audit.startDate,
              completionDate: audit.completionDate,
            })),
            vulnerabilities: vulnerabilities.map(vuln => ({
              name: vuln.name,
              severity: vuln.severity,
              status: vuln.status,
              source: vuln.source,
            })),
          };
          break;

        case 'team-readiness':
          content[sectionId] = {
            title: 'Team Readiness',
            teamSize: stats.teamSize,
            teamMembers: teamMembers.map(member => ({
              name: member.name,
              role: member.role,
              contact: member.primaryContactMethod,
            })),
            communicationRoles: communicationRoles.map(role => ({
              role: role.role,
              assignee: role.assignedMemberName,
              responsibilities: role.responsibilities,
            })),
            communicationChannels: communicationChannels.map(channel => ({
              platform: channel.platform,
              isPrimary: channel.isPrimary,
              link: channel.link,
            })),
          };
          break;

        case 'incident-playbooks':
          content[sectionId] = {
            title: 'Incident Response Playbooks',
            totalPlaybooks: stats.playbooks,
            playbooks: incidentTypes.map(type => ({
              type: type.type,
              description: type.description,
              initialSteps: type.initialAssessmentSteps.length,
              technicalSteps: type.technicalResponseSteps.length,
              postMortemSteps: type.postMortemSteps.length,
              communicationStrategy: type.communicationStrategy,
              legalConsiderations: type.legalConsiderations,
            })),
            severityLevels: severityLevels,
          };
          break;

        case 'communication-plan':
          content[sectionId] = {
            title: 'Communication Strategy',
            channels: stats.communicationChannels,
            templates: communicationTemplates.length,
            principles: communicationPrinciples,
            channelDetails: communicationChannels,
            templateDetails: communicationTemplates,
            roleAssignments: communicationRoles,
          };
          break;

        case 'historical-analysis':
          content[sectionId] = {
            title: 'Historical Incident Analysis',
            totalIncidents: stats.incidentStats.total,
            resolvedIncidents: stats.incidentStats.resolved,
            activeIncidents: stats.incidentStats.active,
            reviewsCompleted: stats.incidentStats.withReviews,
            incidents: activeIncidents.map(incident => ({
              type: incident.type,
              severity: incident.severity,
              status: incident.currentStatus,
              startTime: incident.startTimestamp,
              resolutionTime: incident.resolutionTimestamp,
              teamMembers: incident.assignedTeamMembers,
              logEntries: incident.incidentLog.length,
            })),
            reviews: postIncidentReviews.map(review => ({
              incidentId: review.incidentId,
              reviewDate: review.reviewDate,
              summary: review.summary,
              actionItems: review.actionItems.length,
            })),
          };
          break;

        case 'vulnerability-tracking':
          content[sectionId] = {
            title: 'Vulnerability Management',
            totalVulnerabilities: stats.vulnStats.total,
            criticalVulnerabilities: stats.vulnStats.critical,
            resolvedVulnerabilities: stats.vulnStats.resolved,
            vulnerabilityBreakdown: {
              Critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
              High: vulnerabilities.filter(v => v.severity === 'High').length,
              Medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
              Low: vulnerabilities.filter(v => v.severity === 'Low').length,
            },
            statusBreakdown: {
              New: vulnerabilities.filter(v => v.status === 'New').length,
              Acknowledged: vulnerabilities.filter(v => v.status === 'Acknowledged').length,
              'In Progress': vulnerabilities.filter(v => v.status === 'In Progress').length,
              Resolved: vulnerabilities.filter(v => v.status === 'Resolved').length,
              Deferred: vulnerabilities.filter(v => v.status === 'Deferred').length,
            },
            vulnerabilities: vulnerabilities,
          };
          break;

        case 'recommendations':
          content[sectionId] = {
            title: 'Improvement Recommendations',
            recommendations: generateRecommendations(stats),
            priorityActions: generatePriorityActions(stats),
            timeline: generateImplementationTimeline(stats),
          };
          break;

        case 'compliance-matrix':
          content[sectionId] = {
            title: 'Compliance Matrix',
            frameworks: [
              {
                name: 'SOC 2 Type II',
                status: stats.checklistProgress > 80 ? 'Compliant' : 'In Progress',
                coverage: `${Math.round(stats.checklistProgress)}%`,
              },
              {
                name: 'ISO 27001',
                status: stats.checklistProgress > 90 ? 'Compliant' : 'In Progress',
                coverage: `${Math.round(Math.max(0, stats.checklistProgress - 10))}%`,
              },
              {
                name: 'NIST Cybersecurity Framework',
                status: stats.playbooks > 5 ? 'Compliant' : 'Partial',
                coverage: `${Math.min(100, stats.playbooks * 20)}%`,
              },
            ],
            gaps: identifyComplianceGaps(stats),
          };
          break;
      }
    });

    return content;
  };

  // Helper functions for recommendations
  const generateRecommendations = (stats: any) => {
    const recommendations = [];

    if (stats.checklistProgress < 80) {
      recommendations.push({
        category: 'Security Compliance',
        priority: 'High',
        description: 'Complete remaining security checklist items to improve overall compliance posture.',
        impact: 'Reduces security vulnerabilities and improves audit readiness.',
      });
    }

    if (stats.riskStats.critical > 0) {
      recommendations.push({
        category: 'Risk Management',
        priority: 'Critical',
        description: `Address ${stats.riskStats.critical} critical risk(s) identified in the risk assessment.`,
        impact: 'Significantly reduces potential for high-impact incidents.',
      });
    }

    if (stats.vulnStats.critical > 0) {
      recommendations.push({
        category: 'Vulnerability Management',
        priority: 'Critical',
        description: `Remediate ${stats.vulnStats.critical} critical vulnerabilities immediately.`,
        impact: 'Prevents potential exploitation of critical security flaws.',
      });
    }

    if (stats.teamSize < 3) {
      recommendations.push({
        category: 'Team Readiness',
        priority: 'Medium',
        description: 'Expand incident response team to ensure adequate coverage and redundancy.',
        impact: 'Improves response capabilities and reduces single points of failure.',
      });
    }

    if (stats.playbooks < 5) {
      recommendations.push({
        category: 'Incident Response',
        priority: 'Medium',
        description: 'Develop additional incident response playbooks for common attack vectors.',
        impact: 'Enables faster, more effective response to various incident types.',
      });
    }

    return recommendations;
  };

  const generatePriorityActions = (stats: any) => {
    const actions = [];

    if (stats.vulnStats.critical > 0) {
      actions.push({
        action: 'Remediate Critical Vulnerabilities',
        timeline: 'Immediate (0-7 days)',
        owner: 'Security Team',
        effort: 'High',
      });
    }

    if (stats.riskStats.critical > 0) {
      actions.push({
        action: 'Implement Critical Risk Mitigations',
        timeline: 'Short-term (1-4 weeks)',
        owner: 'Risk Management Team',
        effort: 'Medium',
      });
    }

    if (stats.checklistProgress < 80) {
      actions.push({
        action: 'Complete Security Compliance Checklist',
        timeline: 'Medium-term (1-3 months)',
        owner: 'Compliance Team',
        effort: 'Medium',
      });
    }

    return actions;
  };

  const generateImplementationTimeline = (stats: any) => {
    return {
      immediate: ['Address critical vulnerabilities', 'Review and update incident response contacts'],
      shortTerm: ['Complete risk mitigation plans', 'Conduct team training exercises'],
      mediumTerm: ['Implement additional security controls', 'Develop new incident playbooks'],
      longTerm: ['Achieve full compliance certification', 'Establish continuous monitoring'],
    };
  };

  const identifyComplianceGaps = (stats: any) => {
    const gaps = [];

    if (stats.checklistProgress < 100) {
      gaps.push({
        framework: 'SOC 2',
        requirement: 'Security Controls Implementation',
        status: 'Incomplete',
        gap: `${100 - Math.round(stats.checklistProgress)}% of security controls not implemented`,
      });
    }

    if (stats.auditsCompleted === 0) {
      gaps.push({
        framework: 'ISO 27001',
        requirement: 'Regular Security Audits',
        status: 'Missing',
        gap: 'No completed security audits on record',
      });
    }

    return gaps;
  };

  // Generate report
  const generateReport = async () => {
    if (!reportTitle.trim()) {
      toast.error('Please enter a report title');
      return;
    }

    if (selectedSections.length === 0) {
      toast.error('Please select at least one section');
      return;
    }

    setIsGenerating(true);

    try {
      const content = generateReportContent(selectedSections);
      
      const newReport: GeneratedReport = {
        id: `report_${Date.now()}`,
        title: reportTitle,
        type: selectedReportType,
        generatedAt: new Date().toISOString(),
        sections: selectedSections,
        content,
        format: selectedFormat as 'json' | 'html' | 'markdown' | 'pdf',
      };

      const updatedReports = [newReport, ...generatedReports];
      setGeneratedReports(updatedReports);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('web3-shield-reports', JSON.stringify(updatedReports));
      }

      toast.success('Report generated successfully');
      
      // Auto-download the report
      downloadReport(newReport);
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report in selected format
  const downloadReport = (report: GeneratedReport) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (report.format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        filename = `${report.title.replace(/\s+/g, '-').toLowerCase()}.json`;
        mimeType = 'application/json';
        break;
        
      case 'html':
        content = generateHTMLReport(report);
        filename = `${report.title.replace(/\s+/g, '-').toLowerCase()}.html`;
        mimeType = 'text/html';
        break;
        
      case 'markdown':
        content = generateMarkdownReport(report);
        filename = `${report.title.replace(/\s+/g, '-').toLowerCase()}.md`;
        mimeType = 'text/markdown';
        break;
        
      case 'pdf':
        // For PDF, we'll generate HTML and let the user print to PDF
        content = generateHTMLReport(report);
        filename = `${report.title.replace(/\s+/g, '-').toLowerCase()}.html`;
        mimeType = 'text/html';
        toast.info('HTML version generated. Use your browser\'s print function to save as PDF.');
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate HTML report
  const generateHTMLReport = (report: GeneratedReport) => {
    const sections = report.sections.map(sectionId => {
      const sectionData = report.content[sectionId];
      if (!sectionData) return '';

      let sectionHTML = `<section class="report-section">
        <h2>${sectionData.title}</h2>`;

      switch (sectionId) {
        case 'executive-summary':
          sectionHTML += `
            <div class="summary-metrics">
              <div class="metric">
                <h3>Overall Readiness</h3>
                <div class="score">${sectionData.overallReadiness}%</div>
              </div>
              <div class="metrics-grid">
                <div class="metric-item">
                  <strong>Security Compliance:</strong> ${sectionData.keyMetrics.securityCompliance}
                </div>
                <div class="metric-item">
                  <strong>Critical Risks:</strong> ${sectionData.keyMetrics.criticalRisks}
                </div>
                <div class="metric-item">
                  <strong>Team Readiness:</strong> ${sectionData.keyMetrics.teamReadiness}
                </div>
                <div class="metric-item">
                  <strong>Incident Response:</strong> ${sectionData.keyMetrics.incidentResponse}
                </div>
              </div>
            </div>
            <p>${sectionData.summary}</p>`;
          break;

        case 'risk-assessment':
          sectionHTML += `
            <div class="risk-overview">
              <p><strong>Total Risks:</strong> ${sectionData.totalRisks}</p>
              <p><strong>Critical Risks:</strong> ${sectionData.criticalRisks}</p>
            </div>
            <h3>Top Risks</h3>
            <table class="risk-table">
              <thead>
                <tr><th>Risk</th><th>Impact</th><th>Likelihood</th><th>Score</th><th>Mitigation</th></tr>
              </thead>
              <tbody>
                ${sectionData.topRisks.map((risk: any) => `
                  <tr>
                    <td>${risk.riskName}</td>
                    <td>${risk.impact}</td>
                    <td>${risk.likelihood}</td>
                    <td>${risk.score}</td>
                    <td>${risk.mitigationNotes || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`;
          break;

        case 'security-audit':
          sectionHTML += `
            <div class="compliance-score">
              <h3>Compliance Score: ${sectionData.complianceScore}%</h3>
            </div>
            <h3>Security Checklist Status</h3>
            <ul class="checklist">
              ${sectionData.checklistItems.map((item: any) => `
                <li class="${item.completed ? 'completed' : 'pending'}">
                  ${item.completed ? '✅' : '❌'} ${item.label}
                </li>
              `).join('')}
            </ul>`;
          break;

        default:
          sectionHTML += `<pre>${JSON.stringify(sectionData, null, 2)}</pre>`;
      }

      sectionHTML += '</section>';
      return sectionHTML;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .report-section { margin-bottom: 40px; }
        .summary-metrics { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .score { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
        .metric-item { padding: 10px; background: white; border-radius: 4px; }
        .risk-table, .checklist { width: 100%; margin: 15px 0; }
        .risk-table th, .risk-table td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        .risk-table th { background: #f5f5f5; }
        .checklist li { margin: 5px 0; }
        .completed { color: green; }
        .pending { color: red; }
        h1 { color: #1f2937; }
        h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        h3 { color: #4b5563; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.title}</h1>
        <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
        <p><strong>Report Type:</strong> ${REPORT_TYPES.find(t => t.id === report.type)?.title || report.type}</p>
    </div>
    ${sections}
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
        <p>Generated by Web3 Incident Shield - Comprehensive incident preparedness and response management system</p>
    </footer>
</body>
</html>`;
  };

  // Generate Markdown report
  const generateMarkdownReport = (report: GeneratedReport) => {
    let markdown = `# ${report.title}\n\n`;
    markdown += `**Generated:** ${new Date(report.generatedAt).toLocaleString()}\n`;
    markdown += `**Report Type:** ${REPORT_TYPES.find(t => t.id === report.type)?.title || report.type}\n\n`;

    report.sections.forEach(sectionId => {
      const sectionData = report.content[sectionId];
      if (!sectionData) return;

      markdown += `## ${sectionData.title}\n\n`;

      switch (sectionId) {
        case 'executive-summary':
          markdown += `### Overall Readiness: ${sectionData.overallReadiness}%\n\n`;
          markdown += `**Key Metrics:**\n`;
          markdown += `- Security Compliance: ${sectionData.keyMetrics.securityCompliance}\n`;
          markdown += `- Critical Risks: ${sectionData.keyMetrics.criticalRisks}\n`;
          markdown += `- Team Readiness: ${sectionData.keyMetrics.teamReadiness}\n`;
          markdown += `- Incident Response: ${sectionData.keyMetrics.incidentResponse}\n\n`;
          markdown += `${sectionData.summary}\n\n`;
          break;

        case 'risk-assessment':
          markdown += `**Total Risks:** ${sectionData.totalRisks}\n`;
          markdown += `**Critical Risks:** ${sectionData.criticalRisks}\n\n`;
          markdown += `### Top Risks\n\n`;
          markdown += `| Risk | Impact | Likelihood | Score | Mitigation |\n`;
          markdown += `|------|--------|------------|-------|------------|\n`;
          sectionData.topRisks.forEach((risk: any) => {
            markdown += `| ${risk.riskName} | ${risk.impact} | ${risk.likelihood} | ${risk.score} | ${risk.mitigationNotes || 'N/A'} |\n`;
          });
          markdown += '\n';
          break;

        default:
          markdown += `\`\`\`json\n${JSON.stringify(sectionData, null, 2)}\n\`\`\`\n\n`;
      }
    });

    markdown += `---\n*Generated by Web3 Incident Shield*\n`;
    return markdown;
  };

  // Preview report
  const previewReportContent = (report: GeneratedReport) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  // Delete report
  const deleteReport = (reportId: string) => {
    const updatedReports = generatedReports.filter(r => r.id !== reportId);
    setGeneratedReports(updatedReports);
    if (typeof window !== 'undefined') {
      localStorage.setItem('web3-shield-reports', JSON.stringify(updatedReports));
    }
    toast.success('Report deleted successfully');
  };

  // Calculate overall statistics
  const overallStats = calculateStats();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Preparedness Report
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive reports on your Web3 incident preparedness and response capabilities.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Readiness</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((overallStats.checklistProgress + 
                (overallStats.riskStats.critical === 0 ? 100 : 50) + 
                (overallStats.vulnStats.critical === 0 ? 100 : 50) + 
                (overallStats.teamSize > 0 ? 100 : 0)) / 4)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Compliance</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(overallStats.checklistProgress)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.riskStats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{overallStats.teamSize}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Playbooks</CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{overallStats.playbooks}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Report Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Report Configuration
                </CardTitle>
                <CardDescription>
                  Configure your preparedness report settings and content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={selectedReportType} onValueChange={handleReportTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {REPORT_TYPES.find(t => t.id === selectedReportType)?.description}
                  </p>
                </div>

                <div>
                  <Label htmlFor="reportTitle">Report Title</Label>
                  <Input
                    id="reportTitle"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Enter report title"
                  />
                </div>

                <div>
                  <Label htmlFor="reportDescription">Description (Optional)</Label>
                  <Textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Brief description of the report purpose"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Output Format</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_FORMATS.map(format => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {OUTPUT_FORMATS.find(f => f.id === selectedFormat)?.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Report Sections
                </CardTitle>
                <CardDescription>
                  Select which sections to include in your report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {REPORT_SECTIONS.map(section => (
                    <div key={section.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(checked) => handleSectionToggle(section.id, checked as boolean)}
                        disabled={section.required}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <section.icon className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                            {section.title}
                            {section.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {selectedSections.length} section(s) selected • {selectedFormat.toUpperCase()} format
                  </p>
                </div>
                <Button 
                  onClick={generateReport} 
                  disabled={isGenerating || !reportTitle.trim() || selectedSections.length === 0}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-4">
          {generatedReports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Reports Generated</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate your first preparedness report to track your incident response capabilities.
                </p>
              </CardContent>
            </Card>
          ) : (
            generatedReports
              .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
              .map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {report.format.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary">
                            {report.sections.length} sections
                          </Badge>
                        </div>
                        <CardDescription>
                          Generated on {new Date(report.generatedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => previewReportContent(report)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadReport(report)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {report.sections.map(sectionId => {
                        const section = REPORT_SECTIONS.find(s => s.id === sectionId);
                        return section ? (
                          <Badge key={sectionId} variant="outline" className="text-xs">
                            {section.title}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>

      {/* Report Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {previewReport?.title} - Generated on {previewReport ? new Date(previewReport.generatedAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewReport && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: generateHTMLReport(previewReport) }} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            {previewReport && (
              <Button onClick={() => downloadReport(previewReport)} className="gap-2">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}