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
import { Lock, Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock, Calendar, FileText, Shield, Bug, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import type { AuditEntry, Vulnerability, AuditStatusType, VulnerabilityStatusType, VulnerabilitySeverityType } from '@/src/context/data-context';

const auditStatusColors = {
  'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Delayed': 'bg-red-100 text-red-800 border-red-200',
};

const vulnerabilityStatusColors = {
  'New': 'bg-red-100 text-red-800 border-red-200',
  'Acknowledged': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Deferred': 'bg-gray-100 text-gray-800 border-gray-200',
};

const vulnerabilitySeverityColors = {
  'Critical': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

export default function SecurityAuditPage() {
  const { 
    getSecurityChecklistItems, 
    getSecurityChecklistStatus, 
    saveSecurityChecklistStatus,
    getAudits,
    saveAudits,
    getVulnerabilities,
    saveVulnerabilities
  } = useData();

  const checklistItems = getSecurityChecklistItems();
  const [checklistStatus, setChecklistStatus] = useState(getSecurityChecklistStatus());
  const [audits, setAudits] = useState<AuditEntry[]>(getAudits());
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(getVulnerabilities());
  
  // Dialog states
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [isVulnDialogOpen, setIsVulnDialogOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<AuditEntry | null>(null);
  const [editingVuln, setEditingVuln] = useState<Vulnerability | null>(null);

  // Form states
  const [auditFormData, setAuditFormData] = useState({
    auditorName: '',
    startDate: '',
    completionDate: '',
    status: 'Scheduled' as AuditStatusType,
    reportTitle: '',
    reportUrl: '',
  });

  const [vulnFormData, setVulnFormData] = useState({
    name: '',
    description: '',
    source: '',
    severity: 'Medium' as VulnerabilitySeverityType,
    status: 'New' as VulnerabilityStatusType,
    remediationNotes: '',
  });

  // Checklist functions
  const handleChecklistChange = async (itemId: string, checked: boolean) => {
    const newStatus = { ...checklistStatus, [itemId]: checked };
    setChecklistStatus(newStatus);
    await saveSecurityChecklistStatus(newStatus);
    toast.success(checked ? 'Item completed' : 'Item marked incomplete');
  };

  const checklistProgress = (Object.values(checklistStatus).filter(Boolean).length / checklistItems.length) * 100;

  // Audit functions
  const resetAuditForm = () => {
    setAuditFormData({
      auditorName: '',
      startDate: '',
      completionDate: '',
      status: 'Scheduled',
      reportTitle: '',
      reportUrl: '',
    });
    setEditingAudit(null);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auditFormData.auditorName.trim() || !auditFormData.reportTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedAudits: AuditEntry[];
      
      if (editingAudit) {
        updatedAudits = audits.map(audit => 
          audit.id === editingAudit.id 
            ? { ...audit, ...auditFormData }
            : audit
        );
        toast.success('Audit updated successfully');
      } else {
        const newAudit: AuditEntry = {
          id: `audit_${Date.now()}`,
          ...auditFormData,
        };
        updatedAudits = [...audits, newAudit];
        toast.success('Audit added successfully');
      }

      setAudits(updatedAudits);
      await saveAudits(updatedAudits);
      setIsAuditDialogOpen(false);
      resetAuditForm();
    } catch (error) {
      toast.error('Failed to save audit');
    }
  };

  const handleEditAudit = (audit: AuditEntry) => {
    setEditingAudit(audit);
    setAuditFormData({
      auditorName: audit.auditorName,
      startDate: audit.startDate,
      completionDate: audit.completionDate || '',
      status: audit.status,
      reportTitle: audit.reportTitle,
      reportUrl: audit.reportUrl || '',
    });
    setIsAuditDialogOpen(true);
  };

  const handleDeleteAudit = async (auditId: string) => {
    try {
      const updatedAudits = audits.filter(audit => audit.id !== auditId);
      setAudits(updatedAudits);
      await saveAudits(updatedAudits);
      toast.success('Audit deleted successfully');
    } catch (error) {
      toast.error('Failed to delete audit');
    }
  };

  // Vulnerability functions
  const resetVulnForm = () => {
    setVulnFormData({
      name: '',
      description: '',
      source: '',
      severity: 'Medium',
      status: 'New',
      remediation: '',
    });
    setEditingVuln(null);
  };

  const handleVulnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vulnFormData.name.trim() || !vulnFormData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedVulns: Vulnerability[];
      
      if (editingVuln) {
        updatedVulns = vulnerabilities.map(vuln => 
          vuln.id === editingVuln.id 
            ? { ...vuln, ...vulnFormData }
            : vuln
        );
        toast.success('Vulnerability updated successfully');
      } else {
        const newVuln: Vulnerability = {
          id: `vuln_${Date.now()}`,
          ...vulnFormData,
        };
        updatedVulns = [...vulnerabilities, newVuln];
        toast.success('Vulnerability added successfully');
      }

      setVulnerabilities(updatedVulns);
      await saveVulnerabilities(updatedVulns);
      setIsVulnDialogOpen(false);
      resetVulnForm();
    } catch (error) {
      toast.error('Failed to save vulnerability');
    }
  };

  const handleEditVuln = (vuln: Vulnerability) => {
    setEditingVuln(vuln);
    setVulnFormData({
      name: vuln.name,
      description: vuln.description,
      source: vuln.source,
      severity: vuln.severity,
      status: vuln.status,
      remediationNotes: vuln.remediationNotes,
    });
    setIsVulnDialogOpen(true);
  };

  const handleDeleteVuln = async (vulnId: string) => {
    try {
      const updatedVulns = vulnerabilities.filter(vuln => vuln.id !== vulnId);
      setVulnerabilities(updatedVulns);
      await saveVulnerabilities(updatedVulns);
      toast.success('Vulnerability deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vulnerability');
    }
  };

  // Statistics
  const auditStats = {
    total: audits.length,
    completed: audits.filter(a => a.status === 'Completed').length,
    inProgress: audits.filter(a => a.status === 'In Progress').length,
    scheduled: audits.filter(a => a.status === 'Scheduled').length,
  };

  const vulnStats = {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
    resolved: vulnerabilities.filter(v => v.status === 'Resolved').length,
    active: vulnerabilities.filter(v => !['Resolved', 'Deferred'].includes(v.status)).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lock className="h-8 w-8 text-blue-600" />
            Security & Audit
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage security compliance, track audits, and monitor vulnerabilities.
          </p>
        </div>
      </div>

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">Security Checklist</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
        </TabsList>

        {/* Security Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Security Compliance Checklist
                  </CardTitle>
                  <CardDescription>
                    Track your security compliance across key areas
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(checklistProgress)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              <Progress value={checklistProgress} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={item.id}
                    checked={checklistStatus[item.id] || false}
                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  {checklistStatus[item.id] && (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audits Tab */}
        <TabsContent value="audits" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-4 md:grid-cols-4 flex-1 mr-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{auditStats.completed}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{auditStats.inProgress}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{auditStats.scheduled}</div>
                </CardContent>
              </Card>
            </div>
            <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetAuditForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingAudit ? 'Edit Audit' : 'Add New Audit'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAudit 
                      ? 'Update the audit details below.'
                      : 'Schedule or record a new security audit.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAuditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="auditorName">Auditor Name *</Label>
                      <Input
                        id="auditorName"
                        value={auditFormData.auditorName}
                        onChange={(e) => setAuditFormData({ ...auditFormData, auditorName: e.target.value })}
                        placeholder="e.g., CertiK, ConsenSys Diligence"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={auditFormData.status} onValueChange={(value: AuditStatusType) => setAuditFormData({ ...auditFormData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={auditFormData.startDate}
                        onChange={(e) => setAuditFormData({ ...auditFormData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="completionDate">Completion Date</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={auditFormData.completionDate}
                        onChange={(e) => setAuditFormData({ ...auditFormData, completionDate: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="reportTitle">Report Title *</Label>
                      <Input
                        id="reportTitle"
                        value={auditFormData.reportTitle}
                        onChange={(e) => setAuditFormData({ ...auditFormData, reportTitle: e.target.value })}
                        placeholder="e.g., Smart Contract Security Audit Report"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="reportUrl">Report URL</Label>
                      <Input
                        id="reportUrl"
                        type="url"
                        value={auditFormData.reportUrl}
                        onChange={(e) => setAuditFormData({ ...auditFormData, reportUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAuditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAudit ? 'Update Audit' : 'Add Audit'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {audits.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Audits Recorded</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start tracking your security audits and compliance reviews.
                  </p>
                  <Button onClick={() => setIsAuditDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Audit
                  </Button>
                </CardContent>
              </Card>
            ) : (
              audits.map((audit) => (
                <Card key={audit.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{audit.reportTitle}</CardTitle>
                          <Badge className={auditStatusColors[audit.status]}>
                            {audit.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Auditor: {audit.auditorName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAudit(audit)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAudit(audit.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">START DATE</Label>
                        <div className="text-sm mt-1">
                          {audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'Not set'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">COMPLETION DATE</Label>
                        <div className="text-sm mt-1">
                          {audit.completionDate ? new Date(audit.completionDate).toLocaleDateString() : 'Not completed'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">REPORT</Label>
                        <div className="text-sm mt-1">
                          {audit.reportUrl ? (
                            <a 
                              href={audit.reportUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Report
                            </a>
                          ) : (
                            'No report available'
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Vulnerabilities Tab */}
        <TabsContent value="vulnerabilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="grid gap-4 md:grid-cols-4 flex-1 mr-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
                  <Bug className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vulnStats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{vulnStats.critical}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{vulnStats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{vulnStats.resolved}</div>
                </CardContent>
              </Card>
            </div>
            <Dialog open={isVulnDialogOpen} onOpenChange={setIsVulnDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetVulnForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Vulnerability
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingVuln ? 'Edit Vulnerability' : 'Add New Vulnerability'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingVuln 
                      ? 'Update the vulnerability details below.'
                      : 'Record a new security vulnerability for tracking.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleVulnSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="vulnName">Vulnerability Name *</Label>
                      <Input
                        id="vulnName"
                        value={vulnFormData.name}
                        onChange={(e) => setVulnFormData({ ...vulnFormData, name: e.target.value })}
                        placeholder="e.g., Reentrancy in withdraw function"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="vulnDescription">Description *</Label>
                      <Textarea
                        id="vulnDescription"
                        value={vulnFormData.description}
                        onChange={(e) => setVulnFormData({ ...vulnFormData, description: e.target.value })}
                        placeholder="Detailed description of the vulnerability..."
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vulnSource">Source</Label>
                      <Input
                        id="vulnSource"
                        value={vulnFormData.source}
                        onChange={(e) => setVulnFormData({ ...vulnFormData, source: e.target.value })}
                        placeholder="e.g., Internal audit, Bug bounty"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vulnSeverity">Severity</Label>
                      <Select value={vulnFormData.severity} onValueChange={(value: VulnerabilitySeverityType) => setVulnFormData({ ...vulnFormData, severity: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="vulnStatus">Status</Label>
                      <Select value={vulnFormData.status} onValueChange={(value: VulnerabilityStatusType) => setVulnFormData({ ...vulnFormData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Deferred">Deferred</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="vulnRemediation">Remediation Notes</Label>
                      <Textarea
                        id="vulnRemediation"
                        value={vulnFormData.remediationNotes}
                        onChange={(e) => setVulnFormData({ ...vulnFormData, remediationNotes: e.target.value })}
                        placeholder="Steps taken or planned to address this vulnerability..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsVulnDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVuln ? 'Update Vulnerability' : 'Add Vulnerability'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {vulnerabilities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bug className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Vulnerabilities Recorded</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Track security vulnerabilities and their remediation status.
                  </p>
                  <Button onClick={() => setIsVulnDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Vulnerability
                  </Button>
                </CardContent>
              </Card>
            ) : (
              vulnerabilities
                .sort((a, b) => {
                  const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
                  return severityOrder[b.severity] - severityOrder[a.severity];
                })
                .map((vuln) => (
                  <Card key={vuln.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{vuln.name}</CardTitle>
                            <Badge className={vulnerabilitySeverityColors[vuln.severity]}>
                              {vuln.severity}
                            </Badge>
                            <Badge className={vulnerabilityStatusColors[vuln.status]}>
                              {vuln.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {vuln.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVuln(vuln)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVuln(vuln.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">SOURCE</Label>
                          <div className="text-sm mt-1">{vuln.source || 'Not specified'}</div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">SEVERITY</Label>
                          <Badge className={`mt-1 ${vulnerabilitySeverityColors[vuln.severity]}`}>
                            {vuln.severity}
                          </Badge>
                        </div>
                      </div>
                      {vuln.remediationNotes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <Label className="text-xs font-medium text-muted-foreground">REMEDIATION NOTES</Label>
                          <p className="text-sm mt-1">{vuln.remediationNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}