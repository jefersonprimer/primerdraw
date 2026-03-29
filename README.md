# Primerdraw 🎨

Primerdraw is a lightweight, open-source whiteboard tool designed for quick sketching and idea sharing. It features a clean interface, support for various shapes, freehand drawing, and Excalidraw library compatibility.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jefersonprimer/primerdraw.git
   cd primerdraw
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy the example environment file and fill in your details:
   ```bash
   cp .env.example .env.local
   ```
   *Note: For basic local use, the default values are usually sufficient.*

### 💻 Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

## 🗄️ Database Setup (Optional)

Primerdraw uses **Dexie.js** (IndexedDB) for local browser storage by default. 

If you are working on features that require a server-side database (like live collaboration or user accounts), the project is configured to work with **Supabase/PostgreSQL**.

1. Ensure you have your Supabase credentials in `.env.local`.
2. Migrations are located in the `/migrations` directory.

## 🧰 Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/)
- **State Management:** [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- **Canvas Library:** [Konva.js](https://konvajs.org/) & [react-konva](https://konvajs.org/docs/react/index.html)
- **Local Database:** [Dexie.js](https://dexie.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Internationalization:** [next-intl](https://next-intl-docs.vercel.app/)
