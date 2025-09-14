import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Music, Video, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface UploadModalProps {
  onClose: () => void;
}

const genres = [
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "electronic", label: "Electronic" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "country", label: "Country" },
  { value: "reggae", label: "Reggae" },
];

export default function UploadModal({ onClose }: UploadModalProps) {
  const [contentType, setContentType] = useState<"audio" | "video">("audio");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("genre", formData.genre);
      
      if (file) {
        data.append("file", file);
      }
      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Contenuto caricato con successo!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Errore",
        description: "Impossibile caricare il contenuto",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title || !formData.genre) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect content type based on file type
      if (selectedFile.type.startsWith("video/")) {
        setContentType("video");
      } else {
        setContentType("audio");
      }
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="upload-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Carica Contenuto
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo di Contenuto</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={contentType === "audio" ? "default" : "outline"}
                onClick={() => setContentType("audio")}
                className="p-4 h-auto flex-col"
                data-testid="button-select-audio"
              >
                <Music className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Audio</span>
              </Button>
              <Button
                type="button"
                variant={contentType === "video" ? "default" : "outline"}
                onClick={() => setContentType("video")}
                className="p-4 h-auto flex-col"
                data-testid="button-select-video"
              >
                <Video className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Video</span>
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file" className="text-sm font-medium mb-2 block">
              File *
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={contentType === "video" ? "video/*" : "audio/*"}
                className="hidden"
                data-testid="input-file"
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Trascina il file qui o clicca per selezionare"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supportati: {contentType === "video" ? "MP4, MOV, AVI" : "MP3, WAV"} (max 100MB)
                </p>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Titolo *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Il titolo del tuo contenuto"
              required
              data-testid="input-title"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium mb-2 block">
              Descrizione
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrivi il tuo contenuto..."
              className="h-24 resize-none"
              data-testid="textarea-description"
            />
          </div>

          {/* Genre */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Genere *</Label>
            <Select value={formData.genre} onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}>
              <SelectTrigger data-testid="select-genre">
                <SelectValue placeholder="Seleziona genere" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value}>
                    {genre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cover Image (for audio) */}
          {contentType === "audio" && (
            <div>
              <Label htmlFor="coverImage" className="text-sm font-medium mb-2 block">
                Immagine di Copertina
              </Label>
              <div className="border border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  id="coverImage"
                  type="file"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-cover-image"
                />
                <label htmlFor="coverImage" className="cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {coverImage ? coverImage.name : "Carica immagine di copertina"}
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={uploadMutation.isPending}
              data-testid="button-publish"
            >
              {uploadMutation.isPending ? "Caricamento..." : "Pubblica"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Annulla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
