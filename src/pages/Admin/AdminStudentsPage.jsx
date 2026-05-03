import { useMemo, useState } from 'react';
import { BookOpen, ClipboardCheck, Eye, RotateCcw, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { getScores, getStudentDetail, getStudents, resetStudentProgress, toggleStudentStatus } from '../../services/adminDataService';
import { AdminBadge, AdminErrorState, AdminModal, AdminPageHeader, AdminToolbar, ConfirmModal, formatAdminValue, useAdminData } from './AdminShared';
import './AdminPages.css';

function progressStatus(student) {
  if (Number(student.progress) >= 100 || Number(student.completedPhases) >= 1) return 'Completed Phase 1';
  if (Number(student.progress) > 0) return 'In Progress';
  return 'Not Started';
}

export default function AdminStudentsPage() {
  const { language, t } = useLanguage();
  const { data: scores } = useAdminData(getScores, []);
  const { data: students, loading, error, refresh } = useAdminData(getStudents, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [progressFilter, setProgressFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [resetTarget, setResetTarget] = useState(null);

  const filtered = useMemo(() => students.filter((student) => {
    const text = `${student.name} ${student.email}`.toLowerCase();
    return text.includes(query.toLowerCase())
      && (statusFilter === 'All' || student.status === statusFilter)
      && (progressFilter === 'All' || progressStatus(student) === progressFilter);
  }), [progressFilter, query, statusFilter, students]);

  function studentScores(student) {
    return scores.filter((score) => score.studentName === student.name);
  }

  function averageScore(student) {
    const rows = studentScores(student);
    if (!rows.length) return null;
    return Math.round(rows.reduce((sum, score) => sum + score.score, 0) / rows.length);
  }

  async function openStudentDetail(student) {
    setSelectedStudent(student);
    setSelectedDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      setSelectedDetail(await getStudentDetail(student.id));
    } catch (requestError) {
      setDetailError(requestError?.message || 'Student detail could not be loaded.');
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <AdminLayout>
      <main className="admin-page">
        <AdminPageHeader title={t('admin.manageStudents')} subtitle={t('admin.manageStudentsSubtitle')} />
        {loading && <div className="admin-loading">{t('admin.loading')}</div>}
        {error && <AdminErrorState message={error} />}

        <AdminToolbar>
          <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('admin.searchStudents')} />
          <select className="form-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">{t('admin.allStatuses')}</option>
            <option value="Active">{t('admin.active')}</option>
            <option value="Disabled">{t('admin.disabled')}</option>
          </select>
          <select className="form-control" value={progressFilter} onChange={(event) => setProgressFilter(event.target.value)}>
            <option value="All">{t('admin.allProgress')}</option>
            <option value="Not Started">{t('admin.notStarted')}</option>
            <option value="In Progress">{t('admin.inProgress')}</option>
            <option value="Completed Phase 1">{t('admin.completedPhase1')}</option>
          </select>
        </AdminToolbar>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.student')}</th>
                <th>{t('admin.email')}</th>
                <th>{t('admin.progress')}</th>
                <th>{t('admin.completedLessons')}</th>
                <th>{t('admin.completedPhases')}</th>
                <th>{t('admin.lastActive')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id}>
                  <td className="admin-table__highlight">{student.name}</td>
                  <td>{student.email}</td>
                  <td>{formatAdminValue(student.progress, language, '%')}</td>
                  <td>{student.completedLessons}</td>
                  <td>{student.completedPhases}</td>
                  <td>{formatAdminValue(student.lastActive, language)}</td>
                  <td><AdminBadge status={student.status} /></td>
                  <td>
                    <div className="admin-table__actions">
                      <button className="admin-table__btn" onClick={() => openStudentDetail(student)}><Eye size={14} />{t('admin.view')}</button>
                      <button className="admin-table__btn" onClick={async () => { await toggleStudentStatus(student); await refresh(); }}>
                        {student.status === 'Disabled' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {student.status === 'Disabled' ? t('admin.enable') : t('admin.disable')}
                      </button>
                      <button className="admin-table__btn admin-table__btn--danger" onClick={() => setResetTarget(student)}><RotateCcw size={14} />{t('admin.reset')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <AdminModal wide title={t('admin.studentDetails')} onClose={() => setSelectedStudent(null)} footer={<button type="button" className="btn btn-primary" onClick={() => setSelectedStudent(null)}>{t('admin.close')}</button>}>
            {detailLoading && <div className="admin-loading">Loading student profile...</div>}
            {detailError && <AdminErrorState message={detailError} />}
            {selectedDetail && (
              <div className="student-detail">
                <section className="student-detail__hero">
                  <div className="student-detail__avatar">{selectedDetail.name?.charAt(0) || 'S'}</div>
                  <div>
                    <span>Student Profile</span>
                    <h3>{selectedDetail.name}</h3>
                    <p>{selectedDetail.email}</p>
                  </div>
                  <AdminBadge status={selectedDetail.status} />
                </section>

                <section className="student-detail__stats">
                  <div><TrendingUp size={18} /><span>Overall Progress</span><strong>{formatAdminValue(selectedDetail.summary.overallProgress, language, '%')}</strong></div>
                  <div><BookOpen size={18} /><span>Completed Lessons</span><strong>{selectedDetail.summary.completedLessons} / {selectedDetail.summary.totalLessons}</strong></div>
                  <div><ClipboardCheck size={18} /><span>Quiz Attempts</span><strong>{selectedDetail.summary.quizAttempts}</strong></div>
                  <div><ClipboardCheck size={18} /><span>Average Score</span><strong>{formatAdminValue(selectedDetail.summary.averageScore ?? averageScore(selectedStudent), language, '%')}</strong></div>
                </section>

                <section className="student-detail__section">
                  <h4>Phase Progress</h4>
                  <div className="student-detail__phase-list">
                    {selectedDetail.phaseProgress.map((phase) => (
                      <div className="student-detail__phase" key={phase.id}>
                        <div>
                          <strong>Phase {phase.phaseNumber}: {phase.title}</strong>
                          <span>{phase.completedLessons} / {phase.totalLessons} lessons - {phase.status}</span>
                        </div>
                        <div className="student-detail__bar"><span style={{ width: `${phase.progress}%` }} /></div>
                        <b>{phase.progress}%</b>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="student-detail__columns">
                  <div className="student-detail__section">
                    <h4>Recent Lessons</h4>
                    <div className="student-detail__list">
                      {selectedDetail.recentLessons.length ? selectedDetail.recentLessons.map((lesson) => (
                        <div key={lesson.id}>
                          <strong>{lesson.title}</strong>
                          <span>{lesson.phase} - {lesson.status} - {formatAdminValue(lesson.updatedAt, language)}</span>
                        </div>
                      )) : <p>No lesson activity yet.</p>}
                    </div>
                  </div>
                  <div className="student-detail__section">
                    <h4>Quiz Attempts</h4>
                    <div className="student-detail__list">
                      {selectedDetail.quizAttempts.length ? selectedDetail.quizAttempts.map((attempt) => (
                        <div key={attempt.id}>
                          <strong>{attempt.quizName}</strong>
                          <span>{attempt.phase} - Attempt {attempt.attemptNumber} - {attempt.score}% - {attempt.status}</span>
                        </div>
                      )) : <p>No quiz attempts yet.</p>}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </AdminModal>
        )}

        {resetTarget && (
          <ConfirmModal
            danger
            title={t('admin.resetProgress')}
            message={t('admin.resetProgressWarning')}
            confirmLabel={t('admin.reset')}
            onCancel={() => setResetTarget(null)}
            onConfirm={async () => {
              await resetStudentProgress(resetTarget);
              setResetTarget(null);
              await refresh();
            }}
          />
        )}
      </main>
    </AdminLayout>
  );
}
