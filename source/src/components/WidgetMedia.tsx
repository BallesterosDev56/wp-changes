// Import React Dependencies
import React, { FC, useEffect, useState } from "react";
import ReactDOM from "react-dom";

//Import media
// import { ImageZoomModal } from "./ImageZoomModal";

const isNotBlank = (value: any): boolean => {
  return value !== null && value !== undefined && value !== "";
};

const supportedAudioTypes = [
  "audio/aac",
  "audio/amr",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
];

const supportedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/heic",
];

const supportedStickerTypes = ["image/webp"];

const supportedVideoTypes = ["video/3gp", "video/mp4"];

const supportedDocumentTypes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export type MessageMedia = {
  url: string;
  mediaType: string;
  mediaName: string | null;
};

type WidgetMediaProps = {
  messageId: string;
  isAsset?: boolean;
  globalSelectedBackend: string;
  mainLanguage?: string;
  widgetLoader?: string;
};

// Page main functional component
const WidgetMedia: FC<WidgetMediaProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [media, setMedia] = useState<MessageMedia>({
    url: "",
    mediaType: "",
    mediaName: null,
  });
  const [brokenURLError, setBrokenURLError] = useState<boolean>(false);

  useEffect(() => {
    getMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsLoaded(false);
    getMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.messageId]);

  // Set isLoaded to true when media URL is available for document types
  useEffect(() => {
    if (
      isNotBlank(media.url) &&
      supportedDocumentTypes.includes(media.mediaType) &&
      media.mediaType !== "application/pdf"
    ) {
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media.url, media.mediaType]);

  const getMedia = async () => {
    if (props.isAsset) {
      await fetch(
        props.globalSelectedBackend + "/assets/" + props.messageId,

        {
          method: "GET",
          credentials: "include",
          redirect: "follow",
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            console.log(errorText);
          } else {
            return response.json();
          }
        })
        .then((JSONresult) => {
          setMedia(JSONresult);
        })
        .catch((err) => {
          console.log(err);
          setIsLoaded(true);
        });
    } else {
      await fetch(
        props.globalSelectedBackend +
          "/shopifywidgetrest/messagemedia/" +
          props.messageId,

        {
          method: "GET",
          credentials: "include",
          redirect: "follow",
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            console.log(errorText);
          } else {
            return response.json();
          }
        })
        .then((JSONresult) => {
          setMedia(JSONresult);
        })
        .catch((err) => {
          console.log(err);
          setIsLoaded(true);
        });
    }
  };

  return (
    <React.Fragment>
      <div
        className="ChatMedia__outter"
        style={
          !isLoaded ? { maxWidth: "300px", maxHeight: "300px" } : undefined
        }
      >
        <div
          className="ChatMedia__inner"
          style={{ width: "fit-content", height: "fit-content" }}
        >
          <img
            src={props.widgetLoader}
            style={{
              position: "absolute",
              width: "100px",
              height: "100px",
              objectFit: "none",
              zIndex: 0,
              display: !isLoaded ? "block" : "none",
            }}
          />
          {!brokenURLError ? (
            // IMAGE BY URL
            (supportedImageTypes.includes(media.mediaType) ||
              supportedStickerTypes.includes(media.mediaType)) &&
            isNotBlank(media.url) ? (
              <>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ zIndex: 1 }}
                >
                  <img
                    className="ChatMedia__image"
                    src={media.url}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setBrokenURLError(true)}
                    alt={media.mediaName || "Media"}
                    style={
                      !isLoaded
                        ? { zIndex: 1, display: "none" }
                        : { zIndex: 1, display: "block" }
                    }
                  />
                </a>
              </>
            ) : // VIDEO BY URL
            supportedVideoTypes.includes(media.mediaType) &&
              isNotBlank(media.url) ? (
              <video
                controls
                src={media.url}
                style={
                  !isLoaded
                    ? { zIndex: 1, display: "none" }
                    : {
                        zIndex: 1,
                        maxWidth: "270px",
                        maxHeight: "270px",
                        objectFit: "contain",
                        borderRadius: "20px",
                      }
                }
                onLoadedData={() => setIsLoaded(true)}
                onError={() => setBrokenURLError(true)}
              />
            ) : // AUDIO BY URL
            supportedAudioTypes.includes(media.mediaType) &&
              isNotBlank(media.url) ? (
              <audio
                controls
                src={media.url}
                style={
                  !isLoaded
                    ? { zIndex: 1, display: "none" }
                    : {
                        zIndex: 1,
                        maxWidth: "270px",
                        maxHeight: "270px",
                        objectFit: "contain",
                        borderRadius: "20px",
                      }
                }
                onLoadedData={() => setIsLoaded(true)}
                onError={() => setBrokenURLError(true)}
              />
            ) : // DOCUMENT BY URL
            supportedDocumentTypes.includes(media.mediaType) &&
              isNotBlank(media.url) ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                {media.mediaType === "application/pdf" ? (
                  <iframe
                    src={media.url}
                    style={
                      !isLoaded
                        ? { display: "none" }
                        : {
                            zIndex: 1,
                            width: "270px",
                            height: "400px",
                            borderRadius: "20px",
                            overflow: "auto",
                          }
                    }
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setBrokenURLError(true)}
                    title="PDF preview"
                  />
                ) : (
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsLoaded(true)}
                    style={
                      !isLoaded
                        ? { display: "none" }
                        : {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "270px",
                            height: "150px",
                            backgroundColor: "#f9f9f9",
                            color: "#666",
                            textDecoration: "none",
                            borderRadius: "20px",
                            border: "2px dashed #ccc",
                            padding: "20px",
                            textAlign: "center",
                            zIndex: 1,
                          }
                    }
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      {media.mediaName || "Document"}
                    </div>
                    <div style={{ fontSize: "12px" }}>Click to open</div>
                  </a>
                )}
              </div>
            ) : props.mainLanguage === "English" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Media not available
              </div>
            ) : props.mainLanguage === "Spanish" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Archivo no disponible
              </div>
            ) : props.mainLanguage === "French" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Média non disponible
              </div>
            ) : props.mainLanguage === "Portuguese" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Mídia não disponível
              </div>
            ) : props.mainLanguage === "German" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Medien nicht verfügbar
              </div>
            ) : props.mainLanguage === "Italian" ? (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Media non disponibile
              </div>
            ) : (
              <div
                style={{
                  zIndex: 1,
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: "0 15px",
                }}
              >
                Media not available
              </div>
            )
          ) : props.mainLanguage === "English" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Media not available
            </div>
          ) : props.mainLanguage === "Spanish" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Archivo no disponible
            </div>
          ) : props.mainLanguage === "French" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Média non disponible
            </div>
          ) : props.mainLanguage === "Portuguese" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Mídia não disponível
            </div>
          ) : props.mainLanguage === "German" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Medien nicht verfügbar
            </div>
          ) : props.mainLanguage === "Italian" ? (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Media non disponibile
            </div>
          ) : (
            <div
              style={{
                zIndex: 1,
                height: "50px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                padding: "0 15px",
              }}
            >
              Media not available
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

// Default exported function
export default WidgetMedia;
