import { useEffect, useState } from 'react';
import { Download, RotateCcw, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { exportPlatformData, getAdminSettings, saveAdminSettings } from '../../services/adminDataService';
import { AdminErrorState, AdminPageHeader, ConfirmModal } from './AdminShared';
import './AdminPages.css';

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const defaultSettings = {
    platformName: 'Green Zone Academy',
    defaultLanguage: 'en',
    passingScore: 70,
    translationMode: 'Manual / Backend',
    dataSourceMode: 'Database',
  };
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      setSettings(await getAdminSettings());
    } catch (requestError) {
      setError(requestError?.message || t('admin.backendUnavailable'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    getAdminSettings()
      .then((next) => {
        if (mounted) setSettings(next);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.message || t('admin.backendUnavailable'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSave(event) {
    event.preventDefault();
    await saveAdminSettings(settings);
    setSaved(true);
    await refresh();
  }

  async function handleExport() {
    downloadJson('green-zone-admin-export.json', await exportPlatformData());
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader title={t('admin.settings')} subtitle={t('admin.settingsSubtitle')} />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <form className="admin-settings-grid" onSubmit={handleSave}>
          <label>{t('admin.platformName')}<input className="form-control" value={settings.platformName} onChange={(event) => update('platformName', event.target.value)} /></label>
          <label>{t('admin.defaultLanguage')}<select className="form-control" value={settings.defaultLanguage} onChange={(event) => update('defaultLanguage', event.target.value)}><option value="en">English</option><option value="ar">العربية</option></select></label>
          <label>{t('admin.passingScore')}<input type="number" className="form-control" value={settings.passingScore} onChange={(event) => update('passingScore', Number(event.target.value))} /></label>
          <label>{t('admin.translationMode')}<input className="form-control" value={settings.translationMode} onChange={(event) => update('translationMode', event.target.value)} /></label>
          <label>{t('admin.dataSourceMode')}<input className="form-control" value={settings.dataSourceMode} onChange={(event) => update('dataSourceMode', event.target.value)} /></label>
          <div className="admin-settings-actions">
            <button type="submit" className="btn btn-primary"><Save size={16} />{t('admin.save')}</button>
            <button type="button" className="btn btn-secondary" onClick={handleExport}><Download size={16} />{t('admin.exportPlatformData')}</button>
            <button type="button" className="btn admin-btn-danger" onClick={() => setConfirmReset(true)}><RotateCcw size={16} />{t('admin.resetPlatformData')}</button>
          </div>
        </form>

        {saved && <div className="admin-success-message">{t('admin.saved')}</div>}

        {confirmReset && (
          <ConfirmModal
            danger
            title={t('admin.resetPlatformData')}
            message={t('admin.resetPlatformDataWarning')}
            confirmLabel={t('admin.reset')}
            onCancel={() => setConfirmReset(false)}
            onConfirm={async () => {
              await saveAdminSettings(defaultSettings);
              await refresh();
              setConfirmReset(false);
              setSaved(true);
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
