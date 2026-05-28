import {
  APIProvider,
  Map,
  MapMouseEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./styles/BulkWhatsAppTemplateForm.css";
import { IWhatsAppTemplate } from "../types/WhatsAppTemplateType.ts";

export type IFixedVariable = {
  type: "fixed";
  value: string;
};

export type IFieldVariable = {
  type: "field";
  field: string;
  default: string;
};

export type ITemplateVariable = IFixedVariable | IFieldVariable;

export type IBulkWhatsAppTemplateFormProps = {
  templatesState: [
    IWhatsAppTemplate[],
    React.Dispatch<React.SetStateAction<IWhatsAppTemplate[]>>,
  ];
  bodyVariableFields: string[];
  urlVariableFields: string[];
};

// Page main functional component
const BulkWhatsAppTemplateForm: FC<IBulkWhatsAppTemplateFormProps> = ({
  templatesState: [templates, setTemplates],
  bodyVariableFields,
  urlVariableFields,
}) => {
  // Use translation
  const { t } = useTranslation(["whatsAppTemplatesModal"]);
  const [defaultLatitude, setDefaultLatitude] = useState<number>(4.694675);
  const [defaultLongitude, setDefaultLongitude] = useState<number>(-74.03234);

  const getSelectedTemplate = () => {
    const selectedTemplate = templates.find((template) => template.selected);
    console.log(selectedTemplate);
    return selectedTemplate;
  };

  useEffect(() => {
    if (
      getSelectedTemplate()?.components.find(
        (component: any) =>
          component.type === "HEADER" && component.format === "LOCATION"
      )
    ) {
      navigator.geolocation.getCurrentPosition((position) => {
        setDefaultLatitude(position.coords.latitude);
        setDefaultLongitude(position.coords.longitude);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeaderVariableChange = (
    event:
      | React.FormEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.currentTarget;
    const param = name.split("_")[0];
    const headerVariableIndex = parseInt(name.split("_")[1]);
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "HEADER" && component.format === "TEXT") {
              const newHeaderVariables = component.headerVariables;
              newHeaderVariables[headerVariableIndex][param] = value;
              return { ...component, headerVariables: newHeaderVariables };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleAttachHeaderFile = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFile = event.target.files[0];
      const templateId = getSelectedTemplate()?.id;
      setTemplates((prevTemplates) =>
        prevTemplates.map((template) => {
          if (template.id === templateId) {
            const newComponents = template.components.map((component) => {
              if (component.type === "HEADER") {
                return { ...component, file: newFile };
              } else {
                return component;
              }
            });
            return { ...template, components: newComponents };
          } else {
            return template;
          }
        })
      );
    }
  };

  const removeHeaderFile = () => {
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "HEADER") {
              return { ...component, file: null };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleBodyVariableChange = (
    event:
      | React.FormEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.currentTarget;
    const param = name.split("_")[0];
    const bodyVariableIndex = parseInt(name.split("_")[1]);
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "BODY") {
              const newBodyVariables = component.bodyVariables.map(
                (bodyVariable: ITemplateVariable, i: number) =>
                  i === bodyVariableIndex
                    ? { ...bodyVariable, [param]: value }
                    : bodyVariable
              );
              return { ...component, bodyVariables: newBodyVariables };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleButtonVariableChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    const buttonIndex = parseInt(name.split("_")[0]);
    const buttonVaribaleIndex = parseInt(name.split("_")[1]);
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "BUTTONS") {
              const newButtons = component.buttons;
              newButtons[buttonIndex].buttonVariables[buttonVaribaleIndex] =
                value;
              return { ...component, buttons: newButtons };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleButtonVariableWithFieldsChange = (
    event:
      | React.FormEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name } = event.currentTarget;
    let { value } = event.currentTarget;
    const param = name.split("_")[0];
    if (param === "value" || param === "default") {
      value = value.replace(/\s/g, "");
    }
    console.log("name, value");
    console.log(name);
    console.log(value);
    const buttonIndex = parseInt(name.split("_")[1]);
    const buttonVaribaleIndex = parseInt(name.split("_")[2]);
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "BUTTONS") {
              const newButtons = component.buttons.map(
                (button: any, bi: number) =>
                  bi === buttonIndex
                    ? {
                        ...button,
                        buttonVariables: button.buttonVariables.map(
                          (variable: any, bvi: number) =>
                            bvi === buttonVaribaleIndex
                              ? { ...variable, [param]: value }
                              : variable
                        ),
                      }
                    : button
              );
              return { ...component, buttons: newButtons };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleUrlButtonDiscountCodeChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    const sanitizedValue = value.replace(/\s/g, "");
    const buttonIndex = parseInt(name);
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (component.type === "BUTTONS") {
              const newButtons = component.buttons.map(
                (button: any, bi: number) =>
                  bi === buttonIndex
                    ? {
                        ...button,
                        discountCode: sanitizedValue,
                      }
                    : button
              );
              return { ...component, buttons: newButtons };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleLocationNameChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (
              component.type === "HEADER" &&
              component.format === "LOCATION"
            ) {
              return {
                ...component,
                name: value,
              };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleLocationAddressChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.currentTarget;
    const templateId = getSelectedTemplate()?.id;
    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (
              component.type === "HEADER" &&
              component.format === "LOCATION"
            ) {
              return {
                ...component,
                address: value,
              };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  const handleLocationChange = (event: MapMouseEvent) => {
    const latLng = event.detail.latLng;
    const templateId = getSelectedTemplate()?.id;

    setTemplates((prevTemplates) =>
      prevTemplates.map((template) => {
        if (template.id === templateId) {
          const newComponents = template.components.map((component) => {
            if (
              component.type === "HEADER" &&
              component.format === "LOCATION"
            ) {
              return {
                ...component,
                latitude: latLng?.lat,
                longitude: latLng?.lng,
              };
            } else {
              return component;
            }
          });
          return { ...template, components: newComponents };
        } else {
          return template;
        }
      })
    );
  };

  return getSelectedTemplate() ? (
    <>
      {getSelectedTemplate()!.components.map((component) => {
        if (component.type === "HEADER") {
          if (component.format === "TEXT") {
            return (
              <>
                <div
                  className="Wizy__input__title"
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {t("Header", {
                    ns: ["whatsAppTemplatesModal"],
                  })}
                </div>
                <textarea
                  className="Wizy__textarea"
                  disabled={true}
                  value={component.text}
                ></textarea>
                {(component.headerVariables as ITemplateVariable[]).map(
                  (headerVariable, index) => (
                    <div className="BulkWhatsAppTemplate__body__variable__container">
                      <div className="WhatsAppTemplate__body__variable__title__outter">
                        <div className="WhatsAppTemplate__body__variable__title">
                          {`{{${index + 1}}}`}
                        </div>
                      </div>
                      {/* FORM FOR VARIABLE PARAMETERS */}
                      <div className="BulkWhatsAppTemplate__body__variable__input__outter">
                        <div className="BulkWhatsAppTemplate__body__variable__input__column">
                          <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                            {t("Type", {
                              ns: ["whatsAppTemplatesModal"],
                            })}
                          </div>
                          <select
                            className="Wizy__input__select__1"
                            name={`type_${index}`}
                            onChange={handleHeaderVariableChange}
                            value={headerVariable.type}
                          >
                            <option value={"fixed"}>
                              {t("Fixed", {
                                ns: ["whatsAppTemplatesModal"],
                              })}
                            </option>
                            <option value={"field"}>
                              {t("Field", {
                                ns: ["whatsAppTemplatesModal"],
                              })}
                            </option>
                          </select>
                        </div>
                        {headerVariable.type === "fixed" ? (
                          <>
                            <div className="BulkWhatsAppTemplate__body__variable__input__column">
                              <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                {t("Value", {
                                  ns: ["whatsAppTemplatesModal"],
                                })}
                              </div>
                              <input
                                type="text"
                                className="Wizy__input__2"
                                placeholder={
                                  component.example.header_text[index]
                                }
                                value={headerVariable.value}
                                onChange={handleHeaderVariableChange}
                                name={`value_${index}`}
                              />
                            </div>
                            <div className="BulkWhatsAppTemplate__body__variable__input__column"></div>
                          </>
                        ) : (
                          <>
                            <div className="BulkWhatsAppTemplate__body__variable__input__column">
                              <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                {t("Field", {
                                  ns: ["whatsAppTemplatesModal"],
                                })}
                              </div>
                              <select
                                className="Wizy__input__select__1"
                                name={`field_${index}`}
                                onChange={handleHeaderVariableChange}
                                value={headerVariable.field}
                              >
                                {bodyVariableFields.map((field, k) => (
                                  <option value={field} key={field + k}>
                                    {t(field, {
                                      ns: ["whatsAppTemplatesModal"],
                                    })}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="BulkWhatsAppTemplate__body__variable__input__column">
                              <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                {t("Default", {
                                  ns: ["whatsAppTemplatesModal"],
                                })}
                              </div>
                              <input
                                type="text"
                                className="Wizy__input__2"
                                placeholder={
                                  component.example.header_text[index]
                                }
                                value={headerVariable.default}
                                onChange={handleHeaderVariableChange}
                                name={`default_${index}`}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                )}
              </>
            );
          } else if (
            component.format === "IMAGE" ||
            component.format === "VIDEO" ||
            component.format === "DOCUMENT"
          ) {
            return (
              <>
                <div
                  className="Wizy__input__title"
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {t("Header", {
                    ns: ["whatsAppTemplatesModal"],
                  })}
                </div>
                <div className="BulkWhatsAppTemplate__body__variable__container">
                  <div className="WhatsAppTemplate__body__variable__title__outter">
                    <div className="WhatsAppTemplate__body__variable__title">
                      {component.format === "IMAGE"
                        ? t("Image", {
                            ns: ["whatsAppTemplatesModal"],
                          })
                        : component.format === "VIDEO"
                          ? t("Video", {
                              ns: ["whatsAppTemplatesModal"],
                            })
                          : t("Document", {
                              ns: ["whatsAppTemplatesModal"],
                            })}
                    </div>
                  </div>
                  <div className="WhatsAppTemplate__body__variable__input__outter">
                    {component.file === null ? (
                      <input
                        type="file"
                        accept={
                          component.format === "IMAGE"
                            ? ".jpg,.jpeg,.png"
                            : component.format === "VIDEO"
                              ? ".mp4"
                              : ".pdf"
                        }
                        onChange={handleAttachHeaderFile}
                      />
                    ) : (
                      <div className="Tags__input__containers">
                        <div className="Tag__element">
                          {component.file.name}
                          <span
                            className="Tag__remove__button"
                            onClick={() => removeHeaderFile()}
                          >
                            <svg
                              viewBox="0 0 14 14"
                              className="Tag__remove__icon"
                            >
                              <path d="M4 4l6 6m0-6l-6 6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          } else if (component.format === "LOCATION") {
            return (
              <>
                <div
                  className="Wizy__input__title"
                  style={{ fontSize: "14px", fontWeight: "bold" }}
                >
                  {t("Header", {
                    ns: ["whatsAppTemplatesModal"],
                  })}
                </div>
                <div className="Wizy__input__title">
                  {t("SelectLocation", {
                    ns: ["whatsAppTemplatesModal"],
                  })}
                </div>
                <APIProvider
                  apiKey={"AIzaSyDP6vv8MjneoWQP5VLoCTUk097xBzaIYis"}
                  onLoad={() => console.log("Maps API has loaded.")}
                >
                  <Map
                    style={{
                      width: "80%",
                      height: "150px",
                      margin: "auto",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }}
                    defaultZoom={13}
                    defaultCenter={{
                      lat: defaultLatitude,
                      lng: defaultLongitude,
                    }}
                    onClick={handleLocationChange}
                  >
                    <Marker
                      position={{
                        lat: component.latitude,
                        lng: component.longitude,
                      }}
                    ></Marker>
                  </Map>
                </APIProvider>
                <div className="BulkWhatsAppTemplate__body__variable__container">
                  <div className="WhatsAppTemplate__body__variable__title__outter">
                    <div className="WhatsAppTemplate__body__variable__title">
                      {t("Name", {
                        ns: ["whatsAppTemplatesModal"],
                      })}
                    </div>
                  </div>
                  <div className="WhatsAppTemplate__body__variable__input__outter">
                    <input
                      type="text"
                      className="Wizy__input__2"
                      value={component.name}
                      onChange={handleLocationNameChange}
                    />
                  </div>
                </div>
                <div className="BulkWhatsAppTemplate__body__variable__container">
                  <div className="WhatsAppTemplate__body__variable__title__outter">
                    <div className="WhatsAppTemplate__body__variable__title">
                      {t("Address", {
                        ns: ["whatsAppTemplatesModal"],
                      })}
                    </div>
                  </div>
                  <div className="WhatsAppTemplate__body__variable__input__outter">
                    <input
                      type="text"
                      className="Wizy__input__2"
                      value={component.address}
                      onChange={handleLocationAddressChange}
                    />
                  </div>
                </div>
              </>
            );
          } else {
            return <></>;
          }
        } else if (component.type === "BODY") {
          return (
            <>
              <div
                className="Wizy__input__title"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {t("Body", {
                  ns: ["whatsAppTemplatesModal"],
                })}
              </div>
              <textarea
                className="Wizy__textarea"
                disabled={true}
                value={component.text}
              ></textarea>
              {component.bodyVariables.length > 0 ? (
                <>
                  <div className="Wizy__input__title">
                    {t("BodyVariables", {
                      ns: ["whatsAppTemplatesModal"],
                    })}
                  </div>
                  {(component.bodyVariables as ITemplateVariable[]).map(
                    (bodyVariable, index) => (
                      <div className="BulkWhatsAppTemplate__body__variable__container">
                        <div className="WhatsAppTemplate__body__variable__title__outter">
                          <div className="WhatsAppTemplate__body__variable__title">
                            {`{{${index + 1}}}`}
                          </div>
                        </div>
                        <div className="BulkWhatsAppTemplate__body__variable__input__outter">
                          <div className="BulkWhatsAppTemplate__body__variable__input__column">
                            <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                              {t("Type", {
                                ns: ["whatsAppTemplatesModal"],
                              })}
                            </div>
                            <select
                              className="Wizy__input__select__1"
                              name={`type_${index}`}
                              onChange={handleBodyVariableChange}
                              value={bodyVariable.type}
                            >
                              <option value={"fixed"}>
                                {t("Fixed", {
                                  ns: ["whatsAppTemplatesModal"],
                                })}
                              </option>
                              <option value={"field"}>
                                {t("Field", {
                                  ns: ["whatsAppTemplatesModal"],
                                })}
                              </option>
                            </select>
                          </div>
                          {bodyVariable.type === "fixed" ? (
                            <>
                              <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                  {t("Value", {
                                    ns: ["whatsAppTemplatesModal"],
                                  })}
                                </div>
                                <input
                                  type="text"
                                  className="Wizy__input__2"
                                  placeholder={
                                    component.example?.body_text?.[0]?.[
                                      index
                                    ] ?? ""
                                  }
                                  value={bodyVariable.value}
                                  onChange={handleBodyVariableChange}
                                  name={`value_${index}`}
                                />
                              </div>
                              <div className="BulkWhatsAppTemplate__body__variable__input__column"></div>
                            </>
                          ) : (
                            <>
                              <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                  {t("Field", {
                                    ns: ["whatsAppTemplatesModal"],
                                  })}
                                </div>
                                <select
                                  className="Wizy__input__select__1"
                                  name={`field_${index}`}
                                  onChange={handleBodyVariableChange}
                                  value={bodyVariable.field}
                                >
                                  {bodyVariableFields.map((field, k) => (
                                    <option value={field} key={field + k}>
                                      {t(field, {
                                        ns: ["whatsAppTemplatesModal"],
                                      })}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                  {t("Default", {
                                    ns: ["whatsAppTemplatesModal"],
                                  })}
                                </div>
                                <input
                                  type="text"
                                  className="Wizy__input__2"
                                  placeholder={
                                    component.example?.body_text?.[0]?.[
                                      index
                                    ] ?? ""
                                  }
                                  value={bodyVariable.default}
                                  onChange={handleBodyVariableChange}
                                  name={`default_${index}`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          );
        } else if (component.type === "BUTTONS") {
          return (
            <>
              <div
                className="Wizy__input__title"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {t("Buttons", {
                  ns: ["whatsAppTemplatesModal"],
                })}
              </div>
              {component.buttons.map((button: any, bIndex: any) => {
                if (button.type === "URL") {
                  return (
                    <>
                      <div className="Wizy__input__title">
                        {`${button.text}`}
                      </div>
                      {/* Text and type of button */}
                      <div className="WhatsAppTemplate__bulk__button__container">
                        <div className="WhatsAppTemplate__button__title__outter">
                          <div className="WhatsAppTemplate__button__title">
                            {t("Type", {
                              ns: ["whatsAppTemplatesModal"],
                            })}
                          </div>
                        </div>
                        <div className="WhatsAppTemplate__button__title__outter">
                          {button.type}
                        </div>
                      </div>
                      {/* URL */}
                      <div className="WhatsAppTemplate__bulk__button__container">
                        <div className="WhatsAppTemplate__button__title__outter">
                          <div className="WhatsAppTemplate__button__title">
                            {`URL`}
                          </div>
                        </div>
                        <div className="WhatsAppTemplate__button__title__outter">
                          {button.url}
                        </div>
                      </div>
                      {urlVariableFields.length === 0 ? (
                        <>
                          {(button.buttonVariables as string[]).map(
                            (buttonVariable, bvIndex) => {
                              return (
                                <>
                                  <div className="WhatsAppTemplate__bulk__button__container">
                                    <div className="WhatsAppTemplate__button__title__outter">
                                      <div className="WhatsAppTemplate__button__title">
                                        {`{{${bvIndex + 1}}}`}
                                      </div>
                                    </div>
                                    <div className="WhatsAppTemplate__button__title__outter">
                                      <input
                                        type="text"
                                        className="Wizy__input__2"
                                        value={buttonVariable}
                                        onChange={handleButtonVariableChange}
                                        name={
                                          bIndex.toString() +
                                          "_" +
                                          bvIndex.toString()
                                        }
                                      />
                                    </div>
                                  </div>
                                </>
                              );
                            }
                          )}
                          {(button.buttonVariables as string[]).length > 0 ? (
                            <div className="BulkWhatsAppTemplate__discount__code__container">
                              <div className="WhatsAppTemplate__button__title__outter">
                                <div className="WhatsAppTemplate__button__title">
                                  {t("IncludeDiscountCode", {
                                    ns: ["whatsAppTemplatesModal"],
                                  })}
                                </div>
                              </div>
                              <div className="WhatsAppTemplate__button__title__outter">
                                <input
                                  type="text"
                                  className="Wizy__input__2"
                                  value={button.discountCode}
                                  onChange={handleUrlButtonDiscountCodeChange}
                                  name={bIndex.toString()}
                                />
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <>
                          {(button.buttonVariables as ITemplateVariable[]).map(
                            (buttonVariable, bvIndex) => {
                              return (
                                <div className="WhatsAppTemplate__bulk__button__container">
                                  <div className="WhatsAppTemplate__button__title__outter">
                                    <div className="WhatsAppTemplate__button__title">
                                      {`{{${bvIndex + 1}}}`}
                                    </div>
                                  </div>
                                  <div className="BulkWhatsAppTemplate__body__variable__input__outter">
                                    <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                      <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                        {t("Type", {
                                          ns: ["whatsAppTemplatesModal"],
                                        })}
                                      </div>
                                      <select
                                        className="Wizy__input__select__1"
                                        name={`type_${bIndex}_${bvIndex}`}
                                        onChange={
                                          handleButtonVariableWithFieldsChange
                                        }
                                        value={buttonVariable.type}
                                      >
                                        <option value={"fixed"}>
                                          {t("Fixed", {
                                            ns: ["whatsAppTemplatesModal"],
                                          })}
                                        </option>
                                        <option value={"field"}>
                                          {t("Field", {
                                            ns: ["whatsAppTemplatesModal"],
                                          })}
                                        </option>
                                      </select>
                                    </div>
                                    {buttonVariable.type === "fixed" ? (
                                      <>
                                        <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                          <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                            {t("Value", {
                                              ns: ["whatsAppTemplatesModal"],
                                            })}
                                          </div>
                                          <input
                                            type="text"
                                            className="Wizy__input__2"
                                            value={buttonVariable.value}
                                            onChange={
                                              handleButtonVariableWithFieldsChange
                                            }
                                            name={`value_${bIndex}_${bvIndex}`}
                                          />
                                        </div>
                                        <div className="BulkWhatsAppTemplate__body__variable__input__column"></div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                          <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                            {t("Field", {
                                              ns: ["whatsAppTemplatesModal"],
                                            })}
                                          </div>
                                          <select
                                            className="Wizy__input__select__1"
                                            name={`field_${bIndex}_${bvIndex}`}
                                            onChange={
                                              handleButtonVariableWithFieldsChange
                                            }
                                            value={buttonVariable.field}
                                          >
                                            {urlVariableFields.map(
                                              (field, k) => (
                                                <option
                                                  value={field}
                                                  key={field + k}
                                                >
                                                  {t(field, {
                                                    ns: [
                                                      "whatsAppTemplatesModal",
                                                    ],
                                                  })}
                                                </option>
                                              )
                                            )}
                                          </select>
                                        </div>
                                        <div className="BulkWhatsAppTemplate__body__variable__input__column">
                                          <div className="BulkWhatsAppTemplate__body__variable__input__column__title">
                                            {t("Default", {
                                              ns: ["whatsAppTemplatesModal"],
                                            })}
                                          </div>
                                          <input
                                            type="text"
                                            className="Wizy__input__2"
                                            value={buttonVariable.default}
                                            onChange={
                                              handleButtonVariableWithFieldsChange
                                            }
                                            name={`default_${bIndex}_${bvIndex}`}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                          {/* Discount Code */}
                          {(button.buttonVariables as ITemplateVariable[])
                            .length > 0 ? (
                            <div className="BulkWhatsAppTemplate__discount__code__container">
                              <div className="WhatsAppTemplate__button__title__outter">
                                <div className="WhatsAppTemplate__button__title">
                                  {t("IncludeDiscountCode", {
                                    ns: ["whatsAppTemplatesModal"],
                                  })}
                                </div>
                              </div>
                              <div
                                className="WhatsAppTemplate__button__title__outter"
                                style={{ paddingRight: "15px" }}
                              >
                                <input
                                  type="text"
                                  className="Wizy__input__2"
                                  value={button.discountCode}
                                  onChange={handleUrlButtonDiscountCodeChange}
                                  name={bIndex.toString()}
                                />
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="Wizy__input__title">
                        {`${button.text}`}
                      </div>
                      <div className="WhatsAppTemplate__bulk__button__container">
                        <div className="WhatsAppTemplate__button__title__outter">
                          <div className="WhatsAppTemplate__button__title">
                            {t("Type", {
                              ns: ["whatsAppTemplatesModal"],
                            })}
                          </div>
                        </div>
                        <div className="WhatsAppTemplate__button__title__outter">
                          {button.type}
                        </div>
                      </div>
                    </>
                  );
                }
              })}
            </>
          );
        } else if (component.type === "FOOTER") {
          return (
            <>
              <div
                className="Wizy__input__title"
                style={{ fontSize: "14px", fontWeight: "bold" }}
              >
                {t("Footer", {
                  ns: ["whatsAppTemplatesModal"],
                })}
              </div>
              <textarea
                className="Wizy__textarea"
                disabled={true}
                value={component.text}
              ></textarea>
            </>
          );
        } else {
          return <></>;
        }
      })}
    </>
  ) : (
    <></>
  );
};

// Default exported function
export default BulkWhatsAppTemplateForm;
