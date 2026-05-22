// Import React Dependencies
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Import media
import wizy_loader from '../../images/ui/Loader.gif';

import { ReactComponent as WizyLogo } from '../../images/logos/Logo.svg';
import { ReactComponent as UiLeft } from '../../images/ui/LoginUILeft.svg';
import { ReactComponent as UiCenter } from '../../images/ui/LoginUICenter.svg';
import { ReactComponent as UiBottom } from '../../images/ui/LoginUIBottom.svg';
import { ReactComponent as InputPerson } from '../../images/icons/Person.svg';
import { ReactComponent as InputPassword } from '../../images/icons/Locked.svg';
import { ReactComponent as ArrowRight } from '../../images/icons/Chevron.svg';

// Import styles
import InputWithIcon from '../../components/atoms/InputWithIcon';
import WizyButton from '../../components/atoms/WizyButton';
import AutoCarousel from '../../pages/login/components/AutoCarousel';

// Declare types and interfaces
enum ELoginPromt {
  initial,
  error,
  loading,
}

interface LoginDashboardWordpressProps {
  appUUID: string;
  shopName?: string;
  shopDomain?: string;
  shopEmail?: string;
  shopMainDomain?: string;
  hasWooCommerce?: boolean;
  isAlreadyExists?: boolean;
  siteUrl?: string;
}

// Page main functional component
const LoginDashboardWordpress: FC<LoginDashboardWordpressProps> = ({
  shopEmail,
  shopDomain,
  shopName,
  shopMainDomain,
  hasWooCommerce,
  appUUID,
  isAlreadyExists,
}) => {
  // Steps and States
  const [viewState, setViewState] = useState<
    'CHECKING' | 'LOGIN' | 'REGISTER' | 'REGISTER_WOO' | 'LOADING'
  >('CHECKING');

  // Use translation
  const { t } = useTranslation(['login']);

  // Use state variables
  const [email, setEmail] = useState<string>(shopEmail || '');
  const [password, setPassword] = useState<string>('');
  const [currentShopName, setCurrentShopName] = useState<string>(
    shopName || '',
  );
  const [shop, _setShop] = useState<string>(shopMainDomain || '');

  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [loginPromt, setLoginPromt] = useState<ELoginPromt>(
    ELoginPromt.initial,
  );

  useEffect(() => {
    if (!window.wizybot.shopToken && window.wizybot.isAlreadyInstalled) {
      setViewState('LOGIN');
    } else if (
      isAlreadyExists &&
      hasWooCommerce &&
      !window.wizybot.wooCommerceSuccess &&
      window.wizybot.shopToken
    ) {
      setViewState('REGISTER_WOO');
    } else {
      setViewState('REGISTER');
    }
  }, [shopMainDomain]);

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setLoginPromt(ELoginPromt.loading);
    try {
      const response = await fetch(
        `${window.wizybot.globalSelectedBackend}/wordpress?site_url=${window.wizybot.wordpressUrl}&shop_domain=${shopDomain}&shop_email=${email}&shop_password=${password}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setViewState('LOADING');
          const tokenUrl = `${window.wizybot.wordpressUrl}/wp-admin/admin.php?page=wizybot-dashboard&token=${data.token}`;
          console.log('tokenUrl', tokenUrl);
          window.location.href = tokenUrl;
        }
      }
    } catch (error) {
      setLoginPromt(ELoginPromt.error);
    }
  };

  const handleRegisterClick = () => {
    if (!isValidEmail(email)) {
      setEmailError(true);
      setEmailErrorMessage(t('WrongEm', { ns: ['login'] }));
      return;
    }

    finalizeRegistration();
  };

  const finalizeRegistration = async () => {
    setLoginPromt(ELoginPromt.loading);
    try {
      const successUrl = encodeURIComponent(
        `${window.wizybot.globalSelectedBackend}/wordpress?shop_domain=${shopDomain}&shop_main_domain=${shopMainDomain}&shop_name=${shopName}&shop_email=${shopEmail}`,
      );
      const wpAuthUrl = `${window.wizybot.wordpressUrl}/wp-admin/authorize-application.php?app_name=Wizybot&app_id=${appUUID}&success_url=${successUrl}`;
      window.location.href = wpAuthUrl;
    } catch (error) {
      setLoginPromt(ELoginPromt.error);
    }
  };

  const handleWooOAuth = () => {
    const backendUrl =
      window.wizybot.stage === 'local'
        ? window.wizybot.ngrokUrl
        : window.wizybot.globalSelectedBackend;

    const callbackUrl = encodeURIComponent(
      `${backendUrl}/wordpress?shop_domain=${shopDomain}&shop_token=${window.wizybot.shopToken}`,
    );
    const returnUrl = encodeURIComponent(
      `${window.wizybot.wordpressUrl}/wp-admin/admin.php?page=wizybot-dashboard`,
    );

    const authUrl = `${window.wizybot.wordpressUrl}/wc-auth/v1/authorize?app_name=Wizybot&scope=read_write&user_id=${window.wizybot.userId}&return_url=${returnUrl}&callback_url=${callbackUrl}`;
    window.location.href = authUrl;
  };

  const handleOpenWizybot = () => {
    const deeplink = `${window.wizybot.globalSelectedBackend}/wordpress?shop_domain=${shopDomain}&shop_token=${window.wizybot.shopToken}`;
    window.location.href = deeplink;
    return;
  };

  // Check state displays
  if (viewState === 'CHECKING' || loginPromt === ELoginPromt.loading) {
    return (
      <div className="tw-class relative w-full min-h-svh bg-neutral-white flex justify-center items-center">
        <img src={wizy_loader} className="h-24" alt="loader" />
      </div>
    );
  }

  return (
    <div className="tw-class font-work relative w-full min-h-svh bg-neutral-white flex justify-center items-center dark:bg-dark-10">
      <div className="w-full min-h-dvh flex">
        <UiLeft className="absolute top-0 left-0 max-sm:hidden text-primary-40 dark:text-primary-60" />
        <UiBottom className="absolute bottom-0 lg:left-0 text-primary-40 max-lg:right-0 max-lg:-scale-x-100 max-sm:hidden dark:text-primary-60" />
        <div className="min-w-[55%] flex-1 flex justify-center items-center bg-neutral-80 max-lg:hidden dark:bg-dark-0">
          <UiCenter className="absolute top-0 left-[55%] text-primary-40 translate-x-[-80%] dark:text-primary-60" />
          <div className="relative w-full text-white flex flex-col justify-center items-center">
            <h1 className="text-5xl text-primary-40 font-bold lg:text-4xl dark:text-neutral-white">
              {t('Welcome', { ns: ['login'] })}
            </h1>
            <AutoCarousel />
          </div>
        </div>
        <div className="relative w-full min-h-svh flex flex-col justify-center items-center">
          {viewState === 'REGISTER_WOO' ? (
            <div className="flex flex-col gap-10">
              <div className="relative w-4/5 max-w-[362px] flex flex-col items-center">
                <h3 className="text-2xl text-primary-30 font-bold dark:text-neutral-white text-center">
                  Iniciar Sesion
                </h3>
                <p className="text-sm text-black font-medium my-4 dark:text-neutral-40 text-center">
                  Esto permitirá a Wizybot acceder a tus productos y pedidos de
                  forma segura.
                </p>
                <WizyButton
                  onClick={handleOpenWizybot}
                  variant="solid"
                  className="flex-1"
                >
                  Abrir Wizybot
                </WizyButton>
              </div>
              <div className="relative w-4/5 max-w-[362px] flex flex-col items-center">
                <h3 className="text-2xl text-primary-30 font-bold dark:text-neutral-white text-center">
                  ¿Deseas integrar WooCommerce?
                </h3>
                <p className="text-sm text-black font-medium my-4 dark:text-neutral-40 text-center">
                  Esto permitirá a Wizybot acceder a tus productos y pedidos de
                  forma segura.
                </p>
                <div className="flex gap-4 w-full">
                  <WizyButton
                    onClick={handleWooOAuth}
                    variant="outline"
                    className="flex-1"
                  >
                    Sí, integrar
                  </WizyButton>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (viewState === 'LOGIN') handleLogin();
                else handleRegisterClick();
              }}
              className="relative w-4/5 max-w-[362px] flex flex-col items-start max-sm:w-10/12"
            >
              <WizyLogo className="!h-10 !w-auto text-primary-20 my-4 dark:text-neutral-white" />
              <h3 className="text-4xl text-primary-30 font-bold dark:text-neutral-white">
                {viewState === 'REGISTER'
                  ? t('RegisterNow', { ns: ['login'] })
                  : t('Login', { ns: ['login'] })}
              </h3>
              <p className="text-sm text-black font-medium my-2 dark:text-neutral-40">
                {viewState === 'REGISTER'
                  ? t('SetStoreData', { ns: ['login'] })
                  : t('SetStoreData', { ns: ['login'] })}
              </p>

              <div className="my-4"></div>

              <div className="relative w-full">
                {viewState === 'REGISTER' && (
                  <InputWithIcon
                    value={currentShopName}
                    name="shopName"
                    type="text"
                    label={t('Shop Name', { ns: ['login'] })}
                    iconLeft={<InputPerson />}
                    onChange={(e) => {
                      setCurrentShopName(e.target.value);
                    }}
                  />
                )}
                <InputWithIcon
                  value={shop}
                  name="shopMainDomain"
                  type="text"
                  label={t('Shop Main Domain', { ns: ['login'] })}
                  iconLeft={<InputPerson />}
                />
                <InputWithIcon
                  value={email}
                  name="email"
                  type="email"
                  label={t('Email', { ns: ['login'] })}
                  iconLeft={<InputPerson />}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) {
                      setEmailError(false);
                      setEmailErrorMessage('');
                    }
                  }}
                  hasError={emailError}
                  errorMessage={emailErrorMessage}
                />
                {viewState === 'LOGIN' && (
                  <InputWithIcon
                    value={password}
                    name="password"
                    type="password"
                    label={t('Password', { ns: ['login'] })}
                    iconLeft={<InputPassword />}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                )}
              </div>

              {loginPromt === ELoginPromt.error && (
                <p className="text-red-500 text-xs mt-2">
                  {t('ErrorLogin', { ns: ['login'] })}
                </p>
              )}

              <WizyButton
                variant={
                  email.length > 0 &&
                  (viewState === 'LOGIN'
                    ? password.length > 0
                    : currentShopName.length > 0)
                    ? 'solid'
                    : 'disabled'
                }
                size="lg"
                iconRight={<ArrowRight />}
                className="mt-4"
              >
                {viewState === 'REGISTER'
                  ? t('RegisterB', { ns: ['login'] })
                  : t('Login', { ns: ['login'] })}
              </WizyButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginDashboardWordpress;
