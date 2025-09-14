import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request with authenticated user
interface AuthenticatedRequest extends Request {
  user?: {
    claims?: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp3',
      'video/mp4', 'video/mov', 'video/avi',
      'image/jpeg', 'image/png', 'image/jpg'
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Posts routes
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const filters = {
        genre: req.query.genre as string,
        userType: req.query.userType as string,
        sortBy: req.query.sortBy as string,
      };

      const posts = await storage.getPosts(limit, offset, filters);
      
      // If user is authenticated, check which posts they've liked
      if (req.user) {
        const userId = (req.user as any).claims?.sub;
        for (const post of posts) {
          post.isLiked = await storage.isPostLikedByUser(post.id, userId);
        }
      }

      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user || (user.userType !== 'creator' && user.userType !== 'expert')) {
        return res.status(403).json({ message: "Only creators and experts can upload content" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const file = files.file?.[0];
      const coverImage = files.coverImage?.[0];

      if (!file) {
        return res.status(400).json({ message: "File is required" });
      }

      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
        fileUrl: `/uploads/${file.filename}`,
        coverImageUrl: coverImage ? `/uploads/${coverImage.filename}` : null,
        contentType: file.mimetype.startsWith('video/') ? 'video' : 'audio',
      });

      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Comments routes
  app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId: req.params.postId,
        userId,
      });

      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Like routes
  app.post('/api/posts/:postId/like', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const isLiked = await storage.toggleLike(req.params.postId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, upload.single('profileImage'), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const file = req.file;
      
      const updateData: any = {
        bio: req.body.bio,
        userType: req.body.userType,
      };

      if (file) {
        updateData.profileImageUrl = `/uploads/${file.filename}`;
      }

      // Handle expert request
      if (req.body.requestExpert === 'true') {
        updateData.expertRequestStatus = 'pending';
        updateData.expertDocuments = req.body.expertDocuments;
      }

      const user = await storage.updateUserProfile(userId, updateData);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:userId/verify', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const adminId = req.user?.claims?.sub;
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const user = await storage.updateUserVerification(req.params.userId, req.body.isVerified);
      res.json(user);
    } catch (error) {
      console.error("Error updating verification:", error);
      res.status(500).json({ message: "Failed to update verification" });
    }
  });

  app.get('/api/admin/expert-requests', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const adminId = req.user?.claims?.sub;
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const requests = await storage.getExpertRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching expert requests:", error);
      res.status(500).json({ message: "Failed to fetch expert requests" });
    }
  });

  app.put('/api/admin/expert-requests/:userId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const adminId = req.user?.claims?.sub;
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const admin = await storage.getUser(adminId);
      
      if (!admin || admin.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { approved } = req.body;
      const user = await storage.updateUserExpertStatus(
        req.params.userId,
        approved,
        approved ? 'approved' : 'rejected'
      );
      res.json(user);
    } catch (error) {
      console.error("Error updating expert status:", error);
      res.status(500).json({ message: "Failed to update expert status" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add proper CORS headers for media files
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
