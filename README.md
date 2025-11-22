# Modern Day Tracker & Todo Manager 🌟

![Day Tracker Preview](./image.png)

A minimalist yet powerful daily task tracker with real-time updates and visual progress indicators.

## 🎯 Key Features

- Live Clock (24h HH:MM format, zinc styled)
- Year Progress Grid (past / current / future days)
- Weekly Schedule Panel (Sun–Sat quick task access)
- Dual Task Modes (Weekly tasks + Day-of-year tasks)
- Shortcut Manager (favicon linked quick launch icons)
- Wallpaper System (URL image/video or local image upload)
- IndexedDB storage for large local wallpaper files
- Drag-and-Drop Task Ordering
- Inline Title Edit (double-click)
- Task Detail Viewer
- Favicon Auto-Fetch (Google service fallback)
- Zinc Theme UI (neutral dark palette)

## 🖼 Wallpaper Management

- Open wallpaper modal via:
  - Change icon button
  - Double-click empty background area
- Set from URL (supports images or MP4/WebM/Ogg/MOV video)
- Upload local image (IndexedDB persisted)
- Automatic type detection (image vs video)
- Reset to default Unsplash image
- Large file support via IndexedDB (avoids localStorage limits)

## ⚡ Shortcuts

- Click + button next to clock to open shortcut modal
- Add (Name + URL) – favicon auto-fetched
- Compact circular favicon pills under clock
- Delete shortcuts from modal
- Stored in localStorage (persistent)

## 📅 Weekly Schedule

- Separate weekly task list keyed by `todo_week_<dayIndex>`
- Current day highlighted (light zinc)
- Indicator dot for days with tasks
- Double-click task title to edit
- View / Delete actions per item

## 📆 Year Grid

- Dynamically rendered 365/366 day boxes
- Current day highlighted (white pulse effect via box-shadow)
- Small indicator dot for days with tasks (`todo_day_<n>`)

## 🛠 Technical Notes

- localStorage: tasks + shortcut metadata + wallpaper meta
- IndexedDB: stored binary of uploaded wallpaper (large files)
- Dynamic event delegation (minimal inline handlers)
- Graceful fallback SVG if favicon fails

## 🔄 Data Keys

- Weekly tasks: `todo_week_0` … `todo_week_6`
- Year day tasks: `todo_day_1` … `todo_day_365|366`
- Shortcuts: `shortcuts`
- Wallpaper meta: `user_wallpaper_meta`
- IndexedDB store: `current_wallpaper`

## 📝 Usage Tips

- Double-click background to quickly open wallpaper settings
- Rotate + button (animation) indicates interaction
- Drag tasks to reorder priority
- Hover year boxes for tooltips (via title attr)
- Minimal footprint; all data local

## 🔜 Upcoming Features

- [ ] Export / Import (tasks + shortcuts + wallpaper meta)
- [ ] Weekly summary / analytics
- [ ] Optional milliseconds toggle for clock
- [ ] Theme variants (emerald / slate / rose)
- [ ] Global search across tasks
- [ ] Tagging & filters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License

MIT License - Open source and free to use

## ⚙️ Installation & Setup

### 1. Clone

```bash
git clone https://github.com/kanishk1122/home_tab.git
cd home_tab
```

### 2. Run Locally

Open: d:\home_tab\index.html (double-click or drag into browser)

### 3. Set as Homepage (Manual)

Browser settings → Homepage → Use this file path or deploy URL.

### 4. Load as Browser Extension (Chrome / Edge - MV3)

1. Create manifest.json at project root (example below).
2. Open chrome://extensions (or edge://extensions)
3. Enable Developer Mode.
4. Click Load Unpacked.
5. Select folder: d:\Black_Hole_Dashboard
6. Open a new tab to see override.

### 5. Firefox Temporary Add-on

Firefox supports MV3 (beta) or fallback:

1. Open about:debugging#/runtime/this-firefox
2. Click Load Temporary Add-on
3. Select manifest.json
   (New tab override works similarly.)

### 6. Data Persistence

- Tasks / shortcuts stored in localStorage & IndexedDB (wallpaper blob).
- Removing extension without clearing site data preserves content if reloaded.

### 📄 Manifest Example

See root manifest.json file included.

### Folder Structure (Essentials)

```
d:/
  home_tab/
    index.html
    scripts/
    styles/
    public/
    manifest.json
```

---

💻 [View Code](https://github.com/kanishk1122/home_tab)
🌐 [Live Demo](https://kanishk1122.github.io/home_tab/)
🐛 [Report Bug](https://github.com/kanishk1122/home_tab/issues)
