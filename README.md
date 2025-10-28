# 25Live Auto-Filler

Automatically fills the 25Live event form for GMU AI Club with Google Sheet integration.

## Installation

1. Copy `config.example.js` → `config.js`
2. Edit `config.js`:
   - Paste our GSheets events link
   - Update organization details
4. Load extension at `chrome://extensions/`

## Usage

1. Click the **extension icon** in Chrome toolbar
2. See your upcoming events from the spreadsheet
3. **Click an event** to select it
4. New tab opens with form auto-filled
5. Manually add date/time and location
6. Click **Save**

### What Gets Auto-Filled

- **Event Name:** "AI Club Event"
- **Event Title:** Selected event name
- **Event Description:** Event description from sheet
- **Speaker:** "Who is speaking/performing?" field
- **All other fields:** From `config.js` defaults
