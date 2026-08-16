// Sprint M7.3 — Personalization Engine (Agent C): User Profile Learner

import { UserPreferences, InteractionHistoryItem } from './UserPreferencesStore';

export interface AffinityScore {
  name: string;
  score: number;
  count: number;
  lastInteraction: string;
}

export interface UserProfile {
  userId: string;
  categoryAffinities: Record<string, number>;
  speakerAffinities: Record<string, number>;
  languageAffinities: Record<string, number>;
  contentTypeAffinities: Record<string, number>;
  topCategories: string[];
  topSpeakers: string[];
  topLanguages: string[];
  recommendedTags: string[];
  engagementLevel: 'new' | 'casual' | 'regular' | 'power';
  totalInteractions: number;
  lastLearnedAt: string;
}

export class UserProfileLearner {
  private halfLifeDays: number;
  private favoriteWeightBoost: number;

  constructor(halfLifeDays: number = 30, favoriteWeightBoost: number = 5.0) {
    this.halfLifeDays = halfLifeDays;
    this.favoriteWeightBoost = favoriteWeightBoost;
  }

  public learnProfile(preferences: UserPreferences): UserProfile {
    const categoryScores: Record<string, AffinityScore> = {};
    const speakerScores: Record<string, AffinityScore> = {};
    const languageScores: Record<string, AffinityScore> = {};
    const contentTypeScores: Record<string, AffinityScore> = {};
    const tagFrequency: Record<string, number> = {};

    const allHistory: InteractionHistoryItem[] = [
      ...preferences.playbackHistory,
      ...preferences.watchHistory,
      ...preferences.readingHistory,
    ];

    const totalInteractions = allHistory.length;
    const now = Date.now();

    // Process history items
    for (const item of allHistory) {
      const itemDate = new Date(item.timestamp).getTime();
      const ageInDays = Math.max(0, (now - (isNaN(itemDate) ? now : itemDate)) / (1000 * 60 * 60 * 24));
      // Exponential decay: e^(-lambda * t)
      const decayFactor = Math.exp(-Math.LN2 * (ageInDays / this.halfLifeDays));
      const completionWeight = item.completionRatio !== undefined ? Math.max(0.2, item.completionRatio) : 1.0;
      const weight = decayFactor * completionWeight;

      // Category affinity
      if (item.category) {
        this.updateAffinity(categoryScores, item.category, weight, item.timestamp);
      }

      // Speaker affinity
      if (item.speaker) {
        this.updateAffinity(speakerScores, item.speaker, weight, item.timestamp);
      }

      // Language affinity
      if (item.language) {
        this.updateAffinity(languageScores, item.language, weight, item.timestamp);
      }

      // Content Type affinity
      if (item.contentType) {
        this.updateAffinity(contentTypeScores, item.contentType, weight, item.timestamp);
      }

      // Tags if available in metadata
      if (item.metadata?.tags && Array.isArray(item.metadata.tags)) {
        for (const tag of item.metadata.tags) {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + weight;
        }
      }
    }

    // Boost explicit favorites
    for (const cat of preferences.favoriteCategories) {
      this.updateAffinity(categoryScores, cat, this.favoriteWeightBoost, new Date().toISOString());
    }
    for (const speaker of preferences.favoriteSpeakers) {
      this.updateAffinity(speakerScores, speaker, this.favoriteWeightBoost, new Date().toISOString());
    }
    for (const lang of preferences.favoriteLanguages) {
      this.updateAffinity(languageScores, lang, this.favoriteWeightBoost, new Date().toISOString());
    }

    // Normalize scores to 0..1 scale relative to max score
    const categoryAffinities = this.normalizeScores(categoryScores);
    const speakerAffinities = this.normalizeScores(speakerScores);
    const languageAffinities = this.normalizeScores(languageScores);
    const contentTypeAffinities = this.normalizeScores(contentTypeScores);

    // Sort top elements
    const topCategories = Object.keys(categoryAffinities).sort((a, b) => categoryAffinities[b] - categoryAffinities[a]).slice(0, 5);
    const topSpeakers = Object.keys(speakerAffinities).sort((a, b) => speakerAffinities[b] - speakerAffinities[a]).slice(0, 5);
    const topLanguages = Object.keys(languageAffinities).sort((a, b) => languageAffinities[b] - languageAffinities[a]).slice(0, 5);
    const recommendedTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]).slice(0, 10);

    // Determine engagement level
    let engagementLevel: 'new' | 'casual' | 'regular' | 'power' = 'new';
    if (totalInteractions >= 50) {
      engagementLevel = 'power';
    } else if (totalInteractions >= 10) {
      engagementLevel = 'regular';
    } else if (totalInteractions >= 1) {
      engagementLevel = 'casual';
    }

    return {
      userId: preferences.userId,
      categoryAffinities,
      speakerAffinities,
      languageAffinities,
      contentTypeAffinities,
      topCategories,
      topSpeakers,
      topLanguages,
      recommendedTags,
      engagementLevel,
      totalInteractions,
      lastLearnedAt: new Date().toISOString(),
    };
  }

  private updateAffinity(
    map: Record<string, AffinityScore>,
    name: string,
    weight: number,
    timestamp: string
  ): void {
    if (!map[name]) {
      map[name] = { name, score: 0, count: 0, lastInteraction: timestamp };
    }
    map[name].score += weight;
    map[name].count += 1;
    if (new Date(timestamp) > new Date(map[name].lastInteraction)) {
      map[name].lastInteraction = timestamp;
    }
  }

  private normalizeScores(map: Record<string, AffinityScore>): Record<string, number> {
    const result: Record<string, number> = {};
    let maxScore = 0;
    for (const key of Object.keys(map)) {
      if (map[key].score > maxScore) {
        maxScore = map[key].score;
      }
    }
    for (const key of Object.keys(map)) {
      result[key] = maxScore > 0 ? parseFloat((map[key].score / maxScore).toFixed(4)) : 0;
    }
    return result;
  }
}
