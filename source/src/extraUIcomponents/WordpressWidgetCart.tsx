// Import React Dependencies
import React, { FC, useEffect, useState } from 'react';
import { ICart } from '../components/WidgetTypes';

type ShopifyWidgetCartProps = {
  cart: ICart;
  updateCart: (cartToUpdate: ICart) => Promise<void>;
  language: string;
  agentName: string;
  closeCart: () => Promise<void>;
  languageUrl?: string;
};

// Page main functional component
const WordpressWidgetCart: FC<ShopifyWidgetCartProps> = (props) => {
  // Use state
  const [cartToUpdate, setCartToUpdate] = useState<ICart>(props.cart);
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout>();

  // Use effect functions
  useEffect(() => {
    if (JSON.stringify(props.cart) !== JSON.stringify(cartToUpdate)) {
      clearTimeout(updateTimeout);
      setUpdateTimeout(
        setTimeout(() => {
          props.updateCart(cartToUpdate);
        }, 1000),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartToUpdate]);

  // Internl functions
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity >= 0) {
      setCartToUpdate((prevState) => ({
        ...prevState,
        items: prevState.items.map((prevItem) => {
          if (prevItem.id === id) {
            return {
              id: prevItem.id,
              quantity: quantity,
              productTitle: prevItem.productTitle,
              variantTitle: prevItem.variantTitle,
              linePrice: prevItem.linePrice,
              image: prevItem.image,
              url: prevItem.url,
            };
          } else {
            return prevItem;
          }
        }),
      }));
    }
  };

  function currencyFormat(price: number, currency: string) {
    // Check if the number has decimal
    // eslint-disable-next-line
    const formatedMoney = eval('Shopify.formatMoney(' + price + ')');

    // Add commas for thousands separators
    return formatedMoney;
  }

  // JSX Return statement
  return (
    <React.Fragment>
      <div>
        {cartToUpdate !== null ? (
          <div>
            <div className="WizybotShopifyWidget__cart__outter__products">
              {cartToUpdate.items.length > 0 ? (
                <div className="WizybotShopifyWidget__cart__inner__products">
                  {cartToUpdate.items.map((item: any) => {
                    return (
                      <div className="WizybotShopifyWidget__cart__product__outter">
                        <div className="WizybotShopifyWidget__cart__add__product__outter">
                          <div className="WizybotShopifyWidget__cart__add__product__image__outter">
                            <img
                              src={item.image}
                              alt="WizybotShopifyWidget__cart__add__product__image"
                              className="WizybotShopifyWidget__cart__add__product__image"
                            />
                          </div>
                          <div className="WizybotShopifyWidget__cart__add__product__name__outter">
                            <div className="WizybotShopifyWidget__cart__add__prouct__name__inner">
                              {item.productTitle}
                            </div>
                            <div className="WizybotShopifyWidget__cart__add__prouct__sku__inner">
                              {item.variantTitle !== '' &&
                              item.variantTitle !== null
                                ? item.variantTitle
                                : props.language === 'English'
                                  ? 'Unique'
                                  : props.language === 'Spanish'
                                    ? 'Único'
                                    : props.language === 'French'
                                      ? 'Unique'
                                      : props.language === 'Portuguese'
                                        ? 'Único'
                                        : props.language === 'German'
                                          ? 'Einzigartig'
                                          : props.language === 'Italian'
                                            ? 'unico'
                                            : 'Unique'}
                            </div>
                            <div className="WizybotShopifyWidget__cart__add__prouct__quantity__delete">
                              <div className="WizybotShopifyWidget__cart__add__product__option__quantity__outter">
                                <div></div>
                                <div
                                  onClick={() => {
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1,
                                    );
                                  }}
                                  className="WizybotShopifyWidget__cart__add__product__option__quantity__image__outter"
                                >
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="WizybotShopifyWidget__cart__add__product__option__quantity__image"
                                  >
                                    <path
                                      d="M19.1111 12.7778H4.88889C4.40296 12.7778 4 12.3748 4 11.8889C4 11.403 4.40296 11 4.88889 11H19.1111C19.597 11 20 11.403 20 11.8889C20 12.3748 19.597 12.7778 19.1111 12.7778Z"
                                      fill="#222251"
                                    />
                                  </svg>
                                </div>{' '}
                                <div className="WizybotShopifyWidget__cart__add__product__option__quantity__counter">
                                  {item.quantity}
                                </div>
                                <div
                                  onClick={() => {
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1,
                                    );
                                  }}
                                  className="WizybotShopifyWidget__cart__add__product__option__quantity__image__outter"
                                >
                                  <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="WizybotShopifyWidget__cart__add__product__option__quantity__image"
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="WizybotShopifyWidget__cart__outter__no__products">
                  {props.language === 'English'
                    ? "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"
                    : props.language === 'Spanish'
                      ? '¡Hola! Parece que no has añadido nada a tu carrito, ¿por qué no nos pides algunas recomendaciones?'
                      : props.language === 'French'
                        ? "Bonjour! Il semble que vous n'avez rien ajouté à votre panier, pourquoi ne pas nous demander des recommandations?"
                        : props.language === 'Portuguese'
                          ? 'Olá! Parece que você não adicionou nada ao seu carrinho, por que não nos pede algumas recomendações?'
                          : props.language === 'German'
                            ? 'Hallo! Es scheint, dass Sie nichts in Ihren Warenkorb gelegt haben. Warum fragen Sie uns nicht nach einigen Empfehlungen?'
                            : props.language === 'Italian'
                              ? 'Ciao! Sembra che tu non abbia aggiunto nulla al carrello, perché non ci chiedi qualche consiglio?'
                              : "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"}
                  <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                    <button
                      className="WizybotShopifyWidget__cart__inner__estimated__no__products__button"
                      style={{ width: '100%' }}
                      onClick={props.closeCart}
                    >
                      {props.language === 'English'
                        ? 'Chat with'
                        : props.language === 'Spanish'
                          ? 'Habla con'
                          : props.language === 'French'
                            ? 'Parler avec'
                            : props.language === 'Portuguese'
                              ? 'Conversar com'
                              : props.language === 'German'
                                ? 'Chatten Sie mit'
                                : props.language === 'Italian'
                                  ? 'Chat con'
                                  : 'Chat with'}{' '}
                      {props.agentName}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="WizybotShopifyWidget__cart__outter__checkout">
              <div className="WizybotShopifyWidget__cart__outter__estimated">
                <div className="WizybotShopifyWidget__cart__inner__estimated">
                  {props.language === 'English'
                    ? 'Estimated total'
                    : props.language === 'Spanish'
                      ? 'Total estimado'
                      : props.language === 'French'
                        ? 'Total estimé'
                        : props.language === 'Portuguese'
                          ? 'Total estimado'
                          : props.language === 'German'
                            ? 'Geschätzte Gesamtsumme'
                            : props.language === 'Italian'
                              ? 'Totale stimato'
                              : 'Estimated total'}
                </div>{' '}
                <div className="WizybotShopifyWidget__cart__inner__estimated__price">
                  {currencyFormat(
                    cartToUpdate.totalPrice,
                    cartToUpdate.currency,
                  )}
                </div>
              </div>
              <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                <a
                  href={
                    props.languageUrl && props.languageUrl !== '/'
                      ? props.languageUrl + '/cart'
                      : '/cart'
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <button
                    className="WizybotShopifyWidget__cart__inner__estimated__button"
                    style={{ width: '100%' }}
                  >
                    {props.language === 'English'
                      ? 'Pay'
                      : props.language === 'Spanish'
                        ? 'Pagar'
                        : props.language === 'French'
                          ? 'Payer'
                          : props.language === 'Portuguese'
                            ? 'Pagar'
                            : props.language === 'German'
                              ? 'Bezahlen'
                              : props.language === 'Italian'
                                ? 'Pagare'
                                : 'Pay'}
                  </button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="WizybotShopifyWidget__cart__outter__products">
              <div className="WizybotShopifyWidget__cart__outter__no__products">
                {props.language === 'English'
                  ? "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"
                  : props.language === 'Spanish'
                    ? '¡Hola! Parece que no has añadido nada a tu carrito, ¿por qué no nos pides algunas recomendaciones?'
                    : props.language === 'French'
                      ? "Bonjour! Il semble que vous n'avez rien ajouté à votre panier, pourquoi ne pas nous demander des recommandations?"
                      : props.language === 'Portuguese'
                        ? 'Olá! Parece que você não adicionou nada ao seu carrinho, por que não nos pede algumas recomendações?'
                        : props.language === 'German'
                          ? 'Hallo! Es scheint, dass Sie nichts in Ihren Warenkorb gelegt haben. Warum fragen Sie uns nicht nach einigen Empfehlungen?'
                          : props.language === 'Italian'
                            ? 'Ciao! Sembra che tu non abbia aggiunto nulla al carrello, perché non ci chiedi qualche consiglio?'
                            : "Hello there! It seems you have not added anything to your cart, why don't you ask us for some recommendations?"}
                <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                  <button
                    className="WizybotShopifyWidget__cart__inner__estimated__no__products__button"
                    style={{ width: '100%' }}
                    onClick={props.closeCart}
                  >
                    {props.language === 'English'
                      ? 'Chat with'
                      : props.language === 'Spanish'
                        ? 'Habla con'
                        : props.language === 'French'
                          ? 'Parler avec'
                          : props.language === 'Portuguese'
                            ? 'Conversar com'
                            : props.language === 'German'
                              ? 'Chatten Sie mit'
                              : props.language === 'Italian'
                                ? 'Chat con'
                                : 'Chat with'}{' '}
                    {props.agentName}
                  </button>
                </div>
              </div>
            </div>
            <div className="WizybotShopifyWidget__cart__outter__checkout">
              <div className="WizybotShopifyWidget__cart__outter__estimated">
                <div className="WizybotShopifyWidget__cart__inner__estimated">
                  {props.language === 'English'
                    ? 'Estimated total'
                    : props.language === 'Spanish'
                      ? 'Total estimado'
                      : props.language === 'French'
                        ? 'Total estimé'
                        : props.language === 'Portuguese'
                          ? 'Total estimado'
                          : props.language === 'German'
                            ? 'Geschätzte Gesamtsumme'
                            : props.language === 'Italian'
                              ? 'Totale stimato'
                              : 'Estimated total'}
                </div>{' '}
                <div className="WizybotShopifyWidget__cart__inner__estimated__price">
                  $0.00
                </div>
              </div>
              <div className="WizybotShopifyWidget__cart__inner__estimated__button__outter">
                <a
                  href={
                    props.languageUrl && props.languageUrl !== '/'
                      ? props.languageUrl + '/cart'
                      : '/cart'
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <button
                    className="WizybotShopifyWidget__cart__inner__estimated__button"
                    style={{ width: '100%' }}
                  >
                    {props.language === 'English'
                      ? 'Pay'
                      : props.language === 'Spanish'
                        ? 'Pagar'
                        : props.language === 'French'
                          ? 'Payer'
                          : props.language === 'Portuguese'
                            ? 'Pagar'
                            : props.language === 'German'
                              ? 'Bezahlen'
                              : props.language === 'Italian'
                                ? 'Pagare'
                                : 'Pay'}
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

// Default exported function
export default WordpressWidgetCart;
