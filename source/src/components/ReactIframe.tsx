// Import React Dependencies
import React, { FC, useState } from "react";

// Import styles
import { createPortal } from "react-dom";

// Declare types and interfaces
interface ReactIframeProps {
  children: React.ReactNode;
  iframetitle: string;
  style: React.CSSProperties;
  className: string;
  id: string;
}

// Page main functional component
const ReactIframe: FC<ReactIframeProps> = (props) => {
  // References
  const [ref, setRef] = useState<HTMLIFrameElement | null>(null);
  // Mount node inicialization
  const mountNode = ref?.contentWindow?.document?.body;

  // JSX Return statement
  return (
    <React.Fragment>
      <iframe
        {...props}
        title={props.iframetitle}
        ref={setRef}
        style={props.style}
        className={props.className}
        id={props.id}
      >
        {mountNode && createPortal(props.children, mountNode)}
      </iframe>
    </React.Fragment>
  );
};

// Default exported function
export default ReactIframe;
