// Sprint M3.1 — Media Processing Pipeline Events

export type MediaProcessingEventType =
  | 'MediaProcessingStarted'
  | 'MediaValidationCompleted'
  | 'MetadataExtracted'
  | 'MediaOptimized'
  | 'ThumbnailGenerated'
  | 'PreviewGenerated'
  | 'MediaStored'
  | 'ProcessingCompleted'
  | 'ProcessingFailed';

export interface MediaProcessingEvent {
  eventType: MediaProcessingEventType;
  mediaId: string;
  timestamp: string;
  stageName?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export type EventListener = (event: MediaProcessingEvent) => void;

export class MediaEventBus {
  private static instance: MediaEventBus;
  private listeners: Map<MediaProcessingEventType, EventListener[]> = new Map();

  private constructor() {}

  public static getInstance(): MediaEventBus {
    if (!MediaEventBus.instance) {
      MediaEventBus.instance = new MediaEventBus();
    }
    return MediaEventBus.instance;
  }

  public subscribe(eventType: MediaProcessingEventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      const list = this.listeners.get(eventType) ?? [];
      this.listeners.set(
        eventType,
        list.filter((l) => l !== listener)
      );
    };
  }

  public publish(event: MediaProcessingEvent): void {
    const list = this.listeners.get(event.eventType) ?? [];
    for (const listener of list) {
      try {
        listener(event);
      } catch (err) {
        console.error(`Error in event listener for ${event.eventType}:`, err);
      }
    }
  }
}

export const mediaEventBus = MediaEventBus.getInstance();
