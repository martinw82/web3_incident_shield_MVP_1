'use server';

import { defineFlow, defineSchema } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

export const GenerateIncidentAnalysisInputSchema = defineSchema(
  'GenerateIncidentAnalysisInput',
  z.object({
    incidentLog: z.string().describe('The incident log entries to analyze'),
  })
);

export const GenerateIncidentAnalysisOutputSchema = defineSchema(
  'GenerateIncidentAnalysisOutput',
  z.object({
    incidentReport: z.string().describe('Comprehensive incident report'),
    rootCauseAnalysis: z.string().describe('Root cause analysis'),
    lessonsLearned: z.string().describe('Key lessons learned'),
    strategicImplications: z.string().describe('Strategic implications and recommendations'),
  })
);

const generateIncidentAnalysisPrompt = `
You are an expert Web3 incident analyst. Based on the provided incident log, generate a comprehensive analysis with the following sections:

1. **Incident Report**: A detailed, professional summary of what happened, when it occurred, and the immediate impact.

2. **Root Cause Analysis**: A thorough technical analysis identifying the primary cause(s) of the incident, including any contributing factors.

3. **Lessons Learned**: Key insights and takeaways from this incident that the team should internalize.

4. **Strategic Implications**: Long-term strategic recommendations, process improvements, and preventive measures to avoid similar incidents.

Format your response as structured sections with clear headings and bullet points where appropriate. Be specific, actionable, and professional.

Incident Log:
{incidentLog}
`;

export const generateIncidentAnalysisFlow = defineFlow(
  {
    name: 'generateIncidentAnalysis',
    inputSchema: GenerateIncidentAnalysisInputSchema,
    outputSchema: GenerateIncidentAnalysisOutputSchema,
  },
  async (input) => {
    const prompt = generateIncidentAnalysisPrompt.replace('{incidentLog}', input.incidentLog);
    
    const response = await googleAI.generateText({
      model: 'gemini-2.0-flash',
      prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    // Parse the response into sections
    const content = response.text;
    const sections = content.split(/(?=#{1,2}\s)/);
    
    let incidentReport = '';
    let rootCauseAnalysis = '';
    let lessonsLearned = '';
    let strategicImplications = '';
    
    sections.forEach(section => {
      const trimmedSection = section.trim();
      if (trimmedSection.toLowerCase().includes('incident report')) {
        incidentReport = trimmedSection.replace(/#{1,2}\s*incident report/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('root cause')) {
        rootCauseAnalysis = trimmedSection.replace(/#{1,2}\s*root cause analysis/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('lessons learned')) {
        lessonsLearned = trimmedSection.replace(/#{1,2}\s*lessons learned/i, '').trim();
      } else if (trimmedSection.toLowerCase().includes('strategic')) {
        strategicImplications = trimmedSection.replace(/#{1,2}\s*strategic implications/i, '').trim();
      }
    });
    
    return {
      incidentReport: incidentReport || content.substring(0, 500),
      rootCauseAnalysis: rootCauseAnalysis || 'Analysis pending further investigation.',
      lessonsLearned: lessonsLearned || 'Lessons learned will be documented upon completion of analysis.',
      strategicImplications: strategicImplications || 'Strategic recommendations will be provided after thorough review.',
    };
  }
);

export async function generateIncidentAnalysis(input: z.infer<typeof GenerateIncidentAnalysisInputSchema>) {
  return await generateIncidentAnalysisFlow(input);
}