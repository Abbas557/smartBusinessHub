# Smart Business Hub

Smart Business Hub is a full-stack SaaS-style platform for local service businesses to manage their online profile, publish services, accept bookings, track customers, and share an embeddable booking widget on any website.

The project contains a React + Vite frontend and a NestJS + MongoDB backend.

## Features

- Owner registration, login, refresh-token sessions, logout, and protected dashboard routes
- Optional Google OAuth login
- Business profile setup with publish and unpublish controls
- Logo and banner upload flow using AWS S3 presigned URLs
- Service management with pricing and duration
- Weekly business hours and closed-day handling
- Public business profile pages
- Public booking flow with available slot generation
- Booking dashboard with status updates
- Customer list generated from bookings
- Analytics dashboard with revenue, payment, customer, booking, and service-performance metrics
- Customer marketplace for discovering and comparing published vendors
- Demo payment checkout flow for booking payments
- Embeddable booking widget script for external websites
- AWS SES booking confirmation email hook
- Demo seed script for local testing

## Tech Stack

Frontend:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Axios
- Lucide React icons

Backend:

- NestJS
- TypeScript
- MongoDB Atlas
- Mongoose
- Passport JWT
- Passport Google OAuth 2.0
- AWS SDK for S3 and SES
- bcrypt

## Project Structure

```text
smart-business-hub-phase1/
|-- backend/
|   |-- scripts/
|   |   `-- seed-demo.js
|   |-- src/
|   |   |-- common/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- bookings/
|   |   |   |-- business/
|   |   |   |-- customers/
|   |   |   |-- mail/
|   |   |   |-- payments/
|   |   |   |-- upload/
|   |   |   `-- users/
|   |   |-- app.module.ts
|   |   `-- main.ts
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- public/
|   |   `-- smart-hub-widget.js
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- store/
|   |   `-- types/
|   |-- .env.example
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas cluster or a local MongoDB connection string
- Optional: Google Cloud OAuth client
- Optional: AWS account for S3 uploads and SES emails

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Abbas557/smartBusinessHub.git
cd smartBusinessHub
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a backend environment file:

```bash
cd backend
cp .env.example .env
```

Backend variables:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart-hub?retryWrites=true&w=majority

JWT_ACCESS_SECRET=change-this-to-a-long-random-string-access
JWT_REFRESH_SECRET=change-this-to-a-long-random-string-refresh
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://127.0.0.1:3001/api/auth/google/callback

AWS_REGION=ap-south-1
AWS_S3_BUCKET=smart-business-hub-uploads
AWS_CLOUDFRONT_URL=
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

Create a frontend environment file:

```bash
cd ../frontend
cp .env.example .env
```

Frontend variables:

```env
VITE_API_URL=http://localhost:3001/api
```

Never commit real `.env` files. They are intentionally ignored by git.

## Running Locally

Start the backend API:

```bash
cd backend
npm run start:dev
```

The backend runs at:

```text
http://localhost:3001/api
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## Demo Data

Seed the database with a demo owner, business, customers, services, and bookings:

```bash
cd backend
npm run seed:demo
```

Demo login:

```text
Email: demo@smartbusinesshub.local
Password: password123
```

Demo public business page:

```text
http://localhost:3000/b/aster-studio-salon
```

## Main App Routes

Frontend routes:

```text
/login
/register
/dashboard
/dashboard/business
/dashboard/bookings
/dashboard/customers
/dashboard/settings
/marketplace
/b/:slug
/b/:slug/book
/embed/:slug
```

Backend API routes are served under:

```text
/api
```

Important route groups:

```text
/api/auth
/api/business
/api/bookings
/api/customers
/api/payments
/api/upload
```

## Customer Marketplace

The customer-facing marketplace is available at:

```text
http://localhost:3000/marketplace
```

Customers can browse published vendors, search by service or city, filter by category, open a public vendor profile, and start a booking directly from a marketplace card.

Each published business profile remains available at:

```text
http://localhost:3000/b/:slug
```

## Analytics And Earnings

The owner dashboard includes earning-focused analytics:

- Projected revenue from non-cancelled bookings
- Paid revenue from completed demo payments
- Average order value
- Payment conversion percentage
- Paid versus unpaid revenue mix
- Six-month revenue trend chart
- Service-level revenue ranking
- Booking status funnel
- Upcoming appointment list with payment state

Revenue is calculated from the service price saved on each booking. Older bookings without `servicePrice` count as `0` until recreated or migrated.

## Payment Flow

The current payment module uses a demo checkout provider so the product flow can be tested without live payment credentials.

Public booking flow:

1. Customer chooses a service, date, and slot.
2. Customer selects either `Pay at venue` or `Demo online payment`.
3. The booking is created with the service price.
4. If demo payment is selected, the frontend calls `POST /api/payments/demo-checkout`.
5. The backend creates a payment record and marks the booking as paid.

This is designed so a real provider can be added later. Good production options are Stripe, Razorpay, or PayPal depending on target markets.

## Google OAuth Setup

Google OAuth is optional. Email/password auth works without it.

To enable Google login:

1. Create a project in Google Cloud Console.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a web application.
4. Add this authorized redirect URI for local development:

```text
http://127.0.0.1:3001/api/auth/google/callback
```

5. Add the client ID and client secret to `backend/.env`:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://127.0.0.1:3001/api/auth/google/callback
```

## AWS S3 Upload Setup

S3 is used for business logo and banner uploads.

Required backend variables:

```env
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
AWS_CLOUDFRONT_URL=
```

The backend generates presigned upload URLs. The frontend uploads the file directly to S3, then saves the public URL on the business profile.

Your AWS identity needs permission for:

```text
s3:PutObject
s3:GetObject
```

For production, prefer CloudFront in front of the bucket and set:

```env
AWS_CLOUDFRONT_URL=https://your-cloudfront-domain.com
```

## AWS SES Email Setup

SES is used to send booking confirmation emails.

Required backend variable:

```env
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

Notes:

- In SES sandbox mode, both sender and recipient emails must usually be verified.
- For real customer emails, request SES production access.
- If `AWS_SES_FROM_EMAIL` is missing, the app will skip email sending and bookings will still succeed.

## Embeddable Booking Widget

The frontend serves a standalone widget script:

```text
http://localhost:3000/smart-hub-widget.js
```

Embed it on another website:

```html
<script
  src="http://localhost:3000/smart-hub-widget.js"
  data-business="aster-studio-salon">
</script>
```

The widget opens the public booking experience in an iframe modal.

For production, change the script `src` to your deployed frontend URL.

## Build Commands

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the frontend production build:

```bash
cd frontend
npm run preview
```

## Deployment Notes

Backend:

- Deploy the NestJS API to Render, Railway, Fly.io, AWS, or another Node hosting provider.
- Set all backend environment variables in the hosting provider.
- Make sure `FRONTEND_URL` points to the deployed frontend URL.
- Make sure MongoDB Atlas allows the deployment server IP or allows access from the provider.

Frontend:

- Deploy the Vite app to Vercel, Netlify, Cloudflare Pages, or S3/CloudFront.
- Set `VITE_API_URL` to the deployed backend API URL.
- Rebuild the frontend after changing `VITE_API_URL`.

MongoDB Atlas:

- Use a dedicated database user.
- Use a strong password.
- Restrict network access where possible.
- Do not store MongoDB credentials in the repository.

Google OAuth:

- Add the production callback URL to Google Cloud.
- Example:

```text
https://your-api-domain.com/api/auth/google/callback
```

AWS:

- Use least-privilege IAM credentials or a deployment role.
- Prefer CloudFront for public assets.
- Verify SES sender identity before enabling production emails.

## Security Notes

- Real `.env` files are ignored by git.
- Rotate credentials if they are ever committed or exposed publicly.
- JWT secrets should be long, random strings.
- Use HTTPS in production.
- Configure CORS carefully for production domains.
- Keep AWS permissions scoped to the required bucket and actions.

## Current Status

The app currently supports Phase 1 owner/business flows plus Phase 2 booking, customer, analytics, widget, upload, and email foundations.

Useful next improvements:

- Payment integration
- Team/staff scheduling
- Calendar sync
- Admin plans and subscriptions
- More advanced analytics
- Automated tests
- Production-ready CI/CD pipeline
