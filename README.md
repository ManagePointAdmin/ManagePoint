# ManagePoint 🚀

ManagePoint is a modern, full-stack project management platform designed to streamline collaboration and boost productivity. Built with a cutting-edge tech stack, it offers a seamless experience for managing workspaces, projects, and tasks.

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features <a name="-features"></a>

- **Multiple Workspaces**: Organize projects into distinct workspaces for different teams or clients.
- **Project Tracking**: Visualize project progress with real-time analytics and dashboards.
- **Task Management**: Create, assign, and track tasks with status updates and due dates.
- **Team Collaboration**: Invite members, manage roles, and stay in sync with your team.
- **Data Visualization**: Gain insights through interactive charts and progress tracking.
- **Email Notifications**: Stay informed with integrated email features.

## 🛠️ Tech Stack <a name="-tech-stack"></a>

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Bundler**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

### Backend & Infrastructure
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Email Service**: [EmailJS](https://www.emailjs.com/)

---

## 🚀 Getting Started <a name="-getting-started"></a>

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YourUsername/ManagePoint.git
   cd ManagePoint
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Database Setup (Supabase)

This project uses Supabase for the backend. To set it up:

1. **Create a Supabase Project** at [supabase.com](https://supabase.com/).
2. **Execute SQL Scripts**:
   - Go to the SQL Editor in your Supabase dashboard.
   - Run the contents of `supabase_setup.sql` to create tables and schemas.
   - Run `rls_fix.sql` to apply Row Level Security policies.
   - (Optional) Run `seed_data.sql` to populate the database with initial data.

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase and EmailJS credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions to ManagePoint! Please check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get involved.

---

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.