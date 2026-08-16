// Sprint M7.2 — Recommendation Engine: Collaborative Filtering

import { MediaItem, SimilarityEngine } from './SimilarityEngine';
import {
  UserInteraction,
  RecommendationOptions,
  RecommendationResultItem,
} from './ContentBasedFiltering';

export class CollaborativeFiltering {
  private userInteractions: Map<string, UserInteraction[]> = new Map();
  private itemCoOccurrence: Map<string, Map<string, number>> = new Map();
  private similarityEngine: SimilarityEngine = new SimilarityEngine();

  public recordInteraction(interaction: UserInteraction): void {
    if (!this.userInteractions.has(interaction.userId)) {
      this.userInteractions.set(interaction.userId, []);
    }
    this.userInteractions.get(interaction.userId)!.push(interaction);
    this.updateCoOccurrence(interaction.userId, interaction.mediaId);
  }

  public recordInteractions(interactions: UserInteraction[]): void {
    for (const inter of interactions) {
      this.recordInteraction(inter);
    }
  }

  private updateCoOccurrence(userId: string, newMediaId: string): void {
    const history = this.userInteractions.get(userId) || [];
    const previousMediaIds = new Set(
      history.filter((h) => h.mediaId !== newMediaId).map((h) => h.mediaId)
    );

    for (const prevId of previousMediaIds) {
      this.incrementCoOccurrence(prevId, newMediaId);
      this.incrementCoOccurrence(newMediaId, prevId);
    }
  }

  private incrementCoOccurrence(mediaIdA: string, mediaIdB: string, weight: number = 1.0): void {
    if (!this.itemCoOccurrence.has(mediaIdA)) {
      this.itemCoOccurrence.set(mediaIdA, new Map());
    }
    const map = this.itemCoOccurrence.get(mediaIdA)!;
    const current = map.get(mediaIdB) || 0;
    map.set(mediaIdB, current + weight);
  }

  /**
   * Calculate User-User similarity based on Jaccard overlap of interacted media IDs.
   */
  public computeUserSimilarity(userIdA: string, userIdB: string): number {
    const historyA = this.userInteractions.get(userIdA) || [];
    const historyB = this.userInteractions.get(userIdB) || [];

    const setA = new Set(historyA.map((h) => h.mediaId));
    const setB = new Set(historyB.map((h) => h.mediaId));

    return this.similarityEngine.jaccardSimilarity(setA, setB);
  }

  /**
   * User-based Collaborative Filtering Recommendations.
   */
  public getUserBasedRecommendations(
    userId: string,
    allMedia: MediaItem[],
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const targetHistory = this.userInteractions.get(userId) || [];
    const targetInteractedIds = new Set(targetHistory.map((h) => h.mediaId));
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const mediaMap = new Map(allMedia.map((m) => [m.id, m]));

    // Find top similar users
    const userSimilarities: { userId: string; similarity: number }[] = [];
    for (const [otherUserId] of this.userInteractions.entries()) {
      if (otherUserId === userId) continue;
      const sim = this.computeUserSimilarity(userId, otherUserId);
      if (sim > 0) {
        userSimilarities.push({ userId: otherUserId, similarity: sim });
      }
    }

    userSimilarities.sort((a, b) => b.similarity - a.similarity);

    // Aggregate candidate item scores from top similar users
    const candidateScores: Map<string, number> = new Map();
    const candidateReasons: Map<string, string> = new Map();

    for (const { userId: similarUserId, similarity } of userSimilarities.slice(0, 20)) {
      const simUserHistory = this.userInteractions.get(similarUserId) || [];
      for (const inter of simUserHistory) {
        if (targetInteractedIds.has(inter.mediaId) && options.filterUnwatched !== false) {
          continue;
        }

        const media = mediaMap.get(inter.mediaId);
        if (!media) continue;

        const currentScore = candidateScores.get(inter.mediaId) || 0;
        candidateScores.set(inter.mediaId, currentScore + similarity);

        if (!candidateReasons.has(inter.mediaId)) {
          candidateReasons.set(
            inter.mediaId,
            `Popular among listeners with similar tastes to you`
          );
        }
      }
    }

    const results: RecommendationResultItem[] = [];
    for (const [mediaId, score] of candidateScores.entries()) {
      const media = mediaMap.get(mediaId);
      if (!media) continue;

      // Normalize score into [0, 1] range
      const normalizedScore = Math.min(1.0, score);
      results.push({
        media,
        score: normalizedScore,
        reason: candidateReasons.get(mediaId) || 'Recommended by users with similar tastes',
        strategy: 'collaborative',
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(offset, offset + limit);
  }

  /**
   * Item-based Collaborative Filtering Recommendations.
   */
  public getItemBasedRecommendations(
    userId: string,
    allMedia: MediaItem[],
    options: RecommendationOptions = {}
  ): RecommendationResultItem[] {
    const targetHistory = this.userInteractions.get(userId) || [];
    const targetInteractedIds = new Set(targetHistory.map((h) => h.mediaId));
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const mediaMap = new Map(allMedia.map((m) => [m.id, m]));

    const candidateScores: Map<string, number> = new Map();
    const triggerItemTitleMap: Map<string, string> = new Map();

    for (const userInter of targetHistory) {
      const coMap = this.itemCoOccurrence.get(userInter.mediaId);
      if (!coMap) continue;

      const triggerMedia = mediaMap.get(userInter.mediaId);
      const triggerTitle = triggerMedia ? triggerMedia.title : 'recent playback';

      for (const [coMediaId, coCount] of coMap.entries()) {
        if (targetInteractedIds.has(coMediaId) && options.filterUnwatched !== false) {
          continue;
        }

        const media = mediaMap.get(coMediaId);
        if (!media) continue;

        const currentScore = candidateScores.get(coMediaId) || 0;
        candidateScores.set(coMediaId, currentScore + coCount);

        if (!triggerItemTitleMap.has(coMediaId)) {
          triggerItemTitleMap.set(coMediaId, triggerTitle);
        }
      }
    }

    const results: RecommendationResultItem[] = [];
    let maxRawScore = 1;
    for (const score of candidateScores.values()) {
      if (score > maxRawScore) maxRawScore = score;
    }

    for (const [mediaId, score] of candidateScores.entries()) {
      const media = mediaMap.get(mediaId);
      if (!media) continue;

      const normScore = score / maxRawScore;
      const triggerTitle = triggerItemTitleMap.get(mediaId);

      results.push({
        media,
        score: normScore,
        reason: `People who listened to "${triggerTitle}" also listened to this`,
        strategy: 'collaborative',
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(offset, offset + limit);
  }

  /**
   * Frequently Played Together: Returns top items co-consumed with mediaId.
   */
  public getFrequentlyPlayedTogether(
    mediaId: string,
    allMedia: MediaItem[],
    limit: number = 5
  ): RecommendationResultItem[] {
    const coMap = this.itemCoOccurrence.get(mediaId);
    if (!coMap || coMap.size === 0) return [];

    const mediaMap = new Map(allMedia.map((m) => [m.id, m]));
    let maxCount = 1;
    for (const count of coMap.values()) {
      if (count > maxCount) maxCount = count;
    }

    const results: RecommendationResultItem[] = [];
    for (const [coId, count] of coMap.entries()) {
      const media = mediaMap.get(coId);
      if (!media) continue;

      results.push({
        media,
        score: count / maxCount,
        reason: `Frequently played together with selected satsang media`,
        strategy: 'collaborative',
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
