import { APP_NAME, APP_TAGLINE } from '@/shared/config';

export function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '40rem' }}>
      <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.875rem' }}>{APP_NAME}</p>
      <h1 style={{ margin: '0.5rem 0 0', fontSize: '1.75rem' }}>{APP_TAGLINE}</h1>
      <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>
        Local-first тренажёр готовности к техническому интервью. Каркас приложения готов к
        подключению router, content-as-code и domain engine.
      </p>
    </main>
  );
}
