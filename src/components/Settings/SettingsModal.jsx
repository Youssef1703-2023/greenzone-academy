import { X, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './SettingsModal.css';

export default function SettingsModal({ isOpen, onClose }) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(event) => event.stopPropagation()}>
        <div className="settings-modal__header">
          <h3>{t('settings.title')}</h3>
          <button className="settings-modal__close" onClick={onClose} aria-label={t('settings.title')}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-modal__body">
          <div className="settings-modal__option">
            <div className="settings-modal__option-info">
              <Globe size={18} />
              <div>
                <h4>{t('settings.language')}</h4>
                <p>{language === 'en' ? t('settings.english') : t('settings.arabic')}</p>
              </div>
            </div>

            <div className="settings-modal__language-actions">
              <button
                className={`settings-modal__language-btn ${language === 'en' ? 'settings-modal__language-btn--active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={`settings-modal__language-btn ${language === 'ar' ? 'settings-modal__language-btn--active' : ''}`}
                onClick={() => setLanguage('ar')}
              >
                العربية
              </button>
            </div>
          </div>

          {language === 'ar' && (
            <p className="settings-modal__note">{t('settings.arabicNote')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
