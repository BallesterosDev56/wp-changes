import { ReactNode, useLayoutEffect, useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { VirtualElement } from "@popperjs/core";

export interface PopupProps {
  headerTitle?: string;
  disableClose?: boolean;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundColor?: string;
}

export default function Popup(props: PopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [referenceElement, setReferenceElement] =
    useState<VirtualElement | null>(null);

  const { styles, attributes, update } = usePopper(
    referenceElement,
    popupRef.current,
    {
      strategy: "fixed",
      placement: "bottom-start",
      modifiers: [
        { name: "offset", options: { offset: [0, 8] } },
        {
          name: "preventOverflow",
          options: {
            rootBoundary: "viewport",
            padding: 8,
            tether: true,
            altAxis: true,
          },
        },
      ],
    }
  );

  useLayoutEffect(() => {
    if (!props.isOpen) {
      setReferenceElement(null);
      return;
    }

    const virtualElement: VirtualElement = {
      getBoundingClientRect: () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) {
          return new DOMRect(0, 0, 0, 0);
        }

        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(false);

        let rect = range.getBoundingClientRect();

        if (
          !rect ||
          rect.width === 0 ||
          rect.height === 0 ||
          (rect.left === 0 && rect.top === 0)
        ) {
          const marker = document.createElement("span");
          marker.textContent = "\u200b";
          range.insertNode(marker);
          rect = marker.getBoundingClientRect();
          marker.remove();
        }

        return rect;
      },
    };

    setReferenceElement(virtualElement);

    setTimeout(() => {
      update?.();
    }, 0);
  }, [props.isOpen]);

  useEffect(() => {
    if (!props.isOpen || !popupRef.current) return;
    const ro = new ResizeObserver(() => {
      const rect = popupRef.current!.getBoundingClientRect();
      if (
        rect.top < 0 ||
        rect.left < 0 ||
        rect.bottom > window.innerHeight ||
        rect.right > window.innerWidth
      ) {
        update?.();
      }
    });
    ro.observe(popupRef.current);
    return () => ro.disconnect();
  }, [props.isOpen, update]);

  if (!props.isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-transparent pointer-events-auto"
      onMouseDown={props.onClose}
    >
      <div
        ref={popupRef}
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-lg pointer-events-auto"
        style={{
          ...styles.popper,
          ...(props.backgroundColor && {
            backgroundColor: props.backgroundColor,
          }),
        }}
        {...attributes.popper}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {props.headerTitle && (
          <div className="px-5 py-2.5 border-b border-gray-300 dark:border-gray-600 relative flex justify-between items-center rounded-t-lg">
            <span className="text-gray-900 dark:text-gray-100">
              {props.headerTitle}
            </span>
            {!props.disableClose && (
              <button
                className="bg-transparent border-none text-xl cursor-pointer transition-transform hover:scale-110 text-gray-700 dark:text-gray-300 ml-2"
                onClick={props.onClose}
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="w-full h-full">{props.children}</div>
      </div>
    </div>,
    document.body
  );
}
