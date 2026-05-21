// Import React Dependencies
import { FC, useEffect, useState } from "react";
import React from "react";
import ReactIframe from "./ReactIframe";
import Cookies from "universal-cookie";
import ShopifyWidget, {
  EDataRetrievalType,
  EEmailRetrievalMethod,
  ELimitBudgetAction,
  EMainLanguage,
  ESide,
  IWidgetVariables,
} from "./ShopifyWidget";
import { IWidgetMessage } from "../types/MessageType";

// Declare types and interfaces
export type IShopifyWidgetWrapperProps = {
  domain: string;
  isRelative: boolean;
  ipRegistryKey: string;
  globalSelectedBackend: string;
  chatProfileImage: string;
  curvyBorderImage: string;
  wizyLogoImage: string;
  noImageImage: string;
  widgetLoader: string;
  stylesPathInner: string;
  stylesPathOutter: string;
  shopifyRootPath: string | null;
  shopifyCurrentPath: string | null;
  isShopifyForeing: boolean;
  isDashboard: boolean;
  isTest: boolean;
  isAdmin: boolean;
  marketId?: string;
  languageCode?: string;
  languageUrl?: string;
  platform?: string;
  wizyCartId?: string;
  onMessagesUpdate?: (messages: IWidgetMessage[]) => void;
};

// Page main functional component
const ShopifyWidgetWrapper: FC<IShopifyWidgetWrapperProps> = ({
  domain,
  isRelative,
  ipRegistryKey,
  globalSelectedBackend,
  chatProfileImage,
  curvyBorderImage,
  wizyLogoImage,
  noImageImage,
  widgetLoader,
  stylesPathInner,
  stylesPathOutter,
  shopifyRootPath,
  shopifyCurrentPath,
  isShopifyForeing,
  isDashboard,
  isTest,
  isAdmin,
  marketId,
  languageCode,
  languageUrl,
  platform,
  wizyCartId,
  onMessagesUpdate,
}) => {
  // Use state
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(isRelative);
  const [width, setWidth] = useState<number>(80);
  const [widget, setWidget] = useState<IWidgetVariables>({
    domain: "",
    setup: {
      primaryColor: "",
      secondaryColor: "",
      fontColor: "",
      agentName: "",
      onlinePhrase: "",
      mainLanguage: EMainLanguage.ENGLISH,
      side: ESide.RIGHT,
      paddingBottom: 0,
      paddingSide: 0,
      image: "",
      isVisible: false,
      emailRetrievalMethod: EEmailRetrievalMethod.NONE,
      dataRetrievalType: EDataRetrievalType.EMAIL,
      dataRetrievalCustomPrompt: "",
      isRedirect: false,
      redirectionLink: "",
      isOverLimitBudget: false,
      limitBudgetAction: ELimitBudgetAction.REDIRECT,
      limitBudgetRedirectionLink: "",
      hideNotificationSign: false,
      hideWizybotBanner: false,
      hideOutboundMessage: false,
      preventSaleNoteCreation: false,
      customWidgetCode: "",
      pagesToExcludeWidget: "",
      defaultCountryCode: "CO",
    },
  });
  const [shouldShow, setShouldShow] = useState<boolean>(true);
  const [isRedirect, setIsRedirect] = useState<boolean>(false);
  const [redirectionLink, setRedirectionLink] = useState<string>("");
  const [actualDate, setActualDate] = useState<number>(0);
  const cookies = new Cookies();

  // Use Effect Functions
  useEffect(() => {
    initializeUrlParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Internal functions
  // Check url parameters and update sale options and cookies
  const initializeUrlParameters = async () => {
    // Check for params in the url
    const urlParams = new URLSearchParams(window.location.search);
    // Client conversation param
    const wizyClient = urlParams.get("wizyclient");
    // Referral from another Wizybot channel param
    const wizyReferral = urlParams.get("wizyreferral");

    // If there is a wizyclient parameter
    if (wizyClient !== null) {
      // Associate current shopify cart id with sale from the referral client
      createSaleOption(wizyClient);

      // Remove client id
      cookies.remove(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
        {
          path: "/",
        },
      );
      // Set the new one
      cookies.set(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
        wizyClient,
        {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        },
      );
      // Remove super client id
      cookies.remove("WIZY_SUPERCLIENT_" + domain, {
        path: "/",
      });
      // Set the new one
      const clientSuperClientId = await clientId2SuperClientId(wizyClient);
      if (clientSuperClientId) {
        // Set it as cookie
        cookies.set("WIZY_SUPERCLIENT_" + domain, clientSuperClientId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      }
    }

    // If there is a wizyreferral
    if (wizyReferral !== null) {
      // Associate current shopify cart id with sale from the referral client
      createSaleOption(wizyReferral);

      // Get cookies
      const superClientCookie = cookies.get("WIZY_SUPERCLIENT_" + domain);
      const clientCookie = cookies.get(
        isAdmin ? "WIZY_CLIENT_ADMIN_" + domain : "WIZY_CLIENT_" + domain,
      );

      // If no client has been previously created on the webpage chat
      if (clientCookie === undefined && superClientCookie === undefined) {
        // Get referral client's superclient id
        const referralSuperClientId =
          await clientId2SuperClientId(wizyReferral);
        if (referralSuperClientId) {
          // Set it as cookie
          cookies.set("WIZY_SUPERCLIENT_" + domain, referralSuperClientId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
      }

      // If there was already a client created
      else if (clientCookie) {
        // Merge the superclients of referral client and webpage client
        const mergedSuperClientId = await mergeSuperClientByClientId(
          wizyReferral,
          clientCookie,
        );
        // If there was an old superclient cookie remove it
        if (superClientCookie) {
          cookies.remove("WIZY_SUPERCLIENT_" + domain, {
            path: "/",
          });
        }
        // Set the merged superclient id as the new superclient cookie
        if (mergedSuperClientId) {
          cookies.set("WIZY_SUPERCLIENT_" + domain, mergedSuperClientId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
      }

      // If there is no webpage client but there is a superclient cookie, it means that there was
      // a previous referral and the two referral channels can be linked if they are different
      else if (superClientCookie) {
        const oldReferralSuperClientId = superClientCookie;
        const newReferralSuperClientId =
          await clientId2SuperClientId(wizyReferral);
        if (
          newReferralSuperClientId &&
          newReferralSuperClientId !== oldReferralSuperClientId
        ) {
          const mergedSuperClientId = await mergeSuperClientBySuperClientId(
            newReferralSuperClientId,
            oldReferralSuperClientId,
          );
          if (mergedSuperClientId) {
            cookies.remove("WIZY_SUPERCLIENT_" + domain, {
              path: "/",
            });
            cookies.set("WIZY_SUPERCLIENT_" + domain, mergedSuperClientId, {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            });
          }
        }
      }
    }
    getWidgetVariables();
  };

  // Get widget variables based on the domain
  const getWidgetVariables = async () => {
    const url = new URL(
      `${globalSelectedBackend}/shops/${domain}/widgetvariables`,
    );
    if (marketId) url.searchParams.append("marketId", marketId);
    if (languageCode) url.searchParams.append("languageCode", languageCode);

    await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      redirect: "follow",
    })
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
        setWidget({
          domain: JSONresult.domain,
          setup: {
            primaryColor: JSONresult.setup.primaryColor,
            secondaryColor: JSONresult.setup.secondaryColor,
            fontColor: JSONresult.setup.fontColor,
            agentName: JSONresult.setup.agentName,
            onlinePhrase: JSONresult.setup.onlinePhrase,
            mainLanguage: JSONresult.setup.mainLanguage,
            side: JSONresult.setup.side,
            paddingBottom: +JSONresult.setup.paddingBottom,
            paddingSide: +JSONresult.setup.paddingSide,
            image:
              JSONresult.setup.image !== "Default"
                ? globalSelectedBackend !== "https://api.wizybot.com"
                  ? "" +
                    JSONresult.setup.image +
                    "?nocache=" +
                    new Date()[Symbol.toPrimitive]("number")
                  : "" +
                    JSONresult.setup.image +
                    "?nocache=" +
                    new Date()[Symbol.toPrimitive]("number")
                : "",
            isVisible: JSONresult.setup.isVisible,
            emailRetrievalMethod: JSONresult.setup.emailRetrievalMethod,
            dataRetrievalType: JSONresult.setup.dataRetrievalType,
            dataRetrievalCustomPrompt:
              JSONresult.setup.dataRetrievalCustomPrompt,
            isRedirect: JSONresult.setup.isRedirect,
            redirectionLink: JSONresult.setup.redirectionLink,
            isOverLimitBudget: JSONresult.setup.isOverLimitBudget,
            limitBudgetAction: JSONresult.setup.limitBudgetAction,
            limitBudgetRedirectionLink:
              JSONresult.setup.limitBudgetRedirectionLink,
            hideNotificationSign: JSONresult.setup.hideNotificationSign,
            hideWizybotBanner: JSONresult.setup.hideWizybotBanner,
            hideOutboundMessage: JSONresult.setup.hideOutboundMessage,
            preventSaleNoteCreation: JSONresult.setup.preventSaleNoteCreation,
            customWidgetCode: JSONresult.setup.customWidgetCode,
            pagesToExcludeWidget: JSONresult.setup.pagesToExcludeWidget,
            defaultCountryCode: JSONresult.setup.defaultCountryCode,
          },
        });
        // The widget should be shown if:
        var shouldShowWidget =
          isDashboard ||
          (JSONresult.setup.isVisible &&
            (shopifyCurrentPath === null ||
            JSONresult.setup.pagesToExcludeWidget === null
              ? true
              : !JSONresult.setup.pagesToExcludeWidget
                  .split(",")
                  .some((pageToExclude: string) =>
                    shopifyCurrentPath.includes(pageToExclude),
                  )));
        // Initially widget should not redirect
        var shouldRedirect = false;
        var redirectionLink = "";
        // But in case is not in the dashboard
        if (!isDashboard) {
          // The widget should be redirecting if is redirect flag
          shouldRedirect = JSONresult.setup.isRedirect;

          // The widget should redirect to this link
          redirectionLink = JSONresult.setup.redirectionLink;

          // Check limit budgests and what to do if over the limit
          if (JSONresult.setup.isOverLimitBudget) {
            if (JSONresult.setup.limitBudgetAction === "widget off") {
              shouldShowWidget = false;
            }
            if (JSONresult.setup.limitBudgetAction === "redirect") {
              shouldRedirect = true;
              redirectionLink = JSONresult.setup.limitBudgetRedirectionLink;
            }
          }
          // Extract actualWidgetVersion from JSONresult
          const actualWidgetVersion = JSONresult.actualWidgetVersion;

          // Extract version from noImageImage URL
          const noImageImageUrl = noImageImage;
          const regex = /extensions\/([^/]+)\/([^/]+)\/assets/;
          const match = noImageImageUrl.match(regex);

          if (match && match[1] && match[2] && actualWidgetVersion) {
            const extractedUuid = match[1];
            const extractedVersion: any = match[2];

            // Extract numeric parts of the versions
            const actualVersionNumber = parseInt(
              actualWidgetVersion.split("-").pop(),
              10,
            );

            const extractedVersionNumber = parseInt(
              extractedVersion.split("-").pop(),
              10,
            );

            // Compare versions and post if actualWidgetVersion is greater
            if (actualVersionNumber < extractedVersionNumber) {
              postWidgetVersion(extractedVersion, extractedUuid);
            }
          }
        }
        // Set vairables in state
        setRedirectionLink(redirectionLink);
        setShouldShow(shouldShowWidget);
        setIsRedirect(shouldRedirect);
        setActualDate(new Date().getTime());
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Update actual widget version in the back
  const postWidgetVersion = async (
    actualWidgetVersion: string,
    actualWidgetVUuid: string,
  ) => {
    try {
      const response = await fetch(
        `${globalSelectedBackend}/shopifywidgetrest/updatewidgetversion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actualWidgetVersion,
            actualWidgetVUuid,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log("Widget version updated successfully:", result.message);
    } catch (error) {
      console.error("Error updating widget version:", error);
    }
  };

  // Create a sale option for a possible referral
  const createSaleOption = async (clientId: string) => {
    if (shopifyRootPath !== null && shopifyRootPath !== "" && !isDashboard) {
      await fetch(shopifyRootPath + "cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attributes: { wizybot: true },
          note: widget.setup.preventSaleNoteCreation ? "" : "Wizybot sale!",
        }),
      })
        .then(async (response) => {
          await fetch(shopifyRootPath + "cart.js", {
            method: "GET",
          })
            .then((response) => {
              return response.json();
            })
            .then(async (data) => {
              var raw = JSON.stringify({
                cartId: data.token.split("?")[0],
              });
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              await fetch(
                globalSelectedBackend +
                  "/sale/" +
                  domain +
                  "/" +
                  clientId +
                  "/createsale",
                {
                  method: "POST",
                  headers: myHeaders,
                  body: raw,
                  credentials: "include",
                  redirect: "follow",
                },
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
                .then((JSONresult) => {})
                .catch((error) => {
                  console.log("Error:", error);
                });
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else if (platform === "WORDPRESS" && !isDashboard) {
      try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        await fetch(
          globalSelectedBackend + "/sale/" + domain + "/" + clientId + "/createsale",
          {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({ cartId: wizyCartId || null }),
            credentials: "include",
            redirect: "follow",
          }
        );
      } catch (error) {
        console.error("Error creating WordPress sale:", error);
      }
    }
  };

  // Gets Id from super client
  const clientId2SuperClientId = async (
    clientId: string,
  ): Promise<string | undefined> => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch(
        globalSelectedBackend +
          "/superclients/clientid2superclientid/" +
          clientId,
        {
          method: "GET",
          headers: myHeaders,
          credentials: "include",
          redirect: "follow",
        },
      );
      if (!response.ok) {
        let errorText = await response.text();
        console.log(errorText);
      } else {
        return await response.text();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Merges super client by client id
  const mergeSuperClientByClientId = async (
    referralClientId: string,
    webpageClientId: string,
  ): Promise<string | undefined> => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        fromClientId: referralClientId,
        toClientId: webpageClientId,
      });

      const response = await fetch(
        globalSelectedBackend + "/superclients/mergebyclientids/",
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        },
      );
      if (!response.ok) {
        let errorText = await response.text();
        console.log(errorText);
      } else {
        return await response.text();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Merges super client by super client id
  const mergeSuperClientBySuperClientId = async (
    referralSuperClientId: string,
    webpageSuperClientId: string,
  ): Promise<string | undefined> => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        fromSuperClientId: referralSuperClientId,
        toSuperClientId: webpageSuperClientId,
      });

      const response = await fetch(
        globalSelectedBackend + "/superclients/mergebysuperclientids/",
        {
          method: "POST",
          headers: myHeaders,
          body: raw,
          credentials: "include",
          redirect: "follow",
        },
      );
      if (!response.ok) {
        let errorText = await response.text();
        console.log(errorText);
      } else {
        return await response.text();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show new message
  const showNewMessage = () => {
    if (!isOpen) {
      setWidth(280);
    }
  };

  // Hide new message
  const hideNewMessage = () => {
    if (!isOpen) {
      setWidth(80);
    }
  };

  // JSX Return statement
  if (isLoaded) {
    return !shouldShow ? (
      <></>
    ) : (
      <React.Fragment>
        {/* Import styles outside the iFrame */}
        <link
          rel="stylesheet"
          href={
            isRelative
              ? stylesPathOutter + "?randomID=" + actualDate
              : stylesPathOutter
          }
        />
        <div
          id="WizybotShopifyWidget__data__div"
          data-storesetup={JSON.stringify(widget)}
        ></div>
        {/* Insert iframe */}
        <ReactIframe
          iframetitle="wizybot-chat-iframe"
          className={
            isRelative
              ? "WizybotShopifyWidget__iframe__outter__open__relative"
              : isOpen
                ? widget.setup.side === ESide.RIGHT
                  ? "WizybotShopifyWidget__iframe__outter__open__right"
                  : "WizybotShopifyWidget__iframe__outter__open__left"
                : "WizybotShopifyWidget__iframe__outter__close"
          }
          id="WizybotShopifyWidget__iframe__outter__id"
          style={{
            right: !isOpen
              ? widget.setup.side === ESide.RIGHT
                ? widget.setup.paddingSide
                : "calc(100% - " + (widget.setup.paddingSide + width) + "px)"
              : "",
            bottom: !isOpen ? widget.setup.paddingBottom : "",
            width: !isOpen ? width + "px" : "",
            height: !isOpen ? "80px" : "",
          }}
        >
          <div>
            {/* Import styles */}
            <link
              rel="stylesheet"
              href={
                isRelative
                  ? stylesPathInner + "?randomID=" + actualDate
                  : stylesPathInner
              }
            />
            {/* Import fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link
              href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
              rel="stylesheet"
            />
            {/* Call the actual shopify widget component */}
            <ShopifyWidget
              domain={domain}
              widget={widget}
              isTest={isTest}
              isAdmin={isAdmin}
              isDashboard={isDashboard}
              isRelative={isRelative}
              ipRegistryKey={ipRegistryKey}
              globalSelectedBackend={globalSelectedBackend}
              chatProfileImage={chatProfileImage}
              curvyBorderImage={curvyBorderImage}
              wizyLogoImage={wizyLogoImage}
              noImageImage={noImageImage}
              widgetLoader={widgetLoader}
              shopifyRootPath={shopifyRootPath}
              shopifyCurrentPath={
                shopifyCurrentPath === null ? "/" : shopifyCurrentPath
              }
              isShopifyForeing={isShopifyForeing}
              isRedirect={isRedirect}
              redirectionLink={redirectionLink}
              showNewMessage={showNewMessage}
              hideNewMessage={hideNewMessage}
              setIsOpen={setIsOpen}
              marketId={marketId}
              languageCode={languageCode}
              languageUrl={languageUrl}
              platform={platform}
              wizyCartId={wizyCartId}
              onMessagesUpdate={onMessagesUpdate}
            />
          </div>
        </ReactIframe>
      </React.Fragment>
    );
  } else {
    return <></>;
  }
};

// Default exported function
export default ShopifyWidgetWrapper;
