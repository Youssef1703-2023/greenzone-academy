import { GraduationCap, BarChart3, ClipboardCheck, Settings } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: GraduationCap,
    title: 'Structured Learning',
    description:
      'Learn through organized courses, phases, and lessons instead of random content.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Track completed lessons, quiz scores, and course progress.',
  },
  {
    icon: ClipboardCheck,
    title: 'Phase Quizzes',
    description:
      'Each phase ends with a quiz that must be passed to unlock completion.',
  },
  {
    icon: Settings,
    title: 'Admin Managed Content',
    description:
      'Admins can manage courses, phases, lessons, quizzes, students, and scores.',
  },
];

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features__container container">
        <h2 className="section-title">
          Why <span className="accent">Green Zone</span> Academy?
        </h2>
        <p className="section-subtitle">
          Everything you need to build a strong cybersecurity foundation, structured for success.
        </p>

        <div className="features__grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                className={`features__card animate-on-scroll delay-${index + 1}`}
                key={feature.title}
              >
                <div className="features__card-icon">
                  <Icon size={26} />
                </div>
                <h3 className="features__card-title">{feature.title}</h3>
                <p className="features__card-desc">{feature.description}</p>
                <div className="features__card-line"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
