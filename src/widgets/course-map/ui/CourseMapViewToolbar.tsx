import ArrowExpand01Icon from '@hugeicons/core-free-icons/ArrowExpand01Icon';
import ArrowShrink01Icon from '@hugeicons/core-free-icons/ArrowShrink01Icon';
import GridViewIcon from '@hugeicons/core-free-icons/GridViewIcon';
import ListViewIcon from '@hugeicons/core-free-icons/ListViewIcon';

import type { CoursePreview } from '@/shared/config';
import { overlayCourseProgress } from '@/shared/lib/progress';
import { useProgressStore } from '@/shared/lib/store/progress-store';
import { useUiPrefsStore } from '@/shared/lib/store/ui-prefs-store';
import { Button, Icon } from '@/shared/ui/kit';

import { resolveDisplayStages } from './display-stages';

/** Expand/collapse + list/tile controls for the course map. */
export function CourseMapViewToolbar({
  course,
  className,
}: {
  course: CoursePreview;
  className?: string;
}) {
  const unitItemsLayout = useUiPrefsStore((s) => s.unitItemsLayout);
  const setUnitItemsLayout = useUiPrefsStore((s) => s.setUnitItemsLayout);
  const stageExpanded = useUiPrefsStore((s) => s.stageExpanded);
  const patchStageExpanded = useUiPrefsStore((s) => s.patchStageExpanded);
  const progressRecord = useProgressStore((s) => s.byCourseId[course.id]);
  const mapped = overlayCourseProgress(course, progressRecord);
  const displayStages = resolveDisplayStages(mapped);

  if (displayStages.length === 0) return null;

  const allExpanded = displayStages.every((stage) => {
    const key = `${mapped.id}:${stage.id}`;
    return stageExpanded[key] ?? !stage.empty;
  });

  const toggleExpandAll = () => {
    const next = !allExpanded;
    const patch: Record<string, boolean> = {};
    for (const stage of displayStages) {
      patch[`${mapped.id}:${stage.id}`] = next;
    }
    patchStageExpanded(patch);
  };

  const expandLabel = allExpanded ? 'Свернуть всё' : 'Развернуть всё';

  return (
    <div
      className={`border-border bg-card/80 flex shrink-0 items-center gap-1 rounded-full border p-1 ${className ?? ''}`}
      role="toolbar"
      aria-label="Представление карты"
    >
      <Button
        type="button"
        size="icon-sm"
        variant={allExpanded ? 'default' : 'ghost'}
        aria-label={expandLabel}
        aria-pressed={allExpanded}
        title={expandLabel}
        onClick={toggleExpandAll}
      >
        <Icon icon={allExpanded ? ArrowShrink01Icon : ArrowExpand01Icon} size={16} />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={unitItemsLayout === 'list' ? 'default' : 'ghost'}
        aria-label="Список уроков"
        aria-pressed={unitItemsLayout === 'list'}
        title="Список"
        onClick={() => setUnitItemsLayout('list')}
      >
        <Icon icon={ListViewIcon} size={16} />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={unitItemsLayout === 'micro-3' ? 'default' : 'ghost'}
        aria-label="Плитка уроков"
        aria-pressed={unitItemsLayout === 'micro-3'}
        title="Плитка"
        onClick={() => setUnitItemsLayout('micro-3')}
      >
        <Icon icon={GridViewIcon} size={16} />
      </Button>
    </div>
  );
}
