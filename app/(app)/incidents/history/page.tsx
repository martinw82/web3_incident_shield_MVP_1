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
import { History, Plus, Edit, Trash2, Clock, CheckCircle, AlertTriangle, FileText, Users, Calendar, TrendingUp, BarChart3, Target, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Incident, PostIncidentReviewData, ActionItem, TeamMember } from '@/src/context/data-context';

const statusColors = {
  'Active': 'bg-red-100 text-red-800 border-red-200',
  'Resolved': 'bg-green-100 text-green-800 border-green-200',
  'Monitoring': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const severityColors = {
  'Critical': 'bg-red-100 text-red-800 border-red-200',
  'High': 'bg-orange-100 text-orange-800 border-orange-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

const actionStatusColors = {
  'Open': 'bg-red-100 text-red-800 border-red-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Completed': 'bg-green-100 text-green-800 border-green-200',
};

export default function IncidentHistoryPage() {
  const { 
    getActiveIncidents,
    getPostIncidentReviews,
    savePostIncidentReviews,
    getTeamMembers
  } = useData();

  const allIncidents = getActiveIncidents();
  const teamMembers = getTeamMembers();
  const [reviews, setReviews] = useState<PostIncidentReviewData[]>(getPostIncidentReviews());

  // Filter for historical incidents (resolved or monitoring)
  const historicalIncidents = allIncidents.filter(incident => 
    incident.currentStatus === 'Resolved' || incident.currentStatus === 'Monitoring'
  );

  // Dialog states
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<PostIncidentReviewData | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Form states
  const [reviewFormData, setReviewFormData] = useState({
    incidentId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    summary: '',
    rootCauseAnalysis: '',
    lessonsLearned: '',
    governanceRetrospectiveNotes: '',
    actionItems: [] as ActionItem[],
  });

  const [newActionItem, setNewActionItem] = useState({
    description: '',
    assignee: '',
    dueDate: '',
    status: 'Open' as 'Open' | 'In Progress' | 'Completed',
    ticketLink: '',
  });

  const resetReviewForm = () => {
    setReviewFormData({
      incidentId: '',
      reviewDate: new Date().toISOString().split('T')[0],
      summary: '',
      rootCauseAnalysis: '',
      lessonsLearned: '',
      governanceRetrospectiveNotes: '',
      actionItems: [],
    });
    setNewActionItem({
      description: '',
      assignee: '',
      dueDate: '',
      status: 'Open',
      ticketLink: '',
    });
    setEditingReview(null);
    setSelectedIncident(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewFormData.incidentId || !reviewFormData.summary.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedReviews: PostIncidentReviewData[];
      
      if (editingReview) {
        updatedReviews = reviews.map(review => 
          review.incidentId === editingReview.incidentId 
            ? { ...reviewFormData }
            : review
        );
        toast.success('Post-incident review updated successfully');
      } else {
        // Check if review already exists for this incident
        const existingReview = reviews.find(r => r.incidentId === reviewFormData.incidentId);
        if (existingReview) {
          toast.error('A post-incident review already exists for this incident');
          return;
        }

        const newReview: PostIncidentReviewData = {
          ...reviewFormData,
        };
        updatedReviews = [...reviews, newReview];
        toast.success('Post-incident review created successfully');
      }

      setReviews(updatedReviews);
      await savePostIncidentReviews(updatedReviews);
      setIsReviewDialogOpen(false);
      resetReviewForm();
    } catch (error) {
      toast.error('Failed to save post-incident review');
    }
  };

  const handleEditReview = (review: PostIncidentReviewData) => {
    setEditingReview(review);
    setReviewFormData({
      incidentId: review.incidentId,
      reviewDate: review.reviewDate,
      summary: review.summary,
      rootCauseAnalysis: review.rootCauseAnalysis,
      lessonsLearned: review.lessonsLearned,
      governanceRetrospectiveNotes: review.governanceRetrospectiveNotes,
      actionItems: review.actionItems,
    });
    setIsReviewDialogOpen(true);
  };

  const handleDeleteReview = async (incidentId: string) => {
    try {
      const updatedReviews = reviews.filter(review => review.incidentId !== incidentId);
      setReviews(updatedReviews);
      await savePostIncidentReviews(updatedReviews);
      toast.success('Post-incident review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post-incident review');
    }
  };

  const addActionItem = () => {
    if (!newActionItem.description.trim() || !newActionItem.assignee.trim()) {
      toast.error('Please fill in action item details');
      return;
    }

    const actionItem: ActionItem = {
      id: `action_${Date.now()}`,
      description: newActionItem.description,
      assignee: newActionItem.assignee,
      dueDate: newActionItem.dueDate,
      status: newActionItem.status,
      ticketLink: newActionItem.ticketLink || undefined,
    };

    setReviewFormData({
      ...reviewFormData,
      actionItems: [...reviewFormData.actionItems, actionItem]
    });
    setNewActionItem({
      description: '',
      assignee: '',
      dueDate: '',
      status: 'Open',
      ticketLink: '',
    });
  };

  const removeActionItem = (actionId: string) => {
    setReviewFormData({
      ...reviewFormData,
      actionItems: reviewFormData.actionItems.filter(item => item.id !== actionId)
    });
  };

  const openReviewDialog = (incident?: Incident) => {
    resetReviewForm();
    if (incident) {
      setSelectedIncident(incident);
      setReviewFormData(prev => ({
        ...prev,
        incidentId: incident.id
      }));
    }
    setIsReviewDialogOpen(true);
  };

  const getIncidentById = (incidentId: string): Incident | undefined => {
    return allIncidents.find(incident => incident.id === incidentId);
  };

  const getReviewForIncident = (incidentId: string): PostIncidentReviewData | undefined => {
    return reviews.find(review => review.incidentId === incidentId);
  };

  // Calculate statistics
  const stats = {
    totalHistorical: historicalIncidents.length,
    resolved: historicalIncidents.filter(i => i.currentStatus === 'Resolved').length,
    monitoring: historicalIncidents.filter(i => i.currentStatus === 'Monitoring').length,
    withReviews: reviews.length,
    avgResolutionTime: historicalIncidents.length > 0 
      ? Math.round(
          historicalIncidents
            .filter(i => i.resolutionTimestamp)
            .reduce((acc, incident) => {
              const duration = new Date(incident.resolutionTimestamp!).getTime() - new Date(incident.startTimestamp).getTime();
              return acc + duration;
            }, 0) / 
          historicalIncidents.filter(i => i.resolutionTimestamp).length / 
          (1000 * 60 * 60)
        )
      : 0,
    openActionItems: reviews.reduce((acc, review) => 
      acc + review.actionItems.filter(item => item.status !== 'Completed').length, 0
    ),
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="h-8 w-8 text-blue-600" />
            Incident History
          </h1>
          <p className="text-muted-foreground mt-2">
            Review past incidents, conduct post-incident analysis, and track lessons learned.
          </p>
        </div>
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openReviewDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Edit Post-Incident Review' : 'Create Post-Incident Review'}
              </DialogTitle>
              <DialogDescription>
                {editingReview 
                  ? 'Update the post-incident review details below.'
                  : 'Conduct a comprehensive review of the incident and document lessons learned.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="actions">Action Items</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="incidentId">Incident *</Label>
                      <Select 
                        value={reviewFormData.incidentId} 
                        onValueChange={(value) => setReviewFormData({ ...reviewFormData, incidentId: value })}
                        disabled={!!editingReview}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident" />
                        </SelectTrigger>
                        <SelectContent>
                          {historicalIncidents.map(incident => (
                            <SelectItem key={incident.id} value={incident.id}>
                              {incident.type} - {new Date(incident.startTimestamp).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reviewDate">Review Date *</Label>
                      <Input
                        id="reviewDate"
                        type="date"
                        value={reviewFormData.reviewDate}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, reviewDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="summary">Executive Summary *</Label>
                      <Textarea
                        id="summary"
                        value={reviewFormData.summary}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, summary: e.target.value })}
                        placeholder="High-level summary of the incident and its resolution..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div>
                    <Label htmlFor="rootCause">Root Cause Analysis</Label>
                    <Textarea
                      id="rootCause"
                      value={reviewFormData.rootCauseAnalysis}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, rootCauseAnalysis: e.target.value })}
                      placeholder="Detailed analysis of what caused the incident..."
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                    <Textarea
                      id="lessonsLearned"
                      value={reviewFormData.lessonsLearned}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, lessonsLearned: e.target.value })}
                      placeholder="Key insights and takeaways from this incident..."
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="governance">Governance & Process Retrospective</Label>
                    <Textarea
                      id="governance"
                      value={reviewFormData.governanceRetrospectiveNotes}
                      onChange={(e) => setReviewFormData({ ...reviewFormData, governanceRetrospectiveNotes: e.target.value })}
                      placeholder="Review of governance processes, decision-making, and organizational response..."
                      rows={5}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Action Items</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Action item description"
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                      />
                      <Select value={newActionItem.assignee} onValueChange={(value) => setNewActionItem({ ...newActionItem, assignee: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map(member => (
                            <SelectItem key={member.name} value={member.name}>{member.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        placeholder="Due date"
                        value={newActionItem.dueDate}
                        onChange={(e) => setNewActionItem({ ...newActionItem, dueDate: e.target.value })}
                      />
                      <Select value={newActionItem.status} onValueChange={(value: 'Open' | 'In Progress' | 'Completed') => setNewActionItem({ ...newActionItem, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Ticket/Issue link (optional)"
                        value={newActionItem.ticketLink}
                        onChange={(e) => setNewActionItem({ ...newActionItem, ticketLink: e.target.value })}
                      />
                      <Button type="button" onClick={addActionItem}>
                        Add Action Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {reviewFormData.actionItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge className={actionStatusColors[item.status]}>
                              {item.status}
                            </Badge>
                            <span className="text-sm flex-1">{item.description}</span>
                            <Badge variant="secondary" className="text-xs">{item.assignee}</Badge>
                            {item.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Due: {new Date(item.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {item.ticketLink && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-6 w-6 p-0"
                              >
                                <a href={item.ticketLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActionItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingReview ? 'Update Review' : 'Create Review'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Historical Incidents</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHistorical}</div>
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
            <CardTitle className="text-sm font-medium">With Reviews</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.withReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Actions</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.openActionItems}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incidents">Historical Incidents</TabsTrigger>
          <TabsTrigger value="reviews">Post-Incident Reviews</TabsTrigger>
        </TabsList>

        {/* Historical Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          {historicalIncidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Historical Incidents</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Resolved and monitoring incidents will appear here for historical analysis.
                </p>
              </CardContent>
            </Card>
          ) : (
            historicalIncidents
              .sort((a, b) => new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime())
              .map((incident) => {
                const review = getReviewForIncident(incident.id);
                const duration = incident.resolutionTimestamp 
                  ? Math.round((new Date(incident.resolutionTimestamp).getTime() - new Date(incident.startTimestamp).getTime()) / (1000 * 60 * 60))
                  : null;

                return (
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
                            {review && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <FileText className="h-3 w-3 mr-1" />
                                Reviewed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(incident.startTimestamp).toLocaleString()}
                            </span>
                            {duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Duration: {duration}h
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {incident.assignedTeamMembers.length} team members
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!review && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewDialog(incident)}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-sm">View Incident Details</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">INCIDENT ID</Label>
                                <div className="text-sm mt-1 font-mono">{incident.id}</div>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">LOG ENTRIES</Label>
                                <div className="text-sm mt-1">{incident.incidentLog.length} entries</div>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">ASSIGNED TEAM</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {incident.assignedTeamMembers.map((memberName) => (
                                  <Badge key={memberName} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {memberName}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {incident.communicationDrafts && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">COMMUNICATION NOTES</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{incident.communicationDrafts}</p>
                                </div>
                              </div>
                            )}

                            {review && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">POST-INCIDENT REVIEW</Label>
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Review completed on {new Date(review.reviewDate).toLocaleDateString()}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditReview(review)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <p className="text-sm">{review.summary}</p>
                                  {review.actionItems.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {review.actionItems.length} action items
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        {/* Post-Incident Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Post-Incident Reviews</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create post-incident reviews to document lessons learned and action items.
                </p>
                <Button onClick={() => openReviewDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            reviews
              .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())
              .map((review) => {
                const incident = getIncidentById(review.incidentId);
                
                return (
                  <Card key={review.incidentId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {incident ? incident.type : 'Unknown Incident'}
                            </CardTitle>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <FileText className="h-3 w-3 mr-1" />
                              Review
                            </Badge>
                            {review.actionItems.length > 0 && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {review.actionItems.filter(item => item.status !== 'Completed').length} open actions
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Review Date: {new Date(review.reviewDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.incidentId)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="review-details">
                          <AccordionTrigger className="text-sm">View Review Details</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">EXECUTIVE SUMMARY</Label>
                              <p className="text-sm mt-1">{review.summary}</p>
                            </div>

                            {review.rootCauseAnalysis && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">ROOT CAUSE ANALYSIS</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{review.rootCauseAnalysis}</p>
                              </div>
                            )}

                            {review.lessonsLearned && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">LESSONS LEARNED</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{review.lessonsLearned}</p>
                              </div>
                            )}

                            {review.governanceRetrospectiveNotes && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">GOVERNANCE RETROSPECTIVE</Label>
                                <p className="text-sm mt-1 whitespace-pre-wrap">{review.governanceRetrospectiveNotes}</p>
                              </div>
                            )}

                            {review.actionItems.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">ACTION ITEMS</Label>
                                <div className="mt-2 space-y-2">
                                  {review.actionItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                      <div className="flex items-center gap-3 flex-1">
                                        <Badge className={actionStatusColors[item.status]}>
                                          {item.status}
                                        </Badge>
                                        <span className="text-sm flex-1">{item.description}</span>
                                        <Badge variant="secondary" className="text-xs">{item.assignee}</Badge>
                                        {item.dueDate && (
                                          <span className="text-xs text-muted-foreground">
                                            Due: {new Date(item.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      {item.ticketLink && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          asChild
                                          className="h-6 w-6 p-0"
                                        >
                                          <a href={item.ticketLink} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}