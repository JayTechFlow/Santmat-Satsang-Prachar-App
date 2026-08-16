// Sprint M6.0 — Enterprise AI Abstraction Platform

export interface IAIProvider {
  readonly providerId: string;
  readonly providerType: string;
  analyzeImage?(imageUri: string): Promise<Record<string, any>>;
  transcribeAudio?(audioUri: string): Promise<{ text: string; language: string }>;
  analyzeDocument?(docUri: string): Promise<{ extractedText: string }>;
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs: number }>;
}
