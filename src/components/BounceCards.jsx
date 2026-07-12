import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./BounceCards.css";

export default function BounceCards({
  className = "",
  images = [],
  cards = [],
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = "elastic.out(1, 0.8)",
  transformStyles = [
    "rotate(10deg) translate(-170px)",
    "rotate(5deg) translate(-85px)",
    "rotate(-3deg)",
    "rotate(-10deg) translate(85px)",
    "rotate(2deg) translate(170px)"
  ],
  enableHover = true
}) {
  const containerRef = useRef(null);
  const entries = cards.length
    ? cards
    : images.map((src, index) => ({
        image: src,
        alt: `Kartu ${index + 1}`
      }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".card",
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [animationStagger, easeType, animationDelay]);

  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);

    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    }

    if (transformStr === "none") {
      return "rotate(0deg)";
    }

    return `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);

    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    }

    return baseTransform === "none"
      ? `translate(${offsetX}px)`
      : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    entries.forEach((_, index) => {
      const target = q(`.card-${index}`);
      gsap.killTweensOf(target);

      const baseTransform = transformStyles[index] || "none";

      if (index === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.4,
          ease: "back.out(1.4)",
          overwrite: "auto"
        });
        return;
      }

      const offsetX = index < hoveredIdx ? -160 : 160;
      const distance = Math.abs(hoveredIdx - index);

      gsap.to(target, {
        transform: getPushedTransform(baseTransform, offsetX),
        duration: 0.4,
        ease: "back.out(1.4)",
        delay: distance * 0.05,
        overwrite: "auto"
      });
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    entries.forEach((_, index) => {
      const target = q(`.card-${index}`);
      gsap.killTweensOf(target);

      gsap.to(target, {
        transform: transformStyles[index] || "none",
        duration: 0.4,
        ease: "back.out(1.4)",
        overwrite: "auto"
      });
    });
  };

  return (
    <div
      className={`bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{
        position: "relative",
        width: containerWidth,
        height: containerHeight
      }}
    >
      {entries.map((entry, index) => (
        <div
          key={entry.title || entry.image || index}
          className={`card card-${index} ${entry.tone ? `card-${entry.tone}` : ""}`}
          style={{
            transform: transformStyles[index] ?? "none"
          }}
          onMouseEnter={() => pushSiblings(index)}
          onMouseLeave={resetSiblings}
        >
          {entry.image ? (
            <img className="image" src={entry.image} alt={entry.alt || `Kartu ${index + 1}`} />
          ) : (
            <div className="bounce-card-content">
              <span className="bounce-card-number">{entry.number}</span>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
