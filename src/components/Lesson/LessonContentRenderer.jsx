/*
 * LessonContentRenderer
 * ──────────────────────
 * Takes a rich lesson content object and renders the appropriate
 * block components in order: overview → objectives → key terms → sections → credit.
 */

import LessonOverview from './blocks/LessonOverview';
import LearningObjectives from './blocks/LearningObjectives';
import KeyTermsGrid from './blocks/KeyTermsGrid';
import DeepExplanation from './blocks/DeepExplanation';
import VisualDiagram from './blocks/VisualDiagram';
import ToolConceptCard from './blocks/ToolConceptCard';
import RealWorldExample from './blocks/RealWorldExample';
import CommonMistakes from './blocks/CommonMistakes';
import MiniPractice from './blocks/MiniPractice';
import LessonQuizPreview from './blocks/LessonQuizPreview';
import LessonSummary from './blocks/LessonSummary';
import LessonStudyTools from './LessonStudyTools';
import './LessonContentBlocks.css';

export default function LessonContentRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="lesson-content-renderer">
      <LessonStudyTools />

      {/* 1. Lesson Overview */}
      {content.overview && <LessonOverview text={content.overview} />}

      {/* 2. Learning Objectives */}
      {content.objectives && content.objectives.length > 0 && (
        <LearningObjectives objectives={content.objectives} />
      )}

      {/* 3. Key Terms */}
      {content.keyTerms && content.keyTerms.length > 0 && (
        <KeyTermsGrid terms={content.keyTerms} />
      )}

      {/* 4–10. Dynamic sections */}
      {content.sections && content.sections.map((section, index) => {
        const key = `section-${index}`;

        switch (section.type) {
          case 'explanation':
            return (
              <DeepExplanation
                key={key}
                title={section.title}
                content={section.content}
              />
            );

          case 'diagram':
            return (
              <VisualDiagram
                key={key}
                title={section.title}
                nodes={section.nodes}
                centerLabel={section.centerLabel}
              />
            );

          case 'toolCard':
            return (
              <ToolConceptCard
                key={key}
                name={section.name}
                category={section.category}
                description={section.description}
                whyItMatters={section.whyItMatters}
                beginnerNote={section.beginnerNote}
              />
            );

          case 'example':
            return (
              <RealWorldExample
                key={key}
                title={section.title}
                scenario={section.scenario}
                whatHappened={section.whatHappened}
                securityLesson={section.securityLesson}
              />
            );

          case 'mistakes':
            return <CommonMistakes key={key} items={section.items} />;

          case 'practice':
            return (
              <MiniPractice
                key={key}
                question={section.question}
                hint={section.hint}
              />
            );

          case 'quiz':
            return (
              <LessonQuizPreview
                key={key}
                title={section.title}
                questions={section.questions}
              />
            );

          case 'summary':
            return <LessonSummary key={key} takeaways={section.takeaways} />;

          default:
            return null;
        }
      })}

      {/* Credit / Author */}
      {content.credit && (
        <div className="lesson-credit">
          <span className="lesson-credit__text">{content.credit}</span>
        </div>
      )}
    </div>
  );
}
