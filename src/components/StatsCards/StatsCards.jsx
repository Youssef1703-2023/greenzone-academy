import { useState, useEffect, useRef } from 'react';
import { BookOpen, Layers, FileText, HelpCircle } from 'lucide-react';
import './StatsCards.css';

/*
 * Stats for the landing page — currently showing data from the demo course
 * "Cybersecurity Fundamentals". When more courses are added, these stats
 * can be aggregated from the full course catalog via the backend API.
 */
const stats = [
  {
    icon: BookOpen,
    value: 1,
    label: 'Course',
    description: 'Cybersecurity Fundamentals',
  },
  {
    icon: Layers,
    value: 8,
    label: 'Phases',
    description: 'Structured learning units',
  },
  {
    icon: FileText,
    value: 56,
    label: 'Lessons',
    description: 'Arabic explanations with English terms',
  },
  {
    icon: HelpCircle,
    value: 8,
    label: 'Quizzes',
    description: 'Pass quizzes to complete phases',
  },
];

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={countRef}>{count}</span>;
}

export default function StatsCards() {
  return (
    <section className="stats" id="stats">
      <div className="stats__container container">
        <div className="stats__grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                className={`stats__card animate-on-scroll delay-${index + 1}`}
                key={stat.label}
              >
                <div className="stats__card-icon">
                  <Icon size={24} />
                </div>
                <div className="stats__card-value">
                  <CountUp end={stat.value} />
                </div>
                <div className="stats__card-label">{stat.label}</div>
                <p className="stats__card-desc">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
