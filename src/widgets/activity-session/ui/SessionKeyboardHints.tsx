import { useEffect, useState } from 'react';

function KeyCap({ children }: { children: string }) {
  return (
    <kbd className="border-border text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded border bg-transparent px-1.5 font-sans text-[11px] leading-none font-medium">
      {children}
    </kbd>
  );
}

type Hint = {
  keys: string[];
  label: string;
  /** Render keys as `1 – 4` instead of adjacent caps. */
  range?: boolean;
};

const DEFAULT_HINTS: Hint[] = [
  { keys: ['←'], label: 'Назад' },
  { keys: ['→'], label: 'Далее' },
  { keys: ['1', '4'], label: 'Ответ', range: true },
];

/**
 * Keyboard cheat-sheet under Назад/Далее (right-aligned).
 * Hidden by default; «Показать клавиши» reveals until the next mouse/touch click.
 * Keyboard navigation does not dismiss.
 */
export function SessionKeyboardHints({ hints = DEFAULT_HINTS }: { hints?: Hint[] }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'keyboard') return;
      setRevealed(false);
    };

    // Skip the pointerdown that opened the hints (the reveal button).
    const frame = window.requestAnimationFrame(() => {
      window.addEventListener('pointerdown', onPointerDown, true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [revealed]);

  return (
    <div className="mt-2.5 flex justify-end">
      {revealed ? (
        <ul
          className="text-muted-foreground m-0 inline-flex max-w-full list-none flex-wrap items-center justify-end gap-x-3.5 gap-y-1.5 p-0 text-xs"
          role="note"
          aria-label="Горячие клавиши"
        >
          {hints.map((hint) => (
            <li
              key={`${hint.keys.join('-')}-${hint.label}`}
              className="inline-flex items-center gap-1.5"
            >
              <span className="inline-flex items-center gap-0.5" aria-hidden>
                {hint.range && hint.keys.length === 2 ? (
                  <>
                    <KeyCap>{hint.keys[0]!}</KeyCap>
                    <span className="text-border px-0.5">–</span>
                    <KeyCap>{hint.keys[1]!}</KeyCap>
                  </>
                ) : (
                  hint.keys.map((key) => <KeyCap key={key}>{key}</KeyCap>)
                )}
              </span>
              <span>{hint.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          className="text-primary text-xs font-medium underline-offset-4 hover:underline"
          onClick={() => setRevealed(true)}
        >
          Показать клавиши
        </button>
      )}
    </div>
  );
}
