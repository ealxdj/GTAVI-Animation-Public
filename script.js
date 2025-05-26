import { logoData } from "./logo";

import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".overlay");
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.transform = "none";

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const heroImgContainer = document.querySelector(".hero-img-container");
  const heroImgLogo = document.querySelector(".hero-img-logo");
  const heroImgCopy = document.querySelector(".hero-img-copy");
  const fadeOverlay = document.querySelector(".fade-overlay");
  const svgOverlay = document.querySelector(".overlay");
  const overlayCopy = document.querySelector("h1");

  const initialOverlayScale = 500;
  const logoContainer = document.querySelector(".logo-container");
  const logoMask = document.getElementById("logoMask");

  logoMask.setAttribute("d", logoData);

  function updateLogoMask() {
    const logoDimensions = logoContainer.getBoundingClientRect();
    const logoBoundingBox = logoMask.getBBox();

    const horizontalScaleRatio = logoDimensions.width / logoBoundingBox.width;
    const verticalScaleRatio = logoDimensions.height / logoBoundingBox.height;
    const logoScaleFactor = Math.min(horizontalScaleRatio, verticalScaleRatio);

    const logoHorizontalPosition =
      logoDimensions.left +
      (logoDimensions.width - logoBoundingBox.width * logoScaleFactor) / 2 -
      logoBoundingBox.x * logoScaleFactor;
    const logoVerticalPosition =
      logoDimensions.top +
      (logoDimensions.height - logoBoundingBox.height * logoScaleFactor) / 2 -
      logoBoundingBox.y * logoScaleFactor;

    logoMask.setAttribute(
      "transform",
      `translate(${logoHorizontalPosition}, ${logoVerticalPosition}) scale(${logoScaleFactor})`
    );
  }

  updateLogoMask();

  gsap.set(svgOverlay, {
    transformOrigin: "50% 50%",
    xPercent: 0,
    yPercent: 0,
    left: 0,
    top: 0,
    scale: initialOverlayScale,
  });

  let scrollTriggerInstance;

  function setupScrollTrigger() {
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
    }

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${window.innerHeight * 5}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const scrollProgress = self.progress;
        const fadeOpacity = 1 - ((scrollProgress - 0.7) * (1 / 0.15));

        if (scrollProgress >= 0.7 && scrollProgress <= 0.85) {
          gsap.set([heroImgLogo, heroImgCopy], {
            opacity: fadeOpacity,
          });
        } else if (scrollProgress > 0.85) {
          gsap.set([heroImgLogo, heroImgCopy], {
            opacity: 0,
          });
        }

        if (scrollProgress <= 0.85) {
          const normalizedProgress = scrollProgress * (1 / 0.85);
          const heroImgContainerScale = 1.5 - 0.5 * normalizedProgress;
          const overlayScale =
            initialOverlayScale *
            Math.pow(1 / initialOverlayScale, normalizedProgress);
          let fadeOverlayOpacity = 0;

          gsap.set(heroImgContainer, {
            scale: heroImgContainerScale,
          });

          gsap.set(svgOverlay, {
            transformOrigin: "50% 25%",
            scale: overlayScale,
            force3D: true,
          });

          // Eliminamos el fade overlay para mantener la imagen de fondo visible
          gsap.set(fadeOverlay, {
            opacity: 0,
          });
        }

        if (scrollProgress >= 0.7 && scrollProgress <= 0.85) {
          const overlayCopyRevealProgress = (scrollProgress - 0.7) * (1 / 0.15);

          const gradientSpread = 100;
          const gradientBottomPosition = 240 - overlayCopyRevealProgress * 280;
          const gradientTopPosition = gradientBottomPosition - gradientSpread;
          const overlayCopyScale = 1.25 - 0.25 * overlayCopyRevealProgress;

          overlayCopy.style.background = `linear-gradient(to bottom, #111117 0%, #111117 ${gradientTopPosition}%, #e66461 ${gradientBottomPosition}%, #e66461 100%)`;
          overlayCopy.style.backgroundClip = "text";

          gsap.set(overlayCopy, {
            scale: overlayCopyScale,
            opacity: overlayCopyRevealProgress,
          });
        } else if (scrollProgress < 0.7) {
          gsap.set(overlayCopy, {
            opacity: 0,
          });
        }

        // Overlay blanco y logo blanco solo al final
        if (scrollProgress >= 0.7) {
          // Fade in overlay blanco
          const overlayWhiteOpacity = Math.min(1, (scrollProgress - 0.7) * 10);
          gsap.set(fadeOverlay, {
            opacity: overlayWhiteOpacity,
          });
          // Logo y texto completamente blancos y visibles
          gsap.set([heroImgLogo, heroImgCopy], {
            opacity: 1,
            filter: 'brightness(1000%)', // fuerza blanco
          });
        } else {
          // Overlay blanco oculto
          gsap.set(fadeOverlay, {
            opacity: 0,
          });
          // Logo y texto normales
          // Si quieres que desaparezcan antes, puedes ajustar la opacidad aquí
          if (scrollProgress >= 0.7 && scrollProgress <= 0.85) {
            const fadeOpacity = 1 - ((scrollProgress - 0.7) * (1 / 0.15));
            gsap.set([heroImgLogo, heroImgCopy], {
              opacity: fadeOpacity,
              filter: 'none',
            });
          } else if (scrollProgress > 0.85) {
            gsap.set([heroImgLogo, heroImgCopy], {
              opacity: 0,
              filter: 'none',
            });
          } else {
            gsap.set([heroImgLogo, heroImgCopy], {
              opacity: 1,
              filter: 'none',
            });
          }
        }
      },
    });
  }

  setupScrollTrigger();

  window.addEventListener("resize", () => {
    updateLogoMask();
    ScrollTrigger.refresh();
    setupScrollTrigger();
  });
});
