import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const compiled = ts.transpileModule(
  readFileSync(
    new URL(
      "../src/features/permissions/OptionalCollectionSettings.tsx",
      import.meta.url,
    ),
    "utf8",
  ),
  {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
    },
  },
).outputText;

function render(setEnabled: (value: boolean) => Promise<void>, ready = true) {
  const states: unknown[] = [];
  let cleanup = () => {};
  const exports: Record<string, Function> = {};
  runInNewContext(compiled, {
    exports,
    require(id: string) {
      if (id === "react")
        return {
          useState(initial: unknown) {
            const index = states.push(initial) - 1;
            return [
              initial,
              (value: unknown) => {
                states[index] = value;
              },
            ];
          },
          useRef: (current: unknown) => ({ current }),
          useEffect(effect: () => () => void) {
            cleanup = effect();
          },
          useSyncExternalStore: (
            _subscribe: unknown,
            snapshot: () => boolean,
          ) => snapshot(),
        };
      if (id === "react/jsx-runtime") return require(id);
      if (id === "react-native") return { Switch: "Switch", View: "View" };
      if (id.endsWith("/Card")) return { Card: "Card" };
      if (id.endsWith("/Text")) return { Text: "Text" };
      throw new Error(`Unexpected dependency: ${id}`);
    },
  });
  const tree = exports.OptionalCollectionSettings({
    accent: "#506E55",
    icon: null,
    title: "Sharing",
    eyebrow: "Optional",
    accessibilityLabel: "Sharing",
    children: "Description",
    store: {
      subscribe: () => () => {},
      enabled: () => false,
      ready: () => ready,
      setEnabled,
    },
  });
  function find(node: any): any {
    if (!node || typeof node !== "object") return;
    if (node.type === "Switch") return node.props;
    const children = node.props?.children;
    for (const child of Array.isArray(children) ? children : [children]) {
      const result = find(child);
      if (result) return result;
    }
  }
  return { control: find(tree), states, unmount: () => cleanup() };
}
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));

test("collection settings cannot change consent before restoration completes", async () => {
  let calls = 0;
  const screen = render(async () => {
    calls++;
  }, false);
  assert.equal(screen.control.disabled, true);
  screen.control.onValueChange(true);
  await settle();
  assert.equal(calls, 0);
});

test("collection settings block duplicate changes and permit retry after a failure", async () => {
  let reject!: (error: Error) => void;
  const calls: boolean[] = [];
  const screen = render((enabled) => {
    calls.push(enabled);
    return new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
  });
  screen.control.onValueChange(true);
  screen.control.onValueChange(false);
  assert.deepEqual(calls, [true]);
  reject(new Error("storage failure"));
  await settle();
  assert.equal(screen.states[0], false);
  assert.match(String(screen.states[1]), /Não foi possível salvar/);
  screen.control.onValueChange(false);
  assert.deepEqual(calls, [true, false]);
  reject(new Error("storage failure"));
  await settle();
});

test("a late collection failure does not update an unmounted settings card", async () => {
  let reject!: (error: Error) => void;
  const screen = render(
    () =>
      new Promise<void>((_resolve, fail) => {
        reject = fail;
      }),
  );
  screen.control.onValueChange(true);
  screen.unmount();
  const before = [...screen.states];
  reject(new Error("storage failure"));
  await settle();
  assert.deepEqual(screen.states, before);
});
