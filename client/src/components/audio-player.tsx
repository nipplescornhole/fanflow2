import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
  coverImage?: string | null;
  duration?: number | null;
}

export default function AudioPlayer({
  src,
  title,
  artist,
  coverImage,
  duration,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-secondary rounded-lg p-4" data-testid="audio-player">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        <img
          src={coverImage || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"}
          alt="Copertina album"
          className="w-16 h-16 rounded-lg object-cover"
          data-testid="img-cover"
        />
        
        <div className="flex-1">
          <h4 className="font-medium mb-1" data-testid="text-title">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground mb-2" data-testid="text-artist">
            {artist}
          </p>
          
          {/* Audio Controls */}
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={togglePlayPause}
              className="w-8 h-8 p-0"
              data-testid="button-play-pause"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={[currentTime]}
                max={audioDuration}
                step={1}
                onValueChange={handleProgressChange}
                className="mb-1"
                data-testid="slider-progress"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span data-testid="text-current-time">
                  {formatTime(currentTime)}
                </span>
                <span data-testid="text-duration">
                  {formatTime(audioDuration)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
                data-testid="slider-volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
