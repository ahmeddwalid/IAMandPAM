import React from 'react';
import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

type DrawioProps = {
  content: string;
};

export default function Drawio({content}: DrawioProps): ReactNode {
  return (
    <BrowserOnly>
      {() => {
        const data = JSON.stringify({
          editable: '_blank',
          highlight: '#0000ff',
          nav: true,
          resize: true,
          toolbar: 'zoom lightbox',
          xml: content,
        });
        return (
          <div className="docusaurus-plugin-drawio">
            <div
              className="geDiagramContainer"
              data-mxgraph={data}
              aria-label="Architecture diagram"
              role="img"
            />
          </div>
        );
      }}
    </BrowserOnly>
  );
}
