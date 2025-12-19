

export enum UserRole {
  FREE = 'Free User',
  PREMIUM = 'Premium',
  EDITOR = 'Editor',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin'
}

export interface Like {
  id: string | number;
  user_name: string;
  created_at: string;
}

export interface Comment {
  id: string | number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
  status: 'draft' | 'published';
  likes?: number;
  comments?: number;
  views?: number;
  likedBy?: Like[];
  commentList?: Comment[];
}
export enum ContentType {
  VIDEO = 'Video',
  PODCAST = 'Podcast',
  BUSINESS = 'Business',
  ARTICLE = 'Article',
  REVIEW = 'Review'
}

export enum Status {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  SUSPENDED = 'Suspended'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: Status;
  joinedAt: string;
  lastLogin: string;
}

export interface ContentItem {
  id: string | number;
  title: string;
  type: ContentType;
  author: string;
  status: Status;
  views: number;
  date: string;
  description: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  mediaUrl?: string;
  media_url?: string;
  likes?: number;
  comments?: number;
  // Business specific
  rating?: number;
  comment?: string;
  reviewCount?: number;
  location?: string;
  category?: string;
  phone?: string;
  address?: string;
  map_pin?: string;
  website_url?: string;
  details?: Record<string, any>;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'Subscribed' | 'Unsubscribed';
}

export interface Advertisement {
  id: string;
  title: string;
  clientName: string;
  imageUrl: string;
  link: string;
  impressions: number;
  clicks: number;
  status: Status;
  type: 'Image' | 'Video';
  placement: string;
  duration: number;
  durationUnit: 'Days' | 'Weeks' | 'Years';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: Status;
  registeredCount: number;
  expectedAttendees?: number;
  description?: string;
  imageUrl?: string;
}

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  ticketType: 'General' | 'VIP';
  status: 'Confirmed' | 'Pending';
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  postedDate: string;
  applicantsCount: number;
  status: Status;
  logoUrl?: string;
  description?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  appliedDate: string;
  status: 'New' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  resumeUrl: string;
  avatar?: string;
}

export interface Ad {
  id: number;
  title: string;
  type: string;
  placement: string;
  url: string;
  durationDays: number;
  mediaFile: string | null;
  status: 'active' | 'inactive';
}