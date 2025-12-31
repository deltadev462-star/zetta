# Zetta Med Platform

A refurbished medical equipment marketplace connecting specialized sellers with potential buyers. Built with React, TypeScript, Material UI, and Supabase.

## Features

### For Buyers
- **Product Catalog**: Browse refurbished medical equipment with advanced search and filtering
- **Shopping Cart**: Add products to cart and manage quantities
- **User Authentication**: Secure login and registration
- **Profile Management**: Manage personal information and preferences
- **Service Requests**: Submit logistics and maintenance service requests
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### For Administrators (Sellers)
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: View and process orders
- **Dashboard**: Track sales, revenue, and performance metrics
- **Commission Tracking**: Automatic calculation of Zetta commissions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material UI v5
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payment Processing**: Stripe (integration pending)
- **Styling**: Material UI theming system

## Prerequisites

- Node.js 16+ and npm
- Supabase account
- Stripe account (for payment processing)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd zetta-med-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API to find your project URL and anon key
3. Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy contents from supabase-schema.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
REACT_APP_ENVIRONMENT=development
```

### 5. Run the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
zetta-med-platform/
├── public/
│   └── placeholder-product.png
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/         # React contexts (Auth, Cart)
│   ├── layouts/          # Page layouts
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── index.tsx        # Entry point
├── .env                 # Environment variables
├── package.json         # Dependencies
└── supabase-schema.sql  # Database schema
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes for authenticated users
- Role-based access (buyer/admin)

### Product Management
- Dynamic product catalog with filters
- Search by title and description
- Filter by category, condition, and price range
- Detailed product pages with image galleries

### Shopping Cart
- Persistent cart using localStorage
- Add/remove products
- Update quantities
- Real-time total calculation

### Service Requests
- **Logistics Services**: Delivery, storage, and transport requests
- **Maintenance Services**: Equipment repair and service requests
- Form validation and multi-step workflows

## Database Schema

The application uses the following main tables:
- `user_profiles` - Extended user information
- `products` - Product listings
- `orders` - Customer orders
- `order_items` - Items within orders
- `service_requests` - Logistics and maintenance requests
- `payments` - Payment records

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for sensitive operations
- Admin-only access for product management
- Secure payment processing with Stripe

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `build` folder to Netlify

## TODO

- [ ] Complete admin dashboard implementation
- [ ] Integrate Stripe payment processing
- [ ] Add order management system
- [ ] Implement email notifications
- [ ] Add product image upload functionality
- [ ] Create admin panel for Zetta staff
- [ ] Add analytics and reporting
- [ ] Implement automated catalog syncing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is proprietary to Zetta Med.
