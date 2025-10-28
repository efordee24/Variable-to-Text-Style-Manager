import { UIMessage, WorkerMessage } from './types';

export class MessageBridge {
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    // Listen for messages from the UI
    window.addEventListener('message', (event) => {
      const message = event.data.pluginMessage as UIMessage;
      if (message && this.messageHandlers.has(message.type)) {
        this.messageHandlers.get(message.type)!(message);
      }
    });
  }

  // Register a handler for a specific message type
  onMessage<T extends UIMessage>(type: T['type'], handler: (message: T) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Send a message to the UI
  sendToUI(message: WorkerMessage) {
    parent.postMessage({ pluginMessage: message }, '*');
  }

  // Send a toast message to the UI
  showToast(message: string, variant: 'success' | 'error' | 'info' = 'info') {
    this.sendToUI({
      type: 'TOAST',
      message,
      variant,
    });
  }
}
