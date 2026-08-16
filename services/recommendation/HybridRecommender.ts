// Sprint M7.2 — Recommendation Engine: Hybrid Recommender

import { MediaItem } from './SimilarityEngine';
import { ContentBasedFiltering, RecommendationOptions, RecommendationResultItem } from './ContentBasedFiltering';
import { CollaborativeFiltering } from './CollaborativeFiltering';

export interface HybridWeights {
  contentWeight: number;
  collaborativeWeight: number;
}

export const DEFAULT_HYBRID_WEIGHTS: HybridWeights = {
  contentWeight: 0.5,
  collaborativeWeight: 0.5,
};

export class HybridRecommender {
  private contentEngine: ContentBasedFiltering;
  private collaborativeEngine: CollaborativeFiltering;

  constructor(contentEngine: ContentBasedFiltering, collaborativeEngine: CollaborativeFiltering) {
    this.contentEngine = contentEngine;
    this.collaborativeEngine = collaborativeEngine;
  }

  /**
   * Recommend items combining Content-Based and Collaborative Filtering results.
   */
  public recommend(
    userId: string,
    options: RecommendationOptions = {},
    customWeights?: Partial<HybridWeights>
  ): RecommendationResultItem[] {
    const weights: HybridWeights = { ...DEFAULT_HYBRID_WEIGHTS, ...customWeights };
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const minScore = options.minScore || 0.01;

    const userInteractions = this.contentEngine.getUserInteractions(userId);

    // Cold-start fallback: if user has < 2 interactions, use content-based or category/trending fallback
    if (userInteractions.length < 2) {
      const contentRecs = this.contentEngine.recommendForUser(userId, { ...options, limit: limit * 2 });
      return contentRecs.map((rec) => ({
        ...rec,
        reason: userInteractions.length === 0
          ? 'Recommended popular satsang content to get started'
          : rec.reason,
        strategy: 'hybrid',
      })).slice(offset, offset + limit);
    }

    // Get Content-Based results
    const contentResults = this.contentEngine.recommendForUser(userId, { ...options, limit: limit * 2 });
    const contentMap = new Map<string, RecommendationResultItem>();
    for (const res of contentResults) {
      contentMap.set(res.media.id, res);
    }

    // Get Collaborative results (try Item-based first, then User-based)
    const allMedia = this.contentEngine.getAllMedia();
    let collabResults = this.collaborativeEngine.getItemBasedRecommendations(userId, allMedia, {
      ...options,
      limit: limit * 2,
    });

    if (collabResults.length === 0) {
      collabResults = this.collaborativeEngine.getUserBasedRecommendations(userId, allMedia, {
        ...options,
        limit: limit * 2,
      });
    }

    const collabMap = new Map<string, RecommendationResultItem>();
    for (const res of collabResults) {
      collabMap.set(res.media.id, res);
    }

    // Collect all candidate media IDs
    const allCandidateIds = new Set([...contentMap.keys(), ...collabMap.keys()]);
    const hybridMap = new Map<string, RecommendationResultItem>();

    for (const mediaId of allCandidateIds) {
      const cRes = contentMap.get(mediaId);
      const colRes = collabMap.get(mediaId);

      const cScore = cRes ? cRes.score : 0;
      const colScore = colRes ? colRes.score : 0;

      const finalScore = cScore * weights.contentWeight + colScore * weights.collaborativeWeight;

      if (finalScore >= minScore) {
        let media: MediaItem;
        let reason: string;

        if (cRes && colRes) {
          media = cRes.media;
          reason = `Matches your taste and recommended by listeners like you`;
        } else if (cRes) {
          media = cRes.media;
          reason = cRes.reason;
        } else {
          media = colRes!.media;
          reason = colRes!.reason;
        }

        hybridMap.set(mediaId, {
          media,
          score: finalScore,
          reason,
          strategy: 'hybrid',
        });
      }
    }

    const results = Array.from(hybridMap.values());
    results.sort((a, b) => b.score - a.score);
    return results.slice(offset, offset + limit);
  }
}
