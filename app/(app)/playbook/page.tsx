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
import { BookOpen, Plus, Edit, Trash2, AlertTriangle, Users, FileText, Settings, CheckCircle, Clock, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { IncidentType, Step, CommunicationSnippet, SeverityLevel, TeamMember } from '@/src/context/data-context';

const defaultIncidentTypes = [
  'Smart Contract Vulnerability',
  'Private Key Compromise',
  'DDoS Attack',
  'Oracle Manipulation',
  'Governance Attack',
  'Bridge Exploit',
  'Flash Loan Attack',
  'Reentrancy Attack',
  'Front-running Attack',
  'Phishing Campaign',
  'Social Engineering',
  'Infrastructure Outage',
  'Database Breach',
  'API Compromise',
  'Other'
];

export default function PlaybookPage() {
  const { 
    getIncidentTypes,
    saveIncidentTypes,
    getTeamMembers,
    getSeverityLevels
  } = useData();

  const teamMembers = getTeamMembers();
  const severityLevels = getSeverityLevels();
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>(getIncidentTypes());

  // Dialog states
  const [isIncidentTypeDialogOpen, setIsIncidentTypeDialogOpen] = useState(false);
  const [editingIncidentType, setEditingIncidentType] = useState<IncidentType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    triggerConditions: '',
    initialAssessmentSteps: [] as Step[],
    technicalResponseSteps: [] as Step[],
    postMortemSteps: [] as Step[],
    communicationStrategy: '',
    communicationSnippets: [] as CommunicationSnippet[],
    legalConsiderations: '',
    linkedRiskIds: [] as string[],
  });

  // Step management
  const [newStep, setNewStep] = useState({ text: '', assignedMemberName: '' });
  const [newSnippet, setNewSnippet] = useState({ description: '', content: '' });

  const resetForm = () => {
    setFormData({
      type: '',
      description: '',
      triggerConditions: '',
      initialAssessmentSteps: [],
      technicalResponseSteps: [],
      postMortemSteps: [],
      communicationStrategy: '',
      communicationSnippets: [],
      legalConsiderations: '',
      linkedRiskIds: [],
    });
    setEditingIncidentType(null);
    setNewStep({ text: '', assignedMemberName: '' });
    setNewSnippet({ description: '', content: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedIncidentTypes: IncidentType[];
      
      if (editingIncidentType) {
        updatedIncidentTypes = incidentTypes.map(incident => 
          incident.id === editingIncidentType.id 
            ? { ...incident, ...formData }
            : incident
        );
        toast.success('Incident type updated successfully');
      } else {
        const newIncidentType: IncidentType = {
          id: `incident_${Date.now()}`,
          ...formData,
        };
        updatedIncidentTypes = [...incidentTypes, newIncidentType];
        toast.success('Incident type added successfully');
      }

      setIncidentTypes(updatedIncidentTypes);
      await saveIncidentTypes(updatedIncidentTypes);
      setIsIncidentTypeDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save incident type');
    }
  };

  const handleEdit = (incidentType: IncidentType) => {
    setEditingIncidentType(incidentType);
    setFormData({
      type: incidentType.type,
      description: incidentType.description,
      triggerConditions: incidentType.triggerConditions,
      initialAssessmentSteps: incidentType.initialAssessmentSteps,
      technicalResponseSteps: incidentType.technicalResponseSteps,
      postMortemSteps: incidentType.postMortemSteps,
      communicationStrategy: incidentType.communicationStrategy,
      communicationSnippets: incidentType.communicationSnippets,
      legalConsiderations: incidentType.legalConsiderations,
      linkedRiskIds: incidentType.linkedRiskIds,
    });
    setIsIncidentTypeDialogOpen(true);
  };

  const handleDelete = async (incidentTypeId: string) => {
    try {
      const updatedIncidentTypes = incidentTypes.filter(incident => incident.id !== incidentTypeId);
      setIncidentTypes(updatedIncidentTypes);
      await saveIncidentTypes(updatedIncidentTypes);
      toast.success('Incident type deleted successfully');
    } catch (error) {
      toast.error('Failed to delete incident type');
    }
  };

  // Step management functions
  const addStep = (stepType: 'initialAssessmentSteps' | 'technicalResponseSteps' | 'postMortemSteps') => {
    if (!newStep.text.trim() || !newStep.assignedMemberName.trim()) {
      toast.error('Please fill in step details');
      return;
    }

    const step: Step = {
      id: `step_${Date.now()}`,
      text: newStep.text,
      assignedMemberName: newStep.assignedMemberName,
    };

    setFormData({
      ...formData,
      [stepType]: [...formData[stepType], step]
    });
    setNewStep({ text: '', assignedMemberName: '' });
  };

  const removeStep = (stepType: 'initialAssessmentSteps' | 'technicalResponseSteps' | 'postMortemSteps', stepId: string) => {
    setFormData({
      ...formData,
      [stepType]: formData[stepType].filter(step => step.id !== stepId)
    });
  };

  // Communication snippet management
  const addSnippet = () => {
    if (!newSnippet.description.trim() || !newSnippet.content.trim()) {
      toast.error('Please fill in snippet details');
      return;
    }

    const snippet: CommunicationSnippet = {
      id: `snippet_${Date.now()}`,
      description: newSnippet.description,
      content: newSnippet.content,
    };

    setFormData({
      ...formData,
      communicationSnippets: [...formData.communicationSnippets, snippet]
    });
    setNewSnippet({ description: '', content: '' });
  };

  const removeSnippet = (snippetId: string) => {
    setFormData({
      ...formData,
      communicationSnippets: formData.communicationSnippets.filter(snippet => snippet.id !== snippetId)
    });
  };

  // Statistics
  const stats = {
    totalPlaybooks: incidentTypes.length,
    avgStepsPerPlaybook: incidentTypes.length > 0 
      ? Math.round(incidentTypes.reduce((acc, incident) => 
          acc + incident.initialAssessmentSteps.length + incident.technicalResponseSteps.length + incident.postMortemSteps.length, 0
        ) / incidentTypes.length)
      : 0,
    playbooksWithCommunication: incidentTypes.filter(incident => incident.communicationSnippets.length > 0).length,
    playbooksWithLegal: incidentTypes.filter(incident => incident.legalConsiderations.trim().length > 0).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Response Playbook
          </h1>
          <p className="text-muted-foreground mt-2">
            Define incident response procedures, team roles, and communication strategies for different incident types.
          </p>
        </div>
        <Dialog open={isIncidentTypeDialogOpen} onOpenChange={setIsIncidentTypeDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Playbook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIncidentType ? 'Edit Incident Playbook' : 'Create New Incident Playbook'}
              </DialogTitle>
              <DialogDescription>
                {editingIncidentType 
                  ? 'Update the incident response playbook details below.'
                  : 'Define a comprehensive response plan for a specific incident type.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="steps">Response Steps</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="legal">Legal & Risks</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="type">Incident Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultIncidentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed description of this incident type..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="triggerConditions">Trigger Conditions</Label>
                      <Textarea
                        id="triggerConditions"
                        value={formData.triggerConditions}
                        onChange={(e) => setFormData({ ...formData, triggerConditions: e.target.value })}
                        placeholder="What conditions or indicators trigger this incident type?"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="space-y-6">
                  {/* Initial Assessment Steps */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="text-lg font-semibold">Initial Assessment Steps</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Step description"
                        value={newStep.text}
                        onChange={(e) => setNewStep({ ...newStep, text: e.target.value })}
                      />
                      <Select value={newStep.assignedMemberName} onValueChange={(value) => setNewStep({ ...newStep, assignedMemberName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={() => addStep('initialAssessmentSteps')} size="sm">
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.initialAssessmentSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{step.text}</span>
                            <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep('initialAssessmentSteps', step.id)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Response Steps */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Technical Response Steps</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Step description"
                        value={newStep.text}
                        onChange={(e) => setNewStep({ ...newStep, text: e.target.value })}
                      />
                      <Select value={newStep.assignedMemberName} onValueChange={(value) => setNewStep({ ...newStep, assignedMemberName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={() => addStep('technicalResponseSteps')} size="sm">
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.technicalResponseSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{step.text}</span>
                            <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep('technicalResponseSteps', step.id)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post-Mortem Steps */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Post-Mortem Steps</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Step description"
                        value={newStep.text}
                        onChange={(e) => setNewStep({ ...newStep, text: e.target.value })}
                      />
                      <Select value={newStep.assignedMemberName} onValueChange={(value) => setNewStep({ ...newStep, assignedMemberName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={() => addStep('postMortemSteps')} size="sm">
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.postMortemSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="text-sm">{step.text}</span>
                            <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep('postMortemSteps', step.id)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="communication" className="space-y-4">
                  <div>
                    <Label htmlFor="communicationStrategy">Communication Strategy</Label>
                    <Textarea
                      id="communicationStrategy"
                      value={formData.communicationStrategy}
                      onChange={(e) => setFormData({ ...formData, communicationStrategy: e.target.value })}
                      placeholder="Overall communication approach for this incident type..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Communication Snippets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Snippet description"
                        value={newSnippet.description}
                        onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                      />
                      <Button type="button" onClick={addSnippet} size="sm">
                        Add Snippet
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Communication content/template"
                      value={newSnippet.content}
                      onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                      rows={3}
                    />
                    <div className="space-y-2">
                      {formData.communicationSnippets.map((snippet) => (
                        <div key={snippet.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{snippet.description}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSnippet(snippet.id)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{snippet.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <div>
                    <Label htmlFor="legalConsiderations">Legal Considerations</Label>
                    <Textarea
                      id="legalConsiderations"
                      value={formData.legalConsiderations}
                      onChange={(e) => setFormData({ ...formData, legalConsiderations: e.target.value })}
                      placeholder="Legal considerations, compliance requirements, regulatory notifications..."
                      rows={6}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsIncidentTypeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIncidentType ? 'Update Playbook' : 'Create Playbook'}
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
            <CardTitle className="text-sm font-medium">Total Playbooks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlaybooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Steps</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgStepsPerPlaybook}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Communication</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.playbooksWithCommunication}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Legal Notes</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.playbooksWithLegal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Playbook List */}
      <div className="space-y-4">
        {incidentTypes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Playbooks Created</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create incident response playbooks to define procedures for different types of security incidents.
              </p>
              <Button onClick={() => setIsIncidentTypeDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Playbook
              </Button>
            </CardContent>
          </Card>
        ) : (
          incidentTypes.map((incidentType) => (
            <Card key={incidentType.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{incidentType.type}</CardTitle>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Zap className="h-3 w-3 mr-1" />
                        Playbook
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {incidentType.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(incidentType)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(incidentType.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm">View Playbook Details</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {incidentType.triggerConditions && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">TRIGGER CONDITIONS</Label>
                          <p className="text-sm mt-1">{incidentType.triggerConditions}</p>
                        </div>
                      )}
                      
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">INITIAL ASSESSMENT</Label>
                          <div className="mt-2 space-y-1">
                            {incidentType.initialAssessmentSteps.map((step, index) => (
                              <div key={step.id} className="text-sm flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                <span className="flex-1">{step.text}</span>
                                <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                              </div>
                            ))}
                            {incidentType.initialAssessmentSteps.length === 0 && (
                              <p className="text-sm text-muted-foreground">No steps defined</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">TECHNICAL RESPONSE</Label>
                          <div className="mt-2 space-y-1">
                            {incidentType.technicalResponseSteps.map((step, index) => (
                              <div key={step.id} className="text-sm flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                <span className="flex-1">{step.text}</span>
                                <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                              </div>
                            ))}
                            {incidentType.technicalResponseSteps.length === 0 && (
                              <p className="text-sm text-muted-foreground">No steps defined</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">POST-MORTEM</Label>
                          <div className="mt-2 space-y-1">
                            {incidentType.postMortemSteps.map((step, index) => (
                              <div key={step.id} className="text-sm flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                <span className="flex-1">{step.text}</span>
                                <Badge variant="secondary" className="text-xs">{step.assignedMemberName}</Badge>
                              </div>
                            ))}
                            {incidentType.postMortemSteps.length === 0 && (
                              <p className="text-sm text-muted-foreground">No steps defined</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {incidentType.communicationStrategy && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">COMMUNICATION STRATEGY</Label>
                          <p className="text-sm mt-1">{incidentType.communicationStrategy}</p>
                        </div>
                      )}

                      {incidentType.communicationSnippets.length > 0 && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">COMMUNICATION SNIPPETS</Label>
                          <div className="mt-2 space-y-2">
                            {incidentType.communicationSnippets.map((snippet) => (
                              <div key={snippet.id} className="p-2 bg-muted/30 rounded">
                                <Badge variant="outline" className="text-xs mb-1">{snippet.description}</Badge>
                                <p className="text-sm">{snippet.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {incidentType.legalConsiderations && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">LEGAL CONSIDERATIONS</Label>
                          <p className="text-sm mt-1">{incidentType.legalConsiderations}</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}