

export enum UserRole {
  FREE = 'Free User',
  PREMIUM = 'Premium',
  EDITOR = 'Editor',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin'
}

export enum ContentType {
  VIDEO = 'Video',
  PODCAST = 'Podcast',
  BUSINESS = 'Business Listing',
  ARTICLE = 'Article'
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
  id: string;
  title: string;
  type: ContentType;
  author: string;
  status: Status;
  views: number;
  date: string;
  description: string;
  thumbnailUrl?: string;
  mediaUrl?: string; // Added for playable content
  likes?: number;
  comments?: number;
  // Business specific
  rating?: number;
  reviewCount?: number;
  location?: string;
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