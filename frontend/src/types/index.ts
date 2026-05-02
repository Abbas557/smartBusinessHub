// ─── Auth ─────────────────────────────────────────────────────────────────────

export type Role = 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'CUSTOMER';

export interface User {
  _id: string;
  name: string;
  email: string;
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
  logoUrl: string | null;
  bannerUrl: string | null;
  services: Service[];
  hours: BusinessHours;
  isPublished: boolean;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
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
