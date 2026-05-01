import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './EditProfileForm.css';

export default function EditProfileForm() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (!name.trim() || !email.trim()) {
      setErrorMsg(t('profilePage.nameRequired'));
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg(t('profilePage.validEmail'));
      return;
    }

    const result = updateUser(name, email);
    if (result.success) {
      setSuccessMsg(t('profilePage.updateSuccess'));
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <div className="edit-profile-form">
      <h3 className="edit-profile-form__header">{t('profilePage.accountInformation')}</h3>
      
      {successMsg && <div className="edit-profile-form__alert edit-profile-form__alert--success">{successMsg}</div>}
      {errorMsg && <div className="edit-profile-form__alert edit-profile-form__alert--error">{errorMsg}</div>}
      
      <form onSubmit={handleSubmit} className="edit-profile-form__form">
        <div className="form-group">
          <label htmlFor="profile-name">{t('profilePage.fullName')}</label>
          <input 
            type="text" 
            id="profile-name" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder={t('common.student')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="profile-email">{t('profilePage.emailAddress')}</label>
          <input 
            type="email" 
            id="profile-email" 
            className="form-control" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="student@example.com"
          />
        </div>
        
        <div className="edit-profile-form__actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            <X size={18} />
            {t('common.cancel')}
          </button>
          <button type="submit" className="btn btn-primary edit-profile-btn--glow">
            <Save size={18} />
            {t('common.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}
