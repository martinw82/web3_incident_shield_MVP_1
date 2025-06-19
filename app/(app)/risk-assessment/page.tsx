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
import { AlertTriangle, Plus, Edit, Trash2, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Risk } from '@/src/context/data-context';

const impactColors = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const likelihoodColors = {
  Low: 'bg-blue-100 text-blue-800 border-blue-200',
  Medium: 'bg-orange-100 text-orange-800 border-orange-200',
  High: 'bg-purple-100 text-purple-800 border-purple-200',
};

const getRiskScore = (impact: string, likelihood: string): number => {
  const impactScore = { Low: 1, Medium: 2, High: 3 }[impact] || 1;
  const likelihoodScore = { Low: 1, Medium: 2, High: 3 }[likelihood] || 1;
  return impactScore * likelihoodScore;
};

const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 6) return { level: 'Critical', color: 'text-red-600' };
  if (score >= 4) return { level: 'High', color: 'text-orange-600' };
  if (score >= 2) return { level: 'Medium', color: 'text-yellow-600' };
  return { level: 'Low', color: 'text-green-600' };
};

export default function RiskAssessmentPage() {
  const { getRisks, saveRisks } = useData();
  const [risks, setRisks] = useState<Risk[]>(getRisks());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [formData, setFormData] = useState({
    riskName: '',
    description: '',
    impact: 'Medium' as 'Low' | 'Medium' | 'High',
    likelihood: 'Medium' as 'Low' | 'Medium' | 'High',
    mitigationNotes: '',
  });

  const resetForm = () => {
    setFormData({
      riskName: '',
      description: '',
      impact: 'Medium',
      likelihood: 'Medium',
      mitigationNotes: '',
    });
    setEditingRisk(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.riskName.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let updatedRisks: Risk[];
      
      if (editingRisk) {
        updatedRisks = risks.map(risk => 
          risk.id === editingRisk.id 
            ? { ...risk, ...formData }
            : risk
        );
        toast.success('Risk updated successfully');
      } else {
        const newRisk: Risk = {
          id: `risk_${Date.now()}`,
          ...formData,
        };
        updatedRisks = [...risks, newRisk];
        toast.success('Risk added successfully');
      }

      setRisks(updatedRisks);
      await saveRisks(updatedRisks);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save risk');
    }
  };

  const handleEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      riskName: risk.riskName,
      description: risk.description,
      impact: risk.impact,
      likelihood: risk.likelihood,
      mitigationNotes: risk.mitigationNotes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (riskId: string) => {
    try {
      const updatedRisks = risks.filter(risk => risk.id !== riskId);
      setRisks(updatedRisks);
      await saveRisks(updatedRisks);
      toast.success('Risk deleted successfully');
    } catch (error) {
      toast.error('Failed to delete risk');
    }
  };

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => getRiskScore(r.impact, r.likelihood) >= 6).length,
    high: risks.filter(r => getRiskScore(r.impact, r.likelihood) >= 4 && getRiskScore(r.impact, r.likelihood) < 6).length,
    medium: risks.filter(r => getRiskScore(r.impact, r.likelihood) >= 2 && getRiskScore(r.impact, r.likelihood) < 4).length,
    low: risks.filter(r => getRiskScore(r.impact, r.likelihood) < 2).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            Risk Assessment
          </h1>
          <p className="text-muted-foreground mt-2">
            Identify, evaluate, and manage potential security risks to your Web3 infrastructure.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingRisk ? 'Edit Risk' : 'Add New Risk'}
              </DialogTitle>
              <DialogDescription>
                {editingRisk 
                  ? 'Update the risk details below.'
                  : 'Define a new security risk and its mitigation strategy.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="riskName">Risk Name *</Label>
                  <Input
                    id="riskName"
                    value={formData.riskName}
                    onChange={(e) => setFormData({ ...formData, riskName: e.target.value })}
                    placeholder="e.g., Smart Contract Vulnerability"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the risk..."
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Impact Level</Label>
                  <Select value={formData.impact} onValueChange={(value: 'Low' | 'Medium' | 'High') => setFormData({ ...formData, impact: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="likelihood">Likelihood</Label>
                  <Select value={formData.likelihood} onValueChange={(value: 'Low' | 'Medium' | 'High') => setFormData({ ...formData, likelihood: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="mitigationNotes">Mitigation Strategy</Label>
                  <Textarea
                    id="mitigationNotes"
                    value={formData.mitigationNotes}
                    onChange={(e) => setFormData({ ...formData, mitigationNotes: e.target.value })}
                    placeholder="How will this risk be mitigated or managed?"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRisk ? 'Update Risk' : 'Add Risk'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{riskStats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{riskStats.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Risks Identified</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start by adding potential security risks to your Web3 infrastructure.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Risk
              </Button>
            </CardContent>
          </Card>
        ) : (
          risks
            .sort((a, b) => getRiskScore(b.impact, b.likelihood) - getRiskScore(a.impact, a.likelihood))
            .map((risk) => {
              const riskScore = getRiskScore(risk.impact, risk.likelihood);
              const riskLevel = getRiskLevel(riskScore);
              
              return (
                <Card key={risk.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{risk.riskName}</CardTitle>
                          <Badge variant="outline" className={riskLevel.color}>
                            {riskLevel.level} Risk
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {risk.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(risk)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(risk.id)}
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
                        <Label className="text-xs font-medium text-muted-foreground">IMPACT</Label>
                        <Badge className={`mt-1 ${impactColors[risk.impact]}`}>
                          {risk.impact}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">LIKELIHOOD</Label>
                        <Badge className={`mt-1 ${likelihoodColors[risk.likelihood]}`}>
                          {risk.likelihood}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">RISK SCORE</Label>
                        <div className={`mt-1 text-sm font-semibold ${riskLevel.color}`}>
                          {riskScore}/9
                        </div>
                      </div>
                    </div>
                    {risk.mitigationNotes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <Label className="text-xs font-medium text-muted-foreground">MITIGATION STRATEGY</Label>
                        <p className="text-sm mt-1">{risk.mitigationNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
}