// ─── Auth ─────────────────────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Business ─────────────────────────────────────────────────────────────────

export type BusinessCategory =
  | 'salon' | 'gym' | 'restaurant' | 'clinic'
  | 'repair' | 'tuition' | 'other';

export interface Service {
  _id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface Business {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string;
  category: BusinessCategory;
  phone?: string;
  address?: string;
  city?: string;
  area?: string;
  pincode?: string;
  location?: GeoPoint;
  serviceRadiusKm?: number;
  logoUrl: string | null;
  bannerUrl: string | null;
  galleryUrls?: string[];
  services: Service[];
  hours: BusinessHours;
  isPublished: boolean;
  totalBookings: number;
  averageRating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  distanceKm?: number;
  distanceMeters?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'pay_later' | 'demo_card' | 'upi' | 'card';

export interface Booking {
  _id: string;
  businessId: string;
  customerId: string;
  customerUserId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string;
  rescheduledFrom?: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Customer {
  _id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  lastBookingDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  _id: string;
  userId: string;
  phone?: string;
  city?: string;
  area?: string;
  pincode?: string;
  location?: GeoPoint;
  savedAddresses: Array<{
    label?: string;
    address?: string;
    city?: string;
    area?: string;
    pincode?: string;
  }>;
  savedBusinessIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  businessId: string;
  amount: number;
  currency: string;
  provider: 'demo' | 'stripe' | 'razorpay';
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  businessId: string;
  customerUserId: string;
  bookingId: string;
  customerName: string;
  rating: number;
  comment?: string;
  status: 'published' | 'hidden';
  reportCount?: number;
  reportReason?: string;
  reportedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategoryOption {
  _id: string;
  name: string;
  slug: string;
  businessCategory: BusinessCategory;
  description?: string;
  icon: string;
  keywords: string[];
  displayOrder: number;
  isActive: boolean;
}

export interface ServiceCollection {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  icon: string;
  categories: BusinessCategory[];
  keywords: string[];
  accent: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ServiceDiscoveryHome {
  categories: ServiceCategoryOption[];
  collections: ServiceCollection[];
}

export interface RecommendationSection {
  id: string;
  title: string;
  subtitle: string;
  businesses: Business[];
}

export interface RecommendationHome {
  generatedAt: string;
  strategy: string;
  sections: RecommendationSection[];
}

export type CustomerEventType =
  | 'search'
  | 'view_business'
  | 'click_collection'
  | 'click_category'
  | 'save_business'
  | 'unsave_business'
  | 'booking_intent'
  | 'booking_created';

export interface CustomerEventPayload {
  eventType: CustomerEventType;
  businessId?: string;
  businessSlug?: string;
  serviceId?: string;
  serviceName?: string;
  category?: BusinessCategory;
  collectionSlug?: string;
  query?: string;
  city?: string;
  area?: string;
  pincode?: string;
  location?: {
    lat: number;
    lng: number;
  };
  metadata?: Record<string, unknown>;
}

export interface CustomerEvent extends CustomerEventPayload {
  _id: string;
  userId?: string | null;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response shape ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
}
