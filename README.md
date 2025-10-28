# 25Live Auto-Filler

Automatically fills the 25Live event form for GMU.

## Installation

1. Copy `config.example.js` → `config.js`
2. Edit `config.js` with your details
3. Load extension at `chrome://extensions/`

## Usage

Navigate to: `https://25live.collegenet.com/pro/gmu#!/home/event/form`

The form auto-fills in 3-5 seconds with smooth scrolling.

**You still need to manually fill:**
- Event Date and Time
- Event Locations

Then click **Save**.

## Customization

**Edit `config.js` to change any values:**
- Event information
- Contact details
- Yes/No toggles
- Comments
- Behavior settings

**After editing `config.js`:**
1. Go to `chrome://extensions/`
2. Click refresh on the extension
3. Reload the 25Live page

## Files

- `config.example.js` - Template config file
- `config.js` - **Your personal config** (git-ignored)
- `content.js` - Auto-fill logic
- `manifest.json` - Extension settings
- `styles.css` - Styling
- `icon*.png` - Icons
