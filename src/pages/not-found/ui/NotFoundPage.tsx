import { Link } from 'react-router';

import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { Button } from '@/shared/ui/kit';

/** Soft 404 for unmatched routes (replaces React Router's default error screen). */
export function NotFoundPage() {
  useDocumentTitle('Страница не найдена');
  return (
    <div>
      <h1 className="m-0 text-2xl font-medium tracking-tight sm:text-3xl">Страница не найдена</h1>
      <p className="text-muted-foreground mt-3 mb-0 text-sm leading-relaxed">
        Такой адрес в ReadyState нет. Возможно, ссылка устарела или была набрана с ошибкой.
      </p>
      <div className="mt-8">
        <Button
          variant="default"
          size="sm"
          nativeButton={false}
          render={<Link to="/">На главную</Link>}
        />
      </div>
    </div>
  );
}
