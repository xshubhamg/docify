<div align="center">
  <h1>Docify</h1>
  <p>An AI-powered document intelligence platform that brings your PDFs to life through voice.</p>

  ![Docify Preview](/placeholder-image.png)
</div>

---

## 📖 About Docify

Docify redefines how you interact with documents. Instead of passively reading or searching for keywords, Docify allows you to upload a PDF, select an AI voice persona, and engage in a **live, real-time voice conversation** with your document. It's like having the author sitting right next to you, ready to answer questions, summarize chapters, and explain complex concepts in plain language.

Whether you're a student digesting dense academic papers, a professional reviewing long contracts, or simply someone looking to learn faster, Docify bridges the gap between static text and interactive knowledge.

## ✨ Key Features

- **Conversational AI Interface:** Talk to your documents using natural speech.
- **Intelligent Segmentation:** Automatically parses and segments long PDFs to provide accurate, context-aware answers.
- **Customizable Voices:** Choose from a curated selection of premium ElevenLabs voice personas (e.g., authoritative, casual, soft).
- **Beautiful Design System:** A meticulously crafted user interface powered by Catppuccin color palettes and smooth animations.
- **Seamless Authentication:** Secure login using Email/Password or Google OAuth, powered by Better-Auth.
- **Privacy-First Storage:** Securely stores your documents and cover images using private blob storage.

## 🛠️ Tech Stack & Architecture

Docify is built for speed, type safety, and scalability.

| Category | Technology | Purpose |
|---|---|---|
| **Core** | [Bun](https://bun.sh/) & [Next.js 16 (App Router)](https://nextjs.org/) | Blazing fast execution, React Server Components, and optimized routing |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) | Utility-first styling with unstyled, accessible component primitives |
| **Database** | [PostgreSQL](https://www.postgresql.org/) & [Drizzle ORM](https://orm.drizzle.team/) | Relational data integrity with a lightweight, type-safe ORM |
| **Auth** | [Better-Auth](https://better-auth.com/) | Self-hosted authentication with Drizzle integration |
| **Voice / AI** | [VAPI](https://vapi.ai/) & [ElevenLabs](https://elevenlabs.io/) | Turn-taking, endpointing, and hyper-realistic TTS |
| **Processing** | `pdfjs-dist` & `react-pdf` | Robust client and server-side PDF parsing and rendering |

### Architecture Highlights

- **Route Groups:** Clean separation of concerns using Next.js route groups (`(landing)`, `(auth)`, `(main)`) for distinct layout management.
- **Blob Storage Integration:** Efficient handling of file uploads and cleanup, utilizing secure endpoints.
- **Database Schema:** 
  - `user` / `session` / `account` for authentication.
  - `document` tracking metadata, blob keys, and voices.
  - `document_segment` storing chunked PDF data for accurate RAG (Retrieval-Augmented Generation).
- **Design System:** Integrates the [Catppuccin](https://catppuccin.com/) aesthetic (Latte for Light mode, Mocha for Dark mode) tightly into Tailwind variables within `globals.css`. 

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A PostgreSQL database instance.
- API Keys for Google OAuth, VAPI, and ElevenLabs (optional but recommended for full functionality).

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/docify.git
cd docify
bun install
```

### 2. Database Setup

Configure your `DATABASE_URL` in `.env.local` and run the Drizzle migrations:

```bash
bun db:generate   # Generate migrations from schema
bun db:migrate    # Run migrations against the database
bun db:push       # Push schema directly (dev environment only)
bun db:studio     # Open Drizzle Studio for visual DB management
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
DATABASE_URL=your_postgres_connection_string
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
NEXT_PUBLIC_ASSISTANT_ID=your_vapi_assistant_id
```

### 4. Run the Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
