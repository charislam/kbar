import { useCallback } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { Mode } from "./Mode";

export function useKBarMode(mode: Mode) {
  const subscribe = useCallback((fn) => mode.subscribe(["change"], fn), [mode]);
  const currentMode = useSyncExternalStore(
    subscribe,
    () => mode.currentMode,
    () => mode.currentMode
  );
  return currentMode;
}
