import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase/config';
import { ServiceResponse } from '../../../types/common/index';
import type {
  AnalyticsContract,
  AnalyticsQuery,
  AnalyticsSummaryPayload,
} from '../analytics/types';

/**
 * Analytics report integration — read side of the Admin Reports centre.
 *
 * Both callables are admin-gated server-side; the client relies on that and
 * does not attempt to filter by role itself.
 *
 * Errors are mapped to actionable bilingual messages. Raw Firebase error
 * strings ("internal", "permission-denied") are not useful to an operator, and
 * previously the raw `error.message` was surfaced straight into the UI.
 */

interface CallableEnvelope<T> {
  status: string;
  data: T;
}

/**
 * Map a callable failure to a message an admin can act on.
 * `functions/permission-denied` and `functions/unauthenticated` are distinct
 * outcomes: the first means "not an admin", the second means "session expired".
 */
const mapAnalyticsError = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? '';
  const message = (error as { message?: string })?.message ?? '';

  switch (code) {
    case 'functions/unauthenticated':
      return 'सत्र समाप्त हो गया। कृपया पुनः लॉगिन करें। (Session expired — please sign in again.)';
    case 'functions/permission-denied':
      return 'इस खाते को रिपोर्ट देखने की अनुमति नहीं है। (This account is not permitted to view reports.)';
    case 'functions/invalid-argument':
      return `अमान्य तिथि-सीमा अथवा फ़िल्टर। (${message.replace(/^.*?:\s*/, '').slice(0, 140)})`;
    case 'functions/unavailable':
    case 'functions/deadline-exceeded':
      return 'एनालिटिक्स सेवा अस्थायी रूप से उपलब्ध नहीं। कृपया थोड़ी देर बाद पुनः प्रयास करें। (Analytics service temporarily unavailable.)';
    case 'functions/resource-exhausted':
    case 'functions/rate-limit-exceeded':
      return 'बहुत अधिक अनुरोध। कृपया कुछ समय बाद पुनः प्रयास करें। (Too many requests — retry shortly.)';
    default:
      return message
        ? `एनालिटिक्स लोड नहीं हो सका। (${message.slice(0, 160)})`
        : 'एनालिटिक्स डेटा अभी उपलब्ध नहीं है। (Analytics data is currently unavailable.)';
  }
};

/** Guard against a malformed payload reaching the UI as a crash. */
const isSummaryPayload = (value: unknown): value is AnalyticsSummaryPayload => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AnalyticsSummaryPayload>;
  return (
    Array.isArray(candidate.daily) &&
    typeof candidate.range?.startDate === 'string' &&
    typeof candidate.range?.endDate === 'string' &&
    typeof candidate.current === 'object' &&
    candidate.current !== null
  );
};

export class ReportService {
  /**
   * Fetch one page of analytics.
   *
   * Paging and filtering are executed by the Cloud Function; this method never
   * downloads the full range and slices it locally.
   */
  async getAnalyticsSummary(query: AnalyticsQuery = {}): Promise<ServiceResponse<AnalyticsSummaryPayload>> {
    try {
      const getSummaryFn = httpsCallable<AnalyticsQuery, CallableEnvelope<AnalyticsSummaryPayload>>(
        functions,
        'analytics-getAnalyticsSummary'
      );
      const response = await getSummaryFn(query);

      if (!isSummaryPayload(response.data?.data)) {
        return {
          success: false,
          error: 'एनालिटिक्स सेवा से अप्रत्याशित प्रतिक्रिया मिली। (Unexpected response from analytics service.)',
        };
      }
      return { success: true, data: response.data.data };
    } catch (error: unknown) {
      return { success: false, error: mapAnalyticsError(error) };
    }
  }

  /**
   * Fetch the server-declared metric contract (definitions, thresholds,
   * timezone). The UI renders metric definitions from this rather than
   * hardcoding them, so the labels can never drift from the thresholds the
   * aggregation engine actually applied.
   */
  async getAnalyticsContract(): Promise<ServiceResponse<AnalyticsContract>> {
    try {
      const getContractFn = httpsCallable<Record<string, never>, CallableEnvelope<AnalyticsContract>>(
        functions,
        'analytics-getAnalyticsContract'
      );
      const response = await getContractFn({});
      const data = response.data?.data;
      if (!data || !Array.isArray(data.metricDefinitions)) {
        return { success: false, error: 'मेट्रिक परिभाषाएँ उपलब्ध नहीं। (Metric definitions unavailable.)' };
      }
      return { success: true, data };
    } catch (error: unknown) {
      // The contract is an enhancement: pages must still render using the
      // locally mirrored declarations when this call fails.
      return { success: false, error: mapAnalyticsError(error) };
    }
  }
}

export const reportService = new ReportService();