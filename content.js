// Main Auto-Filler Coordinator
(function() {
    'use strict';
    
    const CONFIG = window.AUTOFILL_CONFIG || {};
    
    // Detect which platform we're on
    const PLATFORM = detectPlatform();
    
    // Shared form data structure
    let FORM_DATA = {
        eventName: CONFIG.eventName,
        eventTitle: CONFIG.eventTitle,
        eventType: CONFIG.eventType,
        primaryOrganization: CONFIG.primaryOrganization,
        headCount: CONFIG.expectedHeadCount,
        eventDescription: CONFIG.eventDescription,
        eventDate: null,
        startTime: null,
        endTime: null,
        location: null,
        customAttributes: {
            'Applying for SFB money?': CONFIG.applyingForSFBMoney,
            'Are funds being collected?': CONFIG.fundsBeingCollected,
            'Are you partnering with a NON-GMU Org?': CONFIG.partneringWithNonGMUOrg,
            'Catering - Are you serving food/bev?': CONFIG.cateringServingFood,
            'Catering - Food vendor (Chartwells, other approved caterer)': CONFIG.cateringFoodVendor,
            'Catering - Is alcohol being served?': CONFIG.cateringAlcoholServed,
            'Describe your audio visual needs:': CONFIG.audioVisualNeeds,
            'Describe your preferred layout:': CONFIG.preferredLayout,
            'Event on-site Contact (Name,Phone,Email)': `${CONFIG.eventContact.name}, ${CONFIG.eventContact.phone}, ${CONFIG.eventContact.email}`,
            'Faculty Advisor (Name, Email, Dept.)': `${CONFIG.facultyAdvisor.name}, ${CONFIG.facultyAdvisor.email}, ${CONFIG.facultyAdvisor.department}`,
            'Is this event open to the public?': CONFIG.openToPublic,
            'Organization Account Code': CONFIG.organizationAccountCode,
            'Parking Needed?': CONFIG.parkingNeeded,
            'Non-Mason student participants under the age of 18?': CONFIG.nonMasonStudentsUnder18,
            'Performing any medical procedures?': CONFIG.performingMedicalProcedures,
            'Publish event on the Calendar?': CONFIG.publishEventOnCalendar,
            'Using any grills (charcoal)?': CONFIG.usingGrills,
            'Using any tents, inflatables or stages?': CONFIG.usingTentsInflatablesStages,
            'Who is speaking/performing?': CONFIG.speakerPerformer
        },
        eventComments: CONFIG.eventComments,
        affirmation: CONFIG.affirmation
    };
    
    // ==================== Platform Detection ====================
    
    function detectPlatform() {
        const url = window.location.href;
        if (url.includes('mason360.gmu.edu/event_form2')) {
            console.log('🎓 Detected platform: Mason360');
            return 'mason360';
        } else if (url.includes('25live.collegenet.com')) {
            console.log('🎓 Detected platform: 25Live');
            return '25live';
        }
        return 'unknown';
    }

    // ==================== Shared Utilities ====================
    
    function triggerChange(element) {
        if (!element) return;
        const events = ['input', 'change', 'blur', 'keyup'];
        events.forEach(eventType => {
            element.dispatchEvent(new Event(eventType, { bubbles: true, cancelable: true }));
        });
    }
    
    function scrollToElement(element) {
        if (!element || !CONFIG.enableAutoScroll) return;
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        if (CONFIG.enableHighlight) highlightElement(element);
    }
    
    function highlightElement(element) {
        if (!element) return;
        const originalBg = element.style.backgroundColor;
        const originalTransition = element.style.transition;
        element.style.transition = 'background-color 0.3s ease';
        element.style.backgroundColor = CONFIG.highlightColor || '#ffffcc';
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            setTimeout(() => element.style.transition = originalTransition, 300);
        }, CONFIG.highlightDuration || 800);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'autofill-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    function showBanner() {
        const platformName = PLATFORM === 'mason360' ? 'Mason360' : '25Live';
        const banner = document.createElement('div');
        banner.style.cssText = `position: fixed; top: 0; left: 0; right: 0; background: #005239; 
            color: white; text-align: center; padding: 8px; z-index: 999999; 
            font-family: Arial, sans-serif; font-size: 13px;`;
        banner.textContent = `🤖 AI Club Auto-Filler (${platformName}): Active`;
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.5s';
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    }

    // ==================== Form Filling ====================
    
    async function startFilling() {
        const utilities = {
            sleep,
            triggerChange,
            scrollToElement,
            showNotification,
            highlightElement
        };

        if (PLATFORM === 'mason360') {
            if (window.Mason360Filler) {
                await window.Mason360Filler.fillForm(FORM_DATA, CONFIG, utilities);
            } else {
                console.error('❌ Mason360Filler not loaded!');
            }
        } else if (PLATFORM === '25live') {
            if (window.Live25Filler) {
                await window.Live25Filler.waitForFormReady();
                await sleep(500);
                await window.Live25Filler.fillForm(FORM_DATA, CONFIG, utilities);
            } else {
                console.error('❌ Live25Filler not loaded!');
            }
        }
    }

    // ==================== Initialization ====================
    
    async function init() {
        if (PLATFORM === 'mason360') {
            // Mason360 is ready immediately, no navigation needed
            setTimeout(() => openPopup(), 1000);
        } else if (PLATFORM === '25live') {
            if (!window.location.hash.includes('#!/home/event/form')) {
                let lastUrl = window.location.href;
                const checkUrl = setInterval(() => {
                    if (window.location.href !== lastUrl) {
                        lastUrl = window.location.href;
                        if (window.location.hash.includes('#!/home/event/form')) {
                            clearInterval(checkUrl);
                            setTimeout(() => openPopup(), 1000);
                        }
                    }
                }, 500);
                return;
            }
            
            setTimeout(() => openPopup(), 1000);
        }
    }
    
    function openPopup() {
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }

    // ==================== Message Handler ====================
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'fillForm' && request.event) {
            console.log('📨 Received event data from popup:', request.event);
            console.log('🎓 Platform:', PLATFORM);
            
            FORM_DATA.eventName = 'AI Club Event';
            FORM_DATA.eventTitle = request.event.eventName;
            FORM_DATA.customAttributes['Who is speaking/performing?'] = request.event.speakerPerformer;
            FORM_DATA.eventDescription = request.event.eventDescription || '';
            FORM_DATA.location = request.event.location || '';
            
            // Convert date string back to Date object
            FORM_DATA.eventDate = request.event.eventDate ? new Date(request.event.eventDate) : null;
            FORM_DATA.startTime = request.event.startTime;
            FORM_DATA.endTime = request.event.endTime;
            
            console.log('📅 Date:', FORM_DATA.eventDate);
            console.log('🕐 Start:', FORM_DATA.startTime);
            console.log('🕐 End:', FORM_DATA.endTime);
            console.log('📍 Location:', FORM_DATA.location);
            
            startFilling();
            sendResponse({ success: true });
        }
    });

    // ==================== Start ====================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
