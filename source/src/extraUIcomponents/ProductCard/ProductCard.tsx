import React from "react";
import { IProductCardContent } from "../extraUIComponentTypes";

export type ProductCardLiveChatProps = {
  noImageImage: string;
  content: IProductCardContent;
  language: string;
};

export default function ProductCard(props: ProductCardLiveChatProps) {
  return (
    <React.Fragment>
      <div className="ProductCardLiveChat__outter">
        <div className="ProductCardLiveChat__inner">
          <div className="ProductCardLiveChat__image__outter">
            <img
              src={
                props.content.imageUrl
                  ? `${props.content.imageUrl}&width=150`
                  : props.noImageImage
              }
              alt="ProductCardLiveChat__image"
              className="ProductCardLiveChat__image"
            />
          </div>
          <div>
            <div className="ProductCardLiveChat__title__outter">
              <div className="ProductCardLiveChat__title">
                {props.content.title}{" "}
                {props.content.variantTitle
                  ? " - " + props.content.variantTitle
                  : ""}
              </div>
            </div>
            <div className="ProductCardLiveChat__price__outter">
              <div className="ProductCardLiveChat__price">
                {props.content.price}
              </div>
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
      </div>
    </React.Fragment>
  );
}
