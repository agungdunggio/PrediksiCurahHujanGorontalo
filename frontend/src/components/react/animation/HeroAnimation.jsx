import { useEffect } from "react";
import gsap from "gsap";

export default function HeroAnimation() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const title = document.querySelector(".hero-title");
      const desc = document.querySelector(".hero-desc");
      const buttons = gsap.utils.toArray(".hero-btn");
      if (!title || !desc || buttons.length === 0) return;
  
      // Initial state is set via CSS (opacity: 0, transform: translateY(30px))
      // GSAP animates to visible state
      const tl = gsap.timeline({ delay: 0.1 });
      tl.to(title, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
        .to(desc, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
        .to(
          buttons,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power3.out",
            stagger: { each: 0.15, from: "start" },
            overwrite: "auto",               
          },
          "-=0.4"
        );
    });

    return () => ctx.revert();
  }, []);
  
  return null;
}
