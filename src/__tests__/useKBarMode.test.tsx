/**
 * @jest-environment jsdom
 */

import { render, RenderResult } from "@testing-library/react";
import * as React from "react";
import { act } from "react-dom/test-utils";
import { KBarProvider } from "..";
import { DEFAULT_MODE, Mode } from "../mode/Mode";
import { useKBarMode } from "../mode/useKBarMode";

let renderCount = 0;

function ModeValue({ mode }: { mode: Mode<object> }) {
  renderCount++;

  const currentMode = useKBarMode(mode);

  return <p data-testid="mode-value">{currentMode}</p>;
}

function Component({ mode }: { mode: Mode<object> }) {
  return (
    <KBarProvider>
      <ModeValue mode={mode} />
    </KBarProvider>
  );
}

const setup = (Component: React.ComponentType<{ mode: Mode<object> }>) => {
  renderCount = 0;
  const mode = new Mode({});
  const utils = render(<Component mode={mode} />);
  const renderedMode = () => utils.getByTestId("mode-value").textContent;
  return {
    renderedMode,
    mode,
    ...utils,
  } as Utils;
};

type Utils = RenderResult & { renderedMode: () => string; mode: Mode<object> };

describe("useKBarMode", () => {
  let utils: Utils;
  beforeEach(() => {
    act(() => {
      utils = setup(Component);
    });
  });

  it("starts off in default mode", () => {
    const currentMode = utils.renderedMode();
    expect(currentMode).toBe(DEFAULT_MODE);
  });

  it("setting mode from outside component triggers state update", () => {
    const newMode = "test";
    act(() => {
      utils.mode.registerMode(newMode, {});
      utils.mode.setMode(newMode);
    });
    expect(utils.renderedMode()).toBe(newMode);
  });

  it("exiting mode from outside component triggers state update", () => {
    const newMode = "test";
    act(() => {
      utils.mode.registerMode(newMode, {});
      utils.mode.setMode(newMode);
      utils.mode.exitMode();
    });
    expect(utils.renderedMode()).toBe(DEFAULT_MODE);
  });

  it("component only renders when subscribed state is changed", () => {
    const newMode = "test";

    expect(renderCount).toBe(1);

    act(() => {
      utils.mode.registerMode(newMode, {});
    });
    expect(renderCount).toBe(1);

    act(() => {
      utils.mode.setMode(newMode);
    });
    expect(renderCount).toBe(2);
  });
});
