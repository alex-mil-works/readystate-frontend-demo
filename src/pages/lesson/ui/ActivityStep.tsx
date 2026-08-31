import type { Activity, ActivityHint, ChoiceOption } from '@/shared/lib/content';
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from '@/shared/ui/kit';

import { LessonMarkdown } from './LessonMarkdown';

/** Step role pills: Solve / Recall / Speak. */
const PHASE_BADGE: Record<Activity['phase'], string> = {
  practice: 'Solve',
  revision: 'Recall',
  phrasing: 'Speak',
};

function optionClass(answered: boolean, selected: boolean, correct: boolean): string {
  if (answered && selected && correct) {
    return 'border-success bg-success/15 text-foreground';
  }
  if (answered && selected && !correct) {
    return 'border-destructive bg-destructive/15 text-foreground';
  }
  if (answered && !selected && correct) {
    return 'border-success/70 bg-success/10 text-foreground';
  }
  return 'border-border bg-input/30 text-foreground hover:bg-input/50';
}

function ChoiceList({
  options,
  selectedId,
  onSelect,
}: {
  options: ChoiceOption[];
  selectedId?: string;
  onSelect: (optionId: string) => void;
}) {
  const answered = selectedId !== undefined;

  return (
    <div className="mt-4 flex flex-col gap-2" role="listbox" aria-label="Варианты ответа">
      {options.map((option) => {
        const selected = option.id === selectedId;
        const correct = option.correct === true;
        return (
          <button
            key={option.id}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={answered}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors ${optionClass(answered, selected, correct)}`}
            onClick={() => onSelect(option.id)}
          >
            <LessonMarkdown compact>{option.text}</LessonMarkdown>
          </button>
        );
      })}
    </div>
  );
}

function RecallHints({ hints }: { hints: ActivityHint[] }) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="mt-4 w-full sm:w-auto" />
        }
      >
        Подсказка
      </DialogTrigger>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle>Теория</DialogTitle>
          <DialogDescription>
            Короткий инсайт по теме — можно закрыть и ответить снова.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          {hints.map((hint) => (
            <article
              key={hint.title}
              className="border-border border-t pt-4 first:border-t-0 first:pt-0"
            >
              <h3 className="text-foreground m-0 text-sm font-medium tracking-tight">
                {hint.title}
              </h3>
              <div className="mt-2">
                <LessonMarkdown compact>{hint.markdown}</LessonMarkdown>
              </div>
            </article>
          ))}
        </div>
        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" className="w-full sm:w-auto" />}
          >
            Закрыть
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ActivityStep({
  activity,
  selectedId,
  phrasingDraft,
  sampleOpen,
  onSelect,
  onPhrasingDraft,
  onRevealSample,
}: {
  activity: Activity;
  selectedId?: string;
  phrasingDraft: string;
  sampleOpen: boolean;
  onSelect: (optionId: string) => void;
  onPhrasingDraft: (value: string) => void;
  onRevealSample: () => void;
}) {
  const answered = selectedId !== undefined;
  const recallHints =
    activity.phase === 'revision' && activity.hints && activity.hints.length > 0
      ? activity.hints
      : null;

  if (activity.kind === 'interview_phrasing') {
    return (
      <div>
        <Badge className="bg-success text-success-foreground">{PHASE_BADGE.phrasing}</Badge>
        <div className="mt-4">
          <LessonMarkdown>{activity.prompt}</LessonMarkdown>
        </div>
        <label className="mt-4 block">
          <span className="text-muted-foreground mb-1.5 block text-xs font-medium">
            Черновик ответа (не сохраняется)
          </span>
          <Textarea
            value={phrasingDraft}
            onChange={(event) => onPhrasingDraft(event.target.value)}
            placeholder="Скажите вслух или набросайте здесь…"
            rows={5}
          />
        </label>
        {sampleOpen ? (
          <div className="mt-4 space-y-3">
            <div className="border-success bg-success/10 rounded-xl border-l-4 py-3 pr-3 pl-3">
              <div className="text-success mb-1 text-xs font-medium tracking-wide uppercase">
                Образец
              </div>
              <LessonMarkdown>{activity.sampleAnswer}</LessonMarkdown>
            </div>
            <div className="bg-muted/60 rounded-xl px-3 py-3">
              <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Рубрика
              </div>
              <LessonMarkdown>{activity.rubric}</LessonMarkdown>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-primary mt-3 text-sm underline-offset-4 hover:underline"
            onClick={onRevealSample}
          >
            Показать образец и рубрику
          </button>
        )}
      </div>
    );
  }

  const options = activity.kind === 'single_choice' ? activity.options : activity.choices;
  const prompt = activity.kind === 'single_choice' ? activity.prompt : activity.question;

  return (
    <div>
      <Badge className="bg-success text-success-foreground">{PHASE_BADGE[activity.phase]}</Badge>
      <div className="mt-4">
        <LessonMarkdown>{prompt}</LessonMarkdown>
      </div>
      {activity.kind === 'predict_output' ? (
        <pre className="bg-muted mt-3 overflow-x-auto rounded-xl p-3 font-mono text-[13px] leading-relaxed">
          <code>{activity.code}</code>
        </pre>
      ) : null}
      <ChoiceList options={options} selectedId={selectedId} onSelect={onSelect} />
      {answered ? (
        <div className="border-success bg-success/10 mt-4 rounded-xl border-l-4 px-3 py-3">
          <LessonMarkdown>{activity.explain}</LessonMarkdown>
        </div>
      ) : null}
      {recallHints ? <RecallHints hints={recallHints} /> : null}
    </div>
  );
}
