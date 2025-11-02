// Popup script for event selection

// Check if config loaded
if (!window.AUTOFILL_CONFIG) {
    setTimeout(() => {
        if (!window.AUTOFILL_CONFIG) {
            document.getElementById('container').innerHTML = 
                '<div class="error">Config failed to load. Please check config.js exists and has no errors.</div>';
        }
    }, 500);
}

async function fetchEvents() {
    try {
        const CONFIG = window.AUTOFILL_CONFIG;
        
        if (!CONFIG) {
            throw new Error('Config not loaded. Make sure config.js exists.');
        }
        
        if (!CONFIG.googleSheetUrl || CONFIG.googleSheetUrl === 'YOUR_GOOGLE_SHEET_URL_HERE') {
            throw new Error('Please set googleSheetUrl in config.js');
        }
        
        const sheetUrl = CONFIG.googleSheetUrl;
        const urlMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const gidMatch = sheetUrl.match(/[#&]gid=([0-9]+)/);
        
        if (!urlMatch) {
            throw new Error('Invalid Google Sheet URL');
        }
        
        const sheetId = urlMatch[1];
        const gid = gidMatch ? gidMatch[1] : '0';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
}

function parseCSV(csv) {
    const events = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rows = parseCSVWithMultiline(csv);
    console.log('📊 Parsed', rows.length, 'rows from CSV');
    
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        
        if (values[0] && values[0] !== 'More to come!' && values[0] !== 'last updated:') {
            const eventDate = parseDateFromString(values[2]);
            
            if (eventDate && eventDate >= today) {
                const event = {
                    name: values[0]?.trim() || '',
                    speaker: values[1]?.trim() || 'Arman Mahjoor',
                    dateTime: values[2]?.trim() || '',
                    location: values[3]?.trim() || '',
                    description: stripEmojis(values[4]?.trim() || ''),
                    parsedDate: eventDate
                };
                events.push(event);
            }
        }
    }
    
    return events.sort((a, b) => a.parsedDate - b.parsedDate);
}

function stripEmojis(text) {
    if (!text) return '';
    
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
    
    return text
        .replace(emojiRegex, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseCSVWithMultiline(csv) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentCell || currentRow.length > 0) {
                currentRow.push(currentCell);
                if (currentRow.some(cell => cell.trim())) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            }
        } else {
            if (char !== '\r') {
                currentCell += char;
            }
        }
    }
    
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        if (currentRow.some(cell => cell.trim())) {
            rows.push(currentRow);
        }
    }
    
    return rows;
}

function parseDateFromString(dateStr) {
    if (!dateStr) return null;
    
    const months = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
        'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    
    const match = dateStr.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/i);
    if (match) {
        const month = months[match[1].toLowerCase()];
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        if (month !== undefined && !isNaN(day) && !isNaN(year)) {
            return new Date(year, month, day);
        }
    }
    
    return null;
}

function parseDateTimeInfo(dateTimeStr) {
    if (!dateTimeStr) return { date: null, startTime: null, endTime: null };
    
    const dateMatch = dateTimeStr.match(/(\w+)\s+(\d+)(?:st|nd|rd|th)?,?\s+(\d{4})/i);
    let date = null;
    
    if (dateMatch) {
        const months = {
            'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
            'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        const month = months[dateMatch[1].toLowerCase()];
        const day = parseInt(dateMatch[2]);
        const year = parseInt(dateMatch[3]);
        
        if (month !== undefined && !isNaN(day) && !isNaN(year)) {
            date = new Date(year, month, day);
        }
    }
    
    const timeMatch = dateTimeStr.match(/(\d+):(\d+)\s*(am|pm)?\s*-\s*(\d+):(\d+)\s*(am|pm)?/i);
    let startTime = null;
    let endTime = null;
    
    if (timeMatch) {
        let startHour = parseInt(timeMatch[1]);
        const startMin = parseInt(timeMatch[2]);
        const startPeriod = (timeMatch[3] || timeMatch[6] || 'pm').toLowerCase();
        
        if (startPeriod === 'pm' && startHour !== 12) startHour += 12;
        if (startPeriod === 'am' && startHour === 12) startHour = 0;
        
        let endHour = parseInt(timeMatch[4]);
        const endMin = parseInt(timeMatch[5]);
        const endPeriod = (timeMatch[6] || 'pm').toLowerCase();
        
        if (endPeriod === 'pm' && endHour !== 12) endHour += 12;
        if (endPeriod === 'am' && endHour === 12) endHour = 0;
        
        startTime = `${startHour % 12 || 12}:${String(startMin).padStart(2, '0')} ${startHour >= 12 ? 'pm' : 'am'}`;
        endTime = `${endHour % 12 || 12}:${String(endMin).padStart(2, '0')} ${endHour >= 12 ? 'pm' : 'am'}`;
    }
    
    return { date, startTime, endTime };
}


function displayEvents(events) {
    const container = document.getElementById('container');
    
    if (events.length === 0) {
        container.innerHTML = '<div class="error">No events found in spreadsheet.</div>';
        return;
    }
    
    container.innerHTML = events.map((event, index) => `
        <div class="event-card" data-index="${index}">
            <div class="event-name">${escapeHtml(event.name)}</div>
            <div class="event-details">
                <div>🎤 ${escapeHtml(event.speaker)}</div>
                <div>📍 ${escapeHtml(event.location)}</div>
            </div>
            <div class="event-date">📅 ${escapeHtml(event.dateTime)}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => selectEvent(events[index]));
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function selectEvent(event) {
    console.log('🎯 Selected event:', event);
    console.log('📝 Event description from sheet:', event.description);
    
    const dateTimeInfo = parseDateTimeInfo(event.dateTime);
    console.log('📅 Parsed date/time:', dateTimeInfo);
    
    const eventData = {
        eventName: event.name,
        speakerPerformer: event.speaker,
        eventDescription: event.description,
        eventDate: dateTimeInfo.date,
        startTime: dateTimeInfo.startTime,
        endTime: dateTimeInfo.endTime,
        location: event.location
    };
    
    console.log('📤 Sending to content script:', eventData);
    
    await chrome.storage.local.set({ selectedEvent: eventData });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check which platform we're on
    if (tab.url && tab.url.includes('mason360.gmu.edu/event_form2')) {
        console.log('📍 On Mason360 - sending message');
        chrome.tabs.sendMessage(tab.id, { action: 'fillForm', event: eventData }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Please refresh the Mason360 page and try again.');
            } else {
                window.close();
            }
        });
    } else if (tab.url && tab.url.includes('25live.collegenet.com')) {
        console.log('📍 On 25Live - sending message');
        chrome.tabs.sendMessage(tab.id, { action: 'fillForm', event: eventData }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Please refresh the 25Live page and try again.');
            } else {
                window.close();
            }
        });
    } else {
        // Not on either platform - ask user which one to use
        const useMason360 = confirm('Open form in:\n\nOK = Mason360\nCancel = 25Live');
        
        if (useMason360) {
            const formUrl = 'https://mason360.gmu.edu/event_form2';
            chrome.tabs.create({ url: formUrl }, (newTab) => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(newTab.id, { action: 'fillForm', event: eventData });
                    window.close();
                }, 3000);
            });
        } else {
            const formUrl = 'https://25live.collegenet.com/pro/gmu#!/home/event/form';
            chrome.tabs.create({ url: formUrl }, (newTab) => {
                setTimeout(() => {
                    chrome.tabs.sendMessage(newTab.id, { action: 'fillForm', event: eventData });
                    window.close();
                }, 3000);
            });
        }
    }
}

async function loadEvents() {
    const container = document.getElementById('container');
    container.innerHTML = '<div class="loading"><div>📋 Loading upcoming events...</div></div>';
    
    try {
        const events = await fetchEvents();
        if (events.length === 0) {
            container.innerHTML = `
                <div class="error">
                    No upcoming events found. All events may be in the past.
                </div>
            `;
        } else {
            displayEvents(events);
        }
    } catch (error) {
        container.innerHTML = `
            <div class="error">
                ${error.message === 'Please set googleSheetUrl in config.js' ? 
                    'Please set googleSheetUrl in config.js with your Google Sheet link.' :
                    'Failed to load events. Make sure the spreadsheet is publicly accessible.'
                }
                <br><br>Error: ${error.message}
            </div>
        `;
    }
}

document.getElementById('refreshBtn').addEventListener('click', loadEvents);
loadEvents();

