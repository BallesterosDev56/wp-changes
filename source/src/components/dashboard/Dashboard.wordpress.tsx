import { useEffect, useState } from "react";
import LoginDashboardWordpress from "./LoginDashboard.wordpress";
import "../types/WizybotWindow";

// Import media
import wizy_loader from "../../images/ui/Loader.gif";

export function DashboardApp() {
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Autologin
    const checkStatus = async () => {
      const {
        isAlreadyInstalled,
        shopToken: token,
        globalSelectedBackend,
        shopDomain,
        hasWooCommerce,
        wooCommerceSuccess,
      } = window.wizybot;

      console.log("isAlreadyInstalled: ", isAlreadyInstalled);
      console.log("token: ", token);
      console.log("hasWooCommerce", hasWooCommerce);
      console.log("wooCommerceSuccess: ", wooCommerceSuccess);

      if (
        isAlreadyInstalled &&
        token &&
        (!hasWooCommerce || wooCommerceSuccess)
      ) {
        const deeplink = `${globalSelectedBackend}/wordpress?shop_domain=${shopDomain}&shop_token=${token}`;
        window.location.href = deeplink;
        return;
      }

      setIsChecking(false);
    };

    checkStatus();
  }, []);

  if (isChecking) {
    return (
      <div className="tw-class relative w-full min-h-svh bg-neutral-white flex justify-center items-center">
        <img src={wizy_loader} className="h-24" alt="loader" />
      </div>
    );
  }

  return (
    <>
      <LoginDashboardWordpress
        shopDomain={window.wizybot.shopDomain}
        shopMainDomain={window.wizybot.shopMainDomain}
        shopName={window.wizybot.shopName}
        shopEmail={window.wizybot.shopEmail}
        hasWooCommerce={window.wizybot.hasWooCommerce}
        isAlreadyExists={window.wizybot.isAlreadyInstalled}
        appUUID={window.wizybot.appUUID}
        siteUrl={window.wizybot.siteUrl}
      ></LoginDashboardWordpress>
    </>
  );
}
