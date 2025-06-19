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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, Plus, Edit, Trash2, AlertTriangle, Clock, Users, MessageSquare, CheckCircle, AlertCircle, Zap, FileText, ExternalLink, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { Incident, LogEntry, IncidentType, TeamMember, SeverityLevel } from '@/src/context/data-context';

const statusColors = {
  'Active': 'bg-red-100 text-red-800 border-red-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Monitoring': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const triageStatusColors = {
  'New': 'bg-red-100 text-red-800 border-red-200',
  'Acknowledged': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
};

const severityColors = {
  'Critical': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

export default function ActiveIncidentsPage() {
  const { 
    getActiveIncidents,
    saveActiveIncidents,
    getIncidentTypes,
    getTeamMembers,
    getSeverityLevels
  } = useData();

  const incidentTypes = getIncidentTypes();
  const teamMembers = getTeamMembers();
  const severityLevels = getSeverityLevels();
  const [incidents, setIncidents] = useState<Incident[]>(getActiveIncidents());

  // Dialog states
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedIncidentForLog, setSelectedIncidentForLog] = useState<Incident | null>(null);

  // Form states
  const [incidentFormData, setIncidentFormData] = useState({
    type: '',
    severity: '',
    assignedTeamMembers: [] as string[],
    communicationDrafts: '',
  });

  const [logFormData, setLogFormData] = useState({
    entry: '',
    tags: [] as string[],
    triageStatus: 'New' as 'New' | 'Acknowledged' | 'In Progress' | 'Resolved',
    triageAssignee: '',
    ticketLink: '',
  });

  const [newTag, setNewTag] = useState('');

  const resetIncidentForm = () => {
    setIncidentFormData({
      type: '',
      severity: '',
      assignedTeamMembers: [],
      communicationDrafts: '',
    });
    setEditingIncident(null);
  };

  const resetLogForm = () => {
    setLogFormData({
      entry: '',
      tags: [],
      triageStatus: 'New',
      triageAssignee: '',
      ticketLink: '',
    });
    setNewTag('');
  };

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incidentFormData.type.trim() || !incidentFormData.severity.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedIncidents: Incident[];
      
      if (editingIncident) {
        updatedIncidents = incidents.map(incident => 
          incident.id === editingIncident.id 
            ? { 
                ...incident, 
                type: incidentFormData.type,
                severity: incidentFormData.severity,
                assignedTeamMembers: incidentFormData.assignedTeamMembers,
                communicationDrafts: incidentFormData.communicationDrafts,
              }
            : incident
        );
        toast.success('Incident updated successfully');
      } else {
        const newIncident: Incident = {
          id: `incident_${Date.now()}`,
          type: incidentFormData.type,
          severity: incidentFormData.severity,
          startTimestamp: new Date().toISOString(),
          currentStatus: 'Active',
          assignedTeamMembers: incidentFormData.assignedTeamMembers,
          incidentLog: [],
          communicationDrafts: incidentFormData.communicationDrafts,
        };
        updatedIncidents = [...incidents, newIncident];
        toast.success('Incident created successfully');
      }

      setIncidents(updatedIncidents);
      await saveActiveIncidents(updatedIncidents);
      setIsIncidentDialogOpen(false);
      resetIncidentForm();
    } catch (error) {
      toast.error('Failed to save incident');
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logFormData.entry.trim() || !selectedIncidentForLog) {
      toast.error('Please fill in the log entry');
      return;
    }

    try {
      const newLogEntry: LogEntry = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        entry: logFormData.entry,
        tags: logFormData.tags,
        triageStatus: logFormData.triageStatus,
        triageAssignee: logFormData.triageAssignee,
        ticketLink: logFormData.ticketLink || undefined,
      };

      const updatedIncidents = incidents.map(incident => 
        incident.id === selectedIncidentForLog.id 
          ? { 
              ...incident, 
              incidentLog: [...incident.incidentLog, newLogEntry]
            }
          : incident
      );

      setIncidents(updatedIncidents);
      await saveActiveIncidents(updatedIncidents);
      setIsLogDialogOpen(false);
      resetLogForm();
      toast.success('Log entry added successfully');
    } catch (error) {
      toast.error('Failed to add log entry');
    }
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
    setIncidentFormData({
      type: incident.type,
      severity: incident.severity,
      assignedTeamMembers: incident.assignedTeamMembers,
      communicationDrafts: incident.communicationDrafts,
    });
    setIsIncidentDialogOpen(true);
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      const updatedIncidents = incidents.filter(incident => incident.id !== incidentId);
      setIncidents(updatedIncidents);
      await saveActiveIncidents(updatedIncidents);
      toast.success('Incident deleted successfully');
    } catch (error) {
      toast.error('Failed to delete incident');
    }
  };

  const handleStatusChange = async (incidentId: string, newStatus: 'Active' | 'Resolved' | 'Monitoring') => {
    try {
      const updatedIncidents = incidents.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              currentStatus: newStatus,
              resolutionTimestamp: newStatus === 'Resolved' ? new Date().toISOString() : incident.resolutionTimestamp
            }
          : incident
      );

      setIncidents(updatedIncidents);
      await saveActiveIncidents(updatedIncidents);
      toast.success(`Incident status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update incident status');
    }
  };

  const handleTeamMemberToggle = (memberName: string, isSelected: boolean) => {
    if (isSelected) {
      setIncidentFormData({
        ...incidentFormData,
        assignedTeamMembers: [...incidentFormData.assignedTeamMembers, memberName]
      });
    } else {
      setIncidentFormData({
        ...incidentFormData,
        assignedTeamMembers: incidentFormData.assignedTeamMembers.filter(m => m !== memberName)
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !logFormData.tags.includes(newTag.trim())) {
      setLogFormData({
        ...logFormData,
        tags: [...logFormData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setLogFormData({
      ...logFormData,
      tags: logFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const openLogDialog = (incident: Incident) => {
    setSelectedIncidentForLog(incident);
    resetLogForm();
    setIsLogDialogOpen(true);
  };

  // Statistics
  const stats = {
    totalActive: incidents.filter(i => i.currentStatus === 'Active').length,
    critical: incidents.filter(i => i.severity === 'Critical' && i.currentStatus === 'Active').length,
    monitoring: incidents.filter(i => i.currentStatus === 'Monitoring').length,
    resolved: incidents.filter(i => i.currentStatus === 'Resolved').length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-red-600" />
            Active Incidents
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage ongoing security incidents with real-time tracking and team coordination.
          </p>
        </div>
        <Dialog open={isIncidentDialogOpen} onOpenChange={setIsIncidentDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetIncidentForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingIncident ? 'Edit Incident' : 'Create New Incident'}
              </DialogTitle>
              <DialogDescription>
                {editingIncident 
                  ? 'Update the incident details below.'
                  : 'Create a new security incident for tracking and response.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Incident Type *</Label>
                  <Select value={incidentFormData.type} onValueChange={(value) => setIncidentFormData({ ...incidentFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map(type => (
                        <SelectItem key={type.id} value={type.type}>{type.type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Severity Level *</Label>
                  <Select value={incidentFormData.severity} onValueChange={(value) => setIncidentFormData({ ...incidentFormData, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map(level => (
                        <SelectItem key={level.level} value={level.level}>{level.level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Assigned Team Members</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`member-${member.name}`}
                        checked={incidentFormData.assignedTeamMembers.includes(member.name)}
                        onChange={(e) => handleTeamMemberToggle(member.name, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`member-${member.name}`} className="text-sm">
                        {member.name} ({member.role})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="communicationDrafts">Communication Drafts</Label>
                <Textarea
                  id="communicationDrafts"
                  value={incidentFormData.communicationDrafts}
                  onChange={(e) => setIncidentFormData({ ...incidentFormData, communicationDrafts: e.target.value })}
                  placeholder="Draft communications, status updates, or public statements..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsIncidentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIncident ? 'Update Incident' : 'Create Incident'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalActive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Zap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.monitoring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Log Entry Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Log Entry</DialogTitle>
            <DialogDescription>
              Add a new log entry to track incident progress and actions taken.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div>
              <Label htmlFor="logEntry">Log Entry *</Label>
              <Textarea
                id="logEntry"
                value={logFormData.entry}
                onChange={(e) => setLogFormData({ ...logFormData, entry: e.target.value })}
                placeholder="Describe what happened, actions taken, or observations..."
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="triageStatus">Triage Status</Label>
                <Select value={logFormData.triageStatus} onValueChange={(value: 'New' | 'Acknowledged' | 'In Progress' | 'Resolved') => setLogFormData({ ...logFormData, triageStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="triageAssignee">Assignee</Label>
                <Select value={logFormData.triageAssignee} onValueChange={(value) => setLogFormData({ ...logFormData, triageAssignee: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="ticketLink">Ticket/Issue Link</Label>
              <Input
                id="ticketLink"
                type="url"
                value={logFormData.ticketLink}
                onChange={(e) => setLogFormData({ ...logFormData, ticketLink: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {logFormData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Log Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Incidents</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create and track security incidents to coordinate your response efforts.
              </p>
              <Button onClick={() => setIsIncidentDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Incident
              </Button>
            </CardContent>
          </Card>
        ) : (
          incidents
            .sort((a, b) => {
              // Sort by status (Active first), then by severity, then by timestamp
              const statusOrder = { 'Active': 0, 'Monitoring': 1, 'Resolved': 2 };
              const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
              
              if (statusOrder[a.currentStatus] !== statusOrder[b.currentStatus]) {
                return statusOrder[a.currentStatus] - statusOrder[b.currentStatus];
              }
              if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[a.severity] - severityOrder[b.severity];
              }
              return new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime();
            })
            .map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{incident.type}</CardTitle>
                        <Badge className={statusColors[incident.currentStatus]}>
                          {incident.currentStatus}
                        </Badge>
                        <Badge className={severityColors[incident.severity]}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Started: {new Date(incident.startTimestamp).toLocaleString()}
                        </span>
                        {incident.resolutionTimestamp && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Resolved: {new Date(incident.resolutionTimestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={incident.currentStatus} onValueChange={(value: 'Active' | 'Resolved' | 'Monitoring') => handleStatusChange(incident.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Monitoring">Monitoring</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openLogDialog(incident)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditIncident(incident)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIncident(incident.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="log">Incident Log ({incident.incidentLog.length})</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                      <TabsTrigger value="communication">Communication</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">INCIDENT ID</Label>
                          <div className="text-sm mt-1 font-mono">{incident.id}</div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">DURATION</Label>
                          <div className="text-sm mt-1">
                            {incident.resolutionTimestamp 
                              ? `${Math.round((new Date(incident.resolutionTimestamp).getTime() - new Date(incident.startTimestamp).getTime()) / (1000 * 60))} minutes`
                              : `${Math.round((Date.now() - new Date(incident.startTimestamp).getTime()) / (1000 * 60))} minutes (ongoing)`
                            }
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">LOG ENTRIES</Label>
                          <div className="text-sm mt-1">{incident.incidentLog.length} entries</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="log" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Incident Log</h4>
                        <Button size="sm" onClick={() => openLogDialog(incident)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Entry
                        </Button>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {incident.incidentLog.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No log entries yet. Add the first entry to start tracking incident progress.
                          </p>
                        ) : (
                          incident.incidentLog
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((logEntry) => (
                              <div key={logEntry.id} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge className={triageStatusColors[logEntry.triageStatus]} variant="outline">
                                      {logEntry.triageStatus}
                                    </Badge>
                                    {logEntry.triageAssignee && (
                                      <Badge variant="secondary" className="text-xs">
                                        {logEntry.triageAssignee}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(logEntry.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  {logEntry.ticketLink && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      asChild
                                      className="h-6 w-6 p-0"
                                    >
                                      <a href={logEntry.ticketLink} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                                <p className="text-sm mb-2">{logEntry.entry}</p>
                                {logEntry.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {logEntry.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">ASSIGNED TEAM MEMBERS</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {incident.assignedTeamMembers.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No team members assigned</p>
                          ) : (
                            incident.assignedTeamMembers.map((memberName) => {
                              const member = teamMembers.find(m => m.name === memberName);
                              return (
                                <Badge key={memberName} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <Users className="h-3 w-3 mr-1" />
                                  {memberName} {member && `(${member.role})`}
                                </Badge>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="communication" className="space-y-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">COMMUNICATION DRAFTS</Label>
                        <div className="mt-2">
                          {incident.communicationDrafts ? (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{incident.communicationDrafts}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No communication drafts available</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}