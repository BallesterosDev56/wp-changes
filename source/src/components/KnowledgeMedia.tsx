import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Popup from "./Popup";
import { t } from "i18next";
import { IProduct } from "../types/ProductType";
import wizy_mg_outline from "../images/wizy_mg_outline.svg";
import pencilIcon from "../images/pencil.svg";
import wizy_loader from "../images/wizy_loader.gif";
import KnowledgeInput from "../pages/knowledge/components/molecules/KnowledgeInput.tsx";
import { v4 as uuidv4 } from "uuid";
import { ICollection } from "../types/CollectionType";
import { CodeArea } from "./core/code-area/CodeArea";
import { useDarkMode } from "../hooks/useDarkMode";
import { useAuth } from "../context/subContexts/AuthContext";

export enum KnowledgeMediaType {
  // Cards
  product = "product",
  collection = "collection",

  // Script
  script = "script",

  // Images
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageGif = "image/gif",
  ImageHeic = "image/heic",

  // Videos
  VideoMp4 = "video/mp4",
  Video3gp = "video/3gp",

  // Audio
  AudioAac = "audio/aac",
  AudioMpeg = "audio/mpeg",
  AudioMp4 = "audio/mp4",
  AudioWav = "audio/wav",

  // File
  ExcelLegacy = "application/vnd.ms-excel",
  ExcelXlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  WordLegacy = "application/msword",
  WordDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  PowerPointLegacy = "application/vnd.ms-powerpoint",
  PowerPointPptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  Pdf = "application/pdf",
}

const primaryButtonClass = `
  w-full px-4 py-2 rounded-md text-sm font-medium
  appearance-none border-0 outline-none select-none
  cursor-pointer
  focus:outline-none focus-visible:outline-none focus-visible:ring-0
  bg-blue-600 hover:bg-blue-700 text-white
  dark:bg-blue-500 dark:hover:bg-blue-600
  transition-colors
  disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600
  `;

const dangerButtonClass = `
    w-full min-w-[60px] px-4 py-2 rounded-[5px] text-[15px] font-semibold
    text-white bg-[#cf3636] hover:bg-[#881a1a]
    appearance-none border-0 outline-none select-none
    cursor-pointer
    focus:outline-none focus-visible:outline-none focus-visible:ring-0
    transition-colors duration-300
    disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#cf3636]`;

type IKnowledgeMediaProps = {
  knowledgeContent: string;
  setKnowledgeContent: (newContent: string) => void;
  assetsToEnable: string[];
  productList?: ITagOption[];
  setProductList?: React.Dispatch<React.SetStateAction<ITagOption[]>>;
  assetList?: ITagOption[];
  setAssetList?: React.Dispatch<React.SetStateAction<ITagOption[]>>;
  setMediaToCreate?: React.Dispatch<
    React.SetStateAction<{ id: string; media: File }[]>
  >;
  mediaToCreate: { id: string; media: File }[];
  shopId: string;
  globalSelectedBackend: string;
  placeholder: string;
  knowledgeInputClassName?: string;
  maxLength?: number;
  forceInputLightMode?: boolean;
};

export type KnowledgeMediaRef = {
  onKeyDownMapper: (e: React.KeyboardEvent<HTMLElement>) => void;
};

export type ProductDisplayType = "link" | "price" | "stock" | "summary";

export type ITagOption = {
  id: string;
  label: string;
  type: KnowledgeMediaType;
  contentDescription?: string;
  display?: ProductDisplayType; // For product/collection tags only
};

export const KnowledgeMedia = forwardRef<
  KnowledgeMediaRef,
  IKnowledgeMediaProps
>((props, ref) => {
  const { globalShop } = useAuth();
  const ASSETS = [
    "product",
    "collection",
    "image",
    "video",
    "audio",
    "file",
    "script",
  ] as const;
  type AssetType = (typeof ASSETS)[number];
  const { isDark } = useDarkMode();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<AssetType | null>(null);

  const [productQuery, setProductQuery] = useState("");
  const [shopProducts, setShopProducts] = useState<ITagOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ITagOption | null>(
    null,
  );
  const [selectedProductDisplay, setSelectedProductDisplay] =
    useState<ProductDisplayType>("link");

  const [collectionQuery, setCollectionQuery] = useState("");
  const [shopCollections, setShopCollections] = useState<ITagOption[]>([]);

  const [imageQuery, setImageQuery] = useState("");
  const [shopImages, setShopImages] = useState<ITagOption[]>([]);
  const filteredImages = shopImages.filter((p) =>
    p.label.toLowerCase().includes(imageQuery.toLowerCase()),
  );

  const [videoQuery, setVideoQuery] = useState("");
  const [shopVideos, setShopVideos] = useState<ITagOption[]>([]);
  const filteredVideos = shopVideos.filter((p) =>
    p.label.toLowerCase().includes(videoQuery.toLowerCase()),
  );

  const [audioQuery, setAudioQuery] = useState("");
  const [shopAudios, setShopAudios] = useState<ITagOption[]>([]);
  const filteredAudios = shopAudios.filter((p) =>
    p.label.toLowerCase().includes(audioQuery.toLowerCase()),
  );

  const [fileQuery, setFileQuery] = useState("");
  const [shopFiles, setShopFiles] = useState<ITagOption[]>([]);
  const filteredFiles = shopFiles.filter((p) =>
    p.label.toLowerCase().includes(fileQuery.toLowerCase()),
  );

  const [script, setScript] = useState("");
  const [isScriptValid, setIsScriptValid] = useState<Boolean | null>(null);
  // const [evaluatedScript, setEvaluatedScript] = useState("");
  const [scriptErrorMessage, setScriptErrorMessage] = useState("");
  const [scriptLabel, setScriptLabel] = useState<string>("");

  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingExistingFile, setIsLoadingExistingFile] =
    useState<boolean>(false);
  const [selectedFileLabel, setSelectedFileLabel] = useState<string>("");
  const [selectedFileDescription, setSelectedFileDescription] =
    useState<string>("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleSlashKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "/") return;

    setTimeout(() => {
      const sel = window.getSelection();
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;

      if (range && contentRef.current) {
        const marker = document.createElement("span");
        marker.id = "cursor-marker";

        range.insertNode(marker);
        range.setStartAfter(marker);
        range.collapse(true);

        props.setKnowledgeContent(contentRef.current.innerHTML);
      }

      setIsOpen(true);
      setProductQuery("");
    }, 0);
  };

  const handleTagButtonClick = useCallback(
    async (tagId: string, mediaType: string) => {
      // Prevent multiple simultaneous edits
      if (editingTagId !== null || isOpen) {
        return;
      }

      try {
        // Set editing tag ID to track that we're editing
        setEditingTagId(tagId);

        // Handle product tags (collections are not editable)
        if (mediaType === "product") {
          // Find existing tag data from productList
          const existingTag = props.productList?.find((p) => p.id === tagId);

          if (!existingTag) {
            return;
          }

          // Read display configuration from DOM element (not from productList)
          const tagElement = document.querySelector(`[data-id="${tagId}"]`);
          const displayFromDOM = tagElement?.getAttribute(
            "data-display",
          ) as ProductDisplayType | null;

          // Pre-populate display configuration
          setSelectedProduct(existingTag);
          setSelectedProductDisplay(displayFromDOM || "link");
          setSelectedMedia(mediaType);
          setIsOpen(true);
          return;
        }

        // Find existing tag data from assetList for other media types
        const existingTag = props.assetList?.find(
          (asset) => asset.id === tagId,
        );
        if (!existingTag) {
          console.warn(`Tag with id ${tagId} not found in assetList`, {
            tagId,
            mediaType,
            availableAssets: props.assetList?.map((a) => ({
              id: a.id,
              label: a.label,
              type: a.type,
            })),
          });
          setEditingTagId(null);
          return;
        }

        // Pre-populate form fields based on media type
        if (mediaType === "script") {
          setScriptLabel(existingTag.label);
          setScript(existingTag.contentDescription || "");
        } else {
          setSelectedFileLabel(existingTag.label);
          setSelectedFileDescription(existingTag.contentDescription || "");

          // Check if file exists in local memory (for newly created assets)
          const localMedia = props.mediaToCreate.find(
            (media) => media.id === existingTag.id,
          );

          if (localMedia?.media) {
            setSelectedFile(localMedia.media);
          } else {
            // Fetch from server
            setIsLoadingExistingFile(true);
            try {
              const file = await fetchExistingFile(
                existingTag.id,
                existingTag.label,
                existingTag.type as string,
              );
              if (file) {
                setSelectedFile(file);
              }
            } finally {
              setIsLoadingExistingFile(false);
            }
          }
        }

        // Set selected media and open in edit mode
        setSelectedMedia(
          mediaType === "application" ? "file" : (mediaType as any),
        );
        setShowFileUpload(true);
        setIsOpen(true);
      } catch (error) {
        console.error("Error in handleTagButtonClick:", error);
        setEditingTagId(null);
        setIsLoadingExistingFile(false);
      }
    },
    [
      editingTagId,
      isOpen,
      props.assetList,
      props.productList,
      props.mediaToCreate,
      props.globalSelectedBackend,
      props.shopId,
    ],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isOpen) {
      handleSlashKey(e);
      return;
    }

    const el = contentRef.current;
    if (!el) {
      handleSlashKey(e);
      return;
    }

    // Close menu on regular character input (not slash)
    const isRegularChar = e.key.length === 1 && e.key !== "/";
    if (isRegularChar) {
      el.querySelector("#cursor-marker")?.remove();
      props.setKnowledgeContent(el.innerHTML);
      setIsOpen(false);
      setSelectedMedia(null);
      return;
    }

    // Close menu on backspace if no slash remains
    if (e.key === "Backspace") {
      setTimeout(() => {
        if (!contentRef.current?.innerText.includes("/")) {
          setIsOpen(false);
          setSelectedMedia(null);
        }
      }, 0);
    }

    handleSlashKey(e);
  };

  useImperativeHandle(ref, () => ({
    onKeyDownMapper: handleKeyDown,
  }));

  // Handle edit button clicks via event delegation and migrate old tags
  useEffect(() => {
    const currentRef = contentRef.current;
    if (!currentRef) return;

    // Migrate old tags with inline onclick to data attributes
    const migrateOldTags = () => {
      currentRef
        .querySelectorAll<HTMLElement>(
          ".KnowledgeInput__Tag__Button:not([data-tag-id])",
        )
        .forEach((button) => {
          const parentTag = button.closest<HTMLElement>(".KnowledgeInput__Tag");
          const tagId = parentTag?.dataset.id;
          const mediaType = parentTag?.dataset.type;

          if (tagId && mediaType) {
            button.dataset.tagId = tagId;
            button.dataset.mediaType = mediaType;
            button.onclick = null; // Remove old inline onclick
          }
        });
    };

    // Event delegation handler
    const handleClick = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest<HTMLElement>(
        ".KnowledgeInput__Tag__Button",
      );

      const tagId = button?.dataset.tagId;
      const mediaType = button?.dataset.mediaType;

      if (tagId && mediaType) {
        handleTagButtonClick(tagId, mediaType);
      }
    };

    migrateOldTags();
    currentRef.addEventListener("click", handleClick);

    return () => {
      currentRef.removeEventListener("click", handleClick);
    };
  }, [handleTagButtonClick, props.knowledgeContent]);

  const insertTag = (tag: ITagOption) => {
    const el = contentRef.current;
    if (!el) return;

    const marker = el.querySelector("#cursor-marker");
    if (!marker?.parentNode) return;

    // Clean up trailing slash from previous text node
    const prev = marker.previousSibling;
    if (prev?.nodeType === Node.TEXT_NODE) {
      prev.textContent = prev.textContent?.replace(/\/$/, "") || "";
    }

    // Create tag element
    const span = document.createElement("span");
    span.className = "KnowledgeInput__Tag";
    span.contentEditable = "false";
    span.dataset.id = tag.id;
    span.dataset.type = tag.type.split("/")[0];
    span.textContent = tag.label;

    if (tag.display) {
      span.dataset.display = tag.display;
    }

    // Add edit button for editable media types
    const mediaType = span.dataset.type!;
    const editableTypes = [
      "product",
      "image",
      "video",
      "audio",
      "script",
      "application",
    ];

    if (editableTypes.includes(mediaType)) {
      const button = document.createElement("button");
      button.className = "KnowledgeInput__Tag__Button";
      button.innerHTML = `<img src="${pencilIcon}" alt="edit" />`;
      button.dataset.tagId = tag.id;
      button.dataset.mediaType = mediaType;
      span.appendChild(button);
    }

    // Insert tag and space, then remove marker
    const spaceNode = document.createTextNode(" ");
    marker.parentNode.insertBefore(span, marker);
    marker.parentNode.insertBefore(spaceNode, marker);
    marker.remove();

    // Update state and reset form
    props.setKnowledgeContent(el.innerHTML);
    setIsOpen(false);
    setSelectedMedia(null);
    setEditingTagId(null);
    setProductQuery("");
    setSelectedProduct(null);
    setSelectedProductDisplay("link");

    // Set cursor position after inserted space
    const range = document.createRange();
    range.setStartAfter(spaceNode);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
  };

  // Clean tags
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const ASSET_TYPES = new Set([
      "image",
      "video",
      "audio",
      "application",
      "script",
    ]);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(({ removedNodes }) => {
        removedNodes.forEach((node) => {
          if (
            !(node instanceof HTMLElement) ||
            !node.classList.contains("KnowledgeInput__Tag")
          ) {
            return;
          }

          const { id, type } = node.dataset;
          if (!id || !type) return;

          if (
            (type === KnowledgeMediaType.product ||
              type === KnowledgeMediaType.collection) &&
            props.setProductList
          ) {
            props.setProductList((prev) => prev.filter((p) => p.id !== id));
            return;
          }

          const baseType = type.split("/")[0];
          if (
            ASSET_TYPES.has(baseType) &&
            props.setAssetList &&
            props.setMediaToCreate
          ) {
            props.setAssetList((prev) => prev.filter((a) => a.id !== id));
            props.setMediaToCreate((prev) => prev.filter((a) => a.id !== id));
          }
        });
      });
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [
    props.knowledgeContent,
    props.setProductList,
    props.setAssetList,
    props.setMediaToCreate,
  ]);

  // --------------------------------------------------------------------------------
  // FETCHING
  const fetchProducts = useCallback(
    async (q: string) => {
      try {
        const res = await fetch(
          `${props.globalSelectedBackend}/products/shop/${props.shopId}` +
            `?take=50&page=1&text=${encodeURIComponent(q)}`,
          { credentials: "include" },
        );

        if (!res.ok) throw new Error("Failed to load products");

        const { data } = await res.json();

        setShopProducts(
          data.map(({ shopifyProductId, displayTitle }: IProduct) => ({
            id: shopifyProductId,
            label: displayTitle,
            type: KnowledgeMediaType.product,
          })),
        );
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    },
    [props.globalSelectedBackend, props.shopId],
  );

  const fetchCollections = useCallback(
    async (q: string) => {
      try {
        const res = await fetch(
          `${props.globalSelectedBackend}/collections/shop/${props.shopId}` +
            `?take=50&page=1&text=${encodeURIComponent(q)}`,
          { credentials: "include" },
        );

        if (!res.ok) throw new Error("Failed to load collections");

        const { data } = await res.json();

        setShopCollections(
          data.map(({ shopifyCollectionId, displayTitle }: ICollection) => ({
            id: shopifyCollectionId,
            label: displayTitle,
            type: KnowledgeMediaType.collection,
          })),
        );
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    },
    [props.globalSelectedBackend, props.shopId],
  );

  const fetchImages = async () => {
    try {
      const res = await fetch(
        `${props.globalSelectedBackend}/assets/shop/${props.shopId}/${selectedMedia}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Failed to fetch images");
      }

      setShopImages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch(
        `${props.globalSelectedBackend}/assets/shop/${props.shopId}/${selectedMedia}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Failed to fetch videos");
      }

      setShopVideos(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAudios = async () => {
    try {
      const res = await fetch(
        `${props.globalSelectedBackend}/assets/shop/${props.shopId}/${selectedMedia}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Failed to fetch audios");
      }

      setShopAudios(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(
        `${props.globalSelectedBackend}/assets/shop/${props.shopId}/application`,
        { credentials: "include" },
      );

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message ?? "Failed to fetch files");
      }

      setShopFiles(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchTextChange = (text: string) => {
    if (selectedMedia === "product") {
      setProductQuery(text);
    } else if (selectedMedia === "collection") {
      setCollectionQuery(text);
    }
  };

  useEffect(() => {
    if (selectedMedia === "product") {
      const handler = setTimeout(() => {
        fetchProducts(productQuery);
      }, 500);

      return () => clearTimeout(handler);
    } else if (selectedMedia === "collection") {
      const handler = setTimeout(() => {
        fetchCollections(collectionQuery);
      }, 500);

      return () => clearTimeout(handler);
    } else if (selectedMedia === "image") {
      fetchImages();
    } else if (selectedMedia === "video") {
      fetchVideos();
    } else if (selectedMedia === "audio") {
      fetchAudios();
    } else if (selectedMedia === "file") {
      fetchFiles();
    }
  }, [selectedMedia, productQuery, collectionQuery]);

  // --------------------------------------------------------------------------------
  // FILE RECEIVING
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setShowFileUpload(false);
      setEditingTagId(null);
      setSelectedFileLabel("");
      setSelectedFileDescription("");
      setScriptLabel("");
      setScript("");
      setIsScriptValid(null);
      setSelectedProduct(null);
      setSelectedProductDisplay("link");
    }
  }, [isOpen]);

  function isSupportedType(type: string): type is KnowledgeMediaType {
    return (Object.values(KnowledgeMediaType) as string[]).includes(type);
  }

  const handleFileReceive = useCallback((file: File) => {
    if (!file || !isSupportedType(file.type)) return;

    setSelectedFile(file);
  }, []);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return /^(image|video|audio|application|text)\//.test(selectedFile.type)
      ? URL.createObjectURL(selectedFile)
      : null;
  }, [selectedFile]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      handleFileReceive(droppedFile);
    },
    [handleFileReceive],
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleFileReceive(file);
      }
    },
    [handleFileReceive],
  );

  // --------------------------------------------------------------------------------
  // FILE FETCHING
  const fetchExistingFile = async (
    assetId: string,
    fileName: string,
    mediaType: string,
  ): Promise<File | null> => {
    try {
      // Get signed URL from backend
      const res = await fetch(
        `${props.globalSelectedBackend}/assets/download/${props.shopId}/${assetId}`,
        { credentials: "include" },
      );

      if (!res.ok) throw new Error("Failed to fetch asset");

      const { downloadUrl } = await res.json();

      // Fetch the actual file from signed URL
      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) throw new Error("Failed to download file");

      // Convert blob to File object
      return new File([await fileRes.blob()], fileName, { type: mediaType });
    } catch (e) {
      console.error("Error fetching existing file:", e);
      return null;
    }
  };

  // --------------------------------------------------------------------------------
  // SCRIPT
  const validateScript = () => {
    try {
      const result = eval(`(function(){ "use strict"; ${script} })();`);

      if (typeof result !== "string") {
        throw new Error("Output is not a string");
      }

      setIsScriptValid(true);
      setScriptErrorMessage("");
    } catch (err) {
      setIsScriptValid(false);
      setScriptErrorMessage(
        err instanceof Error ? err.message : "Invalid code",
      );
    }
  };

  useEffect(() => {
    setIsScriptValid(null);
    setScriptErrorMessage("");
  }, [script]);

  return (
    <>
      {selectedMedia === null ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
          }}
          headerTitle={t("SelectKnowledgeMedia", { ns: ["additionalInfo"] })}
        >
          <div className="overflow-auto max-h-[45vh] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {ASSETS.filter((asset) => {
              if (!props.assetsToEnable.includes(asset)) return false;
              if (
                globalShop.platform !== "SHOPIFY" &&
                (asset === "product" || asset === "collection")
              ) {
                return false;
              }
              return true;
            }).map((asset) => {
              const isSelected = selectedMedia === asset;

              return (
                <div
                  key={asset}
                  onClick={() => setSelectedMedia(asset)}
                  className={`
                      flex flex-col px-5 py-2.5 text-sm cursor-pointer transition-colors rounded-md text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700
                      ${
                        isSelected
                          ? "bg-gray-200 dark:bg-gray-700/70 border-l-2 border-gray-400 dark:border-gray-400"
                          : ""
                      }
                    `}
                >
                  {t(asset, { ns: ["additionalInfo"] })}
                </div>
              );
            })}
          </div>
        </Popup>
      ) : selectedMedia === "product" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setProductQuery("");
            setSelectedProduct(null);
            setSelectedProductDisplay("link");
          }}
          headerTitle={t("Product", { ns: ["additionalInfo"] })}
        >
          {!selectedProduct ? (
            <>
              <SearchInput
                value={productQuery}
                onChange={handleSearchTextChange}
              />

              <SelectableList
                items={shopProducts}
                selectedItem={selectedProduct}
                onItemClick={setSelectedProduct}
              />
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-auto max-h-[45vh] p-2">
                <div className="px-4 pb-4">
                  <div className="text-[15px] font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    {selectedProduct.label}
                  </div>

                  <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                    {t("SelectDisplayType", { ns: ["additionalInfo"] })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["link", "price", "stock", "summary"] as const).map(
                      (displayType) => {
                        const isActive = selectedProductDisplay === displayType;

                        return (
                          <button
                            key={displayType}
                            onClick={() =>
                              setSelectedProductDisplay(displayType)
                            }
                            className={`
                              flex-1 min-w-[80px] px-3 py-2 rounded-md text-sm font-medium
                              appearance-none border-0 outline-none select-none
                              cursor-pointer
                              focus:outline-none focus-visible:outline-none focus-visible:ring-0
                              transition-colors
                              disabled:cursor-not-allowed disabled:opacity-50
                              ${
                                isActive
                                  ? "bg-blue-600 text-white dark:bg-blue-500 cursor-default"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                              }
                            `}
                          >
                            {t(
                              `Display${
                                displayType.charAt(0).toUpperCase() +
                                displayType.slice(1)
                              }`,
                              { ns: ["additionalInfo"] },
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <div className="px-4 mb-2">
                  <button
                    className={primaryButtonClass}
                    onClick={() => {
                      if (props.setProductList) {
                        const productWithDisplay = {
                          ...selectedProduct,
                          display: selectedProductDisplay,
                        };

                        if (editingTagId) {
                          // Update existing tag's display attribute
                          const tagElement = document.querySelector(
                            `[data-id="${editingTagId}"]`,
                          );
                          if (tagElement) {
                            tagElement.setAttribute(
                              "data-display",
                              selectedProductDisplay,
                            );
                            if (contentRef.current) {
                              props.setKnowledgeContent(
                                contentRef.current.innerHTML,
                              );
                            }
                          }

                          // Update productList
                          props.setProductList((prev) =>
                            prev.map((p) =>
                              p.id === editingTagId
                                ? { ...p, display: selectedProductDisplay }
                                : p,
                            ),
                          );

                          setEditingTagId(null);
                          setIsOpen(false);
                          setSelectedMedia(null);
                          setSelectedProduct(null);
                          setSelectedProductDisplay("link");
                        } else {
                          // Create new tag
                          insertTag(productWithDisplay);
                          props.setProductList((prev) => [
                            ...prev,
                            productWithDisplay,
                          ]);
                        }
                      }
                    }}
                  >
                    {t("Save", { ns: ["additionalInfo"] })}
                  </button>
                </div>

                <div className="px-4">
                  <button
                    className={dangerButtonClass}
                    onClick={() => {
                      setSelectedProduct(null);
                      setSelectedProductDisplay("link");
                    }}
                  >
                    {t("Cancel", { ns: ["additionalInfo"] })}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Popup>
      ) : selectedMedia === "collection" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setCollectionQuery("");
          }}
          headerTitle={t("Collection", { ns: ["additionalInfo"] })}
        >
          <SearchInput
            value={collectionQuery}
            onChange={handleSearchTextChange}
          />

          <SelectableList
            items={shopCollections}
            isSelectable={false}
            onItemClick={(p) => {
              if (props.setProductList) {
                insertTag(p);
                props.setProductList((prev) => [...prev, p]);
              }
            }}
          />
        </Popup>
      ) : selectedMedia === "image" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setImageQuery("");
            setShowFileUpload(false);
            setSelectedFileLabel("");
            setSelectedFileDescription("");
          }}
          headerTitle={t("image", { ns: ["additionalInfo"] })}
        >
          {!showFileUpload ? (
            <>
              <SearchInput value={imageQuery} onChange={setImageQuery} />

              <SelectableList
                items={filteredImages}
                isSelectable={false}
                onItemClick={(a) => {
                  if (props.setAssetList) {
                    insertTag(a);
                    props.setAssetList((prev) => {
                      const exists = prev.some((asset) => asset.id === a.id);
                      return exists ? prev : [...prev, a];
                    });
                  }
                }}
              />

              <div className="my-4 px-4">
                <button
                  className={primaryButtonClass}
                  onClick={() => setShowFileUpload(true)}
                >
                  {t("UploadImage", { ns: ["additionalInfo"] })}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-auto max-h-[45vh] p-2">
                <div>
                  {selectedFile && previewUrl ? (
                    <>
                      <div className="px-4">
                        <div className="text-center">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-[300px] rounded-lg"
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetLabel", { ns: ["additionalInfo"] })}
                          </div>
                          <input
                            type="text"
                            value={selectedFileLabel}
                            onChange={(e) =>
                              setSelectedFileLabel(e.target.value)
                            }
                            className="w-full h-10 rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-white dark:border-gray-600 px-2.5 pr-10 text-[15px] text-gray-900 dark:text-gray-100 font-euclid focus:outline-none focus:border-[#0565ffbd] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500 box-border placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder={t("EnterAssetLabelP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetDescription", {
                              ns: ["additionalInfo"],
                            })}
                          </div>
                          <textarea
                            value={selectedFileDescription}
                            onChange={(e) =>
                              setSelectedFileDescription(e.target.value)
                            }
                            className="w-full h-20 min-w-full max-w-full rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-[#8787877b] dark:border-gray-600 p-2.5 box-border text-[15px] text-gray-900 dark:text-gray-100 font-euclid placeholder:opacity-60 placeholder:text-[14px] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0565fff1] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500"
                            placeholder={t("EnterAssetDescriptionP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>
                      </div>

                      <div className="px-4 mb-2">
                        <button
                          className={primaryButtonClass}
                          onClick={() => {
                            if (
                              selectedFile &&
                              isSupportedType(selectedFile.type) &&
                              props.setAssetList &&
                              props.setMediaToCreate
                            ) {
                              if (editingTagId) {
                                // Update existing tag
                                const mediaType = selectedFile.type;

                                // Update the tag text in DOM (preserve button)
                                const tagElement = document.querySelector(
                                  `[data-id="${editingTagId}"]`,
                                );
                                if (tagElement) {
                                  // Find and update the text node, preserving the button
                                  const childNodes = Array.from(
                                    tagElement.childNodes,
                                  );
                                  const textNode = childNodes.find(
                                    (node) => node.nodeType === Node.TEXT_NODE,
                                  );
                                  if (textNode) {
                                    textNode.textContent = selectedFileLabel;
                                  } else {
                                    // Fallback: if no text node found, create one
                                    const newTextNode =
                                      document.createTextNode(
                                        selectedFileLabel,
                                      );
                                    tagElement.insertBefore(
                                      newTextNode,
                                      tagElement.firstChild,
                                    );
                                  }
                                  // Update knowledgeContent to persist the DOM changes
                                  if (contentRef.current) {
                                    props.setKnowledgeContent(
                                      contentRef.current.innerHTML,
                                    );
                                  }
                                }

                                // Update assetList
                                props.setAssetList((prev) =>
                                  prev.map((asset) =>
                                    asset.id === editingTagId
                                      ? {
                                          ...asset,
                                          label: selectedFileLabel,
                                          contentDescription:
                                            selectedFileDescription,
                                          type: mediaType,
                                        }
                                      : asset,
                                  ),
                                );

                                // Update or add to mediaToCreate
                                props.setMediaToCreate((prev) => {
                                  const existingIndex = prev.findIndex(
                                    (item) => item.id === editingTagId,
                                  );
                                  if (existingIndex >= 0) {
                                    // Update existing
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                      id: editingTagId,
                                      media: selectedFile,
                                    };
                                    return updated;
                                  } else {
                                    // Add new
                                    return [
                                      ...prev,
                                      { id: editingTagId, media: selectedFile },
                                    ];
                                  }
                                });

                                // Close modal after successful edit
                                setEditingTagId(null);
                                setShowFileUpload(false);
                                setIsOpen(false);
                                setSelectedMedia(null);
                              } else {
                                // Create new tag
                                const mediaId = uuidv4();
                                const mediaType = selectedFile.type;

                                insertTag({
                                  id: mediaId,
                                  label: selectedFileLabel,
                                  type: mediaType,
                                });

                                props.setAssetList((prev) => [
                                  ...prev,
                                  {
                                    id: mediaId,
                                    label: selectedFileLabel,
                                    type: mediaType,
                                    contentDescription: selectedFileDescription,
                                  },
                                ]);

                                props.setMediaToCreate((prev) => [
                                  ...prev,
                                  { id: mediaId, media: selectedFile },
                                ]);
                              }

                              setSelectedFile(null);
                            }
                          }}
                          disabled={
                            !selectedFile ||
                            !selectedFileLabel ||
                            !selectedFileDescription
                          }
                        >
                          {t("Save", { ns: ["additionalInfo"] })}
                        </button>
                      </div>

                      <div className="px-4">
                        <button
                          className={dangerButtonClass}
                          onClick={() => {
                            setSelectedFile(null);
                          }}
                        >
                          {t("Delete", { ns: ["additionalInfo"] })}
                        </button>
                      </div>
                    </>
                  ) : isLoadingExistingFile ? (
                    <LoadingState message="Loading existing file..." />
                  ) : (
                    <div className="px-4">
                      <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer mb-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("DragnDrop", { ns: ["additionalInfo"] })}
                        </p>
                      </div>

                      <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Popup>
      ) : selectedMedia === "video" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setVideoQuery("");
            setShowFileUpload(false);
            setSelectedFileLabel("");
            setSelectedFileDescription("");
          }}
          headerTitle={t("video", { ns: ["additionalInfo"] })}
        >
          {!showFileUpload ? (
            <>
              <SearchInput value={videoQuery} onChange={setVideoQuery} />

              <SelectableList
                items={filteredVideos}
                isSelectable={false}
                onItemClick={(a) => {
                  if (props.setAssetList) {
                    insertTag(a);
                    props.setAssetList((prev) => {
                      const exists = prev.some((asset) => asset.id === a.id);
                      return exists ? prev : [...prev, a];
                    });
                  }
                }}
              />

              <div className="my-4 px-4">
                <button
                  className={primaryButtonClass}
                  onClick={() => setShowFileUpload(true)}
                >
                  {t("UploadVideo", { ns: ["additionalInfo"] })}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-auto max-h-[45vh] p-2">
                <div>
                  {selectedFile && previewUrl ? (
                    <>
                      <div className="px-4">
                        <div className="text-center">
                          <video
                            controls
                            src={previewUrl}
                            className="max-w-full max-h-[300px] rounded-lg"
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetLabel", { ns: ["additionalInfo"] })}
                          </div>
                          <input
                            type="text"
                            value={selectedFileLabel}
                            onChange={(e) =>
                              setSelectedFileLabel(e.target.value)
                            }
                            className="w-full h-10 rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-white dark:border-gray-600 px-2.5 pr-10 text-[15px] text-gray-900 dark:text-gray-100 font-euclid focus:outline-none focus:border-[#0565ffbd] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500 box-border placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder={t("EnterAssetLabelP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetDescription", {
                              ns: ["additionalInfo"],
                            })}
                          </div>
                          <textarea
                            value={selectedFileDescription}
                            onChange={(e) =>
                              setSelectedFileDescription(e.target.value)
                            }
                            className="w-full h-20 min-w-full max-w-full rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-[#8787877b] dark:border-gray-600 p-2.5 box-border text-[15px] text-gray-900 dark:text-gray-100 font-euclid placeholder:opacity-60 placeholder:text-[14px] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0565fff1] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500"
                            placeholder={t("EnterAssetDescriptionP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>
                      </div>

                      <div className="px-4 mb-2">
                        <button
                          className={primaryButtonClass}
                          onClick={() => {
                            if (
                              selectedFile &&
                              isSupportedType(selectedFile.type) &&
                              props.setAssetList &&
                              props.setMediaToCreate
                            ) {
                              if (editingTagId) {
                                // Update existing tag
                                const mediaType = selectedFile.type;

                                // Update the tag text in DOM (preserve button)
                                const tagElement = document.querySelector(
                                  `[data-id="${editingTagId}"]`,
                                );
                                if (tagElement) {
                                  // Find and update the text node, preserving the button
                                  const childNodes = Array.from(
                                    tagElement.childNodes,
                                  );
                                  const textNode = childNodes.find(
                                    (node) => node.nodeType === Node.TEXT_NODE,
                                  );
                                  if (textNode) {
                                    textNode.textContent = selectedFileLabel;
                                  } else {
                                    // Fallback: if no text node found, create one
                                    const newTextNode =
                                      document.createTextNode(
                                        selectedFileLabel,
                                      );
                                    tagElement.insertBefore(
                                      newTextNode,
                                      tagElement.firstChild,
                                    );
                                  }
                                  // Update knowledgeContent to persist the DOM changes
                                  if (contentRef.current) {
                                    props.setKnowledgeContent(
                                      contentRef.current.innerHTML,
                                    );
                                  }
                                }

                                // Update assetList
                                props.setAssetList((prev) =>
                                  prev.map((asset) =>
                                    asset.id === editingTagId
                                      ? {
                                          ...asset,
                                          label: selectedFileLabel,
                                          contentDescription:
                                            selectedFileDescription,
                                          type: mediaType,
                                        }
                                      : asset,
                                  ),
                                );

                                // Update or add to mediaToCreate
                                props.setMediaToCreate((prev) => {
                                  const existingIndex = prev.findIndex(
                                    (item) => item.id === editingTagId,
                                  );
                                  if (existingIndex >= 0) {
                                    // Update existing
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                      id: editingTagId,
                                      media: selectedFile,
                                    };
                                    return updated;
                                  } else {
                                    // Add new
                                    return [
                                      ...prev,
                                      { id: editingTagId, media: selectedFile },
                                    ];
                                  }
                                });

                                // Close modal after successful edit
                                setEditingTagId(null);
                                setShowFileUpload(false);
                                setIsOpen(false);
                                setSelectedMedia(null);
                              } else {
                                // Create new tag
                                const mediaId = uuidv4();
                                const mediaType = selectedFile.type;

                                insertTag({
                                  id: mediaId,
                                  label: selectedFileLabel,
                                  type: mediaType,
                                });

                                props.setAssetList((prev) => [
                                  ...prev,
                                  {
                                    id: mediaId,
                                    label: selectedFileLabel,
                                    type: mediaType,
                                    contentDescription: selectedFileDescription,
                                  },
                                ]);

                                props.setMediaToCreate((prev) => [
                                  ...prev,
                                  { id: mediaId, media: selectedFile },
                                ]);
                              }

                              setSelectedFile(null);
                            }
                          }}
                          disabled={
                            !selectedFile ||
                            !selectedFileLabel ||
                            !selectedFileDescription
                          }
                        >
                          {t("Save", { ns: ["additionalInfo"] })}
                        </button>
                      </div>

                      <div className="px-4">
                        <button
                          className={dangerButtonClass}
                          onClick={() => {
                            setSelectedFile(null);
                          }}
                        >
                          {t("Delete", { ns: ["additionalInfo"] })}
                        </button>
                      </div>
                    </>
                  ) : isLoadingExistingFile ? (
                    <LoadingState message="Loading existing file..." />
                  ) : (
                    <div className="px-4">
                      <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer mb-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("DragnDrop", { ns: ["additionalInfo"] })}
                        </p>
                      </div>

                      <input
                        id="fileInput"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Popup>
      ) : selectedMedia === "audio" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setAudioQuery("");
            setShowFileUpload(false);
            setSelectedFileLabel("");
            setSelectedFileDescription("");
          }}
          headerTitle={t("audio", { ns: ["additionalInfo"] })}
        >
          {!showFileUpload ? (
            <>
              <SearchInput value={audioQuery} onChange={setAudioQuery} />

              <SelectableList
                items={filteredAudios}
                isSelectable={false}
                onItemClick={(a) => {
                  if (props.setAssetList) {
                    insertTag(a);
                    props.setAssetList((prev) => {
                      const exists = prev.some((asset) => asset.id === a.id);
                      return exists ? prev : [...prev, a];
                    });
                  }
                }}
              />

              <div className="my-4 px-4">
                <button
                  className={primaryButtonClass}
                  onClick={() => setShowFileUpload(true)}
                >
                  {t("UploadAudio", { ns: ["additionalInfo"] })}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-auto max-h-[45vh] p-2">
                <div>
                  {selectedFile && previewUrl ? (
                    <>
                      <div className="px-4">
                        <div className="text-center">
                          <video
                            controls
                            src={previewUrl}
                            className="max-w-full max-h-[300px] rounded-lg"
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetLabel", { ns: ["additionalInfo"] })}
                          </div>
                          <input
                            type="text"
                            value={selectedFileLabel}
                            onChange={(e) =>
                              setSelectedFileLabel(e.target.value)
                            }
                            className="w-full h-10 rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-white dark:border-gray-600 px-2.5 pr-10 text-[15px] text-gray-900 dark:text-gray-100 font-euclid focus:outline-none focus:border-[#0565ffbd] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500 box-border placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder={t("EnterAssetLabelP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetDescription", {
                              ns: ["additionalInfo"],
                            })}
                          </div>
                          <textarea
                            value={selectedFileDescription}
                            onChange={(e) =>
                              setSelectedFileDescription(e.target.value)
                            }
                            className="w-full h-20 min-w-full max-w-full rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-[#8787877b] dark:border-gray-600 p-2.5 box-border text-[15px] text-gray-900 dark:text-gray-100 font-euclid placeholder:opacity-60 placeholder:text-[14px] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0565fff1] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500"
                            placeholder={t("EnterAssetDescriptionP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>
                      </div>

                      <div className="px-4 mb-2">
                        <button
                          className={primaryButtonClass}
                          onClick={() => {
                            if (
                              selectedFile &&
                              isSupportedType(selectedFile.type) &&
                              props.setAssetList &&
                              props.setMediaToCreate
                            ) {
                              if (editingTagId) {
                                // Update existing tag
                                const mediaType = selectedFile.type;

                                // Update the tag text in DOM (preserve button)
                                const tagElement = document.querySelector(
                                  `[data-id="${editingTagId}"]`,
                                );
                                if (tagElement) {
                                  // Find and update the text node, preserving the button
                                  const childNodes = Array.from(
                                    tagElement.childNodes,
                                  );
                                  const textNode = childNodes.find(
                                    (node) => node.nodeType === Node.TEXT_NODE,
                                  );
                                  if (textNode) {
                                    textNode.textContent = selectedFileLabel;
                                  } else {
                                    // Fallback: if no text node found, create one
                                    const newTextNode =
                                      document.createTextNode(
                                        selectedFileLabel,
                                      );
                                    tagElement.insertBefore(
                                      newTextNode,
                                      tagElement.firstChild,
                                    );
                                  }
                                  // Update knowledgeContent to persist the DOM changes
                                  if (contentRef.current) {
                                    props.setKnowledgeContent(
                                      contentRef.current.innerHTML,
                                    );
                                  }
                                }

                                // Update assetList
                                props.setAssetList((prev) =>
                                  prev.map((asset) =>
                                    asset.id === editingTagId
                                      ? {
                                          ...asset,
                                          label: selectedFileLabel,
                                          contentDescription:
                                            selectedFileDescription,
                                          type: mediaType,
                                        }
                                      : asset,
                                  ),
                                );

                                // Update or add to mediaToCreate
                                props.setMediaToCreate((prev) => {
                                  const existingIndex = prev.findIndex(
                                    (item) => item.id === editingTagId,
                                  );
                                  if (existingIndex >= 0) {
                                    // Update existing
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                      id: editingTagId,
                                      media: selectedFile,
                                    };
                                    return updated;
                                  } else {
                                    // Add new
                                    return [
                                      ...prev,
                                      { id: editingTagId, media: selectedFile },
                                    ];
                                  }
                                });

                                // Close modal after successful edit
                                setEditingTagId(null);
                                setShowFileUpload(false);
                                setIsOpen(false);
                                setSelectedMedia(null);
                              } else {
                                // Create new tag
                                const mediaId = uuidv4();
                                const mediaType = selectedFile.type;

                                insertTag({
                                  id: mediaId,
                                  label: selectedFileLabel,
                                  type: mediaType,
                                });

                                props.setAssetList((prev) => [
                                  ...prev,
                                  {
                                    id: mediaId,
                                    label: selectedFileLabel,
                                    type: mediaType,
                                    contentDescription: selectedFileDescription,
                                  },
                                ]);

                                props.setMediaToCreate((prev) => [
                                  ...prev,
                                  { id: mediaId, media: selectedFile },
                                ]);
                              }

                              setSelectedFile(null);
                            }
                          }}
                          disabled={
                            !selectedFile ||
                            !selectedFileLabel ||
                            !selectedFileDescription
                          }
                        >
                          {t("Save", { ns: ["additionalInfo"] })}
                        </button>
                      </div>

                      <div className="px-4">
                        <button
                          className={dangerButtonClass}
                          onClick={() => {
                            setSelectedFile(null);
                          }}
                        >
                          {t("Delete", { ns: ["additionalInfo"] })}
                        </button>
                      </div>
                    </>
                  ) : isLoadingExistingFile ? (
                    <LoadingState message="Loading existing file..." />
                  ) : (
                    <div className="px-4">
                      <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer mb-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("DragnDrop", { ns: ["additionalInfo"] })}
                        </p>
                      </div>

                      <input
                        id="fileInput"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Popup>
      ) : selectedMedia === "file" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setFileQuery("");
            setShowFileUpload(false);
            setSelectedFileLabel("");
            setSelectedFileDescription("");
          }}
          headerTitle={t("file", { ns: ["additionalInfo"] })}
        >
          {!showFileUpload ? (
            <>
              <SearchInput value={fileQuery} onChange={setFileQuery} />

              <SelectableList
                items={filteredFiles}
                isSelectable={false}
                onItemClick={(a) => {
                  if (props.setAssetList) {
                    insertTag(a);
                    props.setAssetList((prev) => {
                      const exists = prev.some((asset) => asset.id === a.id);
                      return exists ? prev : [...prev, a];
                    });
                  }
                }}
              />

              <div className="my-4 px-4">
                <button
                  className={primaryButtonClass}
                  onClick={() => setShowFileUpload(true)}
                >
                  {t("UploadFile", { ns: ["additionalInfo"] })}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800">
              <div className="overflow-auto max-h-[45vh] p-2">
                <div>
                  {selectedFile && previewUrl ? (
                    <>
                      <div className="px-4">
                        <div className="text-center">
                          {selectedFile.type === "application/pdf" ? (
                            <iframe
                              src={previewUrl}
                              title="PDF preview"
                              className="w-full h-[300px] rounded-lg border border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-center p-5">
                              <div className="text-base font-bold mb-1">
                                {selectedFile.name}
                              </div>
                              <div className="text-sm">
                                ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB)
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetLabel", { ns: ["additionalInfo"] })}
                          </div>
                          <input
                            type="text"
                            value={selectedFileLabel}
                            onChange={(e) =>
                              setSelectedFileLabel(e.target.value)
                            }
                            className="w-full h-10 rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-white dark:border-gray-600 px-2.5 pr-10 text-[15px] text-gray-900 dark:text-gray-100 font-euclid focus:outline-none focus:border-[#0565ffbd] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500 box-border placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder={t("EnterAssetLabelP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>

                        <div className="my-4">
                          <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                            {t("EnterAssetDescription", {
                              ns: ["additionalInfo"],
                            })}
                          </div>
                          <textarea
                            value={selectedFileDescription}
                            onChange={(e) =>
                              setSelectedFileDescription(e.target.value)
                            }
                            className="w-full h-20 min-w-full max-w-full rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-[#8787877b] dark:border-gray-600 p-2.5 box-border text-[15px] text-gray-900 dark:text-gray-100 font-euclid placeholder:opacity-60 placeholder:text-[14px] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:border-[#0565fff1] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500"
                            placeholder={t("EnterAssetDescriptionP", {
                              ns: ["additionalInfo"],
                            })}
                          />
                        </div>
                      </div>

                      <div className="px-4 mb-2">
                        <button
                          className={primaryButtonClass}
                          onClick={() => {
                            if (
                              selectedFile &&
                              isSupportedType(selectedFile.type) &&
                              props.setAssetList &&
                              props.setMediaToCreate
                            ) {
                              if (editingTagId) {
                                // Update existing tag
                                const mediaType = selectedFile.type;

                                // Update the tag text in DOM (preserve button)
                                const tagElement = document.querySelector(
                                  `[data-id="${editingTagId}"]`,
                                );
                                if (tagElement) {
                                  // Find and update the text node, preserving the button
                                  const childNodes = Array.from(
                                    tagElement.childNodes,
                                  );
                                  const textNode = childNodes.find(
                                    (node) => node.nodeType === Node.TEXT_NODE,
                                  );
                                  if (textNode) {
                                    textNode.textContent = selectedFileLabel;
                                  } else {
                                    // Fallback: if no text node found, create one
                                    const newTextNode =
                                      document.createTextNode(
                                        selectedFileLabel,
                                      );
                                    tagElement.insertBefore(
                                      newTextNode,
                                      tagElement.firstChild,
                                    );
                                  }
                                  // Update knowledgeContent to persist the DOM changes
                                  if (contentRef.current) {
                                    props.setKnowledgeContent(
                                      contentRef.current.innerHTML,
                                    );
                                  }
                                }

                                // Update assetList
                                props.setAssetList((prev) =>
                                  prev.map((asset) =>
                                    asset.id === editingTagId
                                      ? {
                                          ...asset,
                                          label: selectedFileLabel,
                                          contentDescription:
                                            selectedFileDescription,
                                          type: mediaType,
                                        }
                                      : asset,
                                  ),
                                );

                                // Update or add to mediaToCreate
                                props.setMediaToCreate((prev) => {
                                  const existingIndex = prev.findIndex(
                                    (item) => item.id === editingTagId,
                                  );
                                  if (existingIndex >= 0) {
                                    // Update existing
                                    const updated = [...prev];
                                    updated[existingIndex] = {
                                      id: editingTagId,
                                      media: selectedFile,
                                    };
                                    return updated;
                                  } else {
                                    // Add new
                                    return [
                                      ...prev,
                                      { id: editingTagId, media: selectedFile },
                                    ];
                                  }
                                });

                                // Close modal after successful edit
                                setEditingTagId(null);
                                setShowFileUpload(false);
                                setIsOpen(false);
                                setSelectedMedia(null);
                              } else {
                                // Create new tag
                                const mediaId = uuidv4();
                                const mediaType = selectedFile.type;

                                insertTag({
                                  id: mediaId,
                                  label: selectedFileLabel,
                                  type: mediaType,
                                });

                                props.setAssetList((prev) => [
                                  ...prev,
                                  {
                                    id: mediaId,
                                    label: selectedFileLabel,
                                    type: mediaType,
                                    contentDescription: selectedFileDescription,
                                  },
                                ]);

                                props.setMediaToCreate((prev) => [
                                  ...prev,
                                  { id: mediaId, media: selectedFile },
                                ]);
                              }

                              setSelectedFile(null);
                            }
                          }}
                          disabled={
                            !selectedFile ||
                            !selectedFileLabel ||
                            !selectedFileDescription
                          }
                        >
                          {t("Save", { ns: ["additionalInfo"] })}
                        </button>
                      </div>

                      <div className="px-4">
                        <button
                          className={dangerButtonClass}
                          onClick={() => {
                            setSelectedFile(null);
                          }}
                        >
                          {t("Delete", { ns: ["additionalInfo"] })}
                        </button>
                      </div>
                    </>
                  ) : isLoadingExistingFile ? (
                    <LoadingState message="Loading existing file..." />
                  ) : (
                    <div className="px-4">
                      <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-5 text-center cursor-pointer mb-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="text-gray-700 dark:text-gray-300">
                          {t("DragnDrop", { ns: ["additionalInfo"] })}
                        </p>
                      </div>

                      <input
                        id="fileInput"
                        type="file"
                        accept="application/pdf,.xls,.xlsx,.doc,.docx,.ppt,.pptx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Popup>
      ) : selectedMedia === "script" ? (
        <Popup
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedMedia(null);
            setEditingTagId(null);
            setScript("");
            setScriptLabel("");
            setIsScriptValid(null);
            // setEvaluatedScript("");
            setScriptErrorMessage("");
          }}
          headerTitle={t("script", { ns: ["additionalInfo"] })}
        >
          <div className="w-[500px]">
            <div className="my-4 px-4">
              <div className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">
                {t("EnterCodeLabel", {
                  ns: ["additionalInfo"],
                })}
              </div>
              <input
                type="text"
                value={scriptLabel}
                onChange={(e) => setScriptLabel(e.target.value)}
                className="w-full h-10 rounded-[5px] bg-[#fefcff] dark:bg-gray-800 border border-white dark:border-gray-600 px-2.5 pr-10 text-[15px] text-gray-900 dark:text-gray-100 font-euclid focus:outline-none focus:border-[#0565ffbd] dark:focus:border-blue-500 hover:border-[#0565ffbd] dark:hover:border-blue-500 box-border placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder={t("EnterCodeLabelP", {
                  ns: ["additionalInfo"],
                })}
              />
            </div>
            <CodeArea
              key={editingTagId || "new"}
              initialHeight="400px"
              value={script}
              typescript={true}
              onChange={(text) => setScript(text)}
              isDark={isDark}
            />

            <div className="flex gap-2.5 mx-4 mt-4">
              <div className="flex-1">
                <button
                  className={`
                    w-full px-4 py-2 rounded-md text-sm font-medium appearance-none border-0 ring-0 ring-offset-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 transition-none
                    ${
                      isScriptValid === true
                        ? "bg-[#4caf50] text-white"
                        : isScriptValid === false
                          ? "bg-[#f44336] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                  onClick={() => {
                    validateScript();
                  }}
                >
                  {t("Validate", { ns: ["additionalInfo"] })}
                </button>
              </div>
              <div className="flex-1">
                <button
                  className={primaryButtonClass}
                  onClick={() => {
                    if (props.setAssetList) {
                      if (editingTagId) {
                        // Update existing script tag

                        // Update the tag text in DOM (preserve button)
                        const tagElement = document.querySelector(
                          `[data-id="${editingTagId}"]`,
                        );
                        if (tagElement) {
                          // Find and update the text node, preserving the button
                          const childNodes = Array.from(tagElement.childNodes);
                          const textNode = childNodes.find(
                            (node) => node.nodeType === Node.TEXT_NODE,
                          );
                          if (textNode) {
                            textNode.textContent = scriptLabel;
                          } else {
                            // Fallback: if no text node found, create one
                            const newTextNode =
                              document.createTextNode(scriptLabel);
                            tagElement.insertBefore(
                              newTextNode,
                              tagElement.firstChild,
                            );
                          }
                          // Update knowledgeContent to persist the DOM changes
                          if (contentRef.current) {
                            props.setKnowledgeContent(
                              contentRef.current.innerHTML,
                            );
                          }
                        }

                        // Update assetList
                        props.setAssetList((prev) =>
                          prev.map((asset) =>
                            asset.id === editingTagId
                              ? {
                                  ...asset,
                                  label: scriptLabel,
                                  contentDescription: script,
                                  type: KnowledgeMediaType.script,
                                }
                              : asset,
                          ),
                        );

                        // Close modal after successful edit
                        setEditingTagId(null);
                        setIsOpen(false);
                        setSelectedMedia(null);
                        setScript("");
                        setScriptLabel("");
                        setIsScriptValid(null);
                        setScriptErrorMessage("");
                      } else {
                        // Create new script tag
                        const scriptId = uuidv4();

                        insertTag({
                          id: scriptId,
                          label: scriptLabel,
                          type: KnowledgeMediaType.script,
                        });

                        props.setAssetList((prev) => {
                          const newAssetList = [
                            ...prev,
                            {
                              id: scriptId,
                              label: scriptLabel,
                              type: KnowledgeMediaType.script,
                              contentDescription: script,
                            },
                          ];
                          return newAssetList;
                        });
                      }
                    }
                  }}
                  disabled={!isScriptValid || !scriptLabel}
                >
                  {t("Save", { ns: ["additionalInfo"] })}
                </button>
              </div>
            </div>
            {!isScriptValid && (
              <div className="text-center mx-4 my-4 break-words text-red-600 dark:text-red-400">
                {scriptErrorMessage}
              </div>
            )}
          </div>
        </Popup>
      ) : (
        <></>
      )}
      <KnowledgeInput
        ref={contentRef}
        content={props.knowledgeContent}
        onChange={props.setKnowledgeContent}
        onKeyDown={handleKeyDown as any}
        placeholder={props.placeholder}
        className={props.knowledgeInputClassName}
        maxLength={props.maxLength}
        forceLightMode={props.forceInputLightMode}
      />
    </>
  );
});

export default KnowledgeMedia;

const SelectableList = <T extends { id: string | number; label: string }>({
  items,
  selectedItem,
  onItemClick,
  isSelectable = true,
}: {
  items: T[];
  selectedItem?: T | null;
  onItemClick: (item: T) => void;
  isSelectable?: boolean;
}) => {
  return (
    <div className="mt-1">
      <div className="overflow-auto max-h-[300px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {items.map((item) => {
          const isSelected = isSelectable && selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onItemClick(item)}
              className={`
                flex flex-col px-5 py-2 text-sm text-gray-900 dark:text-gray-100 cursor-pointer transition-colors
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${
                  isSelected
                    ? "bg-gray-200 dark:bg-gray-700/70 border-l-2 border-gray-400 dark:border-gray-400"
                    : ""
                }
              `}
            >
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LoadingState = ({
  message = "Loading...",
  size = 10,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col justify-center items-center p-10 text-center ${className}`}
    >
      <img
        src={wizy_loader}
        alt="Loading..."
        className={`w-${size} h-${size} mb-2.5`}
      />
      <div className="text-gray-700 dark:text-gray-300">{message}</div>
    </div>
  );
};

const SearchInput = ({
  value,
  onChange,
  placeholder = "",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) => {
  return (
    <div className="px-2 py-1 box-border w-full">
      <div
        className={`
          relative flex items-center rounded-md
          border border-gray-300 dark:border-gray-600 transition-colors
          hover:border-gray-400 dark:hover:border-gray-500
          focus-within:border-gray-500 dark:focus-within:border-gray-400
          focus-within:ring-1 focus-within:ring-gray-300 dark:focus-within:ring-gray-600
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <img
          src={wizy_mg_outline}
          alt="search"
          className="pointer-events-none absolute right-2 w-4 h-4 opacity-60 dark:opacity-80 dark:invert"
        />

        <input
          type="text"
          name="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full rounded-md border-none outline-none px-2 pr-8 py-2 text-sm
            bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-400 disabled:cursor-not-allowed
          "
        />
      </div>
    </div>
  );
};
