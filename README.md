# Chess Stats Tracker ♟️

A comprehensive chess statistics visualization tool that analyzes and displays your Chess.com game data with interactive graphs and detailed game insights.

🔗 **Live Demo**: [https://chess-statsv2.netlify.app](https://chess-statsv2.netlify.app)

## 🎯 Features

### 📊 Game Analytics Dashboard

- **Performance Graphs**: Visualize your rating progression across different time controls
- **Multiple Time Controls**: Separate analytics for Blitz, Bullet, Rapid, and Daily chess
- **Flexible Time Ranges**:
  - View last 30 days by default
  - Filter by specific month and year using the calendar picker
- **Interactive Charts**: Area graphs showing your performance trends over time

### 🎮 Detailed Games View

- **Comprehensive Game List**: See all your games with detailed information
- **Visual Game Results**: Color-coded cards for wins (green), losses (red), and draws (orange)
- **Player Information**:
  - Both players displayed with their colors (white/black pieces)
  - Player ratings at the time of the game
  - Winner highlighting
- **Game Details**:
  - Result and termination reason
  - Move count
  - Date and time played
- **Direct Links**: Click any game to view it on Chess.com

### 🗓️ Calendar-Based Filtering

- **Month Picker**: Select any month to analyze specific periods
- **Date Validation**: Only allows selection from your join date to current date
- **Easy Navigation**: Seamless switching between dashboard and games view

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd chess-stats-tracker
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Routing**: TanStack Router (with type-safe routing)
- **Styling**:
  - Styled Components (CSS-in-JS)
  - Tailwind CSS (utility classes)
- **UI Components**:
  - Mantine UI (Date Picker)
  - React Icons (FaStopwatch, FaSun, SiStackblitz, GiBulletBill, FaArrowLeftLong)
- **Data Visualization**: Recharts (Area graphs)
- **Data Fetching**: TanStack Query (React Query)
- **Date Management**: Day.js
- **Deployment**: Netlify

## 📁 Project Structure

```
src/
├── components/
│   ├── DashBoard.tsx       # Main analytics dashboard with graphs
│   └── Games.tsx           # Detailed games list view
├── hooks/
│   ├── useProfile.ts       # Fetch player profile data
│   ├── useGames.ts         # Fetch games for specific month/year
│   └── useGames30days.ts   # Fetch last 30 days of games
├── helpers/
│   ├── TransformGames.ts   # Transform API data by time control
│   ├── gamesDateWise.ts    # Group games by date for graphs
│   └── DateFormat.ts       # Date formatting utilities
├── ui/
│   ├── AreaGraph.tsx       # Area chart component
│   ├── Spinner.tsx         # Loading spinner with overlay
│   └── Button.tsx          # Reusable button component
└── routes/                 # TanStack Router configuration
```

## 🎨 Key Components

### Dashboard (`/dashboard/:username`)

The main analytics view showing:

- Player name in header
- Four separate graphs (Blitz, Bullet, Rapid, Daily)
- Each graph displays rating changes over time
- Hover effects for better interactivity

**Query Parameters:**

- `?year=2024&month=11` - Filter games by specific month

### Games View (`/games/:username`)

Detailed game listing with:

- Calendar picker for month selection (when no games data)
- Back button to return to dashboard
- Scrollable game list with all game details
- Click-through to Chess.com for game analysis

**Query Parameters:**

- `?year=2024&month=11` - Pass-through from dashboard filter

## 🌐 Deployment

This project is configured for Netlify deployment with client-side routing support.

### Netlify Configuration

A `_redirects` file is included in the `public` folder:

```
/*    /index.html   200
```

This ensures all routes are handled by the React Router instead of Netlify's server.

### Deploy to Netlify

1. Connect your repository to Netlify
2. Build command: `npm run build` or `yarn build`
3. Publish directory: `dist` (for Vite) or `build` (for CRA)
4. Deploy!

The `_redirects` file will automatically be copied to your build output.

## 📊 Data Source

This application uses the Chess.com Public API to fetch:

- Player profiles
- Game archives
- Game statistics

API Base URL: `https://api.chess.com/pub/`

## 🎯 Usage

1. **Enter a Username**: Navigate to `/dashboard/username` where `username` is any Chess.com username
2. **View Analytics**: See performance graphs for all time controls
3. **Filter by Date**: Use the calendar to select a specific month
4. **View Games**: Click through to see individual games for any date
5. **Analyze on Chess.com**: Click any game card to open it on Chess.com

## 🔜 Upcoming Features

- **Favorite Players**: Track multiple players and compare stats
- **Country Leaderboards**: View top players by country
- **User Accounts**: Save preferences and favorite players

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

MIT license

## 👨‍💻 Author

**Abhishek Prajapati**

[![GitHub](https://img.shields.io/badge/GitHub-appu--46-181717?style=flat&logo=github)](https://github.com/appu-46)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abhishekprajapati-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/abhishekprajapati/)
[![Instagram](https://img.shields.io/badge/Instagram-git__life-E4405F?style=flat&logo=instagram)](https://www.instagram.com/git_life/)
[![Twitter](https://img.shields.io/badge/Twitter-ap958461-1DA1F2?style=flat&logo=x)](https://x.com/ap958461)

---

**Built with ♟️ for chess enthusiasts**
