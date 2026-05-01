import { Network, ArrowRight } from 'lucide-react';
import GlossaryText from '../GlossaryText';

export default function VisualDiagram({ title, nodes, centerLabel }) {
  return (
    <div className="lcb diagram">
      <div className="lcb__icon-header">
        <div className="lcb__icon-wrap">
          <Network />
        </div>
        <h2 className="lcb__section-title"><GlossaryText text={title} /></h2>
      </div>
      <div className="diagram__flow">
        {nodes.map((node, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <div className="diagram__node"><GlossaryText text={node} /></div>
            {i < nodes.length - 1 && (
              <div className="diagram__arrow">
                <ArrowRight size={22} />
              </div>
            )}
          </span>
        ))}
      </div>
      {centerLabel && (
        <div className="diagram__center-label"><GlossaryText text={centerLabel} /></div>
      )}
    </div>
  );
}
