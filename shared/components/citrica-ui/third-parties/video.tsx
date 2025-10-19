import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoJSProps {
  options: any; // Video.js options object
  onReady?: (player: any) => void; // Video.js player instance
  className?: string;
}

export const VideoJS: React.FC<VideoJSProps> = ({ options, onReady, className }) => {
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else if (playerRef.current && options) {
      const player = playerRef.current;

      if (options.autoplay !== undefined) {
        player.autoplay(options.autoplay);
      }
      if (options.sources) {
        player.src(options.sources);
      }
    }
  }, [options, onReady]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className={className}>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoJS;
export type { VideoJSProps };