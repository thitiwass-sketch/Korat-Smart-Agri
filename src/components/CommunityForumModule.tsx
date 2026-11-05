import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  db,
  auth,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from "../firebase";
import { KORAT_DISTRICTS, KoratDistrict } from "../data/koratAgriData";
import {
  FORUM_CATEGORIES,
  AUTHOR_ROLE_BADGES,
  INITIAL_SEEDED_FORUM_POSTS,
  ForumCategoryKey,
  ForumPostType,
  AuthorRole,
  ForumPostItem,
  ForumReplyItem,
  REPUTATION_BADGE_CONFIG,
  calculateUserReputation,
  getAllUsersReputations,
  UserReputationProfile,
  ReputationBadgeKey,
} from "../data/koratForumData";
import {
  MessageSquare,
  MessageCircle,
  Send,
  Plus,
  Pin,
  Lock,
  Unlock,
  Flag,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ThumbsUp,
  Search,
  Filter,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Award,
  Sparkles,
  Sprout,
  Wheat,
  Bug,
  Droplets,
  FlaskConical,
  Handshake,
  Tractor,
  User as UserIcon,
  Users,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  LogIn,
  LogOut,
  Check,
  HelpCircle,
  Lightbulb,
  FileText,
  BadgeAlert,
  ArrowRight,
  ExternalLink,
  Crown,
  HeartHandshake,
  Zap,
  Trophy,
  Star,
  Info,
  TrendingUp,
} from "lucide-react";

interface CommunityForumModuleProps {
  selectedDistrict: KoratDistrict;
  onSelectDistrict?: (districtId: string) => void;
  onNavigateToClinic?: () => void;
  onNavigateToPartnerships?: () => void;
}

const LOCAL_STORAGE_POSTS_KEY = "korat_smartagri_forum_posts_v2";
const LOCAL_STORAGE_LIKES_KEY = "korat_smartagri_forum_user_likes_v2";
const LOCAL_STORAGE_PERSONA_KEY = "korat_smartagri_user_persona_v2";

interface UserPersona {
  name: string;
  role: AuthorRole;
  districtId: string;
  districtNameTh: string;
}

const DEFAULT_PERSONAS: UserPersona[] = [
  {
    name: "ลุงชูชาติ แปลงใหญ่มันสำปะหลังเสิงสาง",
    role: "smart_farmer",
    districtId: "soeng-sang",
    districtNameTh: "อ.เสิงสาง",
  },
  {
    name: "นักวิชาการส่งเสริมการเกษตร อ.พิมาย",
    role: "agri_officer",
    districtId: "phimai",
    districtNameTh: "อ.พิมาย",
  },
  {
    name: "ประทีป ประธานสหกรณ์การเกษตรครบุรี",
    role: "coop_leader",
    districtId: "khon-buri",
    districtNameTh: "อ.ครบุรี",
  },
  {
    name: "สมหมาย ไร่มันด่านขุนทด",
    role: "farmer",
    districtId: "dan-khun-thot",
    districtNameTh: "อ.ด่านขุนทด",
  },
  {
    name: "ฐิติวัสส์ กาญจนพิมาย (ผู้ดูแลระบบ)",
    role: "moderator",
    districtId: "mueang-nakhon-ratchasima",
    districtNameTh: "อ.เมืองนครราชสีมา",
  },
];

const REPORT_REASONS = [
  "ข้อมูลเท็จหรือไม่ถูกต้องทางวิชาการเกษตร / โรคพืช",
  "ถ้อยคำไม่สุภาพ หยาบคาย หรือสร้างความขัดแย้ง",
  "โฆษณาขายสินค้าแอบแฝง / นายหน้าสินเชื่อนอกระบบ",
  "โพสต์ซ้ำซ้อน (Spam) หรือไม่เกี่ยวกับเกษตรโคราช",
  "ชักชวนให้เผาอ้อย / เผาแปลงเกษตรที่ผิดกฎหมาย",
];

export const CommunityForumModule: React.FC<CommunityForumModuleProps> = ({
  selectedDistrict,
  onSelectDistrict,
  onNavigateToClinic,
  onNavigateToPartnerships,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Active persona for posting/replying
  const [activePersona, setActivePersona] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PERSONA_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PERSONAS[0];
  });

  // Moderator tools toggle
  const [isModeratorMode, setIsModeratorMode] = useState<boolean>(false);

  // Posts collection
  const [posts, setPosts] = useState<ForumPostItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_SEEDED_FORUM_POSTS;
  });

  // Track liked items
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<ForumCategoryKey>("all");
  const [selectedPostType, setSelectedPostType] = useState<string>("all");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<"newest" | "likes" | "replies">("newest");
  const [moderationFilter, setModerationFilter] = useState<"all" | "reported" | "resolved">("all");

  // Expanded post thread modal or drawer
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // New post modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostCategory, setNewPostCategory] = useState<ForumCategoryKey>("cassava");
  const [newPostType, setNewPostType] = useState<ForumPostType>("question");
  const [newPostCropTag, setNewPostCropTag] = useState<string>("มันสำปะหลัง (กวก. 50)");
  const [newPostDistrictId, setNewPostDistrictId] = useState<string>(selectedDistrict.id);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);

  // Reply input state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Report modal state
  const [reportingPost, setReportingPost] = useState<ForumPostItem | null>(null);
  const [selectedReportReason, setSelectedReportReason] = useState<string>(REPORT_REASONS[0]);

  // Moderator Note editing state
  const [editingModNotePostId, setEditingModNotePostId] = useState<string | null>(null);
  const [modNoteInput, setModNoteInput] = useState<string>("");

  // User Reputation System & Leaderboard states
  const [selectedReputationAuthor, setSelectedReputationAuthor] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Save persona to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PERSONA_KEY, JSON.stringify(activePersona));
  }, [activePersona]);

  // Save liked IDs to localStorage
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_LIKES_KEY,
      JSON.stringify(Array.from(likedIds))
    );
  }, [likedIds]);

  // Save posts to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user?.displayName) {
        // Automatically reflect verified user into persona
        setActivePersona((prev) => ({
          ...prev,
          name: user.displayName || prev.name,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore forumPosts in real-time when available
  useEffect(() => {
    const path = "forumPosts";
    let isSubscribed = true;

    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isSubscribed) return;
          if (!snapshot.empty) {
            const fetchedPosts: ForumPostItem[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              fetchedPosts.push({
                id: docSnap.id,
                authorId: data.authorId || "anon",
                authorName: data.authorName || "เกษตรกรโคราช",
                authorRole: data.authorRole || "farmer",
                districtId: data.districtId || "dan-khun-thot",
                districtNameTh: data.districtNameTh || "อ.ด่านขุนทด",
                category: data.category || "general",
                categoryNameTh: data.categoryNameTh || "ทั่วไป",
                postType: data.postType || "discussion",
                cropTag: data.cropTag || "พืชทั่วไป",
                title: data.title || "",
                content: data.content || "",
                likesCount: typeof data.likesCount === "number" ? data.likesCount : 0,
                replyCount: typeof data.replyCount === "number" ? data.replyCount : 0,
                isPinned: Boolean(data.isPinned),
                isLocked: Boolean(data.isLocked),
                isResolved: Boolean(data.isResolved),
                moderationStatus: data.moderationStatus || "active",
                reportCount: typeof data.reportCount === "number" ? data.reportCount : 0,
                moderatorNote: data.moderatorNote || undefined,
                createdAt:
                  data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate().toISOString()
                    : typeof data.createdAt === "string"
                    ? data.createdAt
                    : new Date().toISOString(),
                updatedAt:
                  data.updatedAt instanceof Timestamp
                    ? data.updatedAt.toDate().toISOString()
                    : typeof data.updatedAt === "string"
                    ? data.updatedAt
                    : new Date().toISOString(),
              });
            });

            // Merge with seeded replies for rich discussion demo if remote replies are not yet in subcollection
            setPosts((prev) => {
              const prevRepliesMap = new Map<string, ForumReplyItem[]>();
              prev.forEach((p) => {
                if (p.replies) prevRepliesMap.set(p.id, p.replies);
              });

              return fetchedPosts.map((fp) => ({
                ...fp,
                replies: prevRepliesMap.get(fp.id) || INITIAL_SEEDED_FORUM_POSTS.find((ip) => ip.id === fp.id)?.replies || [],
              }));
            });
          }
        },
        (error) => {
          console.warn("Firestore onSnapshot offline or permissions error, using local/seeded forum state:", error.message);
        }
      );

      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    } catch (err) {
      console.warn("Failed to attach Firestore onSnapshot for forumPosts:", err);
    }
  }, []);

  // Google sign in handler
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Google sign-out failed:", error);
    }
  };

  // Upvote post
  const handleToggleLikePost = async (postId: string) => {
    const isLiked = likedIds.has(postId);
    const updatedLikedIds = new Set(likedIds);

    if (isLiked) {
      updatedLikedIds.delete(postId);
    } else {
      updatedLikedIds.add(postId);
    }
    setLikedIds(updatedLikedIds);

    // Optimistic state update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLikes = Math.max(0, p.likesCount + (isLiked ? -1 : 1));
          return { ...p, likesCount: newLikes };
        }
        return p;
      })
    );

    // Attempt Firestore update
    if (currentUser) {
      try {
        const postRef = doc(db, "forumPosts", postId);
        const targetPost = posts.find((p) => p.id === postId);
        const newLikes = Math.max(0, (targetPost?.likesCount || 0) + (isLiked ? -1 : 1));
        await updateDoc(postRef, {
          likesCount: newLikes,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        // Log firestore error defensively
        console.warn("Firestore post upvote sync error:", err);
      }
    }
  };

  // Upvote reply
  const handleToggleLikeReply = (postId: string, replyId: string) => {
    const isLiked = likedIds.has(replyId);
    const updatedLikedIds = new Set(likedIds);

    if (isLiked) {
      updatedLikedIds.delete(replyId);
    } else {
      updatedLikedIds.add(replyId);
    }
    setLikedIds(updatedLikedIds);

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.replies) {
          return {
            ...p,
            replies: p.replies.map((r) => {
              if (r.id === replyId) {
                return {
                  ...r,
                  likesCount: Math.max(0, r.likesCount + (isLiked ? -1 : 1)),
                };
              }
              return r;
            }),
          };
        }
        return p;
      })
    );
  };

  // Mark answer as Expert / Best Solution
  const handleToggleExpertAnswer = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.replies) {
          return {
            ...p,
            isResolved: true,
            replies: p.replies.map((r) =>
              r.id === replyId
                ? { ...r, isExpertAnswer: !r.isExpertAnswer }
                : r
            ),
          };
        }
        return p;
      })
    );
  };

  // Create new forum post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    setIsSubmittingPost(true);
    const categoryMeta = FORUM_CATEGORIES.find((c) => c.key === newPostCategory);
    const dist = KORAT_DISTRICTS.find((d) => d.id === newPostDistrictId) || selectedDistrict;

    const newPostId = `post-${Date.now()}`;
    const authorId = currentUser?.uid || `usr-local-${Date.now().toString(36)}`;
    const authorName = currentUser?.displayName || activePersona.name;
    const authorRole = isModeratorMode ? "moderator" : activePersona.role;

    const newPost: ForumPostItem = {
      id: newPostId,
      authorId,
      authorName,
      authorRole,
      districtId: dist.id,
      districtNameTh: dist.nameTh,
      category: newPostCategory,
      categoryNameTh: categoryMeta?.labelTh || "ทั่วไป",
      postType: newPostType,
      cropTag: newPostCropTag.trim() || "เกษตรกรรมโคราช",
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      likesCount: 0,
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      isResolved: false,
      moderationStatus: "active",
      reportCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };

    // Optimistically update local posts list
    setPosts((prev) => [newPost, ...prev]);

    // Save to Firestore if connected
    try {
      if (currentUser) {
        const postDocRef = doc(db, "forumPosts", newPostId);
        await setDoc(postDocRef, {
          authorId,
          authorName,
          authorRole,
          districtId: dist.id,
          districtNameTh: dist.nameTh,
          category: newPostCategory,
          categoryNameTh: categoryMeta?.labelTh || "ทั่วไป",
          postType: newPostType,
          cropTag: newPostCropTag.trim() || "เกษตรกรรมโคราช",
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          likesCount: 0,
          replyCount: 0,
          isPinned: false,
          isLocked: false,
          isResolved: false,
          moderationStatus: "active",
          reportCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.warn("Could not save to Firestore, stored locally in forum cache:", error);
    } finally {
      setIsSubmittingPost(false);
      setIsCreateModalOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setActivePostId(newPostId);
    }
  };

  // Submit reply to a post
  const handleSubmitReply = async (postId: string) => {
    const text = replyTextMap[postId]?.trim();
    if (!text) return;

    setIsSubmittingReply(true);
    const replyId = `rep-${Date.now()}`;
    const authorId = currentUser?.uid || `usr-local-${Date.now().toString(36)}`;
    const authorName = currentUser?.displayName || activePersona.name;
    const authorRole = isModeratorMode ? "moderator" : activePersona.role;

    const newReply: ForumReplyItem = {
      id: replyId,
      postId,
      authorId,
      authorName,
      authorRole,
      authorDistrict: activePersona.districtNameTh,
      content: text,
      likesCount: 0,
      isExpertAnswer: isModeratorMode || authorRole === "agri_officer",
      isFlagged: false,
      isHidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedReplies = [...(p.replies || []), newReply];
          return {
            ...p,
            replyCount: updatedReplies.length,
            replies: updatedReplies,
          };
        }
        return p;
      })
    );

    // Try Firestore update
    try {
      if (currentUser) {
        const replyDocRef = doc(db, "forumPosts", postId, "replies", replyId);
        await setDoc(replyDocRef, {
          postId,
          authorId,
          authorName,
          authorRole,
          districtNameTh: activePersona.districtNameTh,
          content: text,
          likesCount: 0,
          isExpertAnswer: isModeratorMode || authorRole === "agri_officer",
          isFlagged: false,
          isHidden: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const postDocRef = doc(db, "forumPosts", postId);
        const targetPost = posts.find((p) => p.id === postId);
        await updateDoc(postDocRef, {
          replyCount: (targetPost?.replyCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Could not sync reply to Firestore:", err);
    } finally {
      setIsSubmittingReply(false);
      setReplyTextMap((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  // Moderation: Report Post
  const handleConfirmReport = async () => {
    if (!reportingPost) return;

    const postId = reportingPost.id;
    const newReportCount = reportingPost.reportCount + 1;
    const isAutoFlagged = newReportCount >= 2;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            reportCount: newReportCount,
            moderationStatus: isAutoFlagged ? "flagged" : p.moderationStatus,
            reportReasons: [...(p.reportReasons || []), selectedReportReason],
          };
        }
        return p;
      })
    );

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, {
          reportCount: newReportCount,
          moderationStatus: isAutoFlagged ? "flagged" : "active",
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Report update error:", err);
    }

    setReportingPost(null);
  };

  // Moderation Tools: Pin/Unpin
  const handleTogglePinPost = async (postId: string, currentPin: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: !currentPin } : p))
    );

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, {
          isPinned: !currentPin,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Pin error:", err);
    }
  };

  // Moderation Tools: Lock/Unlock
  const handleToggleLockPost = async (postId: string, currentLock: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isLocked: !currentLock } : p))
    );

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, {
          isLocked: !currentLock,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Lock error:", err);
    }
  };

  // Moderation Tools: Hide/Restore
  const handleToggleHidePost = async (postId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "hidden" ? "active" : "hidden";
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, moderationStatus: nextStatus } : p))
    );

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, {
          moderationStatus: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Hide error:", err);
    }
  };

  // Moderation Tools: Save Moderator Note
  const handleSaveModeratorNote = async (postId: string) => {
    const note = modNoteInput.trim();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, moderatorNote: note } : p))
    );

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await updateDoc(postRef, {
          moderatorNote: note,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("Save note error:", err);
    }

    setEditingModNotePostId(null);
  };

  // Moderation Tools: Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("ยืนยันการลบกระทู้นี้ออกจากระบบเว็บบอร์ดหรือไม่?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (activePostId === postId) setActivePostId(null);

    try {
      if (currentUser) {
        const postRef = doc(db, "forumPosts", postId);
        await deleteDoc(postRef);
      }
    } catch (err) {
      console.warn("Delete post error:", err);
    }
  };

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Hide post if status is hidden and not in moderator mode
      if (post.moderationStatus === "hidden" && !isModeratorMode) {
        return false;
      }

      // Moderation queue filter
      if (moderationFilter === "reported" && post.reportCount === 0 && post.moderationStatus !== "flagged") {
        return false;
      }
      if (moderationFilter === "resolved" && !post.isResolved) {
        return false;
      }

      // Category filter
      if (selectedCategory !== "all" && post.category !== selectedCategory) {
        return false;
      }

      // Post Type filter
      if (selectedPostType !== "all" && post.postType !== selectedPostType) {
        return false;
      }

      // District filter
      if (selectedDistrictFilter !== "all" && post.districtId !== selectedDistrictFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.title.toLowerCase().includes(q);
        const inContent = post.content.toLowerCase().includes(q);
        const inAuthor = post.authorName.toLowerCase().includes(q);
        const inCrop = post.cropTag.toLowerCase().includes(q);
        const inDistrict = post.districtNameTh.toLowerCase().includes(q);
        if (!inTitle && !inContent && !inAuthor && !inCrop && !inDistrict) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Pinned posts always top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortOption === "likes") {
        return b.likesCount - a.likesCount;
      }
      if (sortOption === "replies") {
        return b.replyCount - a.replyCount;
      }
      // newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    posts,
    selectedCategory,
    selectedPostType,
    selectedDistrictFilter,
    searchQuery,
    sortOption,
    moderationFilter,
    isModeratorMode,
  ]);

  // Statistics
  const forumStats = useMemo(() => {
    const total = posts.length;
    const questions = posts.filter((p) => p.postType === "question");
    const resolved = questions.filter((p) => p.isResolved).length;
    const totalReplies = posts.reduce((acc, p) => acc + (p.replies?.length || p.replyCount || 0), 0);
    const reported = posts.filter((p) => p.reportCount > 0 || p.moderationStatus === "flagged").length;
    const resolveRate = questions.length > 0 ? Math.round((resolved / questions.length) * 100) : 100;

    const allReputations = getAllUsersReputations(posts);
    const expertAndHelpfulCount = allReputations.filter(
      (r) =>
        r.badge.key === "expert_farmer" ||
        r.badge.key === "helpful_member" ||
        r.badge.key === "master_agronomist"
    ).length;

    return {
      total,
      resolved,
      questionsCount: questions.length,
      resolveRate,
      totalReplies,
      reported,
      expertAndHelpfulCount,
      allReputations,
    };
  }, [posts]);

  // Render Post Type Icon & Badge
  const renderPostTypeBadge = (type: ForumPostType) => {
    switch (type) {
      case "question":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3 h-3" />
            <span>คำถามเกษตรกร</span>
          </span>
        );
      case "advice":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Lightbulb className="w-3 h-3" />
            <span>เทคนิค/แบ่งปัน</span>
          </span>
        );
      case "official_notice":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <BadgeAlert className="w-3 h-3" />
            <span>ประกาศทางการ/สิทธิประโยชน์</span>
          </span>
        );
      case "discussion":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <MessageSquare className="w-3 h-3" />
            <span>ร่วมเสวนา</span>
          </span>
        );
    }
  };

  // Render Reputation Badge Icon
  const renderBadgeIcon = (iconName: string, className = "w-3 h-3") => {
    switch (iconName) {
      case "Crown":
        return <Crown className={className} />;
      case "Award":
        return <Award className={className} />;
      case "HeartHandshake":
        return <HeartHandshake className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Sprout":
      default:
        return <Sprout className={className} />;
    }
  };

  // Farmer Reputation Badge Component (Clickable to view detailed reputation score & progress)
  const FarmerReputationBadge: React.FC<{
    authorName: string;
    onClick?: () => void;
    size?: "sm" | "md";
    showPoints?: boolean;
  }> = ({ authorName, onClick, size = "sm", showPoints = true }) => {
    const reputation = useMemo(
      () => calculateUserReputation(authorName, posts),
      [authorName]
    );
    const badge = reputation.badge;

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
          else setSelectedReputationAuthor(authorName);
        }}
        className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${badge.badgeColorClass} ${
          size === "md"
            ? "px-2.5 py-0.5 text-xs"
            : "px-2 py-0.2 text-[10px]"
        }`}
        title={`${badge.labelTh} (${badge.labelEn}) · ${reputation.reputationPoints} แต้มสะสม — คลิกเพื่อดูประวัติและระดับคะแนน`}
      >
        {renderBadgeIcon(badge.iconName, size === "md" ? "w-3.5 h-3.5" : "w-3 h-3")}
        <span>{badge.labelTh}</span>
        {showPoints && (
          <span className="opacity-80 font-mono text-[9px]">({reputation.reputationPoints})</span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Banner */}
      <div className="bg-gradient-to-br from-[#10192D]/95 via-[#0B1222]/95 to-[#080C16] card-ambient-glow border border-[#14B8A6]/40 rounded-3xl p-5 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_35px_rgba(20,184,166,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#14B8A6]/15 text-[#2DD4BF] border border-[#14B8A6]/35 shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                <Users className="w-3.5 h-3.5" />
                <span>Korat SmartAgri Community Forum</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#101728] text-slate-300 border border-slate-700/80">
                <MapPin className="w-3 h-3 text-[#2DD4BF]" />
                <span>เครือข่ายเกษตรกร 32 อำเภอ</span>
              </span>
              {isModeratorMode && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  <span>โหมดเครื่องมือผู้ดูแลระบบ (Active)</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-white tracking-tight flex items-center gap-2">
              <span className="gradient-text-teal">เสวนาเกษตรกรโคราช &amp; แลกเปลี่ยนภูมิปัญญา</span>
              <span className="text-[#2DD4BF] text-sm font-normal hidden sm:inline">
                (ถาม-ตอบ, โรคพืช, ปุ๋ยสั่งตัด, พันธมิตร 4P)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              พื้นที่ปรึกษาหารือ แลกเปลี่ยนเทคนิคการจัดการโรคพืช (SLCMV, หนอนกระทู้, ไหม้คอรวง),
              การคำนวณปุ๋ยสั่งตัด, การยื่นกู้สินเชื่อสีเขียว ธ.ก.ส. 2.5%,
              และสิทธิประโยชน์โควตาโรงงานน้ำตาล-แป้งมันสำปะหลัง โดยเกษตรกรตัวจริงและนักวิชาการเกษตร
            </p>
          </div>

          {/* Action CTAs: New Topic & Persona / Moderator controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#2DD4BF] hover:to-[#14B8A6] text-[#041E1C] font-bold text-xs sm:text-sm shadow-[0_6px_25px_rgba(20,184,166,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>ตั้งกระทู้ถาม-ตอบ / แบ่งปันเทคนิค</span>
            </button>

            {/* Leaderboard Toggle Button */}
            <button
              type="button"
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] cursor-pointer ${
                showLeaderboard
                  ? "bg-amber-950/60 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20"
                  : "bg-[#0E1626] hover:bg-[#141E33] border-slate-700 hover:border-amber-500/50 text-slate-300"
              }`}
              title="เปิดดูทำเนียบปราชญ์เกษตรกรและอันดับคะแนนช่วยเหลือ"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{showLeaderboard ? "ซ่อนทำเนียบปราชญ์" : "ทำเนียบปราชญ์เกษตรกร"}</span>
            </button>

            {/* Moderator Switcher */}
            <button
              type="button"
              onClick={() => setIsModeratorMode(!isModeratorMode)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] cursor-pointer ${
                isModeratorMode
                  ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20"
                  : "bg-[#0E1626] hover:bg-[#141E33] border-slate-700 hover:border-rose-500/40 text-slate-300"
              }`}
              title="สลับโหมดเครื่องมือจัดการกระทู้/รายงาน"
            >
              <Shield className={`w-3.5 h-3.5 ${isModeratorMode ? "text-rose-400" : "text-slate-400"}`} />
              <span>{isModeratorMode ? "ปิดโหมดผู้ดูแล" : "เครื่องมือผู้ดูแล"}</span>
            </button>
          </div>
        </div>

        {/* Identity & Persona Quick Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>ตัวตนโพสต์ปัจจุบัน:</span>
            </span>

            {/* Persona Selector dropdown */}
            <select
              value={activePersona.name}
              onChange={(e) => {
                const found = DEFAULT_PERSONAS.find((p) => p.name === e.target.value);
                if (found) setActivePersona(found);
              }}
              className="bg-[#080C16] border border-slate-700 hover:border-[#2DD4BF]/50 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#2DD4BF] transition-colors"
            >
              {DEFAULT_PERSONAS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({AUTHOR_ROLE_BADGES[p.role]?.labelTh})
                </option>
              ))}
            </select>

            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${AUTHOR_ROLE_BADGES[activePersona.role]?.colorClass}`}>
              {AUTHOR_ROLE_BADGES[activePersona.role]?.labelTh}
            </span>

            {/* Dynamic Reputation Badge for Active Persona */}
            <FarmerReputationBadge authorName={activePersona.name} size="sm" />

            <span className="text-slate-400">
              สังกัด: <strong className="text-slate-200">{activePersona.districtNameTh}</strong>
            </span>
          </div>

          {/* Google Auth Status */}
          <div className="flex items-center gap-2">
            {authLoading ? (
              <span className="text-slate-500 text-[11px]">กำลังเชื่อมต่อระบบบัญชี...</span>
            ) : currentUser ? (
              <div className="flex items-center gap-2 bg-[#080C16] px-2.5 py-1 rounded-lg border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 text-xs truncate max-w-[150px]">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="text-slate-400 hover:text-rose-400 text-[11px] flex items-center gap-0.5 ml-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>ออก</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>เข้าสู่ระบบด้วย Google (บันทึกข้ามเครื่อง)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0B101D] border border-[#1E293B] hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between smooth-card-transition">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">กระทู้ทั้งหมด</span>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono">
              {forumStats.total}
              <span className="text-xs font-normal text-slate-400 ml-1.5">หัวข้อ</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/40 flex items-center justify-center text-[#2DD4BF] shadow-[0_0_14px_rgba(20,184,166,0.2)]">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B101D] border border-[#1E293B] hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between smooth-card-transition">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">อัตราคลายข้อสงสัย</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
              {forumStats.resolveRate}%
              <span className="text-xs font-normal text-slate-400 ml-1.5">มีคำตอบชี้ชัด</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0B101D] border border-[#1E293B] hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 flex items-center justify-between smooth-card-transition">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">ความเห็น &amp; ข้อแนะนำ</span>
            <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono">
              {forumStats.totalReplies}
              <span className="text-xs font-normal text-slate-400 ml-1.5">คำตอบสะสม</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.2)]">
            <MessageCircle className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className={`bg-[#0B101D] border rounded-2xl p-4 sm:p-5 flex items-center justify-between cursor-pointer smooth-card-transition ${
            showLeaderboard
              ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/15"
              : "border-[#1E293B] hover:border-amber-500/50"
          }`}
          title="คลิกเพื่อเปิด/ปิดทำเนียบปราชญ์เกษตรกร"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">ปราชญ์ &amp; ผู้เกื้อกูล</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <span>{forumStats.expertAndHelpfulCount}</span>
              <span className="text-xs font-normal text-slate-400">ท่าน</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium ml-1">
                {showLeaderboard ? "ซ่อน" : "ดูอันดับ"}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.2)]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Contributors & Farmer Reputation Leaderboard Drawer/Section */}
      {showLeaderboard && (
        <div className="bg-[#0B101D] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>ทำเนียบปราชญ์เกษตรกร &amp; ผู้เกื้อกูลชุมชนยอดเยี่ยม</span>
                  <span className="text-xs font-normal text-amber-400 font-mono">
                    (Top Korat Smart Farmers)
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                คะแนนคำนวณจากความถี่ในการแบ่งปันเทคนิค (+15), ตอบข้อสงสัย (+10), โหวตเป็นประโยชน์ (+10) และคำตอบที่ได้รับการรับรองเป็นผู้เชี่ยวชาญ (+50)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLeaderboard(false)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 self-start md:self-auto p-1.5 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
              <span>ปิดแผงอันดับ</span>
            </button>
          </div>

          {/* Reputation Badge Tier Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5 p-3 rounded-xl bg-[#080C16] border border-slate-800/80 text-[11px]">
            {Object.values(REPUTATION_BADGE_CONFIG).map((b) => (
              <div key={b.key} className="flex items-center gap-1.5 p-1 rounded-lg">
                <span className={`p-1 rounded-md border ${b.badgeColorClass}`}>
                  {renderBadgeIcon(b.iconName, "w-3 h-3")}
                </span>
                <div>
                  <span className="font-semibold text-slate-200 block text-[11px] leading-tight">
                    {b.labelTh}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {b.minPoints > 0 ? `${b.minPoints}+ แต้ม` : "เริ่มต้น"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard Table / Cards */}
          <div className="space-y-2">
            {forumStats.allReputations.slice(0, 7).map((userProfile, rankIdx) => {
              const rankMedal =
                rankIdx === 0
                  ? "🥇 อันดับ 1"
                  : rankIdx === 1
                  ? "🥈 อันดับ 2"
                  : rankIdx === 2
                  ? "🥉 อันดับ 3"
                  : `#${rankIdx + 1}`;

              const isTopThree = rankIdx < 3;

              return (
                <div
                  key={userProfile.authorName}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isTopThree
                      ? "bg-slate-900/80 border-amber-500/30 hover:border-amber-400/50"
                      : "bg-[#080C16] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        rankIdx === 0
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : rankIdx === 1
                          ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                          : rankIdx === 2
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {rankMedal}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReputationAuthor(userProfile.authorName)}
                          className="font-bold text-white text-xs sm:text-sm hover:text-[#2DD4BF] text-left transition-colors cursor-pointer"
                        >
                          {userProfile.authorName}
                        </button>
                        <FarmerReputationBadge authorName={userProfile.authorName} size="sm" />
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${AUTHOR_ROLE_BADGES[userProfile.authorRole]?.colorClass}`}>
                          {AUTHOR_ROLE_BADGES[userProfile.authorRole]?.labelTh}
                        </span>
                        <span>· {userProfile.districtNameTh}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points & Contribution Stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                      <span title="กระทู้ที่เผยแพร่">
                        📝 <strong className="text-white font-mono">{userProfile.postsCount}</strong>
                      </span>
                      <span title="ความคิดเห็นและคำแนะนำ">
                        💬 <strong className="text-white font-mono">{userProfile.repliesCount}</strong>
                      </span>
                      <span title="การรับรองเป็นคำตอบผู้เชี่ยวชาญ">
                        🏆 <strong className="text-emerald-400 font-mono">{userProfile.expertSolutionsCount}</strong>
                      </span>
                      <span title="คะแนนถูกใจมีประโยชน์">
                        👍 <strong className="text-cyan-400 font-mono">{userProfile.likesReceived}</strong>
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-amber-400 font-mono">
                        {userProfile.reputationPoints}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">แต้ม</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReputationAuthor(userProfile.authorName)}
                        className="text-[10px] text-[#2DD4BF] hover:underline cursor-pointer"
                      >
                        ดูโปรไฟล์คะแนน
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Horizontal Scrolling Pill Filter */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>หมวดหมู่พืชและการเกษตร:</span>
          </span>
          <span className="text-[11px] text-slate-500">เลือกเพื่อกรองเฉพาะกลุ่มพืชที่สนใจ</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {FORUM_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const countInCat =
              cat.key === "all"
                ? posts.length
                : posts.filter((p) => p.category === cat.key).length;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#14B8A6] text-[#041E1C] border-[#2DD4BF] font-bold shadow-md shadow-teal-500/20"
                    : "bg-[#080C16] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span>{cat.labelTh}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected
                      ? "bg-[#041E1C]/20 text-[#041E1C]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {countInCat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อกระทู้, คำถาม, ปัญหาโรคพืช, ชื่อผู้โพสต์ หรืออำเภอ..."
            className="w-full bg-[#080C16] border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedPostType}
            onChange={(e) => setSelectedPostType(e.target.value)}
            className="bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
          >
            <option value="all">ทุกประเภทกระทู้</option>
            <option value="question">เฉพาะคำถาม (Questions)</option>
            <option value="advice">เฉพาะแบ่งปันเทคนิค (Advice)</option>
            <option value="discussion">เฉพาะร่วมเสวนา (Discussions)</option>
            <option value="official_notice">เฉพาะประกาศทางการ (Notices)</option>
          </select>

          {/* District Selector */}
          <select
            value={selectedDistrictFilter}
            onChange={(e) => setSelectedDistrictFilter(e.target.value)}
            className="bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
          >
            <option value="all">ทุกอำเภอในโคราช (32 อำเภอ)</option>
            {KORAT_DISTRICTS.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.nameTh}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
          >
            <option value="newest">ล่าสุด (Newest)</option>
            <option value="likes">ถูกใจมากที่สุด (Most Liked)</option>
            <option value="replies">มีคำตอบมากที่สุด (Most Replied)</option>
          </select>

          {/* Special Moderation Tab if Moderator Mode is active */}
          {isModeratorMode && (
            <div className="flex items-center gap-1 bg-[#080C16] p-1 rounded-xl border border-rose-500/40">
              <button
                type="button"
                onClick={() => setModerationFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  moderationFilter === "all"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setModerationFilter("reported")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  moderationFilter === "reported"
                    ? "bg-rose-500 text-white"
                    : "text-rose-400 hover:text-rose-300"
                }`}
              >
                <Flag className="w-3 h-3" />
                <span>คิวรายงาน ({forumStats.reported})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-[#0B101D] border border-[#1E293B] rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">ไม่พบกระทู้ที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น หรือเป็นคนแรกที่เริ่มตั้งกระทู้ถามในหัวข้อนี้
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPostType("all");
                setSelectedDistrictFilter("all");
                setSearchQuery("");
                setModerationFilter("all");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>รีเซ็ตตัวกรองทั้งหมด</span>
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = activePostId === post.id;
            const isLiked = likedIds.has(post.id);
            const isFlagged = post.moderationStatus === "flagged" || post.reportCount > 0;
            const isHidden = post.moderationStatus === "hidden";

            return (
              <div
                key={post.id}
                id={`forum-post-${post.id}`}
                className={`bg-[#0B101D] border rounded-2xl p-5 sm:p-6 smooth-card-transition shadow-sm ${
                  post.isPinned
                    ? "border-[#14B8A6]/60 bg-gradient-to-b from-[#14B8A6]/10 to-[#0B101D] shadow-[0_0_24px_rgba(20,184,166,0.12)]"
                    : isHidden
                    ? "border-rose-900/60 opacity-60 bg-rose-950/10"
                    : isFlagged
                    ? "border-amber-500/50 bg-amber-950/10"
                    : "border-[#1E293B] hover:border-[#2DD4BF]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                }`}
              >
                {/* Post Header: Pinned status, Category, Badges, Author */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14B8A6]/20 text-[#2DD4BF] border border-[#14B8A6]/40">
                        <Pin className="w-3 h-3 fill-current" />
                        <span>ปักหมุดโดยผู้ดูแล</span>
                      </span>
                    )}

                    {renderPostTypeBadge(post.postType)}

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      <span>{post.categoryNameTh}</span>
                    </span>

                    {post.isResolved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>แก้ไขปัญหาแล้ว</span>
                      </span>
                    )}

                    {post.isLocked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        <Lock className="w-3 h-3" />
                        <span>ปิดรับความเห็น</span>
                      </span>
                    )}

                    {isFlagged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <Flag className="w-3 h-3" />
                        <span>ถูกรายงาน ({post.reportCount} ครั้ง)</span>
                      </span>
                    )}

                    {isHidden && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <EyeOff className="w-3 h-3" />
                        <span>ถูกซ่อนชั่วคราว</span>
                      </span>
                    )}
                  </div>

                  {/* Post Timestamp & District */}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <strong className="text-slate-300 font-medium">{post.districtNameTh}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(post.createdAt).toLocaleDateString("th-TH")}</span>
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setActivePostId(isExpanded ? null : post.id)}
                  className="text-base sm:text-lg font-bold text-white hover:text-[#2DD4BF] cursor-pointer transition-colors leading-snug mb-2"
                >
                  {post.title}
                </h3>

                {/* Crop & Topic Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-teal-400 bg-teal-950/40 border border-teal-500/30 px-2 py-0.5 rounded-md font-medium">
                    <Sprout className="w-3 h-3" />
                    <span>{post.cropTag}</span>
                  </span>
                </div>

                {/* Content body */}
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                  {isExpanded || post.content.length <= 260
                    ? post.content
                    : `${post.content.slice(0, 260)}...`}
                </div>

                {post.content.length > 260 && (
                  <button
                    type="button"
                    onClick={() => setActivePostId(isExpanded ? null : post.id)}
                    className="text-xs font-semibold text-[#2DD4BF] hover:underline mb-3 block"
                  >
                    {isExpanded ? "ย่อเนื้อหา" : "อ่านต่อฉบับเต็ม..."}
                  </button>
                )}

                {/* Official Moderator Note if present */}
                {post.moderatorNote && (
                  <div className="mb-4 p-3 rounded-xl bg-teal-950/30 border border-teal-500/40 text-xs text-teal-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#2DD4BF] block">
                        คำชี้แจงจากผู้ดูแลระบบ / นักวิชาการ SmartAgri:
                      </span>
                      <p className="leading-relaxed text-slate-300">{post.moderatorNote}</p>
                    </div>
                  </div>
                )}

                {/* Author Info Card */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedReputationAuthor(post.authorName)}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#121A2B] to-[#0A0F1D] hover:from-[#14B8A6]/20 hover:to-[#0A0F1D] border border-slate-700/80 hover:border-[#2DD4BF] flex items-center justify-center text-slate-200 font-bold text-xs cursor-pointer transition-all shadow-xs hover:scale-105"
                      title="ดูระดับชื่อเสียงและคะแนนของเกษตรกรท่านนี้"
                    >
                      {post.authorName.slice(0, 1)}
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReputationAuthor(post.authorName)}
                          className="font-bold text-slate-200 hover:text-[#2DD4BF] text-xs text-left cursor-pointer transition-colors"
                        >
                          {post.authorName}
                        </button>
                        <FarmerReputationBadge authorName={post.authorName} size="sm" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${AUTHOR_ROLE_BADGES[post.authorRole]?.colorClass}`}>
                          {AUTHOR_ROLE_BADGES[post.authorRole]?.labelTh}
                        </span>
                        <span className="text-[11px] text-slate-400">· {post.districtNameTh}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Action Buttons: Upvote, Reply count, Report, Mod actions */}
                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLikePost(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        isLiked
                          ? "bg-teal-500/20 text-[#2DD4BF] border-teal-500/50"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span>มีประโยชน์</span>
                      <span className="font-mono font-bold ml-0.5">{post.likesCount}</span>
                    </button>

                    {/* Replies button */}
                    <button
                      type="button"
                      onClick={() => setActivePostId(isExpanded ? null : post.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ความคิดเห็น ({post.replies?.length || post.replyCount})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Report Post Button */}
                    <button
                      type="button"
                      onClick={() => setReportingPost(post)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="รายงานเนื้อหาไม่เหมาะสม"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>

                    {/* Moderator Quick Actions Bar */}
                    {isModeratorMode && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleTogglePinPost(post.id, post.isPinned)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            post.isPinned ? "text-[#2DD4BF] bg-teal-500/10" : "text-slate-400 hover:text-white"
                          }`}
                          title={post.isPinned ? "ยกเลิกปักหมุด" : "ปักหมุดกระทู้"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleLockPost(post.id, post.isLocked)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            post.isLocked ? "text-amber-400 bg-amber-500/10" : "text-slate-400 hover:text-white"
                          }`}
                          title={post.isLocked ? "ปลดล็อกกระทู้" : "ล็อกกระทู้"}
                        >
                          {post.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleHidePost(post.id, post.moderationStatus)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            post.moderationStatus === "hidden" ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white"
                          }`}
                          title={post.moderationStatus === "hidden" ? "แสดงกระทู้" : "ซ่อนกระทู้"}
                        >
                          {post.moderationStatus === "hidden" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingModNotePostId(post.id);
                            setModNoteInput(post.moderatorNote || "");
                          }}
                          className="p-1.5 rounded-lg text-teal-400 hover:bg-teal-950/40 transition-colors cursor-pointer"
                          title="เพิ่ม/แก้ไขคำชี้แจงผู้ดูแล"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="ลบกระทู้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Moderator Note Modal/Box */}
                {editingModNotePostId === post.id && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-teal-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" />
                        <span>เพิ่มข้อคิดเห็น/คำชี้แจงวิชาการจากผู้ดูแลระบบ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingModNotePostId(null)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={modNoteInput}
                      onChange={(e) => setModNoteInput(e.target.value)}
                      placeholder="พิมพ์ข้อความชี้แจงทางการ เช่น ข้อมูลนี้ถูกต้องตามระเบียบกรมวิชาการเกษตร หรือแนะนำให้ติดต่อสำนักงานเกษตรอำเภอ..."
                      rows={2}
                      className="w-full bg-[#080C16] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingModNotePostId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveModeratorNote(post.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#14B8A6] text-[#041E1C] text-xs font-bold"
                      >
                        บันทึกคำชี้แจง
                      </button>
                    </div>
                  </div>
                )}

                {/* Thread Replies Section (Visible when expanded) */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#2DD4BF]" />
                        <span>ข้อเสนอแนะ &amp; คำตอบ ({post.replies?.length || 0})</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        สามารถกดรับรอง "คำตอบผู้เชี่ยวชาญ" ได้
                      </span>
                    </h4>

                    {/* Replies List */}
                    <div className="space-y-3">
                      {post.replies && post.replies.length > 0 ? (
                        post.replies.map((reply) => {
                          const isReplyLiked = likedIds.has(reply.id);

                          return (
                            <div
                              key={reply.id}
                              className={`p-3.5 rounded-xl border transition-all ${
                                reply.isExpertAnswer
                                  ? "bg-emerald-950/20 border-emerald-500/40"
                                  : "bg-[#080C16] border-slate-800/80"
                              }`}
                            >
                              {/* Reply Header */}
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReputationAuthor(reply.authorName)}
                                    className="font-bold text-slate-200 hover:text-[#2DD4BF] text-xs text-left cursor-pointer transition-colors"
                                  >
                                    {reply.authorName}
                                  </button>
                                  <FarmerReputationBadge authorName={reply.authorName} size="sm" />
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                                      AUTHOR_ROLE_BADGES[reply.authorRole]?.colorClass
                                    }`}
                                  >
                                    {AUTHOR_ROLE_BADGES[reply.authorRole]?.labelTh}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    ({reply.authorDistrict})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {reply.isExpertAnswer && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                                      <Award className="w-3 h-3 text-emerald-400" />
                                      <span>คำตอบผู้เชี่ยวชาญ/ชี้ชัด</span>
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-500">
                                    {new Date(reply.createdAt).toLocaleDateString("th-TH")}
                                  </span>
                                </div>
                              </div>

                              {/* Reply Text */}
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                                {reply.content}
                              </p>

                              {/* Reply Footer: Like & Mark as Expert Answer */}
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                                <button
                                  type="button"
                                  onClick={() => handleToggleLikeReply(post.id, reply.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                    isReplyLiked
                                      ? "text-[#2DD4BF] bg-teal-500/10 font-bold"
                                      : "text-slate-400 hover:text-white"
                                  }`}
                                >
                                  <ThumbsUp className={`w-3 h-3 ${isReplyLiked ? "fill-current" : ""}`} />
                                  <span>ชอบ ({reply.likesCount})</span>
                                </button>

                                {/* Author or Moderator can toggle Expert Answer */}
                                {(isModeratorMode || post.authorId === (currentUser?.uid || "usr-local")) && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExpertAnswer(post.id, reply.id)}
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                      reply.isExpertAnswer
                                        ? "text-emerald-400 hover:text-emerald-300"
                                        : "text-slate-400 hover:text-emerald-400"
                                    }`}
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>
                                      {reply.isExpertAnswer
                                        ? "ยกเลิกคำตอบผู้เชี่ยวชาญ"
                                        : "รับรองเป็นคำตอบผู้เชี่ยวชาญ"}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-[#080C16] border border-slate-800/80 text-center text-xs text-slate-400">
                          ยังไม่มีความคิดเห็นในกระทู้นี้ ร่วมแสดงความคิดเห็นหรือให้คำแนะนำเป็นคนแรก
                        </div>
                      )}
                    </div>

                    {/* Add Reply Input Form */}
                    {!post.isLocked ? (
                      <div className="pt-2">
                        <div className="relative">
                          <textarea
                            value={replyTextMap[post.id] || ""}
                            onChange={(e) =>
                              setReplyTextMap({
                                ...replyTextMap,
                                [post.id]: e.target.value,
                              })
                            }
                            placeholder={`ตอบในนาม "${activePersona.name}" (${AUTHOR_ROLE_BADGES[activePersona.role]?.labelTh})... แลกเปลี่ยนคำแนะนำหรือประสบการณ์ตรง`}
                            rows={2}
                            className="w-full bg-[#080C16] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[11px] text-slate-500">
                              คำแนะนำที่เป็นประโยชน์จะได้รับตรา "คำตอบผู้เชี่ยวชาญ"
                            </span>
                            <button
                              type="button"
                              disabled={isSubmittingReply || !(replyTextMap[post.id] || "").trim()}
                              onClick={() => handleSubmitReply(post.id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#2DD4BF] text-[#041E1C] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>ส่งความคิดเห็น</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        <span>กระทู้นี้ถูกปิดรับความคิดเห็นเพิ่มเติมโดยผู้ดูแลระบบ</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      {reportingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0B101D] border border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Flag className="w-4 h-4" />
                <span>รายงานกระทู้ต่อผู้ดูแลระบบ</span>
              </div>
              <button
                type="button"
                onClick={() => setReportingPost(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">หัวข้อกระทู้:</span>
              <strong className="text-white font-medium">{reportingPost.title}</strong>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                เลือกเหตุผลในการรายงาน:
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-800 bg-[#080C16] text-xs text-slate-200 cursor-pointer hover:border-slate-700"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={selectedReportReason === reason}
                      onChange={() => setSelectedReportReason(reason)}
                      className="text-[#14B8A6] focus:ring-0"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              ระบบ SmartAgri มีนโยบายคัดกรองข้อมูลบิดเบือน เพื่อรักษาความปลอดภัยของผลผลิตและสิทธิประโยชน์ของเกษตรกรโคราช
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReportingPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmReport}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                ยืนยันการรายงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Forum Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-[#0B101D] border border-teal-500/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[#2DD4BF]">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ตั้งกระทู้เกษตรกรโคราชใหม่</h3>
                  <p className="text-xs text-slate-400">ถามปัญหา, แบ่งปันวิธีแก้โรคพืช, หรือปรึกษาเรื่องสินเชื่อ ธ.ก.ส.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              {/* Row 1: Post Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">ประเภทกระทู้</label>
                  <select
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as ForumPostType)}
                    className="w-full bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="question">❓ คำถาม (ขอคำปรึกษา/วิธีรักษาโรค)</option>
                    <option value="advice">💡 แบ่งปันเทคนิค/แนวทางปฏิบัติจริง</option>
                    <option value="discussion">💬 ร่วมเสวนาแลกเปลี่ยน</option>
                    <option value="official_notice">📢 ประกาศทางการ/สิทธิประโยชน์</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">หมวดหมู่พืช/หัวข้อ</label>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value as ForumCategoryKey)}
                    className="w-full bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
                  >
                    {FORUM_CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.labelTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: District & Crop Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">อำเภอที่ตั้งแปลง/ที่เกิดเรื่อง</label>
                  <select
                    value={newPostDistrictId}
                    onChange={(e) => setNewPostDistrictId(e.target.value)}
                    className="w-full bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#2DD4BF]"
                  >
                    {KORAT_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">แท็กพืช / พันธุ์พืช</label>
                  <input
                    type="text"
                    value={newPostCropTag}
                    onChange={(e) => setNewPostCropTag(e.target.value)}
                    placeholder="เช่น มันสำปะหลัง กวก. 50, อ้อยขอนแก่น 3, ข้าว 105"
                    className="w-full bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">
                  หัวข้อกระทู้ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="เขียนหัวข้อให้กระชับ ชัดเจน เช่น วิธีแก้อาการใบหงิกด่างมันสำปะหลัง อ.เสิงสาง..."
                  className="w-full bg-[#080C16] border border-slate-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">
                  รายละเอียดเนื้อหา <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="อธิบายอาการ อายุพืช สภาพอากาศ หรือคำถามที่ต้องการให้เพื่อนเกษตรกรและนักวิชาการช่วยตอบ..."
                  className="w-full bg-[#080C16] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#2DD4BF]"
                />
              </div>

              {/* Author Preview */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex flex-wrap items-center gap-2 text-slate-300">
                  <UserIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>
                    โพสต์ในนาม: <strong>{activePersona.name}</strong> ({AUTHOR_ROLE_BADGES[activePersona.role]?.labelTh})
                  </span>
                  <FarmerReputationBadge authorName={activePersona.name} size="sm" />
                </div>
                <span className="text-slate-500 text-[11px]">สังกัด {activePersona.districtNameTh}</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPost || !newPostTitle.trim() || !newPostContent.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#2DD4BF] hover:to-[#14B8A6] text-[#041E1C] font-bold text-xs shadow-lg shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingPost ? "กำลังเผยแพร่..." : "เผยแพร่กระทู้ทันที"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer Reputation Profile & Score Breakdown Modal */}
      {selectedReputationAuthor && (() => {
        const repProfile = calculateUserReputation(selectedReputationAuthor, posts);
        const badge = repProfile.badge;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="bg-[#0B101D] card-ambient-glow border border-amber-500/50 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.15)] space-y-5 my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">โปรไฟล์ระดับชื่อเสียงปราชญ์เกษตรกร</h3>
                    <p className="text-xs text-slate-400">Korat Smart Farmer Reputation System</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReputationAuthor(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Author Overview Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-[#080C16] border border-slate-700/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{repProfile.authorName}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded font-medium border ${AUTHOR_ROLE_BADGES[repProfile.authorRole]?.colorClass}`}>
                        {AUTHOR_ROLE_BADGES[repProfile.authorRole]?.labelTh}
                      </span>
                      <span className="text-slate-400">· {repProfile.districtNameTh}</span>
                    </div>
                  </div>

                  {/* Big Points Badge */}
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold font-mono text-amber-400 leading-none">
                      {repProfile.reputationPoints}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">คะแนนชื่อเสียงสะสม</span>
                  </div>
                </div>

                {/* Badge Tier Card */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${badge.badgeColorClass}`}>
                  <span className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                    {renderBadgeIcon(badge.iconName, "w-6 h-6")}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">{badge.labelTh}</span>
                      <span className="text-xs opacity-75">({badge.labelEn})</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                      {badge.descriptionTh}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {repProfile.nextTier.badge ? (
                <div className="p-3.5 rounded-xl bg-[#080C16] border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>ระดับถัดไป: <strong>{repProfile.nextTier.badge.labelTh}</strong></span>
                    </span>
                    <span className="text-amber-400 font-mono font-bold">
                      {repProfile.nextTier.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#14B8A6] to-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${repProfile.nextTier.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>เกณฑ์ขั้นต่ำ: {repProfile.nextTier.badge.minPoints} แต้ม</span>
                    <span>ต้องการอีก {repProfile.nextTier.pointsNeeded} แต้มเพื่อเลื่อนระดับ</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/40 text-xs text-purple-300 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>อยู่ในระดับสูงสุด: ปรมาจารย์เกษตรอัจฉริยะ (Master Agronomist)</span>
                </div>
              )}

              {/* Points Breakdown Metrics */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  เกณฑ์การสะสมคะแนนผลงาน (Activity Breakdown):
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#080C16] border border-slate-800 space-y-0.5">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>📝 กระทู้เผยแพร่ (+15):</span>
                      <strong className="text-white font-mono">{repProfile.postsCount}</strong>
                    </div>
                    <div className="text-teal-400 font-mono font-bold text-xs">
                      +{repProfile.postsCount * 15} แต้ม
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080C16] border border-slate-800 space-y-0.5">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>💬 คำตอบ/แนะนำ (+10):</span>
                      <strong className="text-white font-mono">{repProfile.repliesCount}</strong>
                    </div>
                    <div className="text-cyan-400 font-mono font-bold text-xs">
                      +{repProfile.repliesCount * 10} แต้ม
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080C16] border border-slate-800 space-y-0.5">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>👍 ถูกใจมีประโยชน์ (+10):</span>
                      <strong className="text-white font-mono">{repProfile.likesReceived}</strong>
                    </div>
                    <div className="text-amber-400 font-mono font-bold text-xs">
                      +{repProfile.likesReceived * 10} แต้ม
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080C16] border border-slate-800 space-y-0.5">
                    <div className="text-slate-400 text-[11px] flex items-center justify-between">
                      <span>🏆 คำตอบชี้ชัด (+50):</span>
                      <strong className="text-white font-mono">{repProfile.expertSolutionsCount}</strong>
                    </div>
                    <div className="text-emerald-400 font-mono font-bold text-xs">
                      +{repProfile.expertSolutionsCount * 50} แต้ม
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(repProfile.authorName);
                    setSelectedReputationAuthor(null);
                  }}
                  className="inline-flex items-center gap-1 text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ดูกระทู้และคำตอบของ {repProfile.authorName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReputationAuthor(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
