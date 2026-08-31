import type { CoursePreview, StagePreview } from '@/shared/config';

/** Stages for the map; flat `units` fall back to a single synthetic stage. */
export function resolveDisplayStages(mapped: CoursePreview): StagePreview[] {
  if (mapped.stages.length > 0) return mapped.stages;
  if (mapped.units.length === 0) return [];
  return [
    {
      id: 'flat',
      title: mapped.title,
      titleEn: mapped.titleEn,
      groups: mapped.units.map((unit) => ({
        groupId: unit.id,
        unitId: unit.id,
        items: unit.items,
      })),
    },
  ];
}
