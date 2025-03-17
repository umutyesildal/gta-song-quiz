# GTA San Andreas Radio Quiz

A fun quiz game that tests your knowledge of songs from Grand Theft Auto: San Andreas radio stations.

## Features

- Test your knowledge of GTA San Andreas radio stations
- Two difficulty modes: Regular and Pro
- YouTube integration to watch/listen to the songs
- Mobile-friendly responsive design

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- YouTube Embed API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gta-song-quiz.git
   cd gta-song-quiz
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Convert the CSV data to JSON (if needed):
   ```bash
   npm run convert-data
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Data Structure

The app uses a CSV dataset of GTA San Andreas songs that includes:
- Song titles and artists
- Radio stations
- YouTube links
- View and like counts for popularity scoring

## How the Quiz Works

1. Select difficulty mode (Regular or Pro)
2. Answer 5 questions about which radio station played specific songs
3. Get feedback on your answers
4. View your final score and review the correct answers
5. Watch the YouTube videos of the songs

## License

MIT
