// Import React Dependencies
import React, { FC, useEffect, useState } from "react";
import {
  EAddToCartStateActions,
  EExtraUIComponentTypes,
  ENewExtraUIComponentTypes,
  IAddToCartContent,
  IAddToCartExtraUIComponent,
  IExtraUIComponent,
  INewAddToCartExtraUIComponent,
  INewExtraUIComponent,
} from "../extraUIComponentTypes";
import { IMessage } from "../../types/MessageType";

// Declare types and interfaces
type Add2CartProps = {
  content: IAddToCartContent;
  extraUIComponentIndex: number;
  globalSelectedBackend: string;
  domain: string;
  shopifyRootPath: string | null;
  message: IMessage;
  language: string;
  isShopifyForeing: boolean;
  openCart: () => Promise<void>;
};

// Page main functional component
const Add2Cart: FC<Add2CartProps> = (props) => {
  const flat2CardinalIndex = (
    flatIndex: number,
    dimensions: number[]
  ): number[] => {
    const cardinalIndex = [];
    let remainder = flatIndex;
    for (let i = 0; i < dimensions.length; i++) {
      if (i === dimensions.length - 1) {
        cardinalIndex.push(remainder);
      } else {
        const denominator = dimensions.slice(i + 1).reduce((a, b) => a * b);
        const index = Math.floor(remainder / denominator);
        cardinalIndex.push(index);
        remainder = remainder - denominator * index;
      }
    }
    return cardinalIndex;
  };

  const getInitialSelectedOptionValues = (
    options: { name: string; values: string[] }[]
  ): number[] => {
    const dimensions = [];
    for (let i = 0; i < options.length; i++) {
      dimensions.push(options[i].values.length);
    }
    const firstNonZeroFlatIndex = infoArray
      .flat(dimensions.length)
      .findIndex((element: any) => element !== null);
    const firstNonZeroCardinalIndex = flat2CardinalIndex(
      firstNonZeroFlatIndex,
      dimensions
    );
    return firstNonZeroCardinalIndex;
  };

  const getDimensions = (
    options: {
      name: string;
      values: string[];
    }[]
  ): number[] => {
    const dimensions1 = [];
    for (let i = 0; i < options.length; i++) {
      dimensions1.push(options[i].values.length);
    }
    return dimensions1;
  };

  // Use State
  const [options, setOptions] = useState(props.content.options);
  const [infoArray, setInfoArray] = useState(props.content.infoArray);
  const [selectedOptionValues, setSelectedOptionValues] = useState<number[]>(
    getInitialSelectedOptionValues(props.content.options)
  );
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [maxQuantity, setMaxQuantiy] = useState<number>(0);

  const [stateAction, setStateAction] = useState<EAddToCartStateActions>(
    props.content.stateAction
  );
  const [stateSelection, setStateSelection] = useState(
    props.content.stateSelection
  );
  const dimensions = getDimensions(props.content.options);

  useEffect(() => {
    getSelectedOptionsMaximumQuantity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOptionValues]);

  // Internal functions
  const getAvailableOptionValues = (
    optionIndex: number,
    selectedOptionValues: number[]
  ): { name: string; index: number }[] => {
    // Get the subset of the info array including the depth indicated by the option index
    let subInfoArray = infoArray;
    for (let i = 0; i < optionIndex; i++) {
      subInfoArray = subInfoArray[selectedOptionValues[i]];
    }
    // Build the vector of available option values for an specific option index
    const availableOptionValuesIndexes: number[] = [];
    for (let i = 0; i < subInfoArray.length; i++) {
      // For every possible value of the current depth, get the subset below that value,
      // flatten it, and check if there is one that is not null.
      // If there is one, the option value is available
      if (Array.isArray(subInfoArray[i])) {
        let flatSubSubInfoArray = subInfoArray[i].flat(dimensions.length);
        const hasAvailability = flatSubSubInfoArray.some(
          (infoArrayValue: any) => infoArrayValue !== null
        );
        if (hasAvailability) {
          availableOptionValuesIndexes.push(i);
        }
      } else {
        if (subInfoArray[i] !== null) {
          availableOptionValuesIndexes.push(i);
        }
      }
    }
    const availableOptionValues: {
      name: string;
      index: number;
    }[] = [];
    options[optionIndex].values.map((optionValue, index) => {
      if (availableOptionValuesIndexes.includes(index)) {
        availableOptionValues.push({
          name: optionValue,
          index: index,
        });
      }
    });
    return availableOptionValues;
  };

  const handleSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = event.currentTarget;
    let newSelectedOptionValues = selectedOptionValues.map((prevValue, i) => {
      if (i === parseInt(name)) {
        return parseInt(value);
      } else {
        return prevValue;
      }
    });
    // Check if the current selected values are valid, if not chenge them
    newSelectedOptionValues = checkCurrentOptionsValues(
      newSelectedOptionValues,
      parseInt(name)
    );
    // Save the new valid selected values for each option
    setSelectedOptionValues(newSelectedOptionValues);
  };

  const checkCurrentOptionsValues = (
    newSelectedOptionValues: number[],
    optionIndex: number
  ): number[] => {
    // For each of the lower level options we checkt whether or not there is availability of such otion
    // if not we change it to the primary value
    for (let i = optionIndex + 1; i < dimensions.length; i++) {
      const availableOptionValues = getAvailableOptionValues(
        i,
        newSelectedOptionValues
      ).map((values) => values.index);
      if (!availableOptionValues.includes(newSelectedOptionValues[i])) {
        newSelectedOptionValues[i] = availableOptionValues[0];
      }
    }
    return newSelectedOptionValues;
  };

  // Helps you find the value for a nested array
  const getValueFromNestedArray = (
    nestedArray: any[],
    position: number[]
  ): any => {
    if (position.length === 1) {
      return nestedArray[position[0]];
    } else {
      const [head, ...tail] = position;
      return getValueFromNestedArray(nestedArray[head], tail);
    }
  };

  // Get maximum quantity
  const getSelectedOptionsMaximumQuantity = () => {
    const selectedVariantData = getValueFromNestedArray(
      infoArray,
      selectedOptionValues
    );
    setMaxQuantiy(selectedVariantData["quantityAvailable"]);
  };

  // Change desired quantity
  const updateQuantity = (action: string) => {
    if (action === "increase") {
      if (selectedQuantity === maxQuantity) {
        setSelectedQuantity(maxQuantity);
      } else {
        setSelectedQuantity(selectedQuantity + 1);
      }
    } else {
      if (selectedQuantity === 1) {
        setSelectedQuantity(1);
      } else {
        setSelectedQuantity(selectedQuantity - 1);
      }
    }
  };

  // Buy now selected variant
  const buyNow = async () => {
    // Get selected variant data
    const selectedVariantData = getValueFromNestedArray(
      infoArray,
      selectedOptionValues
    );
    // Extract variant Id
    const selectedVariantId = selectedVariantData["id"];
    // Get Quantity
    const selectedVariantQuantity = selectedQuantity;
    if (selectedQuantity > 0) {
      // Send request to cart.js
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        variantId: selectedVariantId,
        quantity: selectedVariantQuantity,
        unitPrice: parseFloat(selectedVariantData["price"]?.amount ?? "0"),
      });

      await fetch(
        props.globalSelectedBackend +
        "/shopifywidgetrest/buynowlink/" +
        props.domain +
        "/" +
        props.message.id,
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            let errorJSON = JSON.parse(errorText);
            throw new Error(errorJSON.message);
          } else {
            return response.text();
          }
        })
        .then((result) => JSON.parse(result))
        .then(async (JSONresult) => {
          await updateExtraUIComponentInBackend(EAddToCartStateActions.BOUGHT);
          window.open(JSONresult.link, "_top");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("Add something");
    }
  };

  const updateExtraUIComponentInBackend = async (
    stateAction: EAddToCartStateActions
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    if (props.message.extraUIComponents) {
      const newExtraUIComponent = {
        type: EExtraUIComponentTypes.ADD_TO_CART,
        content: props.content,
      };
      newExtraUIComponent.content.stateAction = stateAction;
      newExtraUIComponent.content.stateSelection = {
        selectedOptionValues: selectedOptionValues,
        selectedQuantity: selectedQuantity,
      };
      const raw = JSON.stringify({
        stringifiedExtraUIComponent: JSON.stringify(newExtraUIComponent),
        extraUIComponentIndex: props.extraUIComponentIndex,
      });
      await fetch(
        props.globalSelectedBackend +
        "/shopifywidgetrest/extrauicomponent/" +
        props.message.id,
        {
          method: "PUT",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            let errorJSON = JSON.parse(errorText);
            throw new Error(errorJSON.message);
          } else {
            return response.text();
          }
        })
        .then((result) => JSON.parse(result))
        .then((JSONresult) => {
          const updatedExtraUIComponents: IExtraUIComponent[] = JSON.parse(
            JSONresult.extraUIComponents
          );

          setStateAction(
            (
              updatedExtraUIComponents[
              props.extraUIComponentIndex
              ] as IAddToCartExtraUIComponent
            ).content.stateAction
          );
          setStateSelection(
            (
              updatedExtraUIComponents[
              props.extraUIComponentIndex
              ] as IAddToCartExtraUIComponent
            ).content.stateSelection
          );
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const newExtraUIComponent = {
        type: ENewExtraUIComponentTypes.ADD_TO_CART,
        title: props.content.title,
        productId: props.content.productId,
        productUrl: props.content.productUrl,
        imageUrl: props.content.imageUrl,
        imageAltText: props.content.imageAltText,
        options: props.content.options,
        infoArray: props.content.infoArray,
        stateAction: props.content.stateAction,
        stateSelection: props.content.stateSelection,
      };
      newExtraUIComponent.stateAction = stateAction;
      newExtraUIComponent.stateSelection = {
        selectedOptionValues: selectedOptionValues,
        selectedQuantity: selectedQuantity,
      };
      const raw = JSON.stringify({
        extraUIComponent: newExtraUIComponent,
        extraUIComponentIndex: props.extraUIComponentIndex,
      });

      await fetch(
        props.globalSelectedBackend +
        "/shopifywidgetrest/extrauicomponent/" +
        props.message.id,
        {
          method: "PUT",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        }
      )
        .then(async (response) => {
          if (!response.ok) {
            let errorText = await response.text();
            let errorJSON = JSON.parse(errorText);
            throw new Error(errorJSON.message);
          } else {
            return response.text();
          }
        })
        .then((result) => JSON.parse(result))
        .then((JSONresult) => {
          const updatedExtraUIComponents: INewExtraUIComponent[] =
            JSONresult.extraUIComponentReference;

          setStateAction(
            (
              updatedExtraUIComponents[
              props.extraUIComponentIndex
              ] as INewAddToCartExtraUIComponent
            ).stateAction
          );
          setStateSelection(
            (
              updatedExtraUIComponents[
              props.extraUIComponentIndex
              ] as INewAddToCartExtraUIComponent
            ).stateSelection
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Buy now selected variant
  const add2Cart = async () => {
    // Get selected variant data
    const selectedVariantData = getValueFromNestedArray(
      infoArray,
      selectedOptionValues
    );
    // Extract variant Id
    const selectedVariantId = selectedVariantData["id"];
    // Get Quantity
    const selectedVariantQuantity = selectedQuantity;
    // Check if there is a selected quantity
    if (selectedQuantity > 0) {
      // Send request to cart.js
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      let formData = {
        items: [
          {
            id: parseInt(selectedVariantId.split("/").pop()),
            quantity: selectedVariantQuantity,
          },
        ],
      };

      if (props.shopifyRootPath !== null) {
        await fetch(props.shopifyRootPath + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then(async (response) => {
            await updateExtraUIComponentInBackend(
              EAddToCartStateActions.ADDED_TO_CART
            );
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        console.log("not in shopify");
      }
    }
  };

  function currencyFormat(price: number, currency: string) {
    // Check if the number has decimal places
    const hasDecimals = price % 1 !== 0;

    // Format the number with or without decimals
    const formattedNum =
      hasDecimals ||
        currency === "USD" ||
        currency === "EUR" ||
        currency === "GBP" ||
        currency === "CAD" ||
        currency === "AUD"
        ? price.toFixed(2)
        : price.toFixed(0);

    // Add commas for thousands separators
    return "$" + formattedNum.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  // JSX Return statement
  return (
    <React.Fragment>
      <div className="WizybotShopifyAdd2Cart__add__message__outter">
        {stateAction === EAddToCartStateActions.NONE ? (
          <div
            className="WizybotShopifyAdd2Cart__add__message__inner"
            style={{
              color: "black",
            }}
          >
            <div className="WizybotShopifyAdd2Cart__add__product__outter">
              <div className="WizybotShopifyAdd2Cart__add__product__image__outter">
                <img
                  src={props.content.imageUrl + "&&width=150"}
                  alt="WizybotShopifyAdd2Cart__add__product__image"
                  className="WizybotShopifyAdd2Cart__add__product__image"
                />
              </div>
              <div className="WizybotShopifyAdd2Cart__add__product__name__outter">
                <a
                  className="WizybotShopifyAdd2Cart__add__prouct__name__inner"
                  href={props.content.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {props.content.title}
                </a>
                <div className="WizybotShopifyAdd2Cart__add__prouct__sku__inner">
                  ID: {props.content.productId.split("/").pop()}
                </div>
                <a
                  href={props.content.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <div className="">
                    {props.language === "English"
                      ? "View details"
                      : props.language === "Spanish"
                        ? "Ver detalles"
                        : props.language === "French"
                          ? "Voir les détails"
                          : props.language === "Portuguese"
                            ? "Ver detalhes"
                            : props.language === "German"
                              ? "Details anzeigen"
                              : props.language === "Italian"
                                ? "Visualizza dettagli"
                                : "View details"}
                  </div>
                </a>
              </div>
            </div>
            <div className="WizybotShopifyAdd2Cart__add__product__options__outter__outter">
              {props.content.options.length === 1 &&
                props.content.options[0].values.length === 1 &&
                props.content.options[0].values[0] === "Default Title"
                ? ""
                : props.content.options.map((option: any, optionIndex) => {
                  return (
                    <div
                      className="AWizybotShopifyAdd2Cart__add__product__option__outter"
                      key={option.name + "_" + optionIndex}
                    >
                      <div className="WizybotShopifyAdd2Cart__add__product__option__name">
                        {option.name}:
                      </div>
                      <div className="WizybotShopifyAdd2Cart__add__product__option__variants__outter">
                        <div className="WizybotShopifyAdd2Cart__input__select__outter">
                          <select
                            className="WizybotShopifyAdd2Cart__input__select"
                            name={optionIndex.toString()}
                            value={selectedOptionValues[optionIndex]}
                            onChange={handleSelectChange}
                          >
                            {getAvailableOptionValues(
                              optionIndex,
                              selectedOptionValues
                            ).map(
                              (optionValue: {
                                name: string;
                                index: number;
                              }) => {
                                return (
                                  <option
                                    value={optionValue.index}
                                    key={optionValue.toString()}
                                  >
                                    {optionValue.name}
                                  </option>
                                );
                              }
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              <div className="WizybotShopifyAdd2Cart__quantity__price__outter">
                <div className="WizybotShopifyAdd2Cart__add__product__quantity__outter__outter">
                  <div className="WizybotShopifyAdd2Cart__add__product__quantity__outter">
                    <div className="WizybotShopifyAdd2Cart__add__product__option__quantity__outter">
                      <div></div>
                      <div
                        onClick={() => {
                          updateQuantity("decrease");
                        }}
                        className="WizybotShopifyAdd2Cart__add__product__option__quantity__image__outter"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="WizybotShopifyAdd2Cart__add__product__option__quantity__image"
                        >
                          <path
                            d="M19.1111 12.7778H4.88889C4.40296 12.7778 4 12.3748 4 11.8889C4 11.403 4.40296 11 4.88889 11H19.1111C19.597 11 20 11.403 20 11.8889C20 12.3748 19.597 12.7778 19.1111 12.7778Z"
                            fill="#222251"
                          />
                        </svg>
                      </div>{" "}
                      <div className="WizybotShopifyAdd2Cart__add__product__option__quantity__counter">
                        {selectedQuantity}
                      </div>
                      <div
                        onClick={() => {
                          updateQuantity("increase");
                        }}
                        className="WizybotShopifyAdd2Cart__add__product__option__quantity__image__outter"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="WizybotShopifyAdd2Cart__add__product__option__quantity__image"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M11.1111 19.1111C11.1111 19.597 11.5141 20 12 20C12.4859 20 12.8889 19.597 12.8889 19.1111V12.8889H19.1111C19.597 12.8889 20 12.4859 20 12C20 11.5141 19.597 11.1111 19.1111 11.1111H12.8889V4.88889C12.8889 4.40296 12.4859 4 12 4C11.5141 4 11.1111 4.40296 11.1111 4.88889V11.1111H4.88889C4.40296 11.1111 4 11.5141 4 12C4 12.4859 4.40296 12.8889 4.88889 12.8889H11.1111V19.1111Z"
                            fill="#222251"
                          />
                        </svg>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
                <div className="WizybotShopifyAdd2Cart__price__outter">
                  <div className="WizybotShopifyAdd2Cart__price__inner">
                    {currencyFormat(
                      getValueFromNestedArray(infoArray, selectedOptionValues)[
                        "price"
                      ].amount * selectedQuantity,
                      getValueFromNestedArray(infoArray, selectedOptionValues)[
                        "price"
                      ].currencyCode
                    )}
                  </div>
                  <div className="WizybotShopifyAdd2Cart__currency__inner">
                    {
                      getValueFromNestedArray(infoArray, selectedOptionValues)[
                        "price"
                      ].currencyCode
                    }
                  </div>
                </div>
              </div>
            </div>
            <div
              className="WizybotShopifyAdd2Cart__add__product__buttons__outter__outter"
              style={{
                gridTemplateColumns: props.isShopifyForeing
                  ? "100%"
                  : "calc(50% - 5px) calc(50% - 5px)",
              }}
            >
              {!props.isShopifyForeing ? (
                <div>
                  <div className="WizybotShopifyAdd2Cart__add__product__buttons__outter">
                    <button
                      disabled={props.shopifyRootPath === null}
                      className="WizybotShopifyAdd2Cart__add__to__cart__button"
                      style={{ width: "100%" }}
                      onClick={add2Cart}
                    >
                      {props.language === "English"
                        ? "Add to cart"
                        : props.language === "Spanish"
                          ? "Añadir al carrito"
                          : props.language === "French"
                            ? "Ajouter au panier"
                            : props.language === "Portuguese"
                              ? "Adicionar ao carrinho"
                              : props.language === "German"
                                ? "In den Warenkorb"
                                : props.language === "Italian"
                                  ? "Aggiungi al carrello"
                                  : "Add to cart"}
                    </button>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <div>
                <div className="WizybotShopifyAdd2Cart__add__product__buttons__outter">
                  <button
                    disabled={selectedQuantity <= 0}
                    className="WizybotShopifyAdd2Cart__buy__now__button"
                    style={{ width: "100%" }}
                    onClick={buyNow}
                  >
                    {props.language === "English"
                      ? "Buy Now"
                      : props.language === "Spanish"
                        ? "Comprar ahora"
                        : props.language === "French"
                          ? "Acheter maintenant"
                          : props.language === "Portuguese"
                            ? "Comprar agora"
                            : props.language === "German"
                              ? "Jetzt kaufen"
                              : props.language === "Italian"
                                ? "Compra ora"
                                : "Buy Now"}
                  </button>
                </div>
              </div>
            </div>{" "}
          </div>
        ) : stateAction === EAddToCartStateActions.BOUGHT ? (
          <div
            className="WizybotShopifyAdd2Cart__add__message__inner"
            style={{
              color: "black",
            }}
          >
            <div className="WizybotShopifyAdd2Cart__add__message__inner__inner">
              {props.language === "English"
                ? "You have been redirected to the checkout page. In case the redirection didn't work, please click this link:"
                : props.language === "Spanish"
                  ? "Has sido redirigido a la página de pago. En caso de que la redirección no haya funcionado, por favor haz clic en este enlace:"
                  : props.language === "French"
                    ? "Vous avez été redirigé vers la page de paiement. Si la redirection n'a pas fonctionné, veuillez cliquer sur ce lien :"
                    : props.language === "Portuguese"
                      ? "Você foi redirecionado para a página de checkout. Caso o redirecionamento não tenha funcionado, por favor clique neste link:"
                      : props.language === "German"
                        ? "Sie wurden zur Checkout-Seite weitergeleitet. Falls die Weiterleitung nicht funktioniert hat, klicken Sie bitte auf diesen Link:"
                        : props.language === "Italian"
                          ? "Sei stato reindirizzato alla pagina di pagamento. Se il reindirizzamento non ha funzionato, per favore clicca su questo link:"
                          : "You have been redirected to the checkout page. In case the redirection didn't work, please click this link:"}{" "}
              <span
                onClick={props.openCart}
                className="WizybotShopifyAdd2Cart__add__prouct__details__inner"
              >
                {props.language === "English"
                  ? "Checkout"
                  : props.language === "Spanish"
                    ? "Pagar"
                    : props.language === "French"
                      ? "Paiement"
                      : props.language === "Portuguese"
                        ? "Finalizar compra"
                        : props.language === "German"
                          ? "Zur Kasse"
                          : props.language === "Italian"
                            ? "Cassa"
                            : "Checkout"}
              </span>
            </div>
          </div>
        ) : stateAction === EAddToCartStateActions.ADDED_TO_CART ? (
          <div
            className="WizybotShopifyAdd2Cart__add__message__inner"
            style={{
              color: "black",
            }}
          >
            {" "}
            <div className="WizybotShopifyAdd2Cart__add__message__inner__inner">
              {props.language === "English"
                ? "The product has been added to your cart. If you want to buy something else, just let me know. If not, please finalize your purchase by clicking this link:"
                : props.language === "Spanish"
                  ? "El producto ha sido añadido a tu carrito. Si quieres comprar algo más, solo avísame. Si no, por favor finaliza tu compra haciendo clic en este enlace:"
                  : props.language === "French"
                    ? "Le produit a été ajouté à votre panier. Si vous souhaitez acheter autre chose, faites-le moi savoir. Sinon, veuillez finaliser votre achat en cliquant sur ce lien :"
                    : props.language === "Portuguese"
                      ? "O produto foi adicionado ao seu carrinho. Se você quiser comprar outra coisa, é só me avisar. Se não, finalize sua compra clicando neste link:"
                      : props.language === "German"
                        ? "Das Produkt wurde Ihrem Warenkorb hinzugefügt. Wenn Sie etwas anderes kaufen möchten, lassen Sie es mich einfach wissen. Wenn nicht, bitte schließen Sie Ihren Einkauf ab, indem Sie auf diesen Link klicken:"
                        : props.language === "Italian"
                          ? "Il prodotto è stato aggiunto al tuo carrello. Se vuoi acquistare qualcos'altro, fammelo sapere. Altrimenti, per favore finalizza il tuo acquisto cliccando su questo link:"
                          : "The product has been added to your cart. If you want to buy something else, just let me know. If not, please finalize your purchase by clicking this link:"}{" "}
              <span
                onClick={props.openCart}
                className="WizybotShopifyAdd2Cart__add__prouct__details__inner"
              >
                {props.language === "English"
                  ? "Go to Cart"
                  : props.language === "Spanish"
                    ? "Ir al carrito"
                    : props.language === "French"
                      ? "Aller au panier"
                      : props.language === "Portuguese"
                        ? "Ir para o carrinho"
                        : props.language === "German"
                          ? "Zum Warenkorb"
                          : props.language === "Italian"
                            ? "Vai al carrello"
                            : "Go to Cart"}
              </span>
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
export default Add2Cart;
