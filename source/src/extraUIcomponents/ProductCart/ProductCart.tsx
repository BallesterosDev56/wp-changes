import React from "react";
import {
  getNewExtraUIComponentTitle,
  INewClientProductCartExtraUIComponent,
} from "../extraUIComponentTypes";
import {
  discountDictionaryProductCart,
  goToCartDictionaryProductCart,
  goToCheckoutDictionaryProductCart,
  quantityDictionaryProductCart,
  totalDictionaryProductCart,
} from "./dictionary";
import { currencyFormat } from "../../utils/shared";

export type ProductCartProps = {
  noImageImage: string;
  content: INewClientProductCartExtraUIComponent;
  language: string;
};

export default function ProductCart(props: ProductCartProps) {
  return (
    <React.Fragment>
      <div className="ProductCart__outter">
        <div className="ProductCart__inner">
          <div className="ProductCart__title">
            {getNewExtraUIComponentTitle(props.content, props.language)}
          </div>

          {props.content.items.map((item) => {
            return (
              <div className="ProductCart__item">
                <div className="ProductCart__item__image">
                  <img
                    src={
                      item.imageUrl
                        ? `${item.imageUrl}&width=150`
                        : props.noImageImage
                    }
                  />
                  <div className="ProductCart__item__details">
                    <span className="ProductCart__item__details__title">
                      {item.displayName}
                    </span>
                    <span className="ProductCart__item__price">
                      {currencyFormat(
                        item.unitPrice,
                        props.content.currencyCode,
                      )}{" "}
                      {props.content.currencyCode}
                    </span>

                    <div className="ProductCart__item__quantity">
                      <div>
                        {quantityDictionaryProductCart[props.language] ||
                          "Quantity"}
                        : {item.quantity}
                      </div>

                      <div className="ProductCart__item__quantity__total">
                        {currencyFormat(
                          item.unitPrice * item.quantity,
                          props.content.currencyCode,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {props.content.appliedDiscount && (
            <div className="ProductCart__total">
              <div>
                {discountDictionaryProductCart[props.language] || "Discount"}
                :{" "}
              </div>
              <div
                className="ProductCart__item__quantity__total"
                style={{ color: "red" }}
              >
                -
                {props.content.appliedDiscount.valueType === "PERCENTAGE"
                  ? `${props.content.appliedDiscount.value}%`
                  : currencyFormat(
                      props.content.appliedDiscount.value,
                      props.content.currencyCode,
                    )}
              </div>
            </div>
          )}

          <div className="ProductCart__total">
            <div>{totalDictionaryProductCart[props.language] || "Total"}: </div>
            <div className="ProductCart__item__quantity__total">
              {currencyFormat(props.content.total, props.content.currencyCode)}
            </div>
          </div>

          <div className="ProductCart__buttons">
            <button
              className="ProductCart__button__secondary"
              onClick={() => window.open(props.content.cartUrl, "_blank")}
            >
              {props.content.isDraftOrder
                ? goToCheckoutDictionaryProductCart[props.language] ||
                  "Go to Checkout"
                : goToCartDictionaryProductCart[props.language] || "Go to Cart"}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
