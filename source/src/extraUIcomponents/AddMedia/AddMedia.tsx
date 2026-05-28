// Import React Dependencies
import React, { FC, useState, useEffect } from "react";
import Cookies from "universal-cookie";
import {
  EAddMediaStateActions,
  IMediaItem,
  INewAddMediaExtraUIComponent,
} from "../extraUIComponentTypes";
import { IMessage } from "../../types/MessageType";

const cookies = new Cookies();

// Declare types and interfaces
type AddMediaProps = {
  isAdmin: boolean;
  content: INewAddMediaExtraUIComponent;
  extraUIComponentIndex: number;
  globalSelectedBackend: string;
  domain: string;
  message: IMessage;
  language: string;
  getClientIpInfo: () => Promise<string>;
};

// Page main functional component
const AddMedia: FC<AddMediaProps> = (props) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<IMediaItem[]>(
    props.content.uploadedMedia || []
  );
  const [stateAction, setStateAction] = useState<EAddMediaStateActions>(
    props.content.stateAction || EAddMediaStateActions.NONE
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  useEffect(() => {
    if (props.content.stateAction) {
      setStateAction(props.content.stateAction);
    }
    if (props.content.uploadedMedia) {
      setUploadedMedia(props.content.uploadedMedia);
    }
  }, [props.content.stateAction, props.content.uploadedMedia]);

  const minFiles = props.content.minFiles || 1;
  const maxFiles = props.content.maxFiles || 10;
  const acceptedTypes = props.content.acceptedTypes || [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) =>
      acceptedTypes.includes(file.type)
    );

    if (validFiles.length + selectedFiles.length > maxFiles) {
      alert(
        `Máximo ${maxFiles} archivos permitidos. Has seleccionado ${
          validFiles.length + selectedFiles.length
        }.`
      );
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

const uploadFiles = async () => {
    if (selectedFiles.length < minFiles) {
      alert(
        `Por favor selecciona al menos ${minFiles} ${minFiles === 1 ? "imagen" : "imágenes"}`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress("Subiendo imágenes...");

    try {
      const uploadedMediaItems: IMediaItem[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Subiendo imagen ${i + 1} de ${selectedFiles.length}...`);

        // Get clientId from cookie
        const clientId = cookies.get(
          props.isAdmin
            ? "WIZY_CLIENT_ADMIN_" + props.domain
            : "WIZY_CLIENT_" + props.domain
        );

        // get client IP info
        const clientInfo = JSON.parse(await props.getClientIpInfo());
        const location: string =
          clientInfo?.location?.city +
          ", " +
          clientInfo?.location?.country?.name +
          " " +
          clientInfo?.location?.country?.flag?.emoji;
        const computer: string =
          window.navigator.platform === undefined ? "" : window.navigator.platform;

        //create the formData for the file to upload to S3
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", clientId);
        formData.append("location", location);
        formData.append("computer", computer);

        // upload image from backend
        const uploadUrlResponse = await fetch(
          `${props.globalSelectedBackend}/shopifywidgetrest/mediaupload/${props.domain}`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        if (!uploadUrlResponse.ok) {
          console.error("Failed to get upload URL:", uploadUrlResponse);
          throw new Error(`Error obteniendo URL firmada para ${file.name}`);
        }
        const responseJson = await uploadUrlResponse.json();
        const { mediaId } = responseJson;

        uploadedMediaItems.push({
          mediaId: mediaId,
          mediaType: file.type,
          filename: file.name,
        });
      }

      setUploadProgress("Guardando mensajes...");

      const addMediaResponse = await fetch(
        `${props.globalSelectedBackend}/shopifywidgetrest/addmedia/${props.domain}/${props.message.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            media: uploadedMediaItems,
            confirmationMessage: `Estas son las ${uploadedMediaItems.length} imágenes que te envío`,
          }),
        }
      );

      if (!addMediaResponse.ok) {
        const errorText = await addMediaResponse.text();
        const errorJSON = JSON.parse(errorText);
        throw new Error(errorJSON.message || "Error guardando mensajes");
      }

      await addMediaResponse.json();

      setUploadedMedia(uploadedMediaItems);
      setStateAction(EAddMediaStateActions.UPLOADED);
      setSelectedFiles([]);
      setUploadProgress("");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // JSX Return statement
  return (
    <React.Fragment>
      <div className="WizybotAddMedia__outter">
        {stateAction === EAddMediaStateActions.NONE ? (
          <div className="WizybotAddMedia__inner">
            <div className="WizybotAddMedia__header">
              <h3>{props.content.title}</h3>
              <p>{props.content.description}</p>
            </div>

            {selectedFiles.length === 0 && (
              <div className="WizybotAddMedia__upload__zone">
                <input
                  type="file"
                  id={`addmedia-input-${props.message.id}`}
                  multiple
                  accept={acceptedTypes.join(",")}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  disabled={isUploading}
                />
                <label
                  htmlFor={`addmedia-input-${props.message.id}`}
                  className="WizybotAddMedia__upload__button"
                >
                  {" "}
                  {props.language === "English"
                    ? "Select Images"
                    : props.language === "Spanish"
                      ? "Seleccionar Imágenes"
                      : props.language === "French"
                        ? "Sélectionner des images"
                        : props.language === "Portuguese"
                          ? "Selecionar Imagens"
                          : props.language === "German"
                            ? "Bilder auswählen"
                            : props.language === "Italian"
                              ? "Seleziona Immagini"
                              : "Select Images"}
                </label>
                <p className="WizybotAddMedia__info">
                  {props.language === "English"
                    ? minFiles === maxFiles
                      ? `${minFiles} image${minFiles !== 1 ? "s" : ""} required`
                      : `${minFiles}-${maxFiles} images`
                    : props.language === "Spanish"
                      ? minFiles === maxFiles
                        ? `${minFiles} imagen${minFiles !== 1 ? "es" : ""} requerida${minFiles !== 1 ? "s" : ""}`
                        : `${minFiles}-${maxFiles} imágenes`
                      : props.language === "French"
                        ? minFiles === maxFiles
                          ? `${minFiles} image${minFiles !== 1 ? "s" : ""} requise${minFiles !== 1 ? "s" : ""}`
                          : `${minFiles}-${maxFiles} images`
                        : props.language === "Portuguese"
                          ? minFiles === maxFiles
                            ? `${minFiles} image${minFiles !== 1 ? "ns" : "m"} obrigatória${minFiles !== 1 ? "s" : ""}`
                            : `${minFiles}-${maxFiles} imagens`
                          : props.language === "German"
                            ? minFiles === maxFiles
                              ? `${minFiles} Bild${minFiles !== 1 ? "er" : ""} erforderlich`
                              : `${minFiles}-${maxFiles} Bilder`
                            : props.language === "Italian"
                              ? minFiles === maxFiles
                                ? `${minFiles} immagin${minFiles !== 1 ? "i" : "e"} richiesta${minFiles !== 1 ? "e" : ""}`
                                : `${minFiles}-${maxFiles} immagini`
                              : minFiles === maxFiles
                                ? `${minFiles} image${minFiles !== 1 ? "s" : ""} required`
                                : `${minFiles}-${maxFiles} images`}
                </p>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="WizybotAddMedia__preview">
                <h4>
                  {props.language === "English"
                    ? "Selected Images"
                    : props.language === "Spanish"
                      ? "Imágenes Seleccionadas"
                      : props.language === "French"
                        ? "Images sélectionnées"
                        : props.language === "Portuguese"
                          ? "Imagens Selecionadas"
                          : props.language === "German"
                            ? "Ausgewählte Bilder"
                            : props.language === "Italian"
                              ? "Immagini selezionate"
                              : "Selected Images"}{" "}
                  ({selectedFiles.length}/{maxFiles})
                </h4>
                <div className="WizybotAddMedia__preview__grid">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="WizybotAddMedia__preview__item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="WizybotAddMedia__preview__image"
                      />
                      <button
                        className="WizybotAddMedia__remove__button"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="WizybotAddMedia__upload__submit__button"
                  onClick={uploadFiles}
                  disabled={isUploading}
                >
                  {isUploading
                    ? uploadProgress
                    : props.language === "English"
                      ? "Upload Images"
                      : props.language === "Spanish"
                        ? "Subir Imágenes"
                        : props.language === "French"
                          ? "Télécharger les images"
                          : props.language === "Portuguese"
                            ? "Enviar Imagens"
                            : props.language === "German"
                              ? "Bilder hochladen"
                              : props.language === "Italian"
                                ? "Carica Immagini"
                                : "Upload Images"}
                </button>
              </div>
            )}
          </div>
        ) : stateAction === EAddMediaStateActions.UPLOADED ? (
          <div className="WizybotAddMedia__inner">
            <div className="WizybotAddMedia__header">
              <h3>
                {" "}
                {props.language === "English"
                  ? "Images Uploaded"
                  : props.language === "Spanish"
                    ? "Imágenes Subidas"
                    : props.language === "French"
                      ? "Images téléchargées"
                      : props.language === "Portuguese"
                        ? "Imagens Enviadas"
                        : props.language === "German"
                          ? "Bilder hochgeladen"
                          : props.language === "Italian"
                            ? "Immagini caricate"
                            : "Images Uploaded"}
              </h3>
              <p>
                {props.language === "English"
                  ? `${uploadedMedia.length} image(s)`
                  : props.language === "Spanish"
                    ? `${uploadedMedia.length} imagen(es)`
                    : props.language === "French"
                      ? `${uploadedMedia.length} image(s)`
                      : props.language === "Portuguese"
                        ? `${uploadedMedia.length} imagem(ns)`
                        : props.language === "German"
                          ? `${uploadedMedia.length} Bild(er)`
                          : props.language === "Italian"
                            ? `${uploadedMedia.length} immagine/i`
                            : `${uploadedMedia.length} image(s)`}
              </p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </React.Fragment>
  );
};

// Default exported function
export default AddMedia;
