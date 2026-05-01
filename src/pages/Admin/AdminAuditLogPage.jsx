import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getAuditLog } from '../../services/adminDataService';
import { AdminEmptyState, AdminErrorState, AdminPageHeader, useAdminData } from './AdminShared';
import './AdminPages.css';

export default function AdminAuditLogPage() {
  const { t } = useLanguage();
  const { data: events, loading, error } = useAdminData(getAuditLog, []);

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader title={t('admin.auditLog')} subtitle={t('admin.auditLogSubtitle')} />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        {!loading && !error && events.length === 0 ? (
          <AdminEmptyState message={t('admin.noAuditEvents')} />
        ) : !error && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.action')}</th>
                  <th>{t('admin.entityType')}</th>
                  <th>{t('admin.entityName')}</th>
                  <th>{t('admin.actor')}</th>
                  <th>{t('admin.date')}</th>
                  <th>{t('admin.details')}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="admin-table__highlight">{event.action}</td>
                    <td>{event.entityType}</td>
                    <td>{event.entityName}</td>
                    <td>{event.actor}</td>
                    <td>{event.createdAt}</td>
                    <td>{event.details || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}
