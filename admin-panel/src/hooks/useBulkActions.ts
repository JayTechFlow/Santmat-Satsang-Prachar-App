import { useState, useCallback } from 'react';

export interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: any[];
}

export function useBulkActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const executeBulkAction = useCallback(async <T>(
    items: T[],
    actionFn: (item: T) => Promise<any>
  ): Promise<BulkOperationResult> => {
    setIsProcessing(true);
    setProgress(0);
    
    let successful = 0;
    let failed = 0;
    const errors: any[] = [];
    
    // Process items in parallel but we might want to track progress.
    // If we just use Promise.allSettled, progress is binary (done or not).
    // Let's execute and map them, incrementing progress.
    const promises = items.map(async (item, index) => {
      try {
        await actionFn(item);
        successful++;
      } catch (err) {
        failed++;
        errors.push(err);
      } finally {
        setProgress(Math.round(((index + 1) / items.length) * 100));
      }
    });

    await Promise.allSettled(promises);
    
    setIsProcessing(false);
    setProgress(100);
    
    return { successful, failed, errors };
  }, []);

  return {
    isProcessing,
    progress,
    executeBulkAction
  };
}
