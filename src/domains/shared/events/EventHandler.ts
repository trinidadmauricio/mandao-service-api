/**
 * Base class para event handlers
 */

import { Event } from './EventBus';

export abstract class EventHandler {
  abstract handle(event: Event): Promise<void>;
}
