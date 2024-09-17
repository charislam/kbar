import { useCallback, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { Mode } from "./Mode";

export function useKBarMode<T extends object>(mode: Mode<T>) {
  const subscribe = useCallback((fn) => mode.subscribe(["change"], fn), [mode]);
  const previousMode = useRef([mode.currentMode, mode.currentValue]);
  const currentMode = useSyncExternalStore(
    subscribe,
    () => {
      const newMode =
        mode.currentMode === previousMode.current[0]
          ? previousMode.current
          : [mode.currentMode, mode.currentValue];
      previousMode.current = newMode;
      return newMode;
    },
    () => [mode.currentMode, mode.currentValue]
  );
  return currentMode;
}
