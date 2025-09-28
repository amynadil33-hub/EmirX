# Musalhu Portal - AI Assistant SaaS Platform

A comprehensive SaaS platform designed specifically for Maldivian businesses, featuring 7 specialized AI assistants powered by OpenAI's Assistants API.

## Features

- **7 Specialized AI Assistants**: HR, Secretary, Accounting, Marketing, Research, Lawyer, and Developer assistants
- **Dhivehi & English Support**: Full support for both languages with proper Thaana font rendering
- **Maldivian Business Context**: All assistants understand local business practices, MVR currency, and regulations
- **Clean Notion-style UI**: Minimal, professional interface with sidebar navigation
- **Real-time Chat**: Interactive chat interfaces for each assistant
- **Responsive Design**: Mobile-first design that works on all devices

## AI Assistants

1. **HR Assistant** - Human resources management and employee relations
2. **Secretary Assistant** - Administrative tasks and office management
3. **Accounting Assistant** - Financial management with MVR support
4. **Marketing Assistant** - Tourism marketing and promotional strategies
5. **Research Assistant** - Market research and business intelligence
6. **Lawyer Assistant** - Legal guidance (not legal advice)
7. **Developer Assistant** - Software development and technical solutions

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with custom Maldivian color scheme
- **AI Integration**: OpenAI Assistants API
- **Authentication**: Ready for Clerk integration
- **Deployment**: Vercel-ready

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_PROJECT_ID=your_project_id
   ```
4. Run development server: `npm run dev`

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_PROJECT_ID`: Your OpenAI project ID
- Assistant IDs for each of the 7 assistants

## Deployment

This project is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Maldivian Business Features

- Currency support for Maldivian Rufiyaa (MVR)
- Understanding of local business regulations
- Tourism industry expertise
- Dhivehi language processing
- Local context awareness

## License

Private SaaS platform for Maldivian businesses.