/* Shown for any URL that doesn't match a route. */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from '@phosphor-icons/react';
import { EmptyState } from '@/ui';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <EmptyState icon={<Compass size={44} />} title={t('notFound.title')}>
      <Link to="/my-work">{t('notFound.back')}</Link>
    </EmptyState>
  );
}
