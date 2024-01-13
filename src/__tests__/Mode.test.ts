import { DEFAULT_MODE, Mode } from "../mode/Mode";

describe("mode class", () => {
  let mode: Mode;

  beforeEach(() => {
    mode = new Mode();
  });

  it("mode is initiated in command mode", () => {
    expect(mode.currentMode).toBe(DEFAULT_MODE);
  });

  it("setting an unregistered mode fails", () => {
    const result = mode.setMode("unregistered");
    expect(result).toBe(false);
    expect(mode.currentMode).toBe(DEFAULT_MODE);
  });

  it("setting a registered mode succeeds", () => {
    const modeName = "registered";
    mode.registerMode(modeName);
    const result = mode.setMode(modeName);
    expect(result).toBe(true);
    expect(mode.currentMode).toBe(modeName);
  });

  it("exiting a mode returns the previous mode", () => {
    const firstMode = "first";
    const secondMode = "second";
    mode.registerMode(firstMode);
    mode.registerMode(secondMode);

    mode.setMode(firstMode);
    mode.setMode(secondMode);
    expect(mode.currentMode).toBe(secondMode);
    mode.exitMode();
    expect(mode.currentMode).toBe(firstMode);
    mode.exitMode();
    expect(mode.currentMode).toBe(DEFAULT_MODE);
  });

  it("root mode cannot be exited", () => {
    const result = mode.exitMode();
    expect(result).toBe(false);
    expect(mode.currentMode).toBe(DEFAULT_MODE);
  });

  it("change listeners are notified on mode set and mode exit", () => {
    const newMode = "test";
    mode.registerMode(newMode);
    const fn = jest.fn();
    mode.subscribe(["change"], fn);

    mode.setMode(newMode);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(newMode);

    mode.exitMode();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(DEFAULT_MODE);
  });

  it("change listeners are not notified if same mode set twice in a row (idempotent)", () => {
    const newMode = "test";
    mode.registerMode(newMode);
    const fn = jest.fn();
    mode.subscribe(["change"], fn);

    mode.setMode(newMode);
    mode.setMode(newMode);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("change listeners are not notified after unsubscribe", () => {
    const newMode = "test";
    mode.registerMode(newMode);
    const fn = jest.fn();
    const unsubscribe = mode.subscribe(["change"], fn);

    mode.setMode(newMode);
    expect(fn).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
