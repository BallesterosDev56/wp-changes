import React, { FC, useState } from "react";
import {
  IOldRecommendationCarouselContent,
  IRecommendationCarouselContent,
} from "../extraUIComponentTypes";

// Declare types and interfaces
type RecommendationCarouselProps = {
  content: IRecommendationCarouselContent | IOldRecommendationCarouselContent;
  language: string;
  platform?: string;
};

// Page main functional component
const RecommendationCarousel: FC<RecommendationCarouselProps> = (props) => {
  return (
    <React.Fragment>
      <div className="WizybotShopifyRecommendationCarousel__outter">
        <div
          className="WizybotShopifyRecommendationCarousel__inner"
          style={{
            color: "black",
          }}
        >
          {
            // NEW RECOMMENDATION CAROUSEL FORMAT
            "cards" in props.content
              ? props.content.cards.map((card) => {
                  return (
                    <div className="WizybotShopifyRecommendationCarousel__product__outter">
                      <div className="WizybotShopifyRecommendationCarousel__add__product__outter">
                        <div className="WizybotShopifyRecommendationCarousel__add__product__image__outter">
                          {card.type === "product" ? (
                            <img
                              src={
                                props.platform === "WORDPRESS"
                                  ? card.imageUrl
                                  : `${card.imageUrl}&width=150`
                              }
                              alt="WizybotShopifyRecommendationCarousel__add__product__image"
                              className="WizybotShopifyRecommendationCarousel__add__product__image"
                            />
                          ) : card.imageUrls.length === 1 ? (
                            <img
                              src={
                                card.imageUrls[0] +
                                (props.platform === "WORDPRESS"
                                  ? ""
                                  : "&&width=150")
                              }
                              alt="WizybotShopifyRecommendationCarousel__add__product__image"
                              className="WizybotShopifyRecommendationCarousel__add__product__image"
                            />
                          ) : (
                            <div className="WizybotShopifyRecommendationCarousel__add__collection__image__container">
                              {card.imageUrls.map((imageUrl) => (
                                <img
                                  src={
                                    imageUrl +
                                    (props.platform === "WORDPRESS"
                                      ? ""
                                      : "&&width=150")
                                  }
                                  alt="WizybotShopifyRecommendationCarousel__add__collection__image"
                                  className="WizybotShopifyRecommendationCarousel__add__collection__image"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="WizybotShopifyRecommendationCarousel__add__product__name__outter">
                          <a
                            className="WizybotShopifyRecommendationCarousel__add__prouct__name__inner"
                            href={card.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {card.title}
                          </a>
                          {card.type === "product" ? (
                            <div className="WizybotShopifyRecommendationCarousel__add__prouct__sku__inner">
                              {card.price}
                            </div>
                          ) : (
                            <></>
                          )}
                          <a
                            href={card.redirectUrl}
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
                  );
                })
              : // OLD RECOMMENDATION CAROUSEL FORMAT
                props.content.recommendations.map((recommendation) => {
                  return (
                    <div className="WizybotShopifyRecommendationCarousel__product__outter">
                      <div className="WizybotShopifyRecommendationCarousel__add__product__outter">
                        <div className="WizybotShopifyRecommendationCarousel__add__product__image__outter">
                          <img
                            src={
                              recommendation.imageUrl +
                              (props.platform === "WORDPRESS"
                                ? ""
                                : "&&width=150")
                            }
                            alt="WizybotShopifyRecommendationCarousel__add__product__image"
                            className="WizybotShopifyRecommendationCarousel__add__product__image"
                          />
                        </div>
                        <div className="WizybotShopifyRecommendationCarousel__add__product__name__outter">
                          <a
                            className="WizybotShopifyRecommendationCarousel__add__prouct__name__inner"
                            href={recommendation.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {recommendation.title}
                          </a>

                          <div className="WizybotShopifyRecommendationCarousel__add__prouct__sku__inner">
                            {recommendation.price}
                          </div>

                          <a
                            href={recommendation.redirectUrl}
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
                  );
                })
          }
        </div>
      </div>
    </React.Fragment>
  );
};

// Default exported function
export default RecommendationCarousel;
