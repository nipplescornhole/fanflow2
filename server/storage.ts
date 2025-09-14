import {
  users,
  posts,
  comments,
  likes,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type InsertLike,
  type PostWithUser,
  type CommentWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number, filters?: {
    genre?: string;
    userType?: string;
    sortBy?: string;
  }): Promise<PostWithUser[]>;
  getPostById(id: string): Promise<PostWithUser | undefined>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: string): Promise<CommentWithUser[]>;
  
  // Like operations
  toggleLike(postId: string, userId: string): Promise<boolean>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  
  // User management (for admin)
  getAllUsers(): Promise<User[]>;
  updateUserVerification(userId: string, isVerified: boolean): Promise<User>;
  updateUserExpertStatus(userId: string, isExpert: boolean, status: string): Promise<User>;
  getExpertRequests(): Promise<User[]>;
  
  // Profile operations
  updateUserProfile(userId: string, data: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit = 20, offset = 0, filters?: {
    genre?: string;
    userType?: string;
    sortBy?: string;
  }): Promise<PostWithUser[]> {
    // Build where conditions
    const whereConditions = [];
    
    if (filters?.genre) {
      whereConditions.push(eq(posts.genre, filters.genre));
    }
    
    if (filters?.userType === 'verified') {
      whereConditions.push(eq(users.isVerified, true));
    } else if (filters?.userType === 'expert') {
      whereConditions.push(eq(users.isExpert, true));
    }

    // Determine ordering
    const orderByClause = filters?.sortBy === 'popular' 
      ? desc(posts.likes) 
      : desc(posts.createdAt);

    // Build the complete query
    let queryBuilder = db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        description: posts.description,
        contentType: posts.contentType,
        fileUrl: posts.fileUrl,
        coverImageUrl: posts.coverImageUrl,
        genre: posts.genre,
        duration: posts.duration,
        likes: posts.likes,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: users,
        commentCount: count(comments.id).as('commentCount'),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId));

    // Apply where conditions if any
    if (whereConditions.length > 0) {
      queryBuilder = queryBuilder.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)) as any;
    }

    // Complete the query
    const result = await queryBuilder
      .groupBy(posts.id, users.id)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    
    return result.map(row => ({
      ...row,
      user: row.user!, // Assert non-null since we always have a user via inner join logic
      commentCount: Number(row.commentCount),
      isLiked: false, // Will be set in the route handler based on current user
    }));
  }

  async getPostById(id: string): Promise<PostWithUser | undefined> {
    const [result] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        title: posts.title,
        description: posts.description,
        contentType: posts.contentType,
        fileUrl: posts.fileUrl,
        coverImageUrl: posts.coverImageUrl,
        genre: posts.genre,
        duration: posts.duration,
        likes: posts.likes,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: users,
        commentCount: count(comments.id).as('commentCount'),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .where(eq(posts.id, id))
      .groupBy(posts.id, users.id);

    if (!result || !result.user) return undefined;

    return {
      ...result,
      user: result.user,
      commentCount: Number(result.commentCount),
      isLiked: false,
    };
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPostId(postId: string): Promise<CommentWithUser[]> {
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));

    return result.filter(row => row.user).map(row => ({
      ...row,
      user: row.user!,
    }));
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));

    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
      
      // Decrease like count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} - 1` })
        .where(eq(posts.id, postId));
      
      return false;
    } else {
      // Add like
      await db.insert(likes).values({ postId, userId });
      
      // Increase like count
      await db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, postId));
      
      return true;
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isVerified, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserExpertStatus(userId: string, isExpert: boolean, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isExpert, expertRequestStatus: status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getExpertRequests(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.expertRequestStatus, 'pending'))
      .orderBy(desc(users.createdAt));
  }

  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
