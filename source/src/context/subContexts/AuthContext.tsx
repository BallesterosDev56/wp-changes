// Import React Dependencies
import { FC, createContext, useContext, useState } from "react";

// Import general dependencies
import Cookies from "universal-cookie";

// Declare types and interfaces
import {
  emptyIUser,
  IUser,
  IUserShopRoleRecord,
} from "../../types/UserType";
import { IShop, emptyIShop } from "../../types/ShopType";
import { IPropsContext } from "../AppProviders";
import { IRole } from "../../types/AuthorizationType";
import { parseJsonResponse } from "../../utils/utils.ts";

export interface IAuthContext {
  globalSelectedBackend: string;
  globalUser: IUser;
  globalShop: IShop;
  authCheck: () => Promise<{
    isLogged: boolean;
    isFirstTime: boolean;
    isUninstalled: boolean;
    needsSyncOrSetup: boolean;
    isSuperAdminUser: boolean;
    isRootUser: boolean;
    role: IRole | undefined;
  }>;
  authenticate: (
    userId: string,
    password: string
  ) => Promise<{
    status: boolean;
    message: string;
    isFirstTime: boolean;
    isSuperAdminUser: boolean;
    isRootUser: boolean;
    role: IRole | undefined;
  }>;
  changePassword: (
    newPassword: string,
    confirmedPassword: string
  ) => Promise<{
    status: boolean;
    message: string;
  }>;
  setNewGlobalShop: (newShopDomain: string) => Promise<Boolean>;
  logOut: () => Promise<boolean>;
}

// Create auth context
export const AuthContext = createContext<IAuthContext | null>(null);

// Page main functional component
const AuthContextProvider: FC<IPropsContext> = ({ children }) => {
  const globalSelectedBackend =
    process.env.REACT_APP_BACKEND_GATEWAY || "https://localhost:3001";
  const [globalUser, setGlobalUser] = useState<IUser>(emptyIUser);
  const [globalShop, setGlobalShop] = useState<IShop>(emptyIShop);

  const cookies = new Cookies();

  const authCheck = async () => {
    let logged = false;
    let isFirstTime = true;
    let isUninstalled = false;
    let needsSyncOrSetup = false;
    let isSuperAdminUser = false;
    let isRootUser = false;
    let role: IRole | undefined;
    try {
      const authResponse = await fetch(globalSelectedBackend + "/", {
        method: "GET",
        credentials: "include",
        redirect: "follow",
      });
      const user: IUser = await parseJsonResponse(authResponse);
      // DEBUG
      console.log("AUTH CHECK USER", user);

      logged = true;
      isFirstTime = user.isFirstTime;
      isSuperAdminUser = user.isSuperAdminUser;
      isRootUser = user.isRootUser;


      if (user.relatedShops && user.relatedShops.length > 0) {
        // If there is an uninstalled shop, set it as the global shop and set isUninstalled to true
        const uninstalledShop = user.relatedShops.find(
          (shop: IShop) => shop.status === "uninstalled"
        );
        if (uninstalledShop) {
          setGlobalShop(uninstalledShop);
          role = user.userShopRoleRecords?.find(
            (record: IUserShopRoleRecord) =>
              record.shop.id === uninstalledShop.id
          )?.role;
          cookies.set("shop", uninstalledShop.domain, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
          isUninstalled = true;
        } else {
          // If there is no uninstalled shop, check if there is a shop that needs setup or sync, and set it as the global shop and set needsSyncOrSetup to true
          const needsSetupOrSyncShop = user.relatedShops.find(
            (shop: IShop) => shop.needsSetup || shop.needsSync
          );
          if (needsSetupOrSyncShop) {
            setGlobalShop(needsSetupOrSyncShop);
            role = user.userShopRoleRecords?.find(
              (record: IUserShopRoleRecord) =>
                record.shop.id === needsSetupOrSyncShop.id
            )?.role;
            cookies.set("shop", needsSetupOrSyncShop.domain, {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            });
            needsSyncOrSetup = true;
          } else {
            // If there is no shop that needs setup or sync, check if the cookie shop is in the user's related shops, and set it as the global shop
            const cookieShop = user.relatedShops.find(
              (shop: IShop) => shop.domain === cookies.get("shop")
            );
            if (cookieShop) {
              setGlobalShop(cookieShop);
              role = user.userShopRoleRecords?.find(
                (record: IUserShopRoleRecord) =>
                  record.shop.id === cookieShop.id
              )?.role;
            } else {
              // If there is no shop that needs setup or sync, and the cookie shop is not in the user's related shops, set the first shop as the global shop
              setGlobalShop(user.relatedShops[0]);
              role = user.userShopRoleRecords?.find(
                (record: IUserShopRoleRecord) =>
                  record.shop.id === user.relatedShops![0].id
              )?.role;
              cookies.set("shop", user.relatedShops![0].domain, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
              });
            }
          }
        }
      } else {
        if (!user.isSuperAdminUser) {
          logOut();
        }
      }
      setGlobalUser({
        id: user.id,
        name: user.name,
        email: user.email,
        isFirstTime: user.isFirstTime,
        isActiveUser: user.isActiveUser,
        createDate: user.createDate,
        isAiAgent: user.isAiAgent,
        isSuperAdminUser: user.isSuperAdminUser,
        isRootUser: user.isRootUser,
        userShopRoleRecords: user.userShopRoleRecords,
        relatedShops: user.relatedShops,
        departmentUserRecords: user.departmentUserRecords,
      });
    } catch (error) {
      console.log(error);
      logged = false;
    }
    return {
      isLogged: logged,
      isFirstTime,
      isUninstalled,
      needsSyncOrSetup,
      isSuperAdminUser,
      isRootUser,
      role,
    };
  };

  const authenticate = async (email: string, password: string) => {
    let logged = false;
    let message = "";
    let isFirstTime = false;
    let isUninstalled = false;
    let needsSyncOrSetup = false;
    let isSuperAdminUser: boolean | undefined = false;
    let isRootUser: boolean | undefined = false;
    let role: IRole | undefined;
    try {
      const loginResponse = await fetch(globalSelectedBackend + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
        redirect: "follow",
      });

      const user: IUser = await parseJsonResponse(loginResponse);
      // DEBUG
      console.log("AUTHENTICATE USER", user);

      logged = true;
      isFirstTime = user.isFirstTime;
      isSuperAdminUser = user.isSuperAdminUser;
      isRootUser = user.isRootUser;

      if (user.relatedShops && user.relatedShops.length > 0) {
        // If there is an uninstalled shop, set it as the global shop and set isUninstalled to true
        const uninstalledShop = user.relatedShops.find(
          (shop: IShop) => shop.status === "uninstalled"
        );
        if (uninstalledShop) {
          setGlobalShop(uninstalledShop);
          role = user.userShopRoleRecords?.find(
            (record: IUserShopRoleRecord) =>
              record.shop.id === uninstalledShop.id
          )?.role;
          cookies.set("shop", uninstalledShop.domain, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
          isUninstalled = true;
        } else {
          // If there is no uninstalled shop, check if there is a shop that needs setup or sync, and set it as the global shop and set needsSyncOrSetup to true
          const needsSetupOrSyncShop = user.relatedShops.find(
            (shop: IShop) => shop.needsSetup || shop.needsSync
          );
          if (needsSetupOrSyncShop) {
            setGlobalShop(needsSetupOrSyncShop);
            role = user.userShopRoleRecords?.find(
              (record: IUserShopRoleRecord) =>
                record.shop.id === needsSetupOrSyncShop.id
            )?.role;
            cookies.set("shop", needsSetupOrSyncShop.domain, {
              path: "/",
              maxAge: 60 * 60 * 24 * 365,
            });
            needsSyncOrSetup = true;
          } else {
            // If there is no shop that needs setup or sync, check if the cookie shop is in the user's related shops, and set it as the global shop
            const cookieShop = user.relatedShops.find(
              (shop: IShop) => shop.domain === cookies.get("shop")
            );
            if (cookieShop) {
              setGlobalShop(cookieShop);
              role = user.userShopRoleRecords?.find(
                (record: IUserShopRoleRecord) =>
                  record.shop.id === cookieShop.id
              )?.role;
            } else {
              // If there is no shop that needs setup or sync, and the cookie shop is not in the user's related shops, set the first shop as the global shop
              setGlobalShop(user.relatedShops[0]);
              role = user.userShopRoleRecords?.find(
                (record: IUserShopRoleRecord) =>
                  record.shop.id === user.relatedShops![0].id
              )?.role;
              cookies.set("shop", user.relatedShops![0].domain, {
                path: "/",
                maxAge: 60 * 60 * 24 * 365,
              });
            }
          }
        }
      } else {
        if (!user.isSuperAdminUser) {
          logOut();
        }
      }
      setGlobalUser({
        id: user.id,
        name: user.name,
        email: user.email,
        isFirstTime: user.isFirstTime,
        isActiveUser: user.isActiveUser,
        createDate: user.createDate,
        isAiAgent: user.isAiAgent,
        isSuperAdminUser: user.isSuperAdminUser,
        isRootUser: user.isRootUser,
        userShopRoleRecords: user.userShopRoleRecords,
        relatedShops: user.relatedShops,
        departmentUserRecords: user.departmentUserRecords,
      });
    } catch (error) {
      logged = false;
      message = JSON.stringify(error);
    }
    return {
      status: logged,
      message,
      isFirstTime,
      isUninstalled,
      needsSyncOrSetup,
      isSuperAdminUser,
      isRootUser,
      role,
    };
  };

  const changePassword = async (
    newPassword: string,
    confirmedPassword: string
  ) => {
    var changed = false;
    var message = "";
    await fetch(globalSelectedBackend + "/changepassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, confirmedPassword }),
      credentials: "include",
      redirect: "follow",
    })
      .then(async (response) => {
        if (!response.ok) {
          let errorText = await response.text();
          let errorJSON = JSON.parse(errorText);
          throw new Error(errorJSON.message);
        } else {
          changed = true;
        }
      })
      .catch((error) => {
        changed = false;
        message = error.message;
      });
    return { status: changed, message };
  };

  const setNewGlobalShop = async (newShopDomain: string) => {
    let foundShop = false;
    if (globalUser.relatedShops !== null) {
      globalUser.relatedShops?.forEach((shop: IShop) => {
        if (shop.domain === newShopDomain) {
          setGlobalShop(shop);
          cookies.set("shop", shop.domain, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
          foundShop = true;
        }
      });
    }
    return foundShop;
  };

  const logOut = async () => {
    let loggedout = false;
    await fetch(globalSelectedBackend + "/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          loggedout = true;
          setGlobalUser(emptyIUser);
          setGlobalShop(emptyIShop);
        }
      })
      .catch(() => {
        loggedout = false;
      });
    return loggedout;
  };

  return (
    <AuthContext.Provider
      value={{
        globalSelectedBackend,
        globalUser,
        globalShop,
        authCheck,
        authenticate,
        changePassword,
        setNewGlobalShop,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContextProvider;
