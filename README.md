# HealthPulse Pro - Clinical Intelligence Platform

AI-powered clinical decision support and patient management system built with Next.js, Supabase, and Google's Gemini AI.

## 📋 Documentation

- **[🏆 Hackathon Submission Guide](./HACKATHON_SUBMISSION.md)** - Complete hackathon pitch and roadmap
- **[Hackathon Judge Analysis](./Analysis.md)** - Comprehensive evaluation and scoring
- **[Business Plan](./docs/business/BUSINESS_PLAN.md)** - Market analysis, financial projections, and go-to-market strategy
- **[HIPAA Compliance](./docs/compliance/HIPAA_COMPLIANCE.md)** - Privacy policy, security measures, and regulatory documentation
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** - Community guidelines
- **[Security Policy](./SECURITY.md)** - Security procedures and reporting
- **[Changelog](./CHANGELOG.md)** - Version history and updates
- **[License](./LICENSE)** - MIT License

## Features

- 🏥 **Patient Management**: Comprehensive patient records with vitals, lab results, and medical history
- 🤖 **AI-Powered Analysis**: Clinical insights powered by Google's Gemini AI
- ⚡ **Smart Alerts**: Real-time clinical alerts with AI-generated notifications
- 📊 **Analytics Dashboard**: Visual insights into patient data and trends
- 🔒 **Secure Authentication**: Role-based access control with Supabase
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini AI (@ai-sdk/google)
- **UI**: React 19, Tailwind CSS, Radix UI
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd KodeKalesh-2
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to React 19 compatibility with some dependencies.

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then fill in the required values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Generative AI (Gemini) API Key
# Get your API key from https://makersuite.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

#### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated key and paste it into your `.env.local` file

### 4. Database Setup

You'll need to set up the following tables in your Supabase database:

- `users` - User profiles and roles
- `patients` - Patient records
- `vital_signs` - Patient vital signs measurements
- `lab_results` - Laboratory test results
- `alerts` - Clinical alerts
- `medications` - Patient medications
- `medical_history` - Patient medical history

Refer to your Supabase dashboard to create these tables with appropriate columns.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ai/           # Gemini AI endpoints
│   ├── auth/             # Authentication pages
│   └── dashboard/        # Dashboard pages
├── components/            # React components
│   ├── ai/               # AI-related components
│   ├── alerts/           # Alert management
│   ├── dashboard/        # Dashboard components
│   ├── patients/         # Patient management
│   └── ui/              # Reusable UI components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client config
│   └── utils.ts         # Helper functions
└── styles/              # Global styles
```

## AI Features

### Patient Analysis

The AI analysis feature uses Google's Gemini AI to provide:
- Clinical summaries based on patient data
- Key findings from vitals and lab results
- Risk assessments
- Actionable recommendations

### Alert Generation

AI-powered alert notifications that:
- Generate clear, professional alert messages
- Contextualize alerts based on patient data
- Provide actionable insights for healthcare professionals

## Demo Credentials

For testing purposes:
- Email: `doctor@test.com`
- Password: `test123456`

## API Endpoints

### AI Endpoints

- `POST /api/ai/analyze-patient` - Generate clinical analysis for a patient
- `POST /api/ai/generate-alert` - Generate AI-enhanced alert messages

## Troubleshooting

### Build Errors

If you encounter build errors related to Google Fonts, ensure you have internet connectivity or configure local font fallbacks.

### API Key Issues

If AI features aren't working:
1. Verify your `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly in `.env.local`
2. Check that the API key is active in Google AI Studio
3. Review the browser console and server logs for detailed error messages

### Dependency Conflicts

If you see peer dependency errors:
```bash
npm install --legacy-peer-deps
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

For security concerns, please review our [Security Policy](./SECURITY.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes and version history.

## Support

For issues or questions, please:
- Check the [documentation](./docs/)
- Search [existing issues](https://github.com/Sharmamayankkkk/KodeKalesh-2/issues)
- Create a [new issue](https://github.com/Sharmamayankkkk/KodeKalesh-2/issues/new/choose) using our templates

## Acknowledgments

Built for hackathon submission. Special thanks to:
- Google Gemini AI for intelligent analysis capabilities
- Supabase for database and authentication infrastructure
- Vercel for hosting platform
- The open-source community for amazing tools and libraries

