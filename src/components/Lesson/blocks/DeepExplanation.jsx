import { FileText, Info } from 'lucide-react';
import GlossaryText from '../GlossaryText';

export default function DeepExplanation({ title, content }) {
  return (
    <div className="lcb explanation">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <FileText />
        </div>
        <h2 className="lcb__section-title">{title}</h2>
      </div>
      <div className="explanation__body">
        {content.map((block, i) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <div key={i}>
                  <p className="explanation__paragraph">
                    <GlossaryText text={block.text} />
                  </p>
                </div>
              );
            case 'heading':
              return <h3 key={i} className="explanation__heading"><GlossaryText text={block.text} /></h3>;
            case 'bullets':
              return (
                <ul key={i} className="explanation__bullets">
                  {block.items.map((item, j) => (
                    <li key={j}>
                      <GlossaryText text={item} />
                    </li>
                  ))}
                </ul>
              );
            case 'note':
              return (
                <div key={i} className="explanation__note">
                  <Info size={18} />
                  <div className="explanation__note-text">
                    <GlossaryText text={block.text} />
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
