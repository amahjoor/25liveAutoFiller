// 25Live Auto-Filler Configuration Template
// COPY THIS FILE TO config.js AND EDIT WITH YOUR VALUES

const CONFIG = {
    // Google Sheet Integration
    // Paste your Google Sheets link here (must be publicly viewable)
    // Example: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?gid=0#gid=0'
    googleSheetUrl: 'YOUR_GOOGLE_SHEET_URL_HERE',
    
    // Event Information
    eventName: 'Your Event Name',
    eventTitle: 'Your Event Title',
    eventType: 'Student Organized',
    primaryOrganization: 'Your Organization Name',
    expectedHeadCount: '30',
    eventDescription: '',
    
    // Event Attributes - Yes/No
    applyingForSFBMoney: 'No',
    fundsBeingCollected: 'No',
    partneringWithNonGMUOrg: 'No',
    cateringServingFood: 'No',
    cateringFoodVendor: 'N/A',
    cateringAlcoholServed: 'No',
    audioVisualNeeds: 'Projector or screen with HDMI input',
    preferredLayout: 'Classroom',
    openToPublic: 'Yes',
    organizationAccountCode: 'YOUR_ACCOUNT_CODE',
    parkingNeeded: 'No',
    nonMasonStudentsUnder18: 'No',
    performingMedicalProcedures: 'No',
    publishEventOnCalendar: 'Yes',
    usingGrills: 'No',
    usingTentsInflatablesStages: 'No',
    speakerPerformer: 'Your Name',
    
    // Contact Information
    eventContact: {
        name: 'Your Name',
        phone: '1234567890',
        email: 'your.email@gmu.edu'
    },
    
    facultyAdvisor: {
        name: 'Advisor Name',
        email: 'advisor@gmu.edu',
        department: 'Department Name'
    },
    
    // Other
    eventComments: 'Your preferred classroom or special requests.',
    affirmation: true,
    
    // Behavior Settings
    enableAutoScroll: true,
    enableHighlight: true,
    enableNotification: true,
    scrollDelay: 500,
    highlightDuration: 800,
    highlightColor: '#ffffcc'
};

window.AUTOFILL_CONFIG = CONFIG;

