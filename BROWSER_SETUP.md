# Browser Homepage Setup Guide 🏠

## Google Chrome

1. Open Chrome Settings (3 dots menu → Settings)
2. Click on "On startup" in the left sidebar
3. Select "Open a specific page or set of pages"
4. Click "Add a new page"
5. Enter the URL: `file:///D:/home_tab/index.html`
6. To set as New Tab page:
   - Install "New Tab Redirect" extension
   - Set it to your local file path

## Mozilla Firefox

1. Open Firefox Settings (Menu button → Settings)
2. Go to "Home" in the left sidebar
3. Under "Homepage and new windows"
4. Select "Custom URLs"
5. Enter: `file:///D:/home_tab/index.html`
6. For New Tab:
   - Install "New Tab Override" extension
   - Configure with local file path

## Microsoft Edge

1. Open Edge Settings (... menu → Settings)
2. Click on "On startup" in the left sidebar
3. Select "Open a specific page"
4. Add page
5. Enter: `file:///D:/home_tab/index.html`
6. For New Tab:
   - Install "Custom New Tab URL" extension
   - Configure with your local path

## Safari

1. Open Safari Preferences
2. Go to "General" tab
3. For "Homepage" enter:
   - `file:///Users/[username]/D:/home_tab/index.html`
4. Set "New windows open with" to "Homepage"
5. Set "New tabs open with" to "Homepage"

## Important Notes 📝

1. Replace `D:/home_tab/index.html` with your actual file path
2. For security reasons, some browsers might restrict local file access
3. Consider hosting the page on a local server for better compatibility
4. Keep the file path structure intact
5. Bookmark the page as backup

## Troubleshooting 🔧

- If page doesn't load:
  - Check file path is correct
  - Ensure file permissions are set correctly
  - Try using `localhost` with a local server instead
  - Allow local file access in browser settings

## Local Server Option 💻

For better compatibility, you can run a local server:

1. Install Python
2. Open terminal in project folder
3. Run: `python -m http.server 8000`
4. Use URL: `http://localhost:8000`

## Mobile Setup 📱

For mobile browsers:

1. Host the page online (GitHub Pages recommended)
2. Use the hosted URL in mobile browser settings
3. Current hosted version: `https://kanishk1122.github.io/home_tab/`
