# Chroma Vision: Art Student Challenge

A high-precision color sensitivity game designed for art students to test their perception of subtle color differences.

## Features
- **Precision Testing**: Grid size and color similarity adjust dynamically based on performance.
- **Bilingual Support**: Toggle between English and Chinese.
- **Technical Feedback**: Real-time Delta-E (H/S/L) difference visualization.
- **Responsive Design**: Works on desktop and mobile.

## Deployment to Vercel

1. **Push to GitHub**:
   - Create a new repository on GitHub.
   - Initialize git in your local folder: `git init`.
   - Add files: `git add .`.
   - Commit: `git commit -m "Initial commit"`.
   - Link to GitHub: `git remote add origin <your-repo-url>`.
   - Push: `git push -u origin main`.

2. **Deploy on Vercel**:
   - Go to [Vercel](https://vercel.com).
   - Click "Add New" -> "Project".
   - Import your GitHub repository.
   - Vercel will automatically detect the Vite project.
   - (Optional) Add `VITE_GEMINI_API_KEY` in Environment Variables if you plan to use Gemini features.
   - Click "Deploy".

## Local Development

```bash
npm install
npm run dev
```
