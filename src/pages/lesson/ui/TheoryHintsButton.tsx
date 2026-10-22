import type { ActivityHint } from '@/shared/lib/content';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/kit';

import { LessonMarkdown } from './LessonMarkdown';

/** Opens theory dialog — intended between Назад and Далее. */
export function TheoryHintsButton({ hints }: { hints: ActivityHint[] }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
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
