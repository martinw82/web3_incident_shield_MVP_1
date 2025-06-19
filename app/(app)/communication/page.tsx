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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Edit, Trash2, Users, MessageCircle, FileText, Settings, ExternalLink, Star, Hash } from 'lucide-react';
import { toast } from 'sonner';
import type { Channel, RoleAssignment, Template, CommunicationRoleType } from '@/src/context/data-context';

const roleOptions: CommunicationRoleType[] = [
  'Lead Communicator',
  'Technical Lead', 
  'Legal Liaison',
  'Community Manager',
  'Executive Spokesperson'
];

const platformOptions = [
  'Twitter/X',
  'Discord',
  'Telegram',
  'Slack',
  'Email',
  'Blog',
  'GitHub',
  'Medium',
  'LinkedIn',
  'Reddit',
  'Other'
];

export default function CommunicationPage() {
  const { 
    getTeamMembers,
    getCommunicationChannels,
    saveCommunicationChannels,
    getCommunicationRoles,
    saveCommunicationRoles,
    getCommunicationPrinciples,
    saveCommunicationPrinciples,
    getCommunicationTemplates,
    saveCommunicationTemplates
  } = useData();

  const teamMembers = getTeamMembers();
  const [channels, setChannels] = useState<Channel[]>(getCommunicationChannels());
  const [roles, setRoles] = useState<RoleAssignment[]>(getCommunicationRoles());
  const [principles, setPrinciples] = useState<string>(getCommunicationPrinciples());
  const [templates, setTemplates] = useState<Template[]>(getCommunicationTemplates());

  // Dialog states
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editingRole, setEditingRole] = useState<RoleAssignment | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form states
  const [channelFormData, setChannelFormData] = useState({
    platform: '',
    link: '',
    isPrimary: false,
  });

  const [roleFormData, setRoleFormData] = useState({
    role: 'Lead Communicator' as CommunicationRoleType,
    assignedMemberName: '',
    responsibilities: '',
  });

  const [templateFormData, setTemplateFormData] = useState({
    templateName: '',
    templateContent: '',
    suggestedChannels: [] as string[],
  });

  // Channel functions
  const resetChannelForm = () => {
    setChannelFormData({
      platform: '',
      link: '',
      isPrimary: false,
    });
    setEditingChannel(null);
  };

  const handleChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelFormData.platform.trim() || !channelFormData.link.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedChannels: Channel[];
      
      if (editingChannel) {
        updatedChannels = channels.map(channel => 
          channel.id === editingChannel.id 
            ? { ...channel, ...channelFormData }
            : channel
        );
        toast.success('Channel updated successfully');
      } else {
        const newChannel: Channel = {
          id: `channel_${Date.now()}`,
          ...channelFormData,
        };
        updatedChannels = [...channels, newChannel];
        toast.success('Channel added successfully');
      }

      setChannels(updatedChannels);
      await saveCommunicationChannels(updatedChannels);
      setIsChannelDialogOpen(false);
      resetChannelForm();
    } catch (error) {
      toast.error('Failed to save channel');
    }
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setChannelFormData({
      platform: channel.platform,
      link: channel.link,
      isPrimary: channel.isPrimary,
    });
    setIsChannelDialogOpen(true);
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      const updatedChannels = channels.filter(channel => channel.id !== channelId);
      setChannels(updatedChannels);
      await saveCommunicationChannels(updatedChannels);
      toast.success('Channel deleted successfully');
    } catch (error) {
      toast.error('Failed to delete channel');
    }
  };

  // Role functions
  const resetRoleForm = () => {
    setRoleFormData({
      role: 'Lead Communicator',
      assignedMemberName: '',
      responsibilities: '',
    });
    setEditingRole(null);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleFormData.assignedMemberName.trim() || !roleFormData.responsibilities.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedRoles: RoleAssignment[];
      
      if (editingRole) {
        updatedRoles = roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...roleFormData }
            : role
        );
        toast.success('Role updated successfully');
      } else {
        const newRole: RoleAssignment = {
          id: `role_${Date.now()}`,
          ...roleFormData,
        };
        updatedRoles = [...roles, newRole];
        toast.success('Role assigned successfully');
      }

      setRoles(updatedRoles);
      await saveCommunicationRoles(updatedRoles);
      setIsRoleDialogOpen(false);
      resetRoleForm();
    } catch (error) {
      toast.error('Failed to save role assignment');
    }
  };

  const handleEditRole = (role: RoleAssignment) => {
    setEditingRole(role);
    setRoleFormData({
      role: role.role,
      assignedMemberName: role.assignedMemberName,
      responsibilities: role.responsibilities,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      await saveCommunicationRoles(updatedRoles);
      toast.success('Role assignment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete role assignment');
    }
  };

  // Template functions
  const resetTemplateForm = () => {
    setTemplateFormData({
      templateName: '',
      templateContent: '',
      suggestedChannels: [],
    });
    setEditingTemplate(null);
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateFormData.templateName.trim() || !templateFormData.templateContent.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedTemplates: Template[];
      
      if (editingTemplate) {
        updatedTemplates = templates.map(template => 
          template.id === editingTemplate.id 
            ? { ...template, ...templateFormData }
            : template
        );
        toast.success('Template updated successfully');
      } else {
        const newTemplate: Template = {
          id: `template_${Date.now()}`,
          ...templateFormData,
        };
        updatedTemplates = [...templates, newTemplate];
        toast.success('Template added successfully');
      }

      setTemplates(updatedTemplates);
      await saveCommunicationTemplates(updatedTemplates);
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateFormData({
      templateName: template.templateName,
      templateContent: template.templateContent,
      suggestedChannels: template.suggestedChannels,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      setTemplates(updatedTemplates);
      await saveCommunicationTemplates(updatedTemplates);
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handlePrinciplesUpdate = async () => {
    try {
      await saveCommunicationPrinciples(principles);
      toast.success('Communication principles updated successfully');
    } catch (error) {
      toast.error('Failed to update communication principles');
    }
  };

  const handleChannelToggle = (channelName: string, isSelected: boolean) => {
    if (isSelected) {
      setTemplateFormData({
        ...templateFormData,
        suggestedChannels: [...templateFormData.suggestedChannels, channelName]
      });
    } else {
      setTemplateFormData({
        ...templateFormData,
        suggestedChannels: templateFormData.suggestedChannels.filter(c => c !== channelName)
      });
    }
  };

  // Statistics
  const stats = {
    totalChannels: channels.length,
    primaryChannels: channels.filter(c => c.isPrimary).length,
    assignedRoles: roles.length,
    availableTemplates: templates.length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            Communication Plan
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage communication channels, team roles, and response templates for incident management.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChannels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Channels</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.primaryChannels}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Roles</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assignedRoles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.availableTemplates}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="roles">Team Roles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
        </TabsList>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Communication Channels</h2>
              <p className="text-muted-foreground">Manage your incident communication channels and platforms.</p>
            </div>
            <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetChannelForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingChannel ? 'Edit Channel' : 'Add New Channel'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingChannel 
                      ? 'Update the channel details below.'
                      : 'Add a new communication channel for incident response.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChannelSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="platform">Platform *</Label>
                      <Select value={channelFormData.platform} onValueChange={(value) => setChannelFormData({ ...channelFormData, platform: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platformOptions.map(platform => (
                            <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="isPrimary"
                        checked={channelFormData.isPrimary}
                        onCheckedChange={(checked) => setChannelFormData({ ...channelFormData, isPrimary: checked })}
                      />
                      <Label htmlFor="isPrimary">Primary Channel</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="link">Channel Link/URL *</Label>
                    <Input
                      id="link"
                      type="url"
                      value={channelFormData.link}
                      onChange={(e) => setChannelFormData({ ...channelFormData, link: e.target.value })}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsChannelDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingChannel ? 'Update Channel' : 'Add Channel'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Channels Configured</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add communication channels to manage incident response communications.
                  </p>
                  <Button onClick={() => setIsChannelDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Your First Channel
                  </Button>
                </CardContent>
              </Card>
            ) : (
              channels.map((channel) => (
                <Card key={channel.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{channel.platform}</CardTitle>
                        {channel.isPrimary && (
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditChannel(channel)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChannel(channel.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate flex-1 mr-2">
                        {channel.link}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a href={channel.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Communication Roles</h2>
              <p className="text-muted-foreground">Assign team members to specific communication roles during incidents.</p>
            </div>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetRoleForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Assign Role
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Edit Role Assignment' : 'Assign Communication Role'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRole 
                      ? 'Update the role assignment details below.'
                      : 'Assign a team member to a specific communication role.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRoleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Communication Role</Label>
                      <Select value={roleFormData.role} onValueChange={(value: CommunicationRoleType) => setRoleFormData({ ...roleFormData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignedMember">Assigned Team Member *</Label>
                      <Select value={roleFormData.assignedMemberName} onValueChange={(value) => setRoleFormData({ ...roleFormData, assignedMemberName: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
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
                    <Label htmlFor="responsibilities">Responsibilities *</Label>
                    <Textarea
                      id="responsibilities"
                      value={roleFormData.responsibilities}
                      onChange={(e) => setRoleFormData({ ...roleFormData, responsibilities: e.target.value })}
                      placeholder="Describe the key responsibilities for this role..."
                      rows={4}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRole ? 'Update Assignment' : 'Assign Role'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {roles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Roles Assigned</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Assign team members to communication roles for effective incident response.
                  </p>
                  <Button onClick={() => setIsRoleDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign Your First Role
                  </Button>
                </CardContent>
              </Card>
            ) : (
              roles.map((role) => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{role.role}</CardTitle>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {role.assignedMemberName}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">RESPONSIBILITIES</Label>
                      <p className="text-sm">{role.responsibilities}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Communication Templates</h2>
              <p className="text-muted-foreground">Pre-written templates for different types of incident communications.</p>
            </div>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetTemplateForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Add New Template'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingTemplate 
                      ? 'Update the template details below.'
                      : 'Create a new communication template for incident response.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={templateFormData.templateName}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, templateName: e.target.value })}
                      placeholder="e.g., Initial Incident Acknowledgment"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateContent">Template Content *</Label>
                    <Textarea
                      id="templateContent"
                      value={templateFormData.templateContent}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, templateContent: e.target.value })}
                      placeholder="Write your template content here. Use placeholders like {incident_type}, {timestamp}, etc."
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Suggested Channels</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {channels.map((channel) => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`channel-${channel.id}`}
                            checked={templateFormData.suggestedChannels.includes(channel.platform)}
                            onChange={(e) => handleChannelToggle(channel.platform, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`channel-${channel.id}`} className="text-sm">
                            {channel.platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? 'Update Template' : 'Add Template'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Created</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create communication templates to streamline your incident response messaging.
                  </p>
                  <Button onClick={() => setIsTemplateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{template.templateName}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          {template.suggestedChannels.map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <Label className="text-xs font-medium text-muted-foreground">TEMPLATE CONTENT</Label>
                      <p className="text-sm mt-2 whitespace-pre-wrap">{template.templateContent}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Principles Tab */}
        <TabsContent value="principles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Communication Principles</h2>
              <p className="text-muted-foreground">Define your organization's communication principles and guidelines for incident response.</p>
            </div>
            <Button onClick={handlePrinciplesUpdate} className="gap-2">
              <Settings className="h-4 w-4" />
              Save Principles
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Communication Guidelines
              </CardTitle>
              <CardDescription>
                Document your communication principles, response times, and messaging guidelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={principles}
                onChange={(e) => setPrinciples(e.target.value)}
                placeholder="Define your communication principles here..."
                rows={15}
                className="font-mono text-sm"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💡 Suggested Principles to Include:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Transparency and honesty in all communications</li>
                  <li>• Response time commitments (e.g., initial response within 30 minutes)</li>
                  <li>• Regular update schedules during active incidents</li>
                  <li>• Tone and voice guidelines for different severity levels</li>
                  <li>• Approval processes for different types of communications</li>
                  <li>• Post-incident communication and follow-up procedures</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}