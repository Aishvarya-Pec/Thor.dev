import gsap from "gsap";
import { useRef } from "react";

import { AnimatedTitle } from "./animated-title";
import { Button } from "./button";
import { RoundedCorners } from "./rounded-corners";

export const Story = () => {
  const frameRef = useRef<HTMLImageElement>(null);

  const handleMouseLeave = () => {
    const element = frameRef.current;

    if (!element) return;

    gsap.to(element, {
      duration: 0.3,
      rotateX: 0,
      rotateY: 0,
      ease: "power1.inOut",
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPerspective: 500,
      ease: "power1.inOut",
    });
  };

  return (
    <section id="story" className="min-h-dvh w-screen bg-black text-blue-50">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <div className="relative size-full">
          <AnimatedTitle containerClass="mt-5 pointer-events-none mix-blend-difference relative z-20">
            {"The St<b>o</b>ry of <br /> a hidden real<b>m</b>"}
          </AnimatedTitle>

          <div className="story-img-container">
            <div className="story-img-mask">
              <div className="story-img-content">
                {/* Image removed */}
              </div>
            </div>

            <RoundedCorners />
          </div>
          
          {/* Full screen happy.png below the title */}
          <div className="absolute top-32 left-0 w-screen h-screen">
            <img 
              src="/img/happy.png" 
              alt="Happy" 
              className="w-full h-full object-cover"
            />
            
            {/* Text overlay on happy.png */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10">
              <p className="max-w-sm text-center font-circular-web text-violet-50">
                A secret forge beyond the storms — where raw ideas are struck into apps, and every builder unlocks their own divine power.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
