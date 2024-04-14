import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { heroVideo, smallHeroVideo } from "../utils";
import { useEffect, useState } from "react";

const Hero = () => {
  // 針對視窗大小，選擇動畫大小
  const [videoSrc, setVideoSrc] = useState(
    window.innerWidth < 760 ? smallHeroVideo : heroVideo
  );

  // 定义一个函数，用于在窗口大小变化时更新videoSrc状态
  const handleVideoSrcSet = () => {
    if (window.innerWidth < 760) {
      setVideoSrc(smallHeroVideo); // 如果窗口宽度小于760像素，设置videoSrc为smallHeroVideo
    } else {
      setVideoSrc(heroVideo); // 否则，设置videoSrc为heroVideo
    }
  };

  // 使用useEffect钩子添加和清除窗口大小变化的事件监听器
  useEffect(() => {
    window.addEventListener("resize", handleVideoSrcSet); // 添加事件监听器
    return () => {
      window.removeEventListener("resize", handleVideoSrcSet); // 组件卸载时移除事件监听器
    };
  }, []); // 依赖数组为空，这段逻辑只在组件挂载时执行一次

  // 動畫設定
  useGSAP(() => {
    gsap.to("#hero", { opacity: 1, delay: 1.5 });
    gsap.to("#cta", { opacity: 1, y: -50, delay: 1.5 });
  }, []);

  return (
    <section className="w-full nav-height bg-black relative">
      <div className="h-5/6 w-full flex-center flex-col">
        <p id="hero" className="hero-title">
          iPhone 15 Pro
        </p>
        <div className="md:w-10/12 w-9/12">
          <video
            className="pointer-events-none"
            autoPlay
            muted
            playsInline={true}
            key={videoSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>

      <div
        id="cta"
        className="flex flex-col items-center opacity-0
      translate-y-20"
      >
        <a href="#highlights" className="btn">
          Buy
        </a>
        <p className="font-normal text-xl">NT$36,900起 </p>
      </div>
    </section>
  );
};

export default Hero;
