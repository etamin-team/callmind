import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

function SettingsLayout() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('app.settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('app.settings.description')}</p>
      </div>
      <div className="flex-1 lg:max-w-4xl">
        <Outlet />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/$workspaceId/settings')({
  component: SettingsLayout,
})
