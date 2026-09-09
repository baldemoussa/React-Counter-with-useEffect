import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "advanced-counter-state";

type SavedState = {
  count: number;
  step: number;
  history: number[];
};

const DEFAULT_STATE: SavedState = {
  count: 0,
  step: 1,
  history: [0],
};

// Load count, step, and history from localStorage
function readSavedState(): SavedState {
  const saved = localStorage.getItem(STORAGE_KEY);

  // First visit: nothing stored yet
  if (saved === null) {
    return DEFAULT_STATE;
  }

  try {
    // localStorage stores strings, so parse JSON back into an object
    const parsed = JSON.parse(saved) as SavedState;
    const hasValidShape =
      Number.isFinite(parsed.count) &&
      Number.isFinite(parsed.step) &&
      Array.isArray(parsed.history);

    // Use the snapshot only if all three fields look valid
    return hasValidShape ? parsed : DEFAULT_STATE;
  } catch {
    // Bad JSON (or a leftover old value) → start fresh
    return DEFAULT_STATE;
  }
}

function AdvancedCounter() {
  // Read localStorage once, then copy each field into its own piece of state
  const [initialState] = useState(readSavedState);
  const [count, setCount] = useState(initialState.count);
  const [history, setHistory] = useState<number[]>(initialState.history);
  const [step, setStep] = useState(initialState.step);
  // UI label for auto-save: "saving" until the timeout finishes, then "saved"
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved">("saving");

  // Shared updater for +step / -step. useCallback with [] means this function
  // is created once and can be listed safely in a useEffect dependency array
  const changeCount = useCallback((amount: number) => {
    // Show "Saving..." because a new value is about to be persisted
    setSaveStatus("saving");
    // Functional update: use the previous count so rapid clicks stay accurate
    setCount((prev) => prev + amount);
    // Functional update: append the new value onto the existing history array
    setHistory((currentHistory) => {
      // Last recorded count, or 0 if the array were somehow empty
      const lastValue = currentHistory[currentHistory.length - 1] ?? 0;
      // Spread copies old history, then adds the new count at the end
      return [...currentHistory, lastValue + amount];
    });
  }, []);

  // Reset button handler: wipe count and history back to the starting state
  const reset = () => {
    // A reset also needs to be saved, so mark auto-save as in progress
    setSaveStatus("saving");
    // Put the displayed count back to 0
    setCount(0);
    // Replace history with a fresh list that only contains 0
    setHistory([0]);
  };

  // AUTO-SAVE EFFECT
  // Runs after render whenever count, step, or history changes (including first mount)
  useEffect(() => {
    // Wait 400ms before writing. This simulates a slow save and lets cleanup
    // cancel the write if the user clicks again before 400ms is up
    const timeoutId = setTimeout(() => {
      // Bundle count, step, and history into one object
      const stateToSave: SavedState = { count, step, history };
      // JSON.stringify is required because localStorage can only store strings
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      // Flip the status so the UI can say "Saved to local storage"
      setSaveStatus("saved");
    }, 400);

    // CLEANUP: React runs this before the effect re-runs or the component unmounts
    return () => {
      // Cancel the pending timeout so an older snapshot cannot overwrite a newer one
      clearTimeout(timeoutId);
    };
    // Re-run whenever any of the three saved values change
  }, [count, step, history]);

  // KEYBOARD EFFECT
  // Adds ArrowUp / ArrowDown listeners. Re-runs if `step` or `changeCount` change
  useEffect(() => {
    // Named handler so the same function reference can be removed in cleanup
    const handleKeyDown = (event: KeyboardEvent) => {
      // The element that currently has focus (button, input, body, etc.)
      const target = event.target as HTMLElement | null;
      // Ignore arrow keys while typing in the step input so the field still works
      if (target?.tagName === "INPUT") {
        return;
      }

      // ArrowUp = increment by the current step
      if (event.key === "ArrowUp") {
        // Stop the page from scrolling when the arrow key is pressed
        event.preventDefault();
        // Increase count using the latest step value from the effect closure
        changeCount(step);
      } else if (event.key === "ArrowDown") {
        // Stop page scrolling on ArrowDown as well
        event.preventDefault();
        // Decrease count (negative amount)
        changeCount(-step);
      }
    };

    // Subscribe: listen for key presses on the whole document
    document.addEventListener("keydown", handleKeyDown);

    // CLEANUP: always remove the same listener to avoid duplicates / memory leaks
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // Re-attach the listener when step changes so Arrow keys use the new step
  }, [step, changeCount]);

  // Controlled-input handler for the Step number field
  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Convert the input's string value into a number
    const nextStep = Number(event.target.value);
    // Show "Saving..." because step is now part of what we persist
    setSaveStatus("saving");
    // Keep a usable number; fall back to 1 if the user typed something invalid
    setStep(Number.isFinite(nextStep) ? nextStep : 1);
  };

  // JSX: what the user sees. Re-runs whenever any state above changes
  return (
    // Card container for the whole counter UI
    <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
      {/* Page heading */}
      <h1 className="text-center text-2xl font-semibold text-slate-800">
        Advanced Counter
      </h1>
      {/* Short hint about keyboard shortcuts */}
      <p className="mt-1 text-center text-sm text-slate-500">
        Use the buttons, or ArrowUp / ArrowDown on the keyboard
      </p>

      {/* Current count. aria-live tells screen readers when the number changes */}
      <p
        className="mt-8 text-center text-7xl font-bold tabular-nums text-indigo-600"
        aria-live="polite"
      >
        {count}
      </p>

      {/* Button row: decrement, increment, and reset */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {/* Subtract the current step from the count */}
        <button
          type="button"
          onClick={() => changeCount(-step)}
          className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-800 hover:bg-slate-300"
        >
          Decrement
        </button>
        {/* Add the current step to the count */}
        <button
          type="button"
          onClick={() => changeCount(step)}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Increment
        </button>
        {/* Restore count and history to 0 */}
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
        >
          Reset
        </button>
      </div>

      {/* Label wraps the input so clicking "Step" focuses the field */}
      <label className="mt-8 block text-sm font-medium text-slate-700">
        Step
        {/* Controlled input: value comes from state, onChange updates state */}
        <input
          type="number"
          value={step}
          onChange={handleStepChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>
      {/* Reminder: editing step does not push a new history entry by itself */}
      <p className="mt-1 text-xs text-slate-500">
        Changing the step only changes how far the next increment or decrement
        moves. It does not add to history until the count itself changes.
      </p>

      {/* Auto-save status text driven by saveStatus state */}
      <p className="mt-6 text-sm text-slate-600">
        Auto-save:{" "}
        {/* Ternary: show "Saving..." until the timeout callback sets "saved" */}
        <span className="font-medium text-slate-800">
          {saveStatus === "saving" ? "Saving..." : "Saved to local storage"}
        </span>
      </p>

      {/* History list of every count value, joined into one readable string */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          History tracking
        </h2>
        <p className="mt-2 break-words text-slate-700">
          Previous counts: {history.join(", ")}
        </p>
      </div>
    </section>
  );
}

// Make AdvancedCounter available for App.tsx to import and render
export default AdvancedCounter;
