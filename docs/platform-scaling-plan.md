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

## Database Architecture

The database must be understandable, scalable, and easy to operate. Collections should be separated by business concept, not by screen.

The current MongoDB approach is acceptable for the next stage because the product is document-heavy:

- Business profiles are document-like.
- Services can be embedded under businesses initially.
- Booking records are naturally event documents.
- Payments are transaction documents.
- Customer profiles can evolve independently.

MongoDB should remain the primary database until the product needs relational reporting, strict financial ledgers, or complex cross-entity joins.

### Recommended MongoDB Collections

Use clear collection names:

```text
users
businesses
services
customer_profiles
bookings
payments
reviews
business_media
notifications
audit_logs
marketplace_events
```

Some of these can be introduced gradually. The important rule is that each collection should have one obvious responsibility.

### Collection Responsibilities

#### users

Stores authentication identity.

Use for login credentials, role, account status, refresh token hash, and basic profile identity.

Do not store full business profile data here.

Recommended fields:

```ts
name
email
password
role
phone
avatarUrl
isActive
refreshToken
lastLoginAt
```

Indexes:

```ts
email unique
role
isActive
```

#### businesses

Stores vendor profile and marketplace-facing business data.

Recommended fields:

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
isPublished
verificationStatus
ratingAverage
ratingCount
totalBookings
```

Indexes:

```ts
ownerId
slug unique
isPublished
category
city
area
pincode
location 2dsphere
```

#### services

Services can stay embedded under `businesses` during the early stage, but they should eventually move into their own `services` collection.

A separate services collection will scale better when search, analytics, service-specific availability, discounts, add-ons, staff assignment, and service-level media are added.

Recommended fields:

```ts
businessId
name
description
category
durationMinutes
price
currency
isActive
images
requiresDeposit
depositAmount
```

Indexes:

```ts
businessId
isActive
category
name text
price
```

Migration path:

1. Keep embedded services for now.
2. Introduce `services` collection.
3. Backfill services from businesses.
4. Store service IDs and service snapshots in bookings.
5. Use service snapshots in bookings so historical price or name changes do not alter old bookings.

#### customer_profiles

Stores customer-specific data separate from authentication.

Recommended fields:

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

Indexes:

```ts
userId unique
city
area
location 2dsphere
```

#### bookings

Stores appointment records.

Bookings should contain service snapshots. This is important because services can later change price, name, or duration. Old bookings must preserve what the customer actually booked.

Recommended fields:

```ts
businessId
customerProfileId
customerUserId
customerName
customerEmail
customerPhone
serviceId
serviceName
servicePrice
serviceDurationMinutes
date
startTime
endTime
status
notes
paymentStatus
paymentId
source
cancelledAt
completedAt
```

Indexes:

```ts
businessId date startTime
businessId status date
customerUserId date
paymentStatus
createdAt
```

Important modelling rule:

`bookings` should not depend on live service price for historical revenue. Always store `servicePrice` on the booking.

#### payments

Stores payment records.

Payments should be separated from bookings because one booking may later have failed attempts, successful payment, refund, partial payment, deposit, or remaining balance.

Recommended fields:

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
refundedAt
rawProviderPayload
```

Indexes:

```ts
bookingId
businessId status createdAt
customerUserId createdAt
providerOrderId
providerPaymentId
```

Financial note:

MongoDB is acceptable for early-stage payment records. If the product later handles wallet balances, payouts, commissions, invoices, taxes, or strict accounting, add PostgreSQL for ledger-style financial records.

#### reviews

Stores customer ratings and reviews.

Recommended fields:

```ts
businessId
bookingId
customerUserId
rating
comment
isPublished
moderationStatus
```

Indexes:

```ts
businessId isPublished
customerUserId
rating
```

#### business_media

Stores media metadata, not binary files. Files should remain in S3 or another object storage service.

Recommended fields:

```ts
businessId
type
url
storageKey
caption
sortOrder
isActive
```

Indexes:

```ts
businessId type
businessId sortOrder
```

#### notifications

Stores email, SMS, WhatsApp, and in-app notification records.

Recommended fields:

```ts
userId
businessId
bookingId
channel
recipient
template
status
sentAt
error
```

Indexes:

```ts
userId createdAt
businessId createdAt
status
channel
```

#### audit_logs

Stores important system actions.

Use for business profile changes, service price changes, booking status changes, payment status changes, and admin actions.

Recommended fields:

```ts
actorUserId
actorRole
entityType
entityId
action
before
after
ipAddress
userAgent
createdAt
```

Indexes:

```ts
entityType entityId createdAt
actorUserId createdAt
createdAt
```

#### marketplace_events

Stores analytics events for marketplace behavior.

Use for business profile views, search events, booking intent clicks, checkout starts, and payment completions.

Recommended fields:

```ts
customerUserId
sessionId
businessId
serviceId
eventType
query
city
area
location
metadata
createdAt
```

Indexes:

```ts
eventType createdAt
businessId createdAt
customerUserId createdAt
city area
```

### MongoDB Modelling Guidelines

Use embedded documents when:

- The data is small.
- It is always loaded with the parent.
- It does not need independent permissions.
- It rarely changes independently.

Use separate collections when:

- The data grows without bound.
- It needs independent search or filters.
- It needs its own lifecycle.
- It is referenced by multiple features.
- It needs analytics or reporting.

Examples:

- Business hours can stay embedded in `businesses`.
- Services can start embedded, then move to `services`.
- Bookings must be separate.
- Payments must be separate.
- Reviews must be separate.
- Media should be separate if gallery support grows.

### Suggested Database Ownership Boundaries

Each backend module should own its collection.

```text
AuthModule -> users
BusinessModule -> businesses
ServicesModule -> services
MarketplaceModule -> read models over businesses/services
CustomerModule -> customer_profiles
BookingsModule -> bookings
PaymentsModule -> payments
ReviewsModule -> reviews
MediaModule -> business_media
NotificationsModule -> notifications
AuditModule -> audit_logs
AnalyticsModule -> marketplace_events and aggregated reads
```

Avoid allowing every module to directly write every collection. Cross-module writes should go through service methods.

### When To Add PostgreSQL

MongoDB can handle the current product well. PostgreSQL should be considered when the product needs strong relational consistency or complex reporting.

Good candidates for PostgreSQL:

- Payment ledger
- Vendor payouts
- Platform commissions
- Tax invoices
- Subscription billing
- Admin reporting
- Strict accounting or audit tables

Recommended hybrid architecture:

```text
MongoDB:
- users
- businesses
- services
- customer profiles
- bookings
- reviews
- media
- marketplace events

PostgreSQL:
- payment ledger
- invoices
- payouts
- commissions
- subscriptions
```

Do not add PostgreSQL immediately just because it might be useful later. Add it when a feature truly needs relational guarantees or accounting-style records.

### When To Add Redis

Redis is useful for speed and temporary state.

Use Redis later for:

- Session blacklisting
- Rate limiting
- OTP storage
- Temporary booking slot holds
- Payment checkout locks
- Frequently searched marketplace filters
- Background job queues

Temporary booking holds are especially important once real payments are introduced. A customer should not be able to start paying for a slot that another customer already grabbed.

### When To Add Search Infrastructure

MongoDB text search can work initially.

Use a dedicated search service later if marketplace search becomes important.

Options:

- MongoDB Atlas Search
- Meilisearch
- Typesense
- Elasticsearch or OpenSearch

Search features that may need this:

- Typo tolerance
- Service synonyms
- Ranking by distance and popularity
- Autocomplete
- Faceted search
- Search analytics

### Future Scaling Pattern

Start simple:

```text
React frontend -> NestJS API -> MongoDB Atlas
```

Then evolve to:

```text
React frontend
NestJS API
MongoDB Atlas
S3/CloudFront for media
Redis for locks/cache/queues
Payment provider
Email/SMS provider
```

Only later, if needed:

```text
PostgreSQL for ledger/reporting
Search service for marketplace discovery
Data warehouse for analytics
```

### Database Naming Rules

Use predictable collection names:

- lowercase
- plural
- snake_case where needed

Good:

```text
customer_profiles
business_media
audit_logs
marketplace_events
```

Avoid:

```text
customerData
BusinessDetails
misc
temp
```

### Data Integrity Rules

Important future rules:

- One user can have one customer profile.
- One business owner can initially own one business.
- Business slug must be unique.
- Published businesses must have at least one active service.
- Bookings must store service snapshot fields.
- Payments must not be deleted after creation.
- Payment changes should be additive or audited.
- Business profile changes should be audit logged.
- Customer location should be optional and permission-based.
- Personal data should be deletable or anonymizable if required by law.

### Analytics Data Strategy

Early analytics can be calculated directly from bookings and payments.

Later, use aggregated collections:

```text
business_daily_metrics
service_daily_metrics
marketplace_daily_metrics
```

Example fields:

```ts
businessId
date
bookingsCreated
bookingsCompleted
bookingsCancelled
grossRevenue
paidRevenue
newCustomers
profileViews
bookingClicks
```

This prevents slow dashboard queries once bookings and events grow.

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
