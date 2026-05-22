import React from "react";
import ReactDOM from "react-dom/client";
import ShopifyWidgetWrapper from "./components/ShopifyWidgetWrapper";

const dataDiv = document.getElementById("wizydiv");

const root = ReactDOM.createRoot(dataDiv as HTMLElement);

const data = dataDiv?.dataset;

root.render(
  <ShopifyWidgetWrapper
    isTest={false}
    isAdmin={false}
    isRelative={false}
    isDashboard={false}
    domain={data?.shopdomain || ""}
    ipRegistryKey={data?.ipregistrykey || ""}
    globalSelectedBackend={data?.globalselectedbackend || ""}
    chatProfileImage={data?.chatprofileimage || ""}
    curvyBorderImage={data?.curvyborderimage || ""}
    wizyLogoImage={data?.wizylogoimage || ""}
    noImageImage={data?.noimageimage || ""}
    widgetLoader={data?.widgetloader || ""}
    stylesPathOutter={data?.stylespathoutter || ""}
    stylesPathInner={data?.stylespathinner || ""}
    shopifyRootPath={data?.shopifyrootpath || ""}
    shopifyCurrentPath={data?.shopifycurrentpath || ""}
    isShopifyForeing={data?.isshopifyforeing === "true" ? true : false || false}
    marketId={data?.marketid || ""}
    languageCode={data?.languagecode || ""}
    languageUrl={data?.languageurl || ""}
    platform="SHOPIFY"
  />,
);
