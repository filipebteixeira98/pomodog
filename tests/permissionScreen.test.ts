import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(
  new URL(
    "../src/features/permissions/OptionalPermissionScreen.tsx",
    import.meta.url,
  ),
  "utf8",
);

// Exercise component actions with isolated hook state; no native permission is requested.
function render(onSave: (enabled: boolean) => Promise<boolean | void>) {
  const states: unknown[] = [];
  let cleanup = () => {};
  let continued = 0;
  const output = { exports: {} as Record<string, Function> };
  const hooks = {
    useState(initial: unknown) {
      const index = states.push(initial) - 1;
      return [
        initial,
        (value: unknown) => {
          states[index] = value;
        },
      ];
    },
    useRef: (initial: unknown) => ({ current: initial }),
    useEffect(effect: () => () => void) {
      cleanup = effect();
    },
  };
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  runInNewContext(compiled, {
    exports: output.exports,
    require(id: string) {
      if (id === "react") return hooks;
      if (id === "react/jsx-runtime") return require(id);
      if (id === "react-native")
        return {
          ActivityIndicator: "Spinner",
          Modal: "Modal",
          ScrollView: "ScrollView",
          View: "View",
        };
      if (id === "react-native-safe-area-context")
        return { SafeAreaView: "SafeAreaView" };
      if (id.endsWith("/Button")) return { Button: "Button" };
      if (id.endsWith("/Text")) return { Text: "Text" };
      throw Error(`Unexpected dependency: ${id}`);
    },
  });
  const tree = output.exports.OptionalPermissionScreen({
    accent: "#506E55",
    reducedMotion: true,
    allowLabel: "Sim, ativar",
    errorMessage: "Permission not granted",
    children: null,
    onSave,
    onContinue: () => {
      continued++;
    },
    onBack: () => {},
  });
  const buttons: { onPress: () => void }[] = [];
  function visit(node: any) {
    if (!node || typeof node !== "object") return;
    if (node.type === "Button") buttons.push(node.props);
    const children = node.props?.children;
    (Array.isArray(children) ? children : [children]).forEach(visit);
  }
  visit(tree);
  return {
    buttons,
    states,
    continued: () => continued,
    unmount: () => cleanup(),
  };
}
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

test("notification refusal saves false and continues without permission request", async () => {
  const choices: boolean[] = [];
  const screen = render(async (enabled) => {
    choices.push(enabled);
    return true;
  });
  screen.buttons[1].onPress();
  await settle();
  assert.deepEqual(choices, [false]);
  assert.equal(screen.continued(), 1);
});

test("denied notification permission stays on screen and allows refusal", async () => {
  const screen = render(async (enabled) => !enabled);
  screen.buttons[0].onPress();
  await settle();
  assert.equal(screen.continued(), 0);
  assert.equal(screen.states[1], "Permission not granted");
  screen.buttons[1].onPress();
  await settle();
  assert.equal(screen.continued(), 1);
});

test("permission screen blocks duplicate actions and late navigation after unmount", async () => {
  let resolve!: (value: boolean) => void;
  let calls = 0;
  const screen = render(() => {
    calls++;
    return new Promise<boolean>((done) => {
      resolve = done;
    });
  });
  screen.buttons[0].onPress();
  screen.buttons[1].onPress();
  assert.equal(calls, 1);
  screen.unmount();
  resolve(true);
  await settle();
  assert.equal(screen.continued(), 0);
});
