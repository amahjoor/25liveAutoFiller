// 25Live Auto-Filler
(function() {
    'use strict';
    
    const CONFIG = window.AUTOFILL_CONFIG || {};
    
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

    function waitForFormReady() {
        return new Promise((resolve) => {
            let attempts = 0;
            const checkForm = setInterval(() => {
                attempts++;
                const eventNameInput = document.querySelector('input[maxlength="40"]');
                const eventTitleInput = document.querySelector('input[maxlength="120"]');
                
                if (eventNameInput && eventTitleInput) {
                    clearInterval(checkForm);
                    resolve();
                }
                
                if (attempts > 100) {
                    clearInterval(checkForm);
                    resolve();
                }
            }, 200);
        });
    }

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

    function fillTextInput(selector, value, label = '') {
        const element = document.querySelector(selector);
        if (element && value !== undefined && value !== null) {
            if (element.value && element.value.trim() !== '') {
                return false;
            }
            scrollToElement(element);
            element.value = value;
            triggerChange(element);
            return true;
        }
        return false;
    }

    function fillByLabel(labelText, value) {
        const labels = Array.from(document.querySelectorAll('label'));
        const label = labels.find(l => l.textContent.trim().includes(labelText));
        if (label) {
            scrollToElement(label);
            const inputId = label.getAttribute('for');
            if (inputId) return fillTextInput('#' + inputId, value);
        }
        return false;
    }

    function setToggleButton(labelText, value) {
        try {
            const labels = Array.from(document.querySelectorAll('.ngEditableCustomAttrLabel'));
            const targetLabel = labels.find(l => l.textContent.trim().includes(labelText));
            if (!targetLabel) return false;

            const container = targetLabel.closest('.ngEditableCustomAttrRow');
            if (!container) return false;
            
            scrollToElement(container);
            const toggleContainer = container.querySelector('[role="radiogroup"]');
            if (!toggleContainer) return false;

            const toggleLabels = toggleContainer.querySelectorAll('label.toggle__label');
            const targetToggleLabel = Array.from(toggleLabels).find(l => l.textContent.trim() === value);
            if (!targetToggleLabel) return false;
            
            const radioId = targetToggleLabel.getAttribute('for');
            if (!radioId) return false;
            
            const targetButton = document.getElementById(radioId);
            if (targetButton) {
                targetButton.click();
                targetButton.checked = true;
                triggerChange(targetButton);
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    async function fillForm() {
        let filled = 0;

        if (fillTextInput('input[maxlength="40"]', FORM_DATA.eventName) ||
            fillTextInput('input.c-input[type="text"][maxlength="40"]', FORM_DATA.eventName)) {
            filled++;
        }
        await sleep(CONFIG.scrollDelay || 500);

        if (fillTextInput('input[maxlength="120"]', FORM_DATA.eventTitle)) {
            filled++;
        }
        await sleep(CONFIG.scrollDelay || 500);

        const eventTypeDropdown = document.querySelector('#ngDropdown-4 .select2-choice, [aria-label*="Event Type"] .select2-choice');
        const eventTypeSelected = eventTypeDropdown?.querySelector('.select2-chosen');
        const eventTypeValue = eventTypeSelected?.textContent.trim();
        
        if (eventTypeDropdown && eventTypeValue !== FORM_DATA.eventType && eventTypeValue !== 'Student Organized') {
            scrollToElement(eventTypeDropdown);
            eventTypeDropdown.click();
            await sleep(800);
            
            let studentOrgOption = Array.from(document.querySelectorAll('.select2-result-label, .ui-select-choices-row, .select2-result'))
                .find(el => el.textContent.trim() === 'Student Organized');
            
            if (studentOrgOption) {
                studentOrgOption.click();
                filled++;
                await sleep(500);
            } else {
                studentOrgOption = Array.from(document.querySelectorAll('.select2-results li'))
                    .find(el => el.textContent.includes('Student Organized'));
                if (studentOrgOption) studentOrgOption.click();
            }
        } else if (eventTypeValue === 'Student Organized') {
            filled++;
        }
        await sleep(500);

        const orgSection = Array.from(document.querySelectorAll('label'))
            .find(l => l.textContent.includes('Primary Organization for this Event'));
        
        let orgDropdown = null;
        if (orgSection) {
            const container = orgSection.closest('.rose-item--wrapper');
            if (container) orgDropdown = container.querySelector('.select2-choice');
        }
        if (!orgDropdown) orgDropdown = document.querySelector('#ngDropdown-5 .select2-choice');
        
        if (orgDropdown) {
            scrollToElement(orgDropdown);
            orgDropdown.click();
            await sleep(1200);
            
            let orgSearchInput = document.querySelector('.select2-dropdown-open .select2-input');
            if (!orgSearchInput) {
                orgSearchInput = document.querySelector('.select2-search input, input.select2-input:not([style*="display: none"])');
            }
            
            if (orgSearchInput) {
                orgSearchInput.focus();
                orgSearchInput.value = 'Artificial Intelligence Club';
                orgSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
                orgSearchInput.dispatchEvent(new Event('change', { bubbles: true }));
                orgSearchInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
                
                await sleep(2000);
                
                const dropdownItems = Array.from(document.querySelectorAll('.ngDropdownItemEl, .ui-select-choices-row, li.select2-result'));
                let aiClubOption = null;
                for (const item of dropdownItems) {
                    if (item.textContent.includes('Artificial Intelligence Club')) {
                        aiClubOption = item;
                        break;
                    }
                }
                
                if (!aiClubOption) {
                    const clickableResults = Array.from(document.querySelectorAll('.ngDropdownItem, [data-ng-click*="select"]'));
                    for (const item of clickableResults) {
                        if (item.textContent.includes('Artificial Intelligence Club')) {
                            aiClubOption = item;
                            break;
                        }
                    }
                }
                
                if (aiClubOption) {
                    aiClubOption.click();
                    await sleep(500);
                    const choiceElement = aiClubOption.querySelector('choice, .ngDropdownItem');
                    if (choiceElement) choiceElement.click();
                    filled++;
                    await sleep(1000);
                } else {
                    orgSearchInput.dispatchEvent(new KeyboardEvent('keydown', { 
                        bubbles: true, key: 'Enter', keyCode: 13, which: 13, code: 'Enter' 
                    }));
                    orgSearchInput.dispatchEvent(new KeyboardEvent('keypress', { 
                        bubbles: true, key: 'Enter', keyCode: 13, which: 13, code: 'Enter' 
                    }));
                    await sleep(800);
                }
            }
        }
        await sleep(500);

        if (fillTextInput('input.c-numeric-input[aria-label*="Expected Head Count"]', FORM_DATA.headCount) ||
            fillByLabel('Expected Head Count', FORM_DATA.headCount)) {
            filled++;
        }
        await sleep(500);

        // Fill Event Description (before date/time to match form order)
        console.log('🔍 Checking event description:', FORM_DATA.eventDescription);
        console.log('🔍 Description value:', FORM_DATA.eventDescription ? `"${FORM_DATA.eventDescription}"` : 'EMPTY/NULL');
        
        if (FORM_DATA.eventDescription) {
            console.log('📝 Attempting to fill Event Description...');
            const descriptionLabel = Array.from(document.querySelectorAll('label'))
                .find(l => l.textContent.includes('Event Description'));
            
            if (descriptionLabel) {
                scrollToElement(descriptionLabel);
                console.log('✅ Found description label, scrolled to it');
            }
            
            await sleep(1000);
            
            let descFilled = false;
            for (let attempt = 0; attempt < 15; attempt++) {
                console.log(`🔄 Description fill attempt ${attempt + 1}/15...`);
                
                try {
                    const iframe = document.querySelector('iframe.tox-edit-area__iframe');
                    console.log('  iframe found:', !!iframe);
                    
                    if (iframe && iframe.contentDocument) {
                        console.log('  iframe.contentDocument accessible:', !!iframe.contentDocument.body);
                        
                        if (iframe.contentDocument.body) {
                            const body = iframe.contentDocument.body;
                            
                            if (window.tinymce && window.tinymce.activeEditor) {
                                console.log('  ✅ Using TinyMCE API');
                                window.tinymce.activeEditor.setContent(`<p>${FORM_DATA.eventDescription}</p>`);
                            } else {
                                console.log('  ✅ Using direct iframe manipulation');
                                body.innerHTML = `<p>${FORM_DATA.eventDescription}</p>`;
                            }
                            
                            body.dispatchEvent(new Event('input', { bubbles: true }));
                            body.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            filled++;
                            descFilled = true;
                            console.log('✅ Description filled successfully!');
                            break;
                        }
                    }
                } catch (e) {
                    console.log('  ⚠️ Error on attempt', attempt + 1, ':', e.message);
                }
                
                await sleep(400);
            }
            
            if (!descFilled) {
                console.log('❌ Failed to fill description after all attempts');
            }
        } else {
            console.log('⚠️ Skipping description - no content to fill');
        }
        await sleep(500);

        // Fill Date and Time if available
        if (FORM_DATA.eventDate && FORM_DATA.startTime && FORM_DATA.endTime) {
            console.log('📅 Filling date and time...');
            const dateTimeLabel = Array.from(document.querySelectorAll('label'))
                .find(l => l.textContent.includes('Event Date and Time'));
            if (dateTimeLabel) scrollToElement(dateTimeLabel);
            
            await sleep(800);
            
            const targetDate = FORM_DATA.eventDate;
            const targetMonth = targetDate.getMonth(); // 0-11
            const targetYear = targetDate.getFullYear();
            const targetDay = targetDate.getDate();
            
            console.log(`🗓️ Target: ${targetMonth + 1}/${targetDay}/${targetYear}`);
            
            // First, click the date input field to open the popup calendar
            const dateInput = document.querySelector('input.b-datepicker-input, input.datepickerInput, input.s25-datepicker-input');
            if (dateInput) {
                console.log('📅 Clicking date input to open popup calendar...');
                dateInput.click();
                dateInput.focus();
                await sleep(600);
                
                // Now work with the POPUP calendar (it's in a qtip div)
                const popupCalendar = document.querySelector('#qtip-2, .qtip.s25-datepicker-qtip');
                if (popupCalendar) {
                    console.log('📅 Found popup calendar');
                    
                    // Get current month displayed in POPUP calendar
                    const calendarTitle = popupCalendar.querySelector('.b-datepicker .h-col-title');
                    if (calendarTitle) {
                        const titleText = calendarTitle.textContent.trim();
                        console.log('📆 Popup calendar showing:', titleText);
                        
                        // Parse current month and year
                        const [currentMonthName, currentYearStr] = titleText.split(' ');
                        const currentYear = parseInt(currentYearStr);
                        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                                          'July', 'August', 'September', 'October', 'November', 'December'];
                        const currentMonth = monthNames.indexOf(currentMonthName);
                        
                        console.log(`📆 Popup at: ${currentMonth + 1}/${currentYear}`);
                        
                        // Calculate how many months to navigate
                        const monthsDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
                        console.log(`➡️ Need to navigate ${monthsDiff} months`);
                        
                        // Navigate to correct month in popup
                        if (monthsDiff !== 0) {
                            const navigationClass = monthsDiff > 0 
                                ? '.b-datepicker-button-next' 
                                : '.b-datepicker-button-prev';
                            const clicksNeeded = Math.abs(monthsDiff);
                            
                            console.log(`🔄 Clicking ${navigationClass} ${clicksNeeded} times in popup...`);
                            
                            for (let i = 0; i < clicksNeeded; i++) {
                                const navButton = popupCalendar.querySelector(navigationClass);
                                if (navButton) {
                                    const parentDiv = navButton.closest('div[data-ng-click*="move"]');
                                    if (parentDiv) {
                                        parentDiv.click();
                                        await sleep(400);
                                    }
                                }
                            }
                            
                            await sleep(600);
                            console.log('✅ Popup navigation complete');
                        }
                    }
                    
                    // Click the date in the POPUP calendar (buttons WITHOUT clickToPick)
                    await sleep(400);
                    const popupDateButtons = popupCalendar.querySelectorAll('button[data-ng-if*="!datepickerOptions.clickToPick"]');
                    
                    console.log(`🔍 Found ${popupDateButtons.length} date buttons in popup`);
                    
                    // Find the button with matching day that's not in secondary month
                    const targetButton = Array.from(popupDateButtons).find(btn => {
                        const isRightDay = btn.textContent.trim() === String(targetDay).padStart(2, '0') || 
                                           btn.textContent.trim() === String(targetDay);
                        const isNotSecondary = !btn.classList.contains('text-muted');
                        return isRightDay && isNotSecondary;
                    });
                    
                    if (targetButton) {
                        console.log('🎯 Clicking date button:', targetDay);
                        targetButton.click();
                        console.log('✅ Clicked date in popup:', targetDay);
                        await sleep(800);
                    } else {
                        console.log('❌ Could not find date button for day:', targetDay);
                    }
                } else {
                    console.log('❌ Popup calendar not found');
                }
            } else {
                console.log('❌ Date input field not found');
            }
            
            // Fill start time
            const startTimeInput = document.querySelector('input[aria-label="Start Time"]');
            if (startTimeInput) {
                startTimeInput.value = FORM_DATA.startTime;
                triggerChange(startTimeInput);
                console.log('✅ Set start time:', FORM_DATA.startTime);
                await sleep(500);
            }
            
            // Fill end time
            const endTimeInput = document.querySelector('input[aria-label="End Time"]');
            if (endTimeInput) {
                endTimeInput.value = FORM_DATA.endTime;
                triggerChange(endTimeInput);
                console.log('✅ Set end time:', FORM_DATA.endTime);
                await sleep(500);
            }
            
            filled += 3;
        }
        await sleep(500);

        // Fill Location Search
        console.log('📍 Starting location search...');
        const locationsLabel = Array.from(document.querySelectorAll('label'))
            .find(l => l.textContent.includes('Event Locations'));
        if (locationsLabel) {
            scrollToElement(locationsLabel);
            await sleep(800);
        }

        // Step 1: Select "All Spaces - Fairfax" from saved searches
        console.log('📍 Step 1: Opening saved searches dropdown...');
        const locationSearchDropdown = document.querySelector('query-chooser[data-type-id="4"] .select2-choice');
        if (locationSearchDropdown) {
            console.log('  Found dropdown, clicking...');
            locationSearchDropdown.click();
            await sleep(1200);
            
            // Find and click "All Spaces - Fairfax" option from the opened dropdown
            console.log('  Looking for "All Spaces - Fairfax" in dropdown...');
            
            // Wait for dropdown to fully open and populate
            await sleep(400);
            
            const dropdownOptions = Array.from(document.querySelectorAll('.ui-select-dropdown.select2-drop-active div.ngDropdownItem.ngParentSelect'));
            console.log(`  Found ${dropdownOptions.length} dropdown options`);
            
            const allSpacesOption = dropdownOptions.find(el => {
                const spanText = el.querySelector('span')?.textContent.trim() || '';
                console.log(`    Checking option: "${spanText}"`);
                return spanText === 'All Spaces - Fairfax';
            });
            
            if (allSpacesOption) {
                console.log('  ✅ Found "All Spaces - Fairfax", clicking...');
                allSpacesOption.click();
                console.log('  Waiting for saved search to auto-execute...');
                await sleep(2500); // Saved searches auto-execute, wait for results
                console.log('✅ Selected "All Spaces - Fairfax" - should have auto-searched');
            } else {
                console.log('  ❌ Could not find "All Spaces - Fairfax" in dropdown');
                // Close dropdown if we couldn't find it
                document.body.click();
                await sleep(500);
            }
        } else {
            console.log('  ❌ Could not find saved searches dropdown');
        }

        // Step 2: Wait for search results (saved searches auto-execute, no need to click Search)
        console.log('📍 Step 2: Waiting for search results to load...');
        await sleep(2000);

        // Step 3: Find and click Request button for "CLASSROOM (FAIRFAX): TECHNOLOGY"
        console.log('📍 Step 3: Looking for CLASSROOM (FAIRFAX): TECHNOLOGY...');
        
        let techClassroomButton = null;
        // Try multiple times to find the button as results may still be loading
        for (let attempt = 0; attempt < 5; attempt++) {
            console.log(`  Attempt ${attempt + 1}/5: Searching for button...`);
            
            // Debug: Check if results table exists
            const resultsTable = document.querySelector('s25-location-search-list table.b-listview');
            console.log(`    Results table exists: ${!!resultsTable}`);
            
            if (resultsTable) {
                const allRows = resultsTable.querySelectorAll('tbody tr.ngListRow');
                console.log(`    Found ${allRows.length} result rows`);
                
                // Look through rows to find CLASSROOM (FAIRFAX): TECHNOLOGY
                allRows.forEach((row, idx) => {
                    const nameCell = row.querySelector('[data-label="Name"] .s25-item-name');
                    if (nameCell) {
                        console.log(`      Row ${idx + 1}: ${nameCell.textContent.trim()}`);
                    }
                });
            }
            
            const requestButtons = Array.from(document.querySelectorAll('button.aw-button--primary'))
                .filter(btn => {
                    const isRequest = btn.textContent.trim() === 'Request';
                    const ariaLabel = btn.getAttribute('aria-label') || '';
                    const hasTech = ariaLabel.includes('CLASSROOM (FAIRFAX): TECHNOLOGY');
                    if (isRequest) {
                        console.log(`      Found Request button with aria-label: "${ariaLabel}"`);
                    }
                    return isRequest && hasTech;
                });
            
            if (requestButtons.length > 0) {
                techClassroomButton = requestButtons[0];
                console.log(`  ✅ Found button on attempt ${attempt + 1}`);
                break;
            }
            
            console.log(`    Button not found, waiting...`);
            await sleep(1000);
        }
        
        if (techClassroomButton) {
            scrollToElement(techClassroomButton);
            await sleep(500);
            techClassroomButton.click();
            console.log('✅ Clicked Request for CLASSROOM (FAIRFAX): TECHNOLOGY');
            await sleep(1500);
            filled++;
        } else {
            console.log('❌ Could not find CLASSROOM (FAIRFAX): TECHNOLOGY after 5 attempts');
        }

        // Step 4: Switch to "Your Starred Locations"
        console.log('📍 Step 4: Switching to "Your Starred Locations"...');
        const locationDropdownAgain = document.querySelector('query-chooser[data-type-id="4"] .select2-choice');
        if (locationDropdownAgain) {
            console.log('  Opening dropdown again...');
            locationDropdownAgain.click();
            await sleep(1200);
            
            // Find and click "Your Starred Locations" option
            console.log('  Looking for "Your Starred Locations"...');
            await sleep(400);
            
            const starredOptions = Array.from(document.querySelectorAll('.ui-select-dropdown.select2-drop-active div.ngDropdownItem.ngParentSelect'));
            const starredOption = starredOptions.find(el => {
                const spanText = el.querySelector('span')?.textContent.trim() || '';
                return spanText === 'Your Starred Locations';
            });
            
            if (starredOption) {
                console.log('  ✅ Found "Your Starred Locations", clicking...');
                starredOption.click();
                await sleep(1000);
                console.log('✅ Selected "Your Starred Locations"');
            } else {
                console.log('  ❌ Could not find "Your Starred Locations"');
            }
        }

        await sleep(500);

        const attributesLabel = Array.from(document.querySelectorAll('label'))
            .find(l => l.textContent.includes('Event Attributes'));
        if (attributesLabel) {
            scrollToElement(attributesLabel);
            await sleep(800);
        }
        
        for (const [question, answer] of Object.entries(FORM_DATA.customAttributes)) {
            await sleep(400);
            if (answer === 'Yes' || answer === 'No') {
                if (setToggleButton(question, answer)) filled++;
            } else {
                if (fillByLabel(question, answer)) filled++;
            }
        }
        await sleep(300);

        const commentTextarea = document.querySelector('textarea[aria-label*="Event Comments"]');
        if (commentTextarea) {
            scrollToElement(commentTextarea);
            commentTextarea.value = FORM_DATA.eventComments;
            triggerChange(commentTextarea);
            filled++;
        }
        await sleep(500);

        const affirmationCheckbox = document.querySelector('input[type="checkbox"][id*="ngCheckboxPro1"]');
        if (affirmationCheckbox && FORM_DATA.affirmation) {
            const affirmationSection = affirmationCheckbox.closest('.rose-item--wrapper');
            if (affirmationSection) scrollToElement(affirmationSection);
            await sleep(300);
            affirmationCheckbox.click();
            filled++;
        }
        
        await sleep(500);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (CONFIG.enableNotification) {
            showNotification(`Auto-filled ${filled} fields successfully!`);
        }
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

    async function init() {
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
    
    function openPopup() {
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }
    
    function showBanner() {
        const banner = document.createElement('div');
        banner.style.cssText = `position: fixed; top: 0; left: 0; right: 0; background: #005239; 
            color: white; text-align: center; padding: 8px; z-index: 999999; 
            font-family: Arial, sans-serif; font-size: 13px;`;
        banner.textContent = '🤖 AI Club Auto-Filler: Active';
        document.body.appendChild(banner);
        setTimeout(() => {
            banner.style.opacity = '0';
            banner.style.transition = 'opacity 0.5s';
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    }
    
    async function startFilling() {
        await waitForFormReady();
        await sleep(500);
        await fillForm();
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'fillForm' && request.event) {
            console.log('📨 Received event data from popup:', request.event);
            
            FORM_DATA.eventName = 'AI Club Event';
            FORM_DATA.eventTitle = request.event.eventName;
            FORM_DATA.customAttributes['Who is speaking/performing?'] = request.event.speakerPerformer;
            FORM_DATA.eventDescription = request.event.eventDescription || '';
            
            // Convert date string back to Date object
            FORM_DATA.eventDate = request.event.eventDate ? new Date(request.event.eventDate) : null;
            FORM_DATA.startTime = request.event.startTime;
            FORM_DATA.endTime = request.event.endTime;
            
            console.log('📅 Date:', FORM_DATA.eventDate);
            console.log('🕐 Start:', FORM_DATA.startTime);
            console.log('🕐 End:', FORM_DATA.endTime);
            
            startFilling();
            sendResponse({ success: true });
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

