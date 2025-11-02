# 25Live & Mason360 Auto-Filler

Automatically fills 25Live and Mason360 event forms for GMU AI Club with Google Sheet integration.

## Installation

1. Copy `config.example.js` → `config.js`
2. Edit `config.js`:
   - Paste our GSheets events link
   - Update organization details
3. Load extension at `chrome://extensions/`

## Usage

### For 25Live:
1. Navigate to [25Live event form](https://25live.collegenet.com/pro/gmu#!/home/event/form)
2. Click the **extension icon** in Chrome toolbar
3. Select an event from the list
4. Form auto-fills with event details
5. Review and click **Save**

### For Mason360:
1. Navigate to [Mason360 event form](https://mason360.gmu.edu/event_form2)
2. Click the **extension icon** in Chrome toolbar
3. Select an event from the list
4. Form auto-fills with event details
5. Review and click **Create Event**

## What Gets Auto-Filled

### 25Live
- **Event Name:** "AI Club Event"
- **Event Title:** Selected event name
- **Event Type:** "Student Organized"
- **Primary Organization:** "Artificial Intelligence Club"
- **Event Description:** From Google Sheet
- **Speaker/Performer:** From Google Sheet
- **Date & Time:** From Google Sheet
- **Location:** Searches for "CLASSROOM (FAIRFAX): TECHNOLOGY"
- **All other fields:** From `config.js` defaults

### Mason360
- **Event Name:** Selected event name from sheet
- **Description:** From Google Sheet
- **Event Type:** "Meetings"
- **Event Tags:** "Science/Technology"
- **Date & Time:** From Google Sheet
- **Location Name:** From Google Sheet
- **Dress Code:** "Casual (jeans ok)"
- **Who is allowed to register:** "Everyone"
- **Who can see this event:** "Everyone"

## Platform Detection

The extension automatically detects whether you're on 25Live or Mason360 and uses the appropriate autofill logic. If you click the extension from another page, you'll be prompted to choose which platform to use.

## Architecture

The extension is organized into modular files for maintainability:

- **`content.js`** - Main coordinator (platform detection, shared utilities, message routing)
- **`25live.js`** - All 25Live-specific form filling logic
- **`mason360.js`** - All Mason360-specific form filling logic
- **`popup.js`** - Event selection popup UI
- **`config.js`** - Your configuration settings (not in repo)
- **`manifest.json`** - Chrome extension configuration

Files are loaded in order: `config.js` → `mason360.js` → `25live.js` → `content.js`
