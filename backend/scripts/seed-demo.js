const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is required. Add it to backend/.env first.');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, default: 'BUSINESS_OWNER' },
    phone: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    refreshToken: { type: String, default: null, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'users' },
);

const dayHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false },
);

const serviceSchema = new mongoose.Schema({
  name: String,
  durationMinutes: Number,
  price: Number,
  description: String,
  isActive: { type: Boolean, default: true },
});

const businessSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: String,
    slug: { type: String, unique: true, index: true },
    description: String,
    category: String,
    phone: String,
    address: String,
    city: String,
    area: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
    serviceRadiusKm: { type: Number, default: 10 },
    logoUrl: String,
    bannerUrl: String,
    services: [serviceSchema],
    hours: {
      monday: { type: dayHoursSchema, default: () => ({}) },
      tuesday: { type: dayHoursSchema, default: () => ({}) },
      wednesday: { type: dayHoursSchema, default: () => ({}) },
      thursday: { type: dayHoursSchema, default: () => ({}) },
      friday: { type: dayHoursSchema, default: () => ({}) },
      saturday: { type: dayHoursSchema, default: () => ({ isClosed: true }) },
      sunday: { type: dayHoursSchema, default: () => ({ isClosed: true }) },
    },
    isPublished: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'businesses' },
);

const customerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    name: String,
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    totalBookings: { type: Number, default: 0 },
    lastBookingDate: Date,
    tags: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'customers' },
);
customerSchema.index({ businessId: 1, email: 1 }, { unique: true });

const customerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
    phone: String,
    city: String,
    area: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number], default: undefined },
    },
    savedAddresses: { type: [Object], default: [] },
  },
  { timestamps: true, collection: 'customer_profiles' },
);
customerProfileSchema.index({ city: 1, area: 1, pincode: 1 });
customerProfileSchema.index({ location: '2dsphere' });

const bookingSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', index: true },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    serviceId: String,
    serviceName: String,
    servicePrice: { type: Number, default: 0 },
    date: Date,
    startTime: String,
    endTime: String,
    status: { type: String, default: 'pending', index: true },
    notes: String,
    paymentStatus: { type: String, default: 'unpaid', index: true },
    paymentMethod: { type: String, default: 'pay_later' },
    paymentId: { type: String, default: null },
  },
  { timestamps: true, collection: 'bookings' },
);

const User = mongoose.model('User', userSchema);
const Business = mongoose.model('Business', businessSchema);
const Customer = mongoose.model('Customer', customerSchema);
const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);
const Booking = mongoose.model('Booking', bookingSchema);

const demoEmail = 'demo@smartbusinesshub.local';
const demoPassword = 'password123';

function nextWeekday(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function main() {
  await mongoose.connect(MONGO_URI);

  const existingUser = await User.findOne({ email: demoEmail });
  if (existingUser) {
    const oldBusiness = await Business.findOne({ ownerId: existingUser._id });
    if (oldBusiness) {
      await Booking.deleteMany({ businessId: oldBusiness._id });
      await Customer.deleteMany({ businessId: oldBusiness._id });
      await Business.deleteOne({ _id: oldBusiness._id });
    }
    await CustomerProfile.deleteMany({ userId: existingUser._id });
    await User.deleteOne({ _id: existingUser._id });
  }
  const oldDemoUsers = await User.find({ email: /@smartbusinesshub\.local$/ });
  await CustomerProfile.deleteMany({ userId: { $in: oldDemoUsers.map((item) => item._id) } });
  await User.deleteMany({ email: /@smartbusinesshub\.local$/ });
  const existingDemoBusinesses = await Business.find({
    slug: { $in: ['aster-studio-salon', 'pulsefit-studio', 'citycare-dental-clinic'] },
  });
  for (const item of existingDemoBusinesses) {
    await Booking.deleteMany({ businessId: item._id });
    await Customer.deleteMany({ businessId: item._id });
  }
  await Business.deleteMany({
    slug: { $in: ['aster-studio-salon', 'pulsefit-studio', 'citycare-dental-clinic'] },
  });

  const password = await bcrypt.hash(demoPassword, 12);
  const user = await User.create({
    name: 'Demo Owner',
    email: demoEmail,
    phone: '+91 98765 43210',
    password,
    role: 'BUSINESS_OWNER',
    isActive: true,
  });

  const businessName = 'Aster Studio Salon';
  const business = await Business.create({
    ownerId: user._id,
    name: businessName,
    slug: slugify(businessName, { lower: true, strict: true }),
    description:
      'A premium neighborhood salon offering sharp grooming, skin care, and restorative styling appointments.',
    category: 'salon',
    phone: '+91 98765 43210',
    address: 'MG Road',
    city: 'Lucknow',
    area: 'MG Road',
    pincode: '226001',
    location: { type: 'Point', coordinates: [80.9462, 26.8467] },
    serviceRadiusKm: 12,
    isPublished: true,
    services: [
      {
        name: 'Signature Haircut',
        durationMinutes: 45,
        price: 650,
        description: 'Consultation, wash, cut, and finish.',
      },
      {
        name: 'Hydrating Facial',
        durationMinutes: 60,
        price: 1500,
        description: 'Deep cleanse and glow treatment.',
      },
      {
        name: 'Bridal Styling Consult',
        durationMinutes: 90,
        price: 2500,
        description: 'Personal styling plan and trial look.',
      },
    ],
  });

  const customers = await Customer.insertMany([
    {
      businessId: business._id,
      name: 'Ananya Mehra',
      email: 'ananya@example.com',
      phone: '+91 90000 00001',
      totalBookings: 2,
      lastBookingDate: nextWeekday(2),
      tags: ['regular'],
    },
    {
      businessId: business._id,
      name: 'Rohan Kapoor',
      email: 'rohan@example.com',
      phone: '+91 90000 00002',
      totalBookings: 1,
      lastBookingDate: nextWeekday(3),
      tags: ['new'],
    },
    {
      businessId: business._id,
      name: 'Meera Joshi',
      email: 'meera@example.com',
      phone: '+91 90000 00003',
      totalBookings: 1,
      lastBookingDate: nextWeekday(5),
      tags: ['bridal'],
    },
  ]);

  const [haircut, facial, bridal] = business.services;
  await Booking.insertMany([
    {
      businessId: business._id,
      customerId: customers[0]._id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      serviceId: haircut._id.toString(),
      serviceName: haircut.name,
      servicePrice: haircut.price,
      date: nextWeekday(2),
      startTime: '10:00',
      endTime: '10:45',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'demo_card',
      paymentId: 'seed-payment-001',
      notes: 'Prefers short layers.',
    },
    {
      businessId: business._id,
      customerId: customers[1]._id,
      customerName: customers[1].name,
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      serviceId: facial._id.toString(),
      serviceName: facial.name,
      servicePrice: facial.price,
      date: nextWeekday(3),
      startTime: '14:00',
      endTime: '15:00',
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'pay_later',
      notes: 'Sensitive skin.',
    },
    {
      businessId: business._id,
      customerId: customers[2]._id,
      customerName: customers[2].name,
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      serviceId: bridal._id.toString(),
      serviceName: bridal.name,
      servicePrice: bridal.price,
      date: nextWeekday(5),
      startTime: '11:00',
      endTime: '12:30',
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'demo_card',
      paymentId: 'seed-payment-002',
      notes: 'Wedding in June.',
    },
  ]);

  await Business.findByIdAndUpdate(business._id, { totalBookings: 3 });

  const marketplaceOwners = await User.insertMany([
    {
      name: 'PulseFit Owner',
      email: 'pulsefit@smartbusinesshub.local',
      phone: '+91 98765 43211',
      password,
      role: 'BUSINESS_OWNER',
      isActive: true,
    },
    {
      name: 'CityCare Owner',
      email: 'citycare@smartbusinesshub.local',
      phone: '+91 98765 43212',
      password,
      role: 'BUSINESS_OWNER',
      isActive: true,
    },
  ]);

  const customerUser = await User.create({
    name: 'Demo Customer',
    email: 'customer@smartbusinesshub.local',
    phone: '+91 90000 00010',
    password,
    role: 'CUSTOMER',
    isActive: true,
  });

  await CustomerProfile.create({
    userId: customerUser._id,
    phone: '+91 90000 00010',
    city: 'Lucknow',
    area: 'Gomti Nagar',
    pincode: '226010',
    location: { type: 'Point', coordinates: [81.0107, 26.8626] },
  });

  await Business.insertMany([
    {
      ownerId: marketplaceOwners[0]._id,
      name: 'PulseFit Studio',
      slug: 'pulsefit-studio',
      description:
        'Small-group strength training, mobility coaching, and personal fitness sessions.',
      category: 'gym',
      phone: '+91 98765 43211',
      address: 'Hazratganj',
      city: 'Lucknow',
      area: 'Hazratganj',
      pincode: '226001',
      location: { type: 'Point', coordinates: [80.9437, 26.8504] },
      serviceRadiusKm: 8,
      isPublished: true,
      totalBookings: 18,
      services: [
        {
          name: 'Personal Training',
          durationMinutes: 60,
          price: 1200,
          description: 'One-on-one strength and mobility session.',
        },
        {
          name: 'Group HIIT Class',
          durationMinutes: 45,
          price: 450,
          description: 'High-energy class with coach guidance.',
        },
      ],
    },
    {
      ownerId: marketplaceOwners[1]._id,
      name: 'CityCare Dental Clinic',
      slug: 'citycare-dental-clinic',
      description:
        'Modern dental consultations, cleaning, whitening, and preventive care appointments.',
      category: 'clinic',
      phone: '+91 98765 43212',
      address: 'Gomti Nagar',
      city: 'Lucknow',
      area: 'Gomti Nagar',
      pincode: '226010',
      location: { type: 'Point', coordinates: [81.0107, 26.8626] },
      serviceRadiusKm: 10,
      isPublished: true,
      totalBookings: 26,
      services: [
        {
          name: 'Dental Consultation',
          durationMinutes: 30,
          price: 700,
          description: 'Doctor consultation and treatment plan.',
        },
        {
          name: 'Cleaning and Polishing',
          durationMinutes: 50,
          price: 1800,
          description: 'Professional oral hygiene appointment.',
        },
      ],
    },
  ]);

  console.log('Demo data seeded.');
  console.log(`Email: ${demoEmail}`);
  console.log(`Password: ${demoPassword}`);
  console.log('Customer Email: customer@smartbusinesshub.local');
  console.log(`Customer Password: ${demoPassword}`);
  console.log(`Public URL: /b/${business.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
