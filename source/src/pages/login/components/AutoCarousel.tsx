import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useDarkMode } from "../../../hooks/useDarkMode";

import Carousel1EN from "../../../images/ui/Carousel1EN.png";
import Carousel2EN from "../../../images/ui/Carousel2EN.png";
import Carousel3EN from "../../../images/ui/Carousel3EN.png";
import Carousel1ENDark from "../../../images/ui/Carousel1ENDark.png";
import Carousel2ENDark from "../../../images/ui/Carousel2ENDark.png";
import Carousel3ENDark from "../../../images/ui/Carousel3ENDark.png";

import Carousel1ES from "../../../images/ui/Carousel1ES.png";
import Carousel2ES from "../../../images/ui/Carousel2ES.png";
import Carousel3ES from "../../../images/ui/Carousel3ES.png";
import Carousel1ESDark from "../../../images/ui/Carousel1ESDark.png";
import Carousel2ESDark from "../../../images/ui/Carousel2ESDark.png";
import Carousel3ESDark from "../../../images/ui/Carousel3ESDark.png";

import Carousel1PT from "../../../images/ui/Carousel1PT.png";
import Carousel2PT from "../../../images/ui/Carousel2PT.png";
import Carousel3PT from "../../../images/ui/Carousel3PT.png";
import Carousel1PTDark from "../../../images/ui/Carousel1PTDark.png";
import Carousel2PTDark from "../../../images/ui/Carousel2PTDark.png";
import Carousel3PTDark from "../../../images/ui/Carousel3PTDark.png";

const AutoCarousel: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const lang = i18n.language.toLocaleLowerCase();
  const { isDark, isReady } = useDarkMode();

  const slides = useMemo(() => {
    if (lang === "es") {
      return isDark
        ? [Carousel1ESDark, Carousel2ESDark, Carousel3ESDark]
        : [Carousel1ES, Carousel2ES, Carousel3ES];
    } else if (lang === "pt") {
      return isDark
        ? [Carousel1PTDark, Carousel2PTDark, Carousel3PTDark]
        : [Carousel1PT, Carousel2PT, Carousel3PT];
    } else {
      return isDark
        ? [Carousel1ENDark, Carousel2ENDark, Carousel3ENDark]
        : [Carousel1EN, Carousel2EN, Carousel3EN];
    }
  }, [lang, isDark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (!isReady) return null;

  return (
    <div className="relative h-[60vh] xl:w-4/5 flex items-center justify-center overflow-hidden lg:w-11/12">
      {slides.map((slideSrc, index) => (
        <div
          key={index}
          className={`flex justify-center absolute h-full w-auto transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slideSrc}
            alt={`Carousel slide ${index + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default AutoCarousel;
