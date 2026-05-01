import { Shield, Mail, User, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './ProfileOverview.css';

export default function ProfileOverview({ user }) {
  const { t } = useLanguage();
  const name = user?.name === 'Student' ? t('common.student') : user?.name || t('common.student');
  const initial = name.charAt(0).toUpperCase();
  const email = user?.email || 'student@example.com';
  
  return (
    <div className="profile-overview">
      <div className="profile-overview__avatar-section">
        <div className="profile-overview__avatar">
          {initial}
        </div>
      </div>
      
      <div className="profile-overview__info">
        <h2 className="profile-overview__name" dir="auto">{name}</h2>
        <p className="profile-overview__email">
          <Mail size={14} />
          {email}
        </p>
        
        <div className="profile-overview__badges">
          <span className="profile-overview__badge">
            <User size={12} />
            {t('common.student')}
          </span>
          <span className="profile-overview__badge profile-overview__badge--active">
            <Shield size={12} />
            {t('profilePage.activeAccount')}
          </span>
          <span className="profile-overview__badge profile-overview__badge--date">
            <Clock size={12} />
            {t('profilePage.joinedToday')}
          </span>
        </div>
      </div>
    </div>
  );
}
