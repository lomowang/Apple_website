import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants"; // 從 constants 文件導入高亮幻燈片數據
import { pauseImg, playImg, replayImg } from "../utils"; // 從 utils 文件導入控制按鈕圖片
import gsap from "gsap"; // 導入 GSAP 動畫庫
import { useGSAP } from "@gsap/react"; // 導入 GSAP 的 React 鉤子

const VideoCarousel = () => {
  // 使用 useRef 創建對視頻元素的引用
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  // 定義視頻播放相關的狀態
  const [video, setVideo] = useState({
    isEnd: false, // 是否結束
    startPlay: false, // 是否開始播放
    videoId: 0, // 當前播放的視頻 ID
    isLastVideo: false, // 是否為最後一個視頻
    isPlaying: false, // 是否正在播放
  });

  // 已加載數據的狀態
  const [loadedData, setLoadedData] = useState([]);

  // 解構狀態變量
  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  // 使用自定義的 useGSAP 鉤子來處理動畫
  useGSAP(() => {
    // 滑動動畫
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    // 完成動畫時的處理
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  // 處理視頻播放和暫停的效果
  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  // 處理視頻加載元數據
  const handleLoadedMetadata = (i, e) => setLoadedData((pre) => [...pre, e]);

  // 視頻播放進度動畫
  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;
    if (span[videoId]) {
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);
          if (progress != currentProgress) {
            currentProgress = progress;
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (videoId === 0) {
        anim.restart();
      }
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  // 處理視頻播放過程中的各種事件
  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }));
        break;
      case "video-last":
        setVideo((pre) => ({ ...pre, isLastVideo: true, videoId: 0 }));
        break;
      case "video-reset":
        setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }));
        break;
      case "play":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      case "pause":
        setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
        break;
      default:
        return video;
    }
  };

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  id="video"
                  playsInline={true}
                  preload="auto"
                  muted
                  className={`${list.id === 2 && "translate-x-44"}
                  pointer-events-none
                  }`}
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() =>
                    i !== 3
                      ? handleProcess("video-end", i)
                      : handleProcess("video-last")
                  }
                  onPlay={() => {
                    setVideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }));
                  }}
                  onLoadedMetadata={(e) => handleLoadedMetadata(i, e)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text) => (
                  <p key={text} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          {/* 图片元素用于显示控制按钮，具体显示哪个按钮由视频的播放状态决定 */}
          <img
            // 图片源地址（src）根据视频是否为最后一个视频以及是否正在播放来决定：
            // - 如果是最后一个视频（isLastVideo为true），则显示重播图标（replayImg）
            // - 如果不是最后一个视频但视频处于暂停状态（isPlaying为false），则显示播放图标（playImg）
            // - 否则，显示暂停图标（pauseImg）
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            // 图片的替代文本（alt），也根据视频状态来决定，与图片源逻辑相同：
            // - 对于重播图标，替代文本为"replay"
            // - 对于播放图标，替代文本为"play"
            // - 对于暂停图标，替代文本为"pause"
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            // 点击事件处理器：
            // - 如果是最后一个视频，点击后调用 handleProcess 函数处理视频重置（video-reset）
            // - 如果不是最后一个视频且视频正在播放（isPlaying为true），点击后调用 handleProcess 处理暂停（pause）
            // - 如果视频不在播放（isPlaying为false），点击后调用 handleProcess 处理播放（play）
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
