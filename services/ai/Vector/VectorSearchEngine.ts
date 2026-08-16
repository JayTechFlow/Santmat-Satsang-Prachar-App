// Sprint M6.5 — Enterprise Vector Search Engine

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export class VectorSearchEngine {
  private vectors: { id: string; embedding: number[]; metadata: Record<string, any> }[] = [];

  public indexMediaVector(id: string, embedding: number[], metadata: Record<string, any>): void {
    this.vectors.push({ id, embedding, metadata });
  }

  public async searchSimilarity(queryVector: number[], topK: number = 5): Promise<VectorSearchResult[]> {
    return this.vectors
      .map((v) => ({
        id: v.id,
        score: this.cosineSimilarity(queryVector, v.embedding),
        metadata: v.metadata,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return magA && magB ? dotProduct / (magA * magB) : 0;
  }
}
