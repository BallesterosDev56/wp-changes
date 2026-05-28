import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import "../../../../components/styles/KnowledgeInput.css";

type KnowledgeInputProps = {
  content: string;
  onChange: (newHTML: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  placeholder: string;
  className?: string;
  maxLength?: number;
  forceLightMode?: boolean;
};

export type KnowledgeInputRef = HTMLDivElement;

const KnowledgeInput = forwardRef<KnowledgeInputRef, KnowledgeInputProps>(
  (
    {
      content,
      onChange,
      onKeyDown,
      placeholder,
      className,
      maxLength,
      forceLightMode,
    },
    ref,
  ) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [charCount, setCharCount] = useState(0);
    useImperativeHandle(ref, () => divRef.current!);

    const d = (darkClass: string) => (forceLightMode ? "" : darkClass);

    const getTextLength = useCallback((element: HTMLElement): number => {
      const clone = element.cloneNode(true) as HTMLElement;
      clone
        .querySelectorAll("[style]")
        .forEach((el) => el.removeAttribute("style"));
      clone.querySelectorAll("span").forEach((el) => {
        if (!el.classList.contains("KnowledgeInput__Tag")) {
          const parent = el.parentNode;
          while (el.firstChild) parent?.insertBefore(el.firstChild, el);
          parent?.removeChild(el);
        }
      });
      return clone.textContent?.length || 0;
    }, []);

    useEffect(() => {
      const el = divRef.current;
      if (!el) return;
      if (el.innerHTML !== content) {
        el.innerHTML = content;
        const marker = el.querySelector("#cursor-marker");
        if (marker) {
          const range = document.createRange();
          range.setStartAfter(marker);
          range.collapse(true);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          marker.remove();
        }
      }
      // Update character count
      if (maxLength) {
        setCharCount(getTextLength(el));
      }
    }, [content, maxLength, getTextLength]);

    const handleInput = () => {
      if (divRef.current) {
        const clone = divRef.current.cloneNode(true) as HTMLElement;
        clone
          .querySelectorAll("[style]")
          .forEach((el) => el.removeAttribute("style"));
        clone.querySelectorAll("span").forEach((el) => {
          if (!el.classList.contains("KnowledgeInput__Tag")) {
            const parent = el.parentNode;
            while (el.firstChild) parent?.insertBefore(el.firstChild, el);
            parent?.removeChild(el);
          }
        });
        onChange(clone.innerHTML);

        // Update character count
        if (maxLength) {
          setCharCount(getTextLength(divRef.current));
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (maxLength && divRef.current) {
        const currentLength = getTextLength(divRef.current);
        // Allow: backspace, delete, arrow keys, ctrl/cmd + a/c/v/x, tab
        if (
          e.key === "Backspace" ||
          e.key === "Delete" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "Tab" ||
          e.ctrlKey ||
          e.metaKey
        ) {
          onKeyDown(e);
          return;
        }
        // Block if at or over limit
        if (currentLength >= maxLength && e.key.length === 1) {
          e.preventDefault();
          return;
        }
      }
      onKeyDown(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (maxLength && divRef.current) {
        const currentLength = getTextLength(divRef.current);
        const pastedText = e.clipboardData.getData("text/plain");
        const remainingSpace = maxLength - currentLength;

        if (remainingSpace <= 0) {
          e.preventDefault();
          return;
        }

        if (pastedText.length > remainingSpace) {
          e.preventDefault();
          const truncatedText = pastedText.substring(0, remainingSpace);
          document.execCommand("insertText", false, truncatedText);
        }
      }
    };

    const countClass =
      maxLength && charCount >= maxLength
        ? `text-error ${d("dark:text-error-50")}`
        : "";

    return (
      <div>
        <div
          ref={divRef}
          className={`block w-full max-h-[200px] min-h-[44px] whitespace-pre-wrap leading-[20px] overflow-y-auto p-[10px] rounded-lg border border-neutral-40 bg-white text-neutral-900 cursor-text text-left transition-all
          hover:shadow-md focus:outline-none focus:border-primary-40 empty:before:content-[attr(data-placeholder)] empty:before:text-sm empty:before:text-neutral-400 empty:before:pointer-events-none empty:before:select-none
          ${d("dark:bg-dark-30")} ${d("dark:text-neutral-white")} ${d("dark:border-neutral-60")} ${d("dark:focus:border-neutral-white")} ${d("dark:empty:before:text-neutral-500")}
          ${className}`}
          contentEditable
          data-placeholder={placeholder}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
        {maxLength && (
          <div className={`text-right text-xs mt-2 ${countClass}`}>
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);

export default KnowledgeInput;
