# Smart Business Hub Platform Scaling Plan

## Purpose

Smart Business Hub is evolving from a single business-owner dashboard into a two-sided local services marketplace.

The platform must serve two clearly different users:

1. Business owners, who register their business, publish services, manage bookings, collect payments, and track business performance.
2. Customers, who discover nearby businesses, compare services, book appointments, pay online, and manage their own bookings.

The current codebase already contains useful foundations:

- Owner authentication
- Business profile management
- Services and business hours
- Public business profiles
- Booking flow
- Customer records generated from bookings
- Demo payment module
- Marketplace listing
- Owner analytics dashboard

The next stage is to make these foundations explicit, scalable, and role-based.

## Core Problem

The website currently mixes two product ideas:

- A SaaS workspace for business owners
- A discovery and booking marketplace for customers

As the product grows, these experiences need separate navigation, separate onboarding, separate data requirements, and separate dashboards.

The owner experience should feel like business software.

The customer experience should feel like a local discovery and booking app.

The platform also needs location awareness. Customers should not see every vendor in the database by default. They should see businesses relevant to their area, city, locality, or current location.

## Target Roles

### Business Owner

Business owners create and manage vendor profiles.

They need to provide:

- Owner full name
- Owner email
- Owner password
- Owner phone number
- Business name
- Business category
- Business phone number
- Business address
- City
- Area or locality
- Pincode
- Latitude and longitude
- Company logo
- Banner image
- Business description
- Service list
- Service prices
- Service duration
- Opening hours
- Payment preferences

After registration, a business owner should not land on a generic empty page. They should enter a guided onboarding flow that helps them complete their vendor profile and publish it.

### Customer

Customers browse, book, and pay.

They need:

- Customer name
- Email
- Password
- Phone number
- City
- Area or locality
- Optional current location permission
- Booking history
- Saved profile details

Customers should be able to browse as guests, but booking and payment should either create a customer account or attach the booking to an existing customer account.

## Target Site Structure

```text
/
|-- /owner/register
|-- /owner/login
|-- /owner/onboarding
|-- /dashboard
|   |-- /dashboard/overview
|   |-- /dashboard/business-profile
|   |-- /dashboard/services
|   |-- /dashboard/bookings
|   |-- /dashboard/customers
|   |-- /dashboard/payments
|   |-- /dashboard/analytics
|   `-- /dashboard/settings
|-- /customer/register
|-- /customer/login
|-- /marketplace
|-- /business/:slug
|-- /business/:slug/book
|-- /checkout/:bookingId
|-- /customer/bookings
|-- /customer/profile
`-- /customer/settings
```

The current routes can be migrated gradually. For example, `/register` can first become a role-selection page, then redirect to `/owner/register` or `/customer/register`.

## User Experience Goals

### Owner Experience

The owner side should be operational and work-focused.

Important owner flows:

- Create account
- Complete vendor onboarding
- Upload logo and banner
- Add business location
- Add services and prices
- Set opening hours
- Publish profile
- View bookings
- Confirm, complete, or cancel bookings
- Track paid and unpaid revenue
- Manage customers
- View marketplace listing preview

The dashboard should show:

- Projected revenue
- Paid revenue
- Average order value
- Payment conversion
- Upcoming bookings
- Booking status funnel
- Service revenue ranking
- Customer growth
- Profile completeness

### Customer Experience

The customer side should feel like a marketplace.

Important customer flows:

- Browse nearby businesses
- Search by service or vendor
- Filter by category
- Filter by city, area, or distance
- View vendor profile
- Select a service
- Select date and time
- Book appointment
- Pay online or choose pay at venue
- View booking confirmation
- See booking history

Customer cards should show:

- Business name
- Logo
- Banner or category visual
- Category
- City and area
- Distance from customer
- Starting price
- Available services
- Next available slot
- Book button

## Location Strategy

Location is a key scaling requirement.

Customers should only see relevant nearby vendors.

### Phase 1 Location Filtering

Use simple structured fields:

- city
- area
- pincode
- category
- service keyword

Marketplace API example:

```text
GET /api/marketplace/businesses?city=Lucknow&area=Gomti%20Nagar&category=salon&search=haircut
```

This is easier to implement and does not require maps immediately.

### Phase 2 Geospatial Search

Add latitude and longitude to businesses and customers.

Business schema should include:

```ts
location: {
  type: 'Point',
  coordinates: [longitude, latitude]
}
serviceRadiusKm: number
```

MongoDB should use a `2dsphere` index.

Marketplace API example:

```text
GET /api/marketplace/businesses?lat=26.8467&lng=80.9462&radiusKm=10&category=salon&search=haircut
```

The backend should return distance for each business.

### Phase 3 Maps And Autocomplete

Later, use a maps provider for:

- Address autocomplete
- Geocoding address to latitude/longitude
- Displaying businesses on a map
- Distance and travel estimates

Possible providers:

- Google Maps Platform
- Mapbox
- LocationIQ
- OpenStreetMap/Nominatim for limited use

## Data Model Direction

### User

Represents login identity.

Fields:

```ts
name
email
password
role
phone
avatarUrl
isActive
refreshToken
```

Roles:

```ts
BUSINESS_OWNER
CUSTOMER
SUPER_ADMIN
```

### Business

Represents a vendor profile.

Fields:

```ts
ownerId
name
slug
description
category
phone
address
city
area
pincode
location
serviceRadiusKm
logoUrl
bannerUrl
gallery
services
hours
isPublished
totalBookings
ratingAverage
ratingCount
```

### Service

Embedded under business for now.

Fields:

```ts
name
description
durationMinutes
price
isActive
```

In the future, services can become their own collection if search, analytics, and availability become more complex.

### Customer Profile

Represents customer-specific profile data.

Fields:

```ts
userId
phone
city
area
pincode
location
savedAddresses
preferences
```

### Booking

Connects customer, business, service, slot, and payment.

Fields:

```ts
businessId
customerId
customerUserId
customerName
customerEmail
customerPhone
serviceId
serviceName
servicePrice
date
startTime
endTime
status
notes
paymentStatus
paymentMethod
paymentId
paidAt
```

Booking statuses:

```ts
pending
confirmed
completed
cancelled
```

Payment statuses:

```ts
unpaid
pending
paid
failed
refunded
```

### Payment

Represents transaction records.

Fields:

```ts
bookingId
businessId
customerUserId
amount
currency
provider
providerOrderId
providerPaymentId
status
method
reference
paidAt
rawProviderPayload
```

Providers:

```ts
demo
razorpay
stripe
paypal
```

### Review

Future feature.

Fields:

```ts
businessId
bookingId
customerUserId
rating
comment
isPublished
```

## API Direction

### Auth

```text
POST /api/auth/register-owner
POST /api/auth/register-customer
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Owner

```text
GET   /api/business/me
POST  /api/business
PATCH /api/business/me
POST  /api/business/me/publish
POST  /api/business/me/unpublish
POST  /api/business/me/services
PATCH /api/business/me/services/:serviceId
DELETE /api/business/me/services/:serviceId
PATCH /api/business/me/hours
```

### Customer

```text
GET   /api/customer/me
PATCH /api/customer/me
GET   /api/customer/bookings
GET   /api/customer/bookings/:id
```

### Marketplace

```text
GET /api/marketplace/businesses
GET /api/marketplace/businesses/:slug
GET /api/marketplace/categories
GET /api/marketplace/suggestions
```

Recommended query parameters:

```text
search
category
city
area
pincode
lat
lng
radiusKm
minPrice
maxPrice
date
```

### Bookings

```text
POST /api/bookings
GET  /api/bookings/slots
GET  /api/bookings
GET  /api/bookings/:id
PATCH /api/bookings/:id/status
DELETE /api/bookings/:id
```

### Payments

Demo:

```text
POST /api/payments/demo-checkout
```

Production-ready direction:

```text
POST /api/payments/create-order
POST /api/payments/verify
POST /api/payments/webhook
GET  /api/payments/:id
```

## Payment Strategy

The current demo payment flow is useful for product testing.

For production:

- Use Razorpay first if the main market is India.
- Use Stripe if the main market is international.
- Keep the internal `Payment` model provider-neutral.
- Booking should not rely directly on provider-specific fields.
- Payment verification should happen on the backend.
- Webhooks should update payment and booking status.

Recommended booking-payment behavior:

- Customer creates booking.
- Backend creates payment order.
- Customer pays through provider checkout.
- Backend verifies payment.
- Payment becomes `paid`.
- Booking becomes `confirmed`.
- Owner sees revenue in dashboard.
- Customer sees paid booking in customer account.

## Implementation Phases

### Phase 1: Role Split And Onboarding

Goal: make owner and customer experiences explicit.

Tasks:

- Convert `/register` into a role-selection screen.
- Add `/owner/register`.
- Add `/customer/register`.
- Update auth registration DTOs to support role-specific fields.
- Add owner onboarding wizard.
- Add customer profile creation.
- Redirect owners to dashboard.
- Redirect customers to marketplace.

Deliverable:

Owners and customers can register separately and land in different views.

### Phase 2: Vendor Profile Completeness

Goal: collect all relevant vendor details at signup/onboarding.

Tasks:

- Add owner phone number.
- Add business area and pincode.
- Add logo and banner upload during onboarding.
- Add service creation during onboarding.
- Add business hours during onboarding.
- Add profile completeness state.

Deliverable:

Business owners can fully create a publishable vendor profile without jumping between unrelated pages.

### Phase 3: Customer Marketplace View

Goal: make customer browsing feel like a real marketplace.

Tasks:

- Build customer layout and navigation.
- Improve marketplace cards.
- Add category filters.
- Add city and area filters.
- Add search suggestions.
- Add starting price.
- Add next available slot preview.
- Add customer booking history.

Deliverable:

Customers can discover and book vendors through a dedicated customer experience.

### Phase 4: Location-Aware Search

Goal: show businesses close to the customer.

Tasks:

- Add business geolocation fields.
- Add customer geolocation fields.
- Add MongoDB `2dsphere` index.
- Add radius-based marketplace query.
- Ask browser for customer location.
- Add manual location fallback.
- Show distance on vendor cards.

Deliverable:

Customers see relevant businesses near their current or selected location.

### Phase 5: Payment Upgrade

Goal: move from demo payments to real online payments.

Tasks:

- Choose provider: Razorpay, Stripe, or PayPal.
- Add create-order endpoint.
- Add verify-payment endpoint.
- Add webhook endpoint.
- Add checkout screen.
- Add payment failure and retry states.
- Add owner payment dashboard.
- Add customer receipts.

Deliverable:

Customers can pay for booked services with a real provider.

### Phase 6: Analytics And Operations

Goal: make the owner dashboard useful for business decisions.

Tasks:

- Add revenue analytics endpoint.
- Add booking analytics endpoint.
- Add customer growth analytics.
- Add service performance analytics.
- Add cancellation and no-show tracking.
- Add CSV export.
- Add date range filters.

Deliverable:

Business owners can understand performance and revenue without manually calculating it.

### Phase 7: Trust And Quality

Goal: improve customer confidence.

Tasks:

- Add reviews and ratings.
- Add verified business badges.
- Add gallery photos.
- Add cancellation policy.
- Add service-level descriptions.
- Add support/contact flow.

Deliverable:

Marketplace feels credible and ready for real users.

## Recommended Immediate Next Step

Start with Phase 1 and Phase 2 together:

1. Role-based registration split.
2. Owner onboarding wizard.
3. Customer profile model.
4. Business location fields: city, area, pincode.
5. Marketplace filtering by city, area, category, and search.

This creates the correct foundation before adding real maps, real payments, reviews, and deeper analytics.

## Open Product Questions

These should be decided before production launch:

- Should customers be allowed to book as guests, or must they create accounts?
- Should payments be mandatory at booking time, or optional per business?
- Should businesses define their service radius manually?
- Should customers search by exact current location or selected city/area first?
- Which payment provider should be used first?
- Should every business require approval before publishing?
- Should the marketplace show only verified businesses?

## Success Criteria

The scaled platform is successful when:

- Owners can complete onboarding and publish a professional vendor profile.
- Customers can find nearby relevant vendors without seeing unrelated locations.
- Customers can book and pay with minimal friction.
- Owners can manage bookings and revenue from a dedicated dashboard.
- The codebase has clear boundaries between owner, customer, marketplace, booking, and payment concerns.
