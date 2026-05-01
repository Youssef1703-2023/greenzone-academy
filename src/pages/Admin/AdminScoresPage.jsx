import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { exportCsv, getQuizzes, getScores } from '../../services/adminDataService';
import { getQuizStatsFromRows } from '../../services/adminStatsService';
import { AdminBadge, AdminErrorState, AdminPageHeader, AdminToolbar, formatAdminValue, useAdminData } from './AdminShared';
import './AdminPages.css';

export default function AdminScoresPage() {
  const { language, t } = useLanguage();
  const { data: quizzes } = useAdminData(getQuizzes, []);
  const { data: scores, loading, error } = useAdminData(getScores, []);
  const [query, setQuery] = useState('');
  const [quizFilter, setQuizFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');

  const filteredScores = useMemo(() => {
    const rows = scores.filter((score) => {
      const text = `${score.studentName} ${score.quizName}`.toLowerCase();
      return text.includes(query.toLowerCase())
        && (quizFilter === 'All' || score.quizName === quizFilter)
        && (statusFilter === 'All' || score.status === statusFilter);
    });

    return [...rows].sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'attempts') return b.attempts - a.attempts;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [query, quizFilter, scores, sortBy, statusFilter]);

  const summary = getQuizStatsFromRows(scores);

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader
          title={t('admin.studentScores')}
          subtitle={t('admin.studentScoresSubtitle')}
          actions={<button className="btn btn-secondary" onClick={() => exportCsv('green-zone-scores.csv', filteredScores)}><Download size={16} />{t('admin.exportCsv')}</button>}
        />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <section className="admin-stats-grid admin-stats-grid--compact">
          <div className="admin-mini-stat"><span>{t('admin.averageScore')}</span><strong>{formatAdminValue(summary.averageScore, language, '%')}</strong></div>
          <div className="admin-mini-stat"><span>{t('admin.passRate')}</span><strong>{formatAdminValue(summary.passRate, language, '%')}</strong></div>
          <div className="admin-mini-stat"><span>{t('admin.highestScore')}</span><strong>{formatAdminValue(summary.highestScore, language, '%')}</strong></div>
          <div className="admin-mini-stat"><span>{t('admin.lowestScore')}</span><strong>{formatAdminValue(summary.lowestScore, language, '%')}</strong></div>
        </section>

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchScores')} />
          <select className="form-control" value={quizFilter} onChange={(event) => setQuizFilter(event.target.value)}>
            <option value="All">{t('admin.allQuizzes')}</option>
            {[...new Set(quizzes.map((quiz) => quiz.title))].map((title) => <option key={title} value={title}>{title}</option>)}
          </select>
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Passed">{t('admin.passed')}</option>
            <option value="Failed">{t('admin.failed')}</option>
          </select>
          <select className="form-control" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="date">{t('admin.sortByDate')}</option>
            <option value="score">{t('admin.sortByScore')}</option>
            <option value="attempts">{t('admin.sortByAttempts')}</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.student')}</th>
                <th>{t('admin.quiz')}</th>
                <th>{t('admin.score')}</th>
                <th>{t('admin.attempts')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.date')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => (
                <tr key={score.id}>
                  <td className="admin-table__highlight">{score.studentName}</td>
                  <td>{score.quizName}</td>
                  <td>{score.score}%</td>
                  <td>{score.attempts}</td>
                  <td><AdminBadge status={score.status} /></td>
                  <td>{score.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AdminLayout>
  );
}
