import { Link } from 'react-router';

import { useDocumentTitle } from '@/shared/lib/use-document-title';
import { Button } from '@/shared/ui/kit';

/** Known path shape but unknown role and/or stack id. */
export function InvalidWorkspacePage({ roleId, stackId }: { roleId?: string; stackId?: string }) {
  useDocumentTitle('Курс не найден');
  const requested = roleId && stackId ? `${roleId}/${stackId}` : roleId ? roleId : (stackId ?? '—');

  return (
    <div>
      <h1 className="m-0 text-2xl font-medium tracking-tight sm:text-3xl">Курс не найден</h1>
      <p className="text-muted-foreground mt-3 mb-0 text-sm leading-relaxed">
        В каталоге нет комбинации роли и стека{' '}
        <span className="text-foreground font-medium">{requested}</span>. Проверьте адрес или
        выберите доступный курс на главной.
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
