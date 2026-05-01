import { useMemo, useState } from 'react';
import { Eye, Languages, RefreshCw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslations, markTranslationReviewed } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, formatAdminValue, useAdminData } from './AdminShared';
import './AdminPages.css';

export default function AdminTranslationsPage() {
  const { language, t } = useLanguage();
  const { data: translations, loading, error, refresh } = useAdminData(getTranslations, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [placeholder, setPlaceholder] = useState('');

  const filtered = useMemo(() => translations.filter((row) => {
    const text = `${row.course} ${row.phase} ${row.lesson} ${row.translationSource}`.toLowerCase();
    const statusMatch = statusFilter === 'All'
      || row.arabicStatus === statusFilter
      || row.hashStatus === statusFilter
      || row.translationSource === statusFilter;
    return text.includes(query.toLowerCase()) && statusMatch;
  }), [query, statusFilter, translations]);

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.translationManagement')}
          subtitle={t('admin.translationManagementSubtitle')}
          actions={<button className="btn btn-secondary" onClick={refresh}><RefreshCw size={16} />{t('admin.refresh')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchTranslations')} />
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Ready">{t('admin.ready')}</option>
            <option value="Missing">{t('admin.missing')}</option>
            <option value="Stale">{t('admin.stale')}</option>
            <option value="Manual">Manual</option>
            <option value="Google">Google</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.course')}</th>
                <th>{t('admin.phase')}</th>
                <th>{t('admin.lesson')}</th>
                <th>{t('admin.englishStatus')}</th>
                <th>{t('admin.arabicStatus')}</th>
                <th>{t('admin.translationSource')}</th>
                <th>{t('admin.lastUpdated')}</th>
                <th>{t('admin.hashStatus')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.course}</td>
                  <td>{row.phase}</td>
                  <td className="admin-table__highlight">{row.lesson}</td>
                  <td><AdminBadge status={row.englishStatus} /></td>
                  <td><AdminBadge status={row.arabicStatus} /></td>
                  <td>{row.translationSource}</td>
                  <td>{formatAdminValue(row.lastUpdated, language)}</td>
                  <td><AdminBadge status={row.hashStatus} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <Link className="admin-table__btn" to={row.route}><Eye size={14} />EN</Link>
                      <Link className="admin-table__btn" to={row.route}><Languages size={14} />AR</Link>
                      <button className="admin-table__btn admin-table__btn--disabled" onClick={() => setPlaceholder(t('admin.translationBackendNotConfigured'))}>{t('admin.generateArabic')}</button>
                      <button className="admin-table__btn" onClick={async () => { await markTranslationReviewed(row); await refresh(); }}><ShieldCheck size={14} />{t('admin.markReviewed')}</button>
                      <button className="admin-table__btn admin-table__btn--disabled" onClick={() => setPlaceholder(t('admin.translationBackendNotConfigured'))}>{t('admin.refreshTranslation')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {placeholder && (
          <AdminModal title={t('admin.translationManagement')} onClose={() => setPlaceholder('')} footer={<button className="btn btn-primary" onClick={() => setPlaceholder('')}>{t('admin.close')}</button>}>
            <p className="admin-confirm-text">{placeholder}</p>
          </AdminModal>
        )}
      </main>
    </AdminLayout>
  );
}
