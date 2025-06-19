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
import { Brain, Settings, Zap, FileText, AlertTriangle, TrendingUp, Eye, EyeOff, Download, Copy, RefreshCw, Sparkles, Bot, Key } from 'lucide-react';
import { toast } from 'sonner';
import type { Incident } from '@/src/context/data-context';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiKeyPlaceholder: string;
  endpoint?: string;
}

interface AnalysisResult {
  id: string;
  incidentId: string;
  provider: string;
  timestamp: string;
  incidentReport: string;
  rootCauseAnalysis: string;
  lessonsLearned: string;
  strategicImplications: string;
  recommendations: string;
  riskAssessment: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s advanced AI model for comprehensive analysis',
    apiKeyPlaceholder: 'Enter your Google AI API key',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'OpenAI\'s GPT models for detailed incident analysis',
    apiKeyPlaceholder: 'Enter your OpenAI API key',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude AI for thorough security incident evaluation',
    apiKeyPlaceholder: 'Enter your Anthropic API key',
  },
];

const STORAGE_KEY = 'web3-shield-ai-analysis';
const API_KEYS_STORAGE_KEY = 'web3-shield-ai-api-keys';

export default function AIAnalysisPage() {
  const { getActiveIncidents } = useData();
  const allIncidents = getActiveIncidents();
  
  // State management
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  const [selectedIncident, setSelectedIncident] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save data to localStorage
  const saveAnalyses = (newAnalyses: AnalysisResult[]) => {
    setAnalyses(newAnalyses);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnalyses));
    }
  };

  const saveApiKeys = (newApiKeys: Record<string, string>) => {
    setApiKeys(newApiKeys);
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(newApiKeys));
    }
  };

  // API key management
  const updateApiKey = (providerId: string, key: string) => {
    const newApiKeys = { ...apiKeys, [providerId]: key };
    saveApiKeys(newApiKeys);
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  // Generate incident log text for analysis
  const generateIncidentLogText = (incident: Incident): string => {
    const logEntries = incident.incidentLog
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(entry => {
        const timestamp = new Date(entry.timestamp).toLocaleString();
        const tags = entry.tags.length > 0 ? ` [Tags: ${entry.tags.join(', ')}]` : '';
        const assignee = entry.triageAssignee ? ` [Assignee: ${entry.triageAssignee}]` : '';
        const status = ` [Status: ${entry.triageStatus}]`;
        return `${timestamp}${status}${assignee}${tags}: ${entry.entry}`;
      })
      .join('\n\n');

    const incidentSummary = `
INCIDENT SUMMARY:
- Type: ${incident.type}
- Severity: ${incident.severity}
- Status: ${incident.currentStatus}
- Start Time: ${new Date(incident.startTimestamp).toLocaleString()}
- Assigned Team: ${incident.assignedTeamMembers.join(', ')}
${incident.resolutionTimestamp ? `- Resolution Time: ${new Date(incident.resolutionTimestamp).toLocaleString()}` : ''}

INCIDENT LOG ENTRIES:
${logEntries}

${incident.communicationDrafts ? `COMMUNICATION NOTES:\n${incident.communicationDrafts}` : ''}
    `.trim();

    return incidentSummary;
  };

  // AI Analysis functions
  const analyzeWithGemini = async (incidentLog: string, customPrompt: string): Promise<Partial<AnalysisResult>> => {
    const apiKey = apiKeys.gemini;
    if (!apiKey) {
      throw new Error('Google AI API key is required');
    }

    const prompt = customPrompt || `
You are an expert Web3 incident analyst. Based on the provided incident log, generate a comprehensive analysis with the following sections:

1. **Incident Report**: A detailed, professional summary of what happened, when it occurred, and the immediate impact.

2. **Root Cause Analysis**: A thorough technical analysis identifying the primary cause(s) of the incident, including any contributing factors.

3. **Lessons Learned**: Key insights and takeaways from this incident that the team should internalize.

4. **Strategic Implications**: Long-term strategic recommendations, process improvements, and preventive measures to avoid similar incidents.

5. **Recommendations**: Specific, actionable recommendations for immediate and long-term improvements.

6. **Risk Assessment**: Evaluation of ongoing risks and potential future vulnerabilities.

Format your response as structured sections with clear headings. Be specific, actionable, and professional.

Incident Log:
${incidentLog}
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to analyze with Gemini');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis generated';

    // Parse the response into sections
    const sections = content.split(/(?=#{1,2}\s|\*\*[^*]+\*\*)/);
    
    let incidentReport = '';
    let rootCauseAnalysis = '';
    let lessonsLearned = '';
    let strategicImplications = '';
    let recommendations = '';
    let riskAssessment = '';
    
    sections.forEach((section: string) => {
      const trimmedSection = section.trim();
      if (trimmedSection.toLowerCase().includes('incident report')) {
        incidentReport = trimmedSection.replace(/#{1,2}\s*\*\*?incident report\*\*?/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('root cause')) {
        rootCauseAnalysis = trimmedSection.replace(/#{1,2}\s*\*\*?root cause analysis\*\*?/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('lessons learned')) {
        lessonsLearned = trimmedSection.replace(/#{1,2}\s*\*\*?lessons learned\*\*?/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('strategic')) {
        strategicImplications = trimmedSection.replace(/#{1,2}\s*\*\*?strategic implications\*\*?/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('recommendation')) {
        recommendations = trimmedSection.replace(/#{1,2}\s*\*\*?recommendations\*\*?/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('risk assessment')) {
        riskAssessment = trimmedSection.replace(/#{1,2}\s*\*\*?risk assessment\*\*?/i, '').trim();
      }
    });
    
    return {
      incidentReport: incidentReport || content.substring(0, 500),
      rootCauseAnalysis: rootCauseAnalysis || 'Analysis pending further investigation.',
      lessonsLearned: lessonsLearned || 'Lessons learned will be documented upon completion of analysis.',
      strategicImplications: strategicImplications || 'Strategic recommendations will be provided after thorough review.',
      recommendations: recommendations || 'Specific recommendations will be developed based on analysis findings.',
      riskAssessment: riskAssessment || 'Risk assessment will be completed as part of the comprehensive review.',
    };
  };

  const analyzeWithOpenAI = async (incidentLog: string, customPrompt: string): Promise<Partial<AnalysisResult>> => {
    const apiKey = apiKeys.openai;
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const prompt = customPrompt || `
You are an expert Web3 incident analyst. Analyze the following incident log and provide a comprehensive analysis with these sections:

1. Incident Report
2. Root Cause Analysis  
3. Lessons Learned
4. Strategic Implications
5. Recommendations
6. Risk Assessment

Incident Log:
${incidentLog}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Web3 incident analyst. Provide detailed, professional analysis with clear sections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to analyze with OpenAI');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No analysis generated';

    // Simple parsing for OpenAI response
    const sections = content.split(/(?=\d+\.\s|\*\*[^*]+\*\*)/);
    
    return {
      incidentReport: sections[1] || content.substring(0, 500),
      rootCauseAnalysis: sections[2] || 'Analysis pending further investigation.',
      lessonsLearned: sections[3] || 'Lessons learned will be documented upon completion of analysis.',
      strategicImplications: sections[4] || 'Strategic recommendations will be provided after thorough review.',
      recommendations: sections[5] || 'Specific recommendations will be developed based on analysis findings.',
      riskAssessment: sections[6] || 'Risk assessment will be completed as part of the comprehensive review.',
    };
  };

  const analyzeWithAnthropic = async (incidentLog: string, customPrompt: string): Promise<Partial<AnalysisResult>> => {
    const apiKey = apiKeys.anthropic;
    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const prompt = customPrompt || `
Analyze this Web3 incident log and provide a comprehensive analysis with these sections:

1. Incident Report
2. Root Cause Analysis
3. Lessons Learned
4. Strategic Implications
5. Recommendations
6. Risk Assessment

Incident Log:
${incidentLog}
    `;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to analyze with Anthropic');
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || 'No analysis generated';

    // Simple parsing for Anthropic response
    const sections = content.split(/(?=\d+\.\s|\*\*[^*]+\*\*)/);
    
    return {
      incidentReport: sections[1] || content.substring(0, 500),
      rootCauseAnalysis: sections[2] || 'Analysis pending further investigation.',
      lessonsLearned: sections[3] || 'Lessons learned will be documented upon completion of analysis.',
      strategicImplications: sections[4] || 'Strategic recommendations will be provided after thorough review.',
      recommendations: sections[5] || 'Specific recommendations will be developed based on analysis findings.',
      riskAssessment: sections[6] || 'Risk assessment will be completed as part of the comprehensive review.',
    };
  };

  // Main analysis function
  const runAnalysis = async () => {
    if (!selectedIncident) {
      toast.error('Please select an incident to analyze');
      return;
    }

    const incident = allIncidents.find(i => i.id === selectedIncident);
    if (!incident) {
      toast.error('Selected incident not found');
      return;
    }

    if (!apiKeys[selectedProvider]) {
      toast.error(`Please configure your ${AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API key`);
      return;
    }

    setIsAnalyzing(true);

    try {
      const incidentLogText = generateIncidentLogText(incident);
      let analysisResult: Partial<AnalysisResult>;

      switch (selectedProvider) {
        case 'gemini':
          analysisResult = await analyzeWithGemini(incidentLogText, customPrompt);
          break;
        case 'openai':
          analysisResult = await analyzeWithOpenAI(incidentLogText, customPrompt);
          break;
        case 'anthropic':
          analysisResult = await analyzeWithAnthropic(incidentLogText, customPrompt);
          break;
        default:
          throw new Error('Unsupported AI provider');
      }

      const newAnalysis: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        incidentId: selectedIncident,
        provider: selectedProvider,
        timestamp: new Date().toISOString(),
        incidentReport: analysisResult.incidentReport || '',
        rootCauseAnalysis: analysisResult.rootCauseAnalysis || '',
        lessonsLearned: analysisResult.lessonsLearned || '',
        strategicImplications: analysisResult.strategicImplications || '',
        recommendations: analysisResult.recommendations || '',
        riskAssessment: analysisResult.riskAssessment || '',
      };

      const updatedAnalyses = [newAnalysis, ...analyses];
      saveAnalyses(updatedAnalyses);
      
      toast.success('AI analysis completed successfully');
      setSelectedIncident('');
      setCustomPrompt('');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Utility functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const exportAnalysis = (analysis: AnalysisResult) => {
    const incident = allIncidents.find(i => i.id === analysis.incidentId);
    const exportData = {
      incident: incident ? {
        type: incident.type,
        severity: incident.severity,
        startTimestamp: incident.startTimestamp,
      } : null,
      analysis,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-analysis-${analysis.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const deleteAnalysis = (analysisId: string) => {
    const updatedAnalyses = analyses.filter(a => a.id !== analysisId);
    saveAnalyses(updatedAnalyses);
    toast.success('Analysis deleted successfully');
  };

  // Statistics
  const stats = {
    totalAnalyses: analyses.length,
    providersUsed: new Set(analyses.map(a => a.provider)).size,
    incidentsAnalyzed: new Set(analyses.map(a => a.incidentId)).size,
    recentAnalyses: analyses.filter(a => 
      new Date(a.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            AI Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive incident analysis using advanced AI models from multiple providers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                API Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  AI Provider API Keys
                </DialogTitle>
                <DialogDescription>
                  Configure your API keys for different AI providers. Keys are stored locally in your browser.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {AI_PROVIDERS.map((provider) => (
                  <div key={provider.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={provider.id} className="font-medium">
                        {provider.name}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(provider.id)}
                        className="h-8 w-8 p-0"
                      >
                        {showApiKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                    <Input
                      id={provider.id}
                      type={showApiKeys[provider.id] ? 'text' : 'password'}
                      value={apiKeys[provider.id] || ''}
                      onChange={(e) => updateApiKey(provider.id, e.target.value)}
                      placeholder={provider.apiKeyPlaceholder}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setIsSettingsOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Providers</CardTitle>
            <Bot className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.providersUsed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents Analyzed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.incidentsAnalyzed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (7 days)</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.recentAnalyses}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Analysis</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>

        {/* Generate Analysis Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                Generate AI Analysis
              </CardTitle>
              <CardDescription>
                Select an incident and AI provider to generate comprehensive analysis and insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="incident">Select Incident *</Label>
                  <Select value={selectedIncident} onValueChange={setSelectedIncident}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an incident to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {allIncidents.map(incident => (
                        <SelectItem key={incident.id} value={incident.id}>
                          {incident.type} - {incident.severity} ({new Date(incident.startTimestamp).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="provider">AI Provider *</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="customPrompt">Custom Analysis Prompt (Optional)</Label>
                <Textarea
                  id="customPrompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom instructions for the AI analysis, or leave blank to use the default comprehensive analysis prompt..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedProvider && !apiKeys[selectedProvider] && (
                    <span className="text-red-600">
                      ⚠️ API key required for {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={runAnalysis} 
                  disabled={isAnalyzing || !selectedIncident || !apiKeys[selectedProvider]}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview selected incident */}
          {selectedIncident && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Incident Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const incident = allIncidents.find(i => i.id === selectedIncident);
                  if (!incident) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${incident.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                          incident.severity === 'High' ? 'bg-orange-100 text-orange-800' : 
                          incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                          {incident.severity}
                        </Badge>
                        <Badge variant="outline">{incident.currentStatus}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {incident.incidentLog.length} log entries
                        </span>
                      </div>
                      <div className="text-sm">
                        <strong>Type:</strong> {incident.type}
                      </div>
                      <div className="text-sm">
                        <strong>Started:</strong> {new Date(incident.startTimestamp).toLocaleString()}
                      </div>
                      <div className="text-sm">
                        <strong>Team:</strong> {incident.assignedTeamMembers.join(', ')}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis History Tab */}
        <TabsContent value="history" className="space-y-4">
          {analyses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No AI Analyses Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Generate your first AI analysis to get comprehensive insights into your incidents.
                </p>
              </CardContent>
            </Card>
          ) : (
            analyses
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((analysis) => {
                const incident = allIncidents.find(i => i.id === analysis.incidentId);
                const provider = AI_PROVIDERS.find(p => p.id === analysis.provider);
                
                return (
                  <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {incident ? incident.type : 'Unknown Incident'}
                            </CardTitle>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                              <Bot className="h-3 w-3 mr-1" />
                              {provider?.name || analysis.provider}
                            </Badge>
                          </div>
                          <CardDescription>
                            Generated on {new Date(analysis.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysis, null, 2))}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportAnalysis(analysis)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="analysis-details">
                          <AccordionTrigger className="text-sm">View Analysis Details</AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            {analysis.incidentReport && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">INCIDENT REPORT</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.incidentReport}</p>
                                </div>
                              </div>
                            )}

                            {analysis.rootCauseAnalysis && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">ROOT CAUSE ANALYSIS</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.rootCauseAnalysis}</p>
                                </div>
                              </div>
                            )}

                            {analysis.lessonsLearned && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">LESSONS LEARNED</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.lessonsLearned}</p>
                                </div>
                              </div>
                            )}

                            {analysis.strategicImplications && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">STRATEGIC IMPLICATIONS</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.strategicImplications}</p>
                                </div>
                              </div>
                            )}

                            {analysis.recommendations && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">RECOMMENDATIONS</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.recommendations}</p>
                                </div>
                              </div>
                            )}

                            {analysis.riskAssessment && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">RISK ASSESSMENT</Label>
                                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{analysis.riskAssessment}</p>
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