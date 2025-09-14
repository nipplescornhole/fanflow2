import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { CommentWithUser } from "@shared/schema";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
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
        description: "Impossibile aggiungere il commento",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const getUserBadge = (commentUser: CommentWithUser['user']) => {
    if (commentUser.isExpert) {
      return <Badge className="bg-accent text-white">★</Badge>;
    }
    if (commentUser.isVerified) {
      return <Badge className="bg-primary text-white">✓</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Caricamento commenti...</div>;
  }

  return (
    <div className="space-y-4" data-testid="comment-section">
      {/* Comments List */}
      {comments && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3" data-testid={`comment-${comment.id}`}>
              <img
                src={comment.user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
                alt="Commento utente"
                className="w-8 h-8 rounded-full object-cover"
                data-testid="img-comment-avatar"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm" data-testid="text-comment-username">
                    {comment.user.firstName} {comment.user.lastName}
                  </span>
                  {getUserBadge(comment.user)}
                  <span className="text-xs text-muted-foreground" data-testid="text-comment-time">
                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: it }) : 'Data non disponibile'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-comment-content">
                  {comment.content}
                </p>
              </div>
              <Button variant="ghost" size="sm" data-testid="button-comment-like">
                <Heart className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      {user && (
        <form onSubmit={handleSubmitComment} className="flex items-center space-x-3">
          <img
            src={user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
            alt="Il tuo profilo"
            className="w-8 h-8 rounded-full object-cover"
            data-testid="img-current-user-avatar"
          />
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Scrivi un commento..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commentMutation.isPending}
              data-testid="input-comment"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || commentMutation.isPending}
            data-testid="button-send-comment"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
