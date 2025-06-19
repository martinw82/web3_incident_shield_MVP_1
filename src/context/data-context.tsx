'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Core Data Types
export interface Risk {
  id: string;
  riskName: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  likelihood: 'Low' | 'Medium' | 'High';
  mitigationNotes: string;
}

export interface TeamMember {
  name: string;
  role: string;
  primaryContactMethod: string;
}

export interface SeverityLevel {
  level: string;
  description: string;
}

export interface Step {
  id: string;
  text: string;
  assignedMemberName: string;
}

export interface CommunicationSnippet {
  id: string;
  description: string;
  templateId?: string;
  content: string;
}

export interface IncidentType {
  id: string;
  type: string;
  description: string;
  triggerConditions: string;
  initialAssessmentSteps: Step[];
  technicalResponseSteps: Step[];
  postMortemSteps: Step[];
  communicationStrategy: string;
  communicationSnippets: CommunicationSnippet[];
  legalConsiderations: string;
  linkedRiskIds: string[];
}

export interface Channel {
  id: string;
  platform: string;
  link: string;
  isPrimary: boolean;
}

export type CommunicationRoleType = 'Lead Communicator' | 'Technical Lead' | 'Legal Liaison' | 'Community Manager' | 'Executive Spokesperson';

export interface RoleAssignment {
  id: string;
  role: CommunicationRoleType;
  assignedMemberName: string;
  responsibilities: string;
}

export interface Template {
  id: string;
  templateName: string;
  templateContent: string;
  suggestedChannels: string[];
}

export interface ChecklistItemDefinition {
  id: string;
  label: string;
  description: string;
}

export interface SecurityChecklistStatus {
  [key: string]: boolean;
}

export type AuditStatusType = 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';

export interface AuditEntry {
  id: string;
  auditorName: string;
  startDate: string;
  completionDate?: string;
  status: AuditStatusType;
  reportTitle: string;
  reportUrl?: string;
}

export type VulnerabilityStatusType = 'New' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Deferred';
export type VulnerabilitySeverityType = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Vulnerability {
  id: string;
  name: string;
  description: string;
  source: string;
  severity: VulnerabilitySeverityType;
  status: VulnerabilityStatusType;
  remediationNotes: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  entry: string;
  tags: string[];
  triageStatus: 'New' | 'Acknowledged' | 'In Progress' | 'Resolved';
  triageAssignee: string;
  ticketLink?: string;
}

export interface Incident {
  id: string;
  type: string;
  severity: string;
  startTimestamp: string;
  currentStatus: 'Active' | 'Resolved' | 'Monitoring';
  assignedTeamMembers: string[];
  incidentLog: LogEntry[];
  communicationDrafts: string;
  resolutionTimestamp?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed';
  ticketLink?: string;
}

export interface PostIncidentReviewData {
  incidentId: string;
  reviewDate: string;
  summary: string;
  rootCauseAnalysis: string;
  lessonsLearned: string;
  governanceRetrospectiveNotes: string;
  actionItems: ActionItem[];
}

// Storage Keys
const STORAGE_KEYS = {
  RISKS: 'web3-shield-risks',
  TEAM_MEMBERS: 'web3-shield-team-members',
  SEVERITY_LEVELS: 'web3-shield-severity-levels',
  INCIDENT_TYPES: 'web3-shield-incident-types',
  COMMUNICATION_CHANNELS: 'web3-shield-communication-channels',
  COMMUNICATION_ROLES: 'web3-shield-communication-roles',
  COMMUNICATION_PRINCIPLES: 'web3-shield-communication-principles',
  COMMUNICATION_TEMPLATES: 'web3-shield-communication-templates',
  SECURITY_CHECKLIST_STATUS: 'web3-shield-security-checklist-status',
  AUDITS: 'web3-shield-audits',
  VULNERABILITIES: 'web3-shield-vulnerabilities',
  ACTIVE_INCIDENTS: 'web3-shield-active-incidents',
  POST_INCIDENT_REVIEWS: 'web3-shield-post-incident-reviews',
};

// Default Data
const defaultRisks: Risk[] = [
  {
    id: 'risk_1',
    riskName: 'Smart Contract Vulnerability',
    description: 'Critical security flaw in main contract',
    impact: 'High',
    likelihood: 'Medium',
    mitigationNotes: 'Regular audits and formal verification',
  },
  {
    id: 'risk_2',
    riskName: 'Private Key Compromise',
    description: 'Unauthorized access to admin keys',
    impact: 'High',
    likelihood: 'Low',
    mitigationNotes: 'Multi-sig wallets and hardware security modules',
  },
];

const defaultTeamMembers: TeamMember[] = [
  { name: 'Alice Johnson', role: 'Incident Commander', primaryContactMethod: 'alice@company.com' },
  { name: 'Bob Smith', role: 'Technical Lead', primaryContactMethod: 'bob@company.com' },
  { name: 'Carol Wilson', role: 'Communications Lead', primaryContactMethod: 'carol@company.com' },
];

const defaultSeverityLevels: SeverityLevel[] = [
  { level: 'Critical', description: 'System-wide outage or major security breach' },
  { level: 'High', description: 'Significant impact on core functionality' },
  { level: 'Medium', description: 'Moderate impact on some features' },
  { level: 'Low', description: 'Minor issues with workarounds available' },
];

const defaultChecklistItems: ChecklistItemDefinition[] = [
  { id: 'cl_1', label: 'Multi-signature wallet setup', description: 'Ensure all critical operations require multiple signatures' },
  { id: 'cl_2', label: 'Smart contract audit', description: 'Professional third-party security audit completed' },
  { id: 'cl_3', label: 'Access control review', description: 'Regular review of admin and user permissions' },
  { id: 'cl_4', label: 'Incident response testing', description: 'Regular drills and response plan validation' },
  { id: 'cl_5', label: 'Documentation updates', description: 'Keep all security documentation current' },
];

const defaultCommunicationChannels: Channel[] = [
  { id: 'ch_1', platform: 'Twitter', link: 'https://twitter.com/company', isPrimary: true },
  { id: 'ch_2', platform: 'Discord', link: 'https://discord.gg/company', isPrimary: false },
  { id: 'ch_3', platform: 'Telegram', link: 'https://t.me/company', isPrimary: false },
];

const defaultCommunicationPrinciples = `# Communication Principles

## Transparency
- Provide clear, honest updates about incidents
- Share what we know and what we don't know
- Regular updates even if there's no new information

## Timeliness
- Initial acknowledgment within 30 minutes
- Regular updates every 2 hours during active incidents
- Post-incident summary within 24 hours

## Accountability
- Take responsibility for issues
- Explain what went wrong and how we're fixing it
- Share lessons learned and preventive measures`;

// Context Definition
interface DataContextType {
  isLoadingData: boolean;
  
  // Risk Assessment
  getRisks: () => Risk[];
  saveRisks: (risks: Risk[]) => Promise<void>;
  
  // Team Management
  getTeamMembers: () => TeamMember[];
  saveTeamMembers: (members: TeamMember[]) => Promise<void>;
  
  // Severity Levels
  getSeverityLevels: () => SeverityLevel[];
  saveSeverityLevels: (levels: SeverityLevel[]) => Promise<void>;
  
  // Incident Types
  getIncidentTypes: () => IncidentType[];
  saveIncidentTypes: (types: IncidentType[]) => Promise<void>;
  
  // Communication
  getCommunicationChannels: () => Channel[];
  saveCommunicationChannels: (channels: Channel[]) => Promise<void>;
  getCommunicationRoles: () => RoleAssignment[];
  saveCommunicationRoles: (roles: RoleAssignment[]) => Promise<void>;
  getCommunicationPrinciples: () => string;
  saveCommunicationPrinciples: (principles: string) => Promise<void>;
  getCommunicationTemplates: () => Template[];
  saveCommunicationTemplates: (templates: Template[]) => Promise<void>;
  
  // Security & Audit
  getSecurityChecklistItems: () => ChecklistItemDefinition[];
  getSecurityChecklistStatus: () => SecurityChecklistStatus;
  saveSecurityChecklistStatus: (status: SecurityChecklistStatus) => Promise<void>;
  getAudits: () => AuditEntry[];
  saveAudits: (audits: AuditEntry[]) => Promise<void>;
  getVulnerabilities: () => Vulnerability[];
  saveVulnerabilities: (vulnerabilities: Vulnerability[]) => Promise<void>;
  
  // Incidents
  getActiveIncidents: () => Incident[];
  saveActiveIncidents: (incidents: Incident[]) => Promise<void>;
  getPostIncidentReviews: () => PostIncidentReviewData[];
  savePostIncidentReviews: (reviews: PostIncidentReviewData[]) => Promise<void>;
  
  // Data Export/Import
  exportDataAsJson: () => void;
  importDataFromJson: (jsonData: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // State for all data
  const [risks, setRisks] = useState<Risk[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [severityLevels, setSeverityLevels] = useState<SeverityLevel[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [communicationChannels, setCommunicationChannels] = useState<Channel[]>([]);
  const [communicationRoles, setCommunicationRoles] = useState<RoleAssignment[]>([]);
  const [communicationPrinciples, setCommunicationPrinciples] = useState<string>('');
  const [communicationTemplates, setCommunicationTemplates] = useState<Template[]>([]);
  const [securityChecklistStatus, setSecurityChecklistStatus] = useState<SecurityChecklistStatus>({});
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [postIncidentReviews, setPostIncidentReviews] = useState<PostIncidentReviewData[]>([]);

  // Utility functions
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const saveToStorage = async <T,>(key: string, data: T): Promise<void> => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      throw error;
    }
  };

  // Export all data as JSON
  const exportDataAsJson = () => {
    try {
      const allData: Record<string, any> = {};
      
      // Collect all data from localStorage
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = loadFromStorage(key, null);
        if (data !== null) {
          allData[key] = data;
        }
      });

      // Add metadata
      allData._metadata = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        application: 'Web3 Incident Shield'
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(allData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `web3-incident-shield-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  };

  // Import data from JSON
  const importDataFromJson = async (jsonData: string): Promise<void> => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validate that this is our data format
      if (!parsedData._metadata || parsedData._metadata.application !== 'Web3 Incident Shield') {
        throw new Error('Invalid data format. Please ensure you are importing a valid Web3 Incident Shield data file.');
      }

      // Import each data type
      if (parsedData[STORAGE_KEYS.RISKS]) {
        await saveToStorage(STORAGE_KEYS.RISKS, parsedData[STORAGE_KEYS.RISKS]);
        setRisks(parsedData[STORAGE_KEYS.RISKS]);
      }

      if (parsedData[STORAGE_KEYS.TEAM_MEMBERS]) {
        await saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, parsedData[STORAGE_KEYS.TEAM_MEMBERS]);
        setTeamMembers(parsedData[STORAGE_KEYS.TEAM_MEMBERS]);
      }

      if (parsedData[STORAGE_KEYS.SEVERITY_LEVELS]) {
        await saveToStorage(STORAGE_KEYS.SEVERITY_LEVELS, parsedData[STORAGE_KEYS.SEVERITY_LEVELS]);
        setSeverityLevels(parsedData[STORAGE_KEYS.SEVERITY_LEVELS]);
      }

      if (parsedData[STORAGE_KEYS.INCIDENT_TYPES]) {
        await saveToStorage(STORAGE_KEYS.INCIDENT_TYPES, parsedData[STORAGE_KEYS.INCIDENT_TYPES]);
        setIncidentTypes(parsedData[STORAGE_KEYS.INCIDENT_TYPES]);
      }

      if (parsedData[STORAGE_KEYS.COMMUNICATION_CHANNELS]) {
        await saveToStorage(STORAGE_KEYS.COMMUNICATION_CHANNELS, parsedData[STORAGE_KEYS.COMMUNICATION_CHANNELS]);
        setCommunicationChannels(parsedData[STORAGE_KEYS.COMMUNICATION_CHANNELS]);
      }

      if (parsedData[STORAGE_KEYS.COMMUNICATION_ROLES]) {
        await saveToStorage(STORAGE_KEYS.COMMUNICATION_ROLES, parsedData[STORAGE_KEYS.COMMUNICATION_ROLES]);
        setCommunicationRoles(parsedData[STORAGE_KEYS.COMMUNICATION_ROLES]);
      }

      if (parsedData[STORAGE_KEYS.COMMUNICATION_PRINCIPLES]) {
        await saveToStorage(STORAGE_KEYS.COMMUNICATION_PRINCIPLES, parsedData[STORAGE_KEYS.COMMUNICATION_PRINCIPLES]);
        setCommunicationPrinciples(parsedData[STORAGE_KEYS.COMMUNICATION_PRINCIPLES]);
      }

      if (parsedData[STORAGE_KEYS.COMMUNICATION_TEMPLATES]) {
        await saveToStorage(STORAGE_KEYS.COMMUNICATION_TEMPLATES, parsedData[STORAGE_KEYS.COMMUNICATION_TEMPLATES]);
        setCommunicationTemplates(parsedData[STORAGE_KEYS.COMMUNICATION_TEMPLATES]);
      }

      if (parsedData[STORAGE_KEYS.SECURITY_CHECKLIST_STATUS]) {
        await saveToStorage(STORAGE_KEYS.SECURITY_CHECKLIST_STATUS, parsedData[STORAGE_KEYS.SECURITY_CHECKLIST_STATUS]);
        setSecurityChecklistStatus(parsedData[STORAGE_KEYS.SECURITY_CHECKLIST_STATUS]);
      }

      if (parsedData[STORAGE_KEYS.AUDITS]) {
        await saveToStorage(STORAGE_KEYS.AUDITS, parsedData[STORAGE_KEYS.AUDITS]);
        setAudits(parsedData[STORAGE_KEYS.AUDITS]);
      }

      if (parsedData[STORAGE_KEYS.VULNERABILITIES]) {
        await saveToStorage(STORAGE_KEYS.VULNERABILITIES, parsedData[STORAGE_KEYS.VULNERABILITIES]);
        setVulnerabilities(parsedData[STORAGE_KEYS.VULNERABILITIES]);
      }

      if (parsedData[STORAGE_KEYS.ACTIVE_INCIDENTS]) {
        await saveToStorage(STORAGE_KEYS.ACTIVE_INCIDENTS, parsedData[STORAGE_KEYS.ACTIVE_INCIDENTS]);
        setActiveIncidents(parsedData[STORAGE_KEYS.ACTIVE_INCIDENTS]);
      }

      if (parsedData[STORAGE_KEYS.POST_INCIDENT_REVIEWS]) {
        await saveToStorage(STORAGE_KEYS.POST_INCIDENT_REVIEWS, parsedData[STORAGE_KEYS.POST_INCIDENT_REVIEWS]);
        setPostIncidentReviews(parsedData[STORAGE_KEYS.POST_INCIDENT_REVIEWS]);
      }

    } catch (error) {
      console.error('Error importing data:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your file and try again.');
      }
      throw new Error('Failed to import data. Please check your file format and try again.');
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setRisks(loadFromStorage(STORAGE_KEYS.RISKS, defaultRisks));
        setTeamMembers(loadFromStorage(STORAGE_KEYS.TEAM_MEMBERS, defaultTeamMembers));
        setSeverityLevels(loadFromStorage(STORAGE_KEYS.SEVERITY_LEVELS, defaultSeverityLevels));
        setIncidentTypes(loadFromStorage(STORAGE_KEYS.INCIDENT_TYPES, []));
        setCommunicationChannels(loadFromStorage(STORAGE_KEYS.COMMUNICATION_CHANNELS, defaultCommunicationChannels));
        setCommunicationRoles(loadFromStorage(STORAGE_KEYS.COMMUNICATION_ROLES, []));
        setCommunicationPrinciples(loadFromStorage(STORAGE_KEYS.COMMUNICATION_PRINCIPLES, defaultCommunicationPrinciples));
        setCommunicationTemplates(loadFromStorage(STORAGE_KEYS.COMMUNICATION_TEMPLATES, []));
        setSecurityChecklistStatus(loadFromStorage(STORAGE_KEYS.SECURITY_CHECKLIST_STATUS, {}));
        setAudits(loadFromStorage(STORAGE_KEYS.AUDITS, []));
        setVulnerabilities(loadFromStorage(STORAGE_KEYS.VULNERABILITIES, []));
        setActiveIncidents(loadFromStorage(STORAGE_KEYS.ACTIVE_INCIDENTS, []));
        setPostIncidentReviews(loadFromStorage(STORAGE_KEYS.POST_INCIDENT_REVIEWS, []));
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    initializeData();
  }, []);

  // Context value
  const contextValue: DataContextType = {
    isLoadingData,
    
    // Risk Assessment
    getRisks: () => risks,
    saveRisks: async (newRisks) => {
      setRisks(newRisks);
      await saveToStorage(STORAGE_KEYS.RISKS, newRisks);
    },
    
    // Team Management
    getTeamMembers: () => teamMembers,
    saveTeamMembers: async (newMembers) => {
      setTeamMembers(newMembers);
      await saveToStorage(STORAGE_KEYS.TEAM_MEMBERS, newMembers);
    },
    
    // Severity Levels
    getSeverityLevels: () => severityLevels,
    saveSeverityLevels: async (newLevels) => {
      setSeverityLevels(newLevels);
      await saveToStorage(STORAGE_KEYS.SEVERITY_LEVELS, newLevels);
    },
    
    // Incident Types
    getIncidentTypes: () => incidentTypes,
    saveIncidentTypes: async (newTypes) => {
      setIncidentTypes(newTypes);
      await saveToStorage(STORAGE_KEYS.INCIDENT_TYPES, newTypes);
    },
    
    // Communication
    getCommunicationChannels: () => communicationChannels,
    saveCommunicationChannels: async (newChannels) => {
      setCommunicationChannels(newChannels);
      await saveToStorage(STORAGE_KEYS.COMMUNICATION_CHANNELS, newChannels);
    },
    getCommunicationRoles: () => communicationRoles,
    saveCommunicationRoles: async (newRoles) => {
      setCommunicationRoles(newRoles);
      await saveToStorage(STORAGE_KEYS.COMMUNICATION_ROLES, newRoles);
    },
    getCommunicationPrinciples: () => communicationPrinciples,
    saveCommunicationPrinciples: async (newPrinciples) => {
      setCommunicationPrinciples(newPrinciples);
      await saveToStorage(STORAGE_KEYS.COMMUNICATION_PRINCIPLES, newPrinciples);
    },
    getCommunicationTemplates: () => communicationTemplates,
    saveCommunicationTemplates: async (newTemplates) => {
      setCommunicationTemplates(newTemplates);
      await saveToStorage(STORAGE_KEYS.COMMUNICATION_TEMPLATES, newTemplates);
    },
    
    // Security & Audit
    getSecurityChecklistItems: () => defaultChecklistItems,
    getSecurityChecklistStatus: () => securityChecklistStatus,
    saveSecurityChecklistStatus: async (newStatus) => {
      setSecurityChecklistStatus(newStatus);
      await saveToStorage(STORAGE_KEYS.SECURITY_CHECKLIST_STATUS, newStatus);
    },
    getAudits: () => audits,
    saveAudits: async (newAudits) => {
      setAudits(newAudits);
      await saveToStorage(STORAGE_KEYS.AUDITS, newAudits);
    },
    getVulnerabilities: () => vulnerabilities,
    saveVulnerabilities: async (newVulnerabilities) => {
      setVulnerabilities(newVulnerabilities);
      await saveToStorage(STORAGE_KEYS.VULNERABILITIES, newVulnerabilities);
    },
    
    // Incidents
    getActiveIncidents: () => activeIncidents,
    saveActiveIncidents: async (newIncidents) => {
      setActiveIncidents(newIncidents);
      await saveToStorage(STORAGE_KEYS.ACTIVE_INCIDENTS, newIncidents);
    },
    getPostIncidentReviews: () => postIncidentReviews,
    savePostIncidentReviews: async (newReviews) => {
      setPostIncidentReviews(newReviews);
      await saveToStorage(STORAGE_KEYS.POST_INCIDENT_REVIEWS, newReviews);
    },
    
    // Data Export/Import
    exportDataAsJson,
    importDataFromJson,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
