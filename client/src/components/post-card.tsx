import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AudioPlayer from "./audio-player";
import VideoPlayer from "./video-player";
import CommentSection from "./comment-section";
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PostWithUser } from "@shared/schema";

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il like",
        variant: "destructive",
      });
    },
  });

  const getUserBadge = () => {
    if (post.user.isExpert) {
      return (
        <Badge className="bg-accent text-white" data-testid="badge-expert">
          ★ Esperto
        </Badge>
      );
    }
    if (post.user.isVerified) {
      return (
        <Badge className="bg-primary text-white" data-testid="badge-verified">
          ✓ Verificato
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" data-testid="badge-listener">
        Ascoltatore
      </Badge>
    );
  };

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <Card className="overflow-hidden" data-testid={`post-${post.id}`}>
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
            alt="Profilo creatore"
            className="w-10 h-10 rounded-full object-cover"
            data-testid="img-user-avatar"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium" data-testid="text-username">
                {post.user.firstName} {post.user.lastName}
              </span>
              {getUserBadge()}
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-post-info">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { 
                addSuffix: true, 
                locale: it 
              }) : 'Data non disponibile'} • {post.genre}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" data-testid="button-more">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Media Content */}
      {post.contentType === "video" ? (
        <VideoPlayer src={post.fileUrl} poster={post.coverImageUrl} />
      ) : (
        <div className="p-4">
          <AudioPlayer
            src={post.fileUrl}
            title={post.title}
            artist={`${post.user.firstName} ${post.user.lastName}`}
            coverImage={post.coverImageUrl}
            duration={post.duration}
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-2" data-testid="text-post-title">
          {post.title}
        </h3>
        {post.description && (
          <p className="text-muted-foreground text-sm mb-4" data-testid="text-post-description">
            {post.description}
          </p>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={post.isLiked ? "text-accent" : "text-muted-foreground"}
              disabled={likeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
              {post.likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              data-testid="button-comments"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {post.commentCount}
            </Button>
            
            <Button variant="ghost" size="sm" data-testid="button-share">
              <Share className="w-4 h-4 mr-2" />
              Condividi
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" data-testid="button-bookmark">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border">
            <CommentSection postId={post.id} />
          </div>
        )}
      </div>
    </Card>
  );
}
