import { DEFAULT_MODE, Mode } from "../mode/Mode";

const DEFAULT_DATA = "default data";

describe("mode class", () => {
  let mode: Mode<{ data: string }>;

  beforeEach(() => {
    mode = new Mode({ data: DEFAULT_DATA });
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
    const modeValue = { data: "registered data" };
    mode.registerMode(modeName, modeValue);
    const result = mode.setMode(modeName);
    expect(result).toBe(true);
    expect(mode.currentMode).toBe(modeName);
  });

  it("can get data for current mode", () => {
    expect(mode.currentValue!.data).toBe(DEFAULT_DATA);

    const modeName = "test";
    const modeValue = { data: "test data" };
    mode.registerMode(modeName, modeValue);
    mode.setMode(modeName);

    expect(mode.currentValue!.data).toBe(modeValue.data);
  });

  it("can unregister a mode", () => {
    const modeName = "test";
    const modeValue = { data: "test data" };
    const unregister = mode.registerMode(modeName, modeValue);
    mode.setMode(modeName);

    unregister?.();
    expect(mode.currentMode).toBe(DEFAULT_MODE);

    const result = mode.setMode(modeName);
    expect(result).toBe(false);
    expect(mode.currentMode).toBe(DEFAULT_MODE);
  });

  it("exiting a mode returns the previous mode", () => {
    const firstMode = "first";
    const firstValue = { data: "first value" };
    const secondMode = "second";
    const secondValue = { data: "second value" };
    mode.registerMode(firstMode, firstValue);
    mode.registerMode(secondMode, secondValue);

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
    const newValue = { data: "test value" };
    mode.registerMode(newMode, newValue);
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
    const newValue = { data: "test value" };
    mode.registerMode(newMode, newValue);
    const fn = jest.fn();
    mode.subscribe(["change"], fn);

    mode.setMode(newMode);
    mode.setMode(newMode);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("change listeners are not notified after unsubscribe", () => {
    const newMode = "test";
    const newValue = { data: "test value" };
    mode.registerMode(newMode, newValue);
    const fn = jest.fn();
    const unsubscribe = mode.subscribe(["change"], fn);

    mode.setMode(newMode);
    expect(fn).toHaveBeenCalledTimes(1);

    unsubscribe();
    mode.exitMode();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
