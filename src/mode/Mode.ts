type ModeEvent = "change";

export const DEFAULT_MODE = "command" as const;

export class Mode {
  private modes: Set<String>;
  private stack: string[];
  private subscribers: Record<ModeEvent, ((mode: string) => any)[]>;

  constructor() {
    this.modes = new Set([DEFAULT_MODE]);
    this.stack = [DEFAULT_MODE];
    this.subscribers = { change: [] };
  }

  registerMode(newMode: string) {
    if (this.modes.has(newMode)) {
      return false;
    }
    this.modes.add(newMode);
    return true;
  }

  setMode(mode: string) {
    if (this.currentMode === mode || !this.modes.has(mode)) {
      return false;
    }
    this.stack.push(mode);
    this.notify("change", mode);
    return true;
  }

  exitMode() {
    if (this.stack.length === 1) {
      return false;
    }
    const removed = this.stack.pop();
    // this.currentMode guaranteed to exist because we have the check
    // against popping from a stack of size 1
    this.notify("change", this.currentMode!);
    return removed;
  }

  get currentMode() {
    return this.stack.at(-1);
  }

  subscribe(events: ModeEvent[], fn: (mode: string) => any) {
    for (const event of events) {
      switch (event) {
        case "change":
          this.subscribers.change.push(fn);
          break;
        default:
          throw Error(`Invalid event requested in subscription: ${event}`);
      }
    }
    return () => {
      for (const event in this.subscribers) {
        const idx = this.subscribers[event].indexOf(fn);
        if (idx !== -1) {
          this.subscribers[event].splice(idx, 1);
        }
      }
    };
  }

  private notify(event: ModeEvent, currMode: string) {
    for (const subscriber of this.subscribers[event]) {
      subscriber(currMode);
    }
  }
}
