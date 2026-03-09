# Erika's Home Base Dashboard

A professional real estate business management dashboard built with Next.js, React, and Tailwind CSS.

## Features

### 🏠 Dashboard Overview
- Quick statistics (tasks, buyers, sellers, completions)
- Quick action buttons for common tasks
- Recent activity view

### 📋 Key Tasks Section
- Manual task input
- Auto-generated tasks from Google Calendar:
  - **Photos event** → 3 tasks (prep, staging, photography) 1 day after
  - **Go Live event** → 4 tasks at 10 days, 7 days, 1 day before, and launch day
- Task status tracking (pending, complete)
- Integration with Google Sheets for task persistence

### 👥 Buyers Management
- Pull hot buyers from FUB API (stage: "A-Hot 1-3 Months")
- Display buyer info: name, email, phone, budget, property type, area
- Built-in buyer workflow checklist template
- One-click email/phone contact

### 🏪 Sellers Management
- Pull active sellers from FUB API (stage: "Active Client" + tag: "seller")
- Show seller info and property details
- Seller workflow checklist (pre-listing, listing, post-listing, post-close)
- Link to Google Drive property folders

### ✅ Task Tracker
- Live view of all Rosie Tasks from Google Sheets
- Filter by status (all, pending, complete)
- Statistics on task completion
- Table view with due dates and assignments

### 📊 Top Picks Analytics
- Weekly newsletter performance from Mailchimp
- Campaign open rates and click rates
- Subscriber engagement metrics
- Recent campaigns display

### 📚 Procedures Hub
- Auto-pull workflow documentation from workspace memory
- Links to internal procedures
- Organized by workflow type

## Design

- **Dark blue professional theme** - Clean, focused interface
- **Left sidebar navigation** - Easy access to all sections
- **Card-based layout** - Organized information groups
- **Dark mode optimized** - Eye-friendly for extended use
- **Responsive design** - Works on desktop and tablet

## API Integrations

### Google Sheets API
- Service account credentials: `~/.credentials/google-calendar.json`
- Reads: Rosie Tasks sheet
- Reads: Google Calendar for event-triggered task generation

### Follow Up Boss (FUB) API
- Service account credentials: `~/.credentials/followupboss.json`
- Reads: Contacts with stage filtering
- Reads: Contact custom fields

### Mailchimp API
- API Key: Set via `MAILCHIMP_API_KEY` environment variable
- Reads: Campaign statistics
- Reads: Top Picks newsletter performance

### Google Drive API
- Service account credentials: `~/.credentials/google-calendar.json`
- Reads: Seller property folder links

## Development

### Setup
```bash
cd erika-dashboard
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Variables
Create `.env.local`:
```
MAILCHIMP_API_KEY=[your-api-key-here]
MAILCHIMP_DATA_CENTER=us15
GOOGLE_SERVICE_ACCOUNT_PATH=/Users/rosiejetson/.credentials/google-calendar.json
FUB_CREDENTIALS_PATH=/Users/rosiejetson/.credentials/followupboss.json
```

**⚠️ Security:** Never commit actual API keys. Use `.env.local` (in .gitignore) for secrets.

### Build for Production
```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment
```bash
vercel deploy --prod
```

Or connect GitHub repo to Vercel for automatic deployments.

## Project Structure

```
erika-dashboard/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API endpoints
│   │   │   ├── dashboard/        # Dashboard stats
│   │   │   ├── tasks/            # Tasks API
│   │   │   ├── buyers/           # Buyers API
│   │   │   ├── sellers/          # Sellers API
│   │   │   ├── analytics/        # Analytics API
│   │   │   └── procedures/       # Procedures API
│   │   ├── layout.tsx            # Root layout with sidebar
│   │   ├── globals.css           # Global styles
│   │   ├── page.tsx              # Dashboard home
│   │   ├── tasks/                # Key Tasks page
│   │   ├── buyers/               # Buyers page
│   │   ├── sellers/              # Sellers page
│   │   ├── tracker/              # Task Tracker page
│   │   ├── analytics/            # Analytics page
│   │   └── procedures/           # Procedures page
│   ├── components/               # React components
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── sections/             # Page sections
│   │       ├── TasksView.tsx
│   │       ├── BuyersView.tsx
│   │       ├── SellersView.tsx
│   │       ├── TaskTrackerView.tsx
│   │       ├── AnalyticsView.tsx
│   │       └── ProceduresView.tsx
│   └── lib/                      # Utility functions
│       ├── fub.ts                # FUB API integration
│       ├── google-sheets.ts      # Google Sheets API
│       ├── mailchimp.ts          # Mailchimp API
│       └── task-generator.ts     # Calendar-triggered tasks
├── public/                       # Static assets
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

## Task Auto-Generation Rules

### Photos Event
When a "Photos" event is found on the calendar:
- Triggers 3 tasks **1 day after** the event
- Tasks: Prepare, Stage, Take Photos
- Assigned to: Erika, Erika, Photographer

### Go Live Event
When a "Go Live", "List", or "Launch" event is found:
- Task 1: 10 days before - Final Listing Review
- Task 2: 7 days before - Pre-Launch Marketing
- Task 3: 1 day before - Final Checks
- Task 4: On event day - GO LIVE

## Workflow References

- **Top Picks Curation**: `memory/workflows/04-top-picks-curation.txt`
- **Buyer Workflow**: Embedded checklist in Buyers section
- **Seller Workflow**: Embedded checklist in Sellers section
- **Procedures Hub**: Links to all `memory/workflows/` files

## Testing Checklist

- [ ] Dashboard loads and displays stats
- [ ] FUB API integration works (buyers/sellers load)
- [ ] Google Sheets integration works (tasks load)
- [ ] Google Calendar integration works (events visible)
- [ ] Task auto-generation works (test with calendar events)
- [ ] Mailchimp analytics load (Top Picks campaigns visible)
- [ ] All navigation links work
- [ ] Dark theme renders correctly
- [ ] Responsive on mobile/tablet
- [ ] API error handling works (graceful fallbacks)

## Next Phase: Client Portal

Future enhancements:
- Client dashboard for buyers/sellers
- Document upload and sharing
- Timeline and progress tracking
- Integrated messaging
- Automated email workflows

## License

Private - Erika's Real Estate Business
