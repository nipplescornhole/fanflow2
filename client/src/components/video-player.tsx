import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string | null;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoClick = () => {
    togglePlayPause();
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div 
      className="relative bg-black aspect-video cursor-pointer"
      onClick={handleVideoClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(false)}
      data-testid="video-player"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="w-full h-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        data-testid="video-element"
      />
      
      {/* Play Button Overlay */}
      {(!isPlaying || showControls) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
          <Button
            size="lg"
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary"
            data-testid="button-video-play"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
