import { useRef, useState } from 'react';
import { Link } from 'react-router';

import { getCourseByRoleStack } from '@/shared/config';
import { lockSiteGate } from '@/shared/lib/site-gate';
import {
  type CourseProgressRecord,
  listCoursesInProgress,
  useProgressStore,
} from '@/shared/lib/store/progress-store';
import { useWorkspacePrefsStore } from '@/shared/lib/store/workspace-prefs-store';
import { useDocumentTitle } from '@/shared/lib/use-document-title';
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
} from '@/shared/ui/kit';

import { coursePathForRoleStack } from '@/features/select-role-stack';

function progressSummary(record: CourseProgressRecord): string {
  const done = record.completedLessonIds.length;
  const started = record.startedLessonIds.filter(
    (id) => !record.completedLessonIds.includes(id),
  ).length;
  const parts = [`${done} пройдено`];
  if (started > 0) parts.push(`${started} начато`);
  return parts.join(' · ');
}

function downloadJson(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const SITE_PASSWORD_CONFIGURED = Boolean(String(import.meta.env.VITE_SITE_PASSWORD ?? '').trim());

/** Theme lives in the header; this page lists local progress, transfer, and session. */
export function SettingsPage() {
  useDocumentTitle('Настройки');
  const byCourseId = useProgressStore((state) => state.byCourseId);
  const resetCourse = useProgressStore((state) => state.resetCourse);
  const exportToJson = useProgressStore((state) => state.exportToJson);
  const importFromJson = useProgressStore((state) => state.importFromJson);
  const lastRoleId = useWorkspacePrefsStore((s) => s.lastRoleId);
  const lastStackId = useWorkspacePrefsStore((s) => s.lastStackId);
  const setLastWorkspace = useWorkspacePrefsStore((s) => s.setLastWorkspace);
  const courses = listCoursesInProgress(byCourseId);
  const [pendingResetCourseId, setPendingResetCourseId] = useState<string | null>(null);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [transferMessage, setTransferMessage] = useState<string | null>(null);
  const [transferBusy, setTransferBusy] = useState(false);
  const [primaryMessage, setPrimaryMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingRecord = pendingResetCourseId ? byCourseId[pendingResetCourseId] : undefined;

  const primaryOnly =
    lastRoleId && lastStackId
      ? (() => {
          const inProgress = courses.some(
            (c) => c.roleId === lastRoleId && c.stackId === lastStackId,
          );
          if (inProgress) return null;
          const course = getCourseByRoleStack(lastRoleId, lastStackId);
          return {
            roleId: lastRoleId,
            stackId: lastStackId,
            title: course?.title ?? `${lastRoleId}/${lastStackId}`,
          };
        })()
      : null;

  const confirmResetCourse = () => {
    if (pendingResetCourseId) resetCourse(pendingResetCourseId);
    setPendingResetCourseId(null);
  };

  const confirmLogout = () => {
    lockSiteGate();
    setPendingLogout(false);
  };

  const handleSetPrimary = (roleId: string, stackId: string, title: string) => {
    setLastWorkspace(roleId, stackId);
    setPrimaryMessage(`Основной курс: ${title}`);
  };

  const handleExport = async () => {
    setTransferBusy(true);
    setTransferMessage(null);
    try {
      const json = await exportToJson();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`readystate-progress-${stamp}.json`, json);
      setTransferMessage('Файл скачан.');
    } catch (error) {
      setTransferMessage(error instanceof Error ? error.message : 'Не удалось скачать.');
    } finally {
      setTransferBusy(false);
    }
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setTransferBusy(true);
    setTransferMessage(null);
    try {
      const raw = await file.text();
      setPendingImport(raw);
    } catch {
      setTransferMessage('Не удалось прочитать файл.');
    } finally {
      setTransferBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = async () => {
    if (!pendingImport) return;
    setTransferBusy(true);
    try {
      await importFromJson(pendingImport);
      setPendingImport(null);
      setTransferMessage('Прогресс заменён.');
    } catch (error) {
      setTransferMessage(error instanceof Error ? error.message : 'Файл не подходит.');
      setPendingImport(null);
    } finally {
      setTransferBusy(false);
    }
  };

  return (
    <div>
      <h1 className="m-0 text-3xl font-medium tracking-tight">Настройки</h1>

      <section className="mt-8">
        <h2 className="text-foreground m-0 text-base font-medium">Курсы</h2>
        {courses.length === 0 && !primaryOnly ? (
          <p className="text-muted-foreground mt-3 mb-0 text-sm leading-relaxed">
            Пока нет начатых курсов. Откройте урок на карте — он появится здесь.
          </p>
        ) : (
          <ul className="mt-4 list-none space-y-3 p-0">
            {primaryOnly ? (
              <li className="border-border bg-card flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={coursePathForRoleStack(primaryOnly.roleId, primaryOnly.stackId)}
                      className="text-foreground text-sm font-medium no-underline hover:underline"
                    >
                      {primaryOnly.title}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      Основной
                    </Badge>
                  </div>
                  <p className="text-muted-foreground m-0 mt-1 text-xs">Прогресс ещё не начат</p>
                </div>
              </li>
            ) : null}
            {courses.map((record) => {
              const isPrimary = lastRoleId === record.roleId && lastStackId === record.stackId;

              return (
                <li
                  key={record.courseId}
                  className="border-border bg-card flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={coursePathForRoleStack(record.roleId, record.stackId)}
                        className="text-foreground text-sm font-medium no-underline hover:underline"
                      >
                        {record.title}
                      </Link>
                      {isPrimary ? (
                        <Badge variant="secondary" className="text-xs">
                          Основной
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground m-0 mt-1 text-xs tabular-nums">
                      {progressSummary(record)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isPrimary ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleSetPrimary(record.roleId, record.stackId, record.title)
                        }
                      >
                        Сделать основным
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingResetCourseId(record.courseId)}
                    >
                      Сбросить прогресс
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {primaryMessage ? (
          <p className="text-muted-foreground mt-3 mb-0 text-sm" role="status">
            {primaryMessage}
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="text-foreground m-0 text-base font-medium">Перенос прогресса</h2>
        <p className="text-muted-foreground mt-1.5 mb-0 text-sm">
          Скачайте файл на другое устройство или загрузите свой — текущий прогресс будет заменён.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={transferBusy}
            onClick={() => void handleExport()}
          >
            Скачать
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={transferBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            Загрузить
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImportFile(event.target.files?.[0])}
          />
        </div>
        {transferMessage ? (
          <p className="text-muted-foreground mt-3 mb-0 text-sm" role="status">
            {transferMessage}
          </p>
        ) : null}
      </section>

      <section className="border-border mt-12 border-t pt-8">
        <h2 className="text-foreground m-0 text-base font-medium">Сессия</h2>
        <p className="text-muted-foreground mt-1.5 mb-3 text-sm leading-relaxed">
          Выйти из текущей сессии. Прогресс и основной курс не затрагиваются.
          {SITE_PASSWORD_CONFIGURED ? ' Потребуется снова ввести пароль.' : null}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setPendingLogout(true)}>
          Выйти
        </Button>
      </section>

      <Dialog
        open={pendingResetCourseId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingResetCourseId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сбросить прогресс курса?</DialogTitle>
            <DialogDescription>
              Удалятся отметки по курсу «{pendingRecord?.title ?? ''}». Основной курс и вход не
              изменятся.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Отмена</DialogClose>
            <Button type="button" variant="destructive" onClick={confirmResetCourse}>
              Да, сбросить прогресс
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingLogout}
        onOpenChange={(open) => {
          if (!open) setPendingLogout(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выйти из сессии?</DialogTitle>
            <DialogDescription>
              {SITE_PASSWORD_CONFIGURED
                ? 'Потребуется снова ввести пароль. Прогресс и основной курс останутся на устройстве.'
                : 'Сессия будет сброшена. Прогресс и основной курс останутся на устройстве.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Отмена</DialogClose>
            <Button type="button" variant="destructive" onClick={confirmLogout}>
              Да, выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заменить прогресс?</DialogTitle>
            <DialogDescription>
              Текущий прогресс на этом устройстве будет заменён данными из файла.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Отмена</DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={transferBusy}
              onClick={() => void confirmImport()}
            >
              Да, заменить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
