/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ADMIN_BACKEND_UNAVAILABLE } from '../../services/adminDataService';

export function formatAdminValue(value, language, suffix = '') {
  if (value === null || value === undefined || value === 'N/A' || value === '') {
    return language === 'ar' ? 'غير متاح' : 'N/A';
  }
  return `${value}${suffix}`;
}

export function AdminBadge({ status }) {
  const normalized = String(status || 'N/A').toLowerCase().replaceAll(' ', '-').replaceAll('/', '-');
  return <span className={`admin-badge admin-badge--${normalized}`}>{status || 'N/A'}</span>;
}

export function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="admin-page__header admin-page__header--with-actions">
      <div>
        <h1 className="admin-page__title">{title}</h1>
        {subtitle && <p className="admin-page__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="admin-page__actions">{actions}</div>}
    </div>
  );
}

export function AdminEmptyState({ message }) {
  return <div className="admin-empty-state">{message}</div>;
}

export function AdminErrorState({ message }) {
  const { t } = useLanguage();
  return <div className="admin-empty-state admin-empty-state--error">{message || t('admin.backendUnavailable')}</div>;
}

export function useAdminData(loader, initialValue = []) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      setData(await loader());
    } catch (requestError) {
      setError(requestError?.message || ADMIN_BACKEND_UNAVAILABLE);
      setData(initialValue);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // loader functions are stable service imports in current admin pages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, setData, loading, error, refresh };
}

export function AdminModal({ title, children, footer, onClose, wide = false }) {
  return (
    <div className="admin-modal-overlay">
      <div className={`admin-modal ${wide ? 'admin-modal--wide' : ''}`}>
        <div className="admin-modal__header">
          <h2>{title}</h2>
          <button className="admin-modal__close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
        {footer && <div className="admin-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger = false }) {
  const { t } = useLanguage();
  return (
    <AdminModal title={title} onClose={onCancel} footer={(
      <>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'admin-btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </>
    )}>
      <p className="admin-confirm-text">{message}</p>
    </AdminModal>
  );
}

export function AdminToolbar({ children }) {
  return <div className="admin-toolbar">{children}</div>;
}
