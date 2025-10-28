// 25Live Auto-Filler v2.3
(function() {
    'use strict';
    
    const CONFIG = window.AUTOFILL_CONFIG || {};
    
    const FORM_DATA = {
        eventName: CONFIG.eventName,
        eventTitle: CONFIG.eventTitle,
        eventType: CONFIG.eventType,
        primaryOrganization: CONFIG.primaryOrganization,
        headCount: CONFIG.expectedHeadCount,
        eventDescription: CONFIG.eventDescription,
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

        try {
            const iframe = document.querySelector('iframe.tox-edit-area__iframe');
            if (iframe && iframe.contentDocument && FORM_DATA.eventDescription) {
                iframe.contentDocument.body.innerHTML = FORM_DATA.eventDescription;
                filled++;
            }
        } catch (e) {}
        await sleep(300);

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
                        setTimeout(() => startFilling(), 2000);
                    }
                }
            }, 500);
            return;
        }
        startFilling();
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
