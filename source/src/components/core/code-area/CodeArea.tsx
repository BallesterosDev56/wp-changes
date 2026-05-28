import { createPortal } from "react-dom";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { useState, useEffect, useRef } from "react";
import prettier from "prettier/standalone";
import parserTypeScript from "prettier/plugins/typescript";
import prettierPluginEstree from "prettier/plugins/estree";
import WizyButton from "../../atoms/WizyButton";

export type CodeAreaProps = {
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  typescript?: boolean;
  onChange: (code: string) => void;
  minHeight?: string;
  maxHeight?: string;
  initialHeight?: string;
  isDark?: boolean;
  disableHighlight?: boolean;
};

export function CodeArea(props: CodeAreaProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [code, setCode] = useState(
    props.value || props.defaultValue || "\n\n\n\n"
  );
  const [initialHeight, setInitialHeight] = useState<string | undefined>(
    undefined
  );
  const isInitialRender = useRef(true);

  // Sync internal state with value prop changes
  useEffect(() => {
    if (props.value !== undefined && props.value !== code) {
      setCode(props.value);
    }
  }, [props.value]);

  // Prevent scrolling of the body when in full-screen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden"; // Disable page scroll
    } else {
      document.body.style.overflow = ""; // Re-enable page scroll
    }
    return () => {
      document.body.style.overflow = ""; // Cleanup the scroll lock
    };
  }, [isFullScreen]);

  useEffect(() => {
    const lineCount = (code.match(/\n/g)?.length || 0) + 1; // Count lines
    const calculatedHeight =
      lineCount < 22
        ? `${Math.min(parseInt(props.initialHeight || "40"), lineCount * 22)}px`
        : props.initialHeight || "auto";
    setInitialHeight(calculatedHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extensions = [
    EditorView.lineWrapping,
    autocompletion(), // Enable autocomplete
    ...(props.disableHighlight
      ? []
      : [javascript({ typescript: props.typescript || false })]),
    EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        const editorElement = update.view.dom as HTMLElement;
        editorElement.style.height = "auto"; // Reset height to auto
        editorElement.style.height = `${editorElement.scrollHeight}px`; // Adjust height to content
      }
    }),
  ];

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  const handlePrettier = async () => {
    if (props.typescript) {
      try {
        const formattedCode = await prettier.format(code, {
          parser: "typescript", // Specify the parser explicitly
          plugins: [parserTypeScript, prettierPluginEstree], // Ensure plugins are correctly imported
        });
        setCode(formattedCode);
        props.onChange(formattedCode);
      } catch (error) {
        console.error("Error formatting code with Prettier:", error);
      }
    } else {
      console.log("Prettier is only available for TypeScript.");
    }
  };

  const theme = props.isDark ? vscodeDark : vscodeLight;

  const editorContent = isFullScreen ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        background: props.isDark ? "#2a2734" : "white",
        color: props.isDark ? "white" : "black",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "10px",
          flexShrink: 0,
          zIndex: 10000,
        }}
      >
        {props.typescript && (
          <WizyButton size="sm" className="!w-fit" onClick={handlePrettier}>
            Prettier
          </WizyButton>
        )}
        <WizyButton size="sm" className="!w-fit" onClick={toggleFullScreen}>
          Exit Full Screen
        </WizyButton>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <CodeMirror
          value={code}
          placeholder={props.placeholder}
          extensions={extensions}
          onChange={(value) => {
            setCode(value);
            props.onChange(value);
          }}
          theme={theme}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
          }}
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            overflow: "auto",
          }}
        />
      </div>
    </div>
  ) : (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "10px",
          zIndex: 10000,
        }}
      >
        {props.typescript && (
          <WizyButton size="sm" className="!w-fit" onClick={handlePrettier}>
            Prettier
          </WizyButton>
        )}
        <WizyButton size="sm" className="!w-fit" onClick={toggleFullScreen}>
          Full Screen
        </WizyButton>
      </div>
      <CodeMirror
        value={code}
        placeholder={props.placeholder}
        extensions={extensions}
        onChange={(value) => {
          setCode(value);
          props.onChange(value);
        }}
        theme={theme}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
        }}
        style={{
          border: "1px solid #ddd",
          borderRadius: "4px",
          maxHeight: props.maxHeight || undefined,
          minHeight: props.minHeight || "40px",
          overflow: "auto",
          resize: "vertical",
          height: initialHeight || "auto",
          fontSize: "12px",
          fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        }}
      />
    </div>
  );

  return isFullScreen
    ? createPortal(editorContent, document.body) // Render at the body level when fullscreen
    : editorContent;
}
