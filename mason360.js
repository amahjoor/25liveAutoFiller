// Mason360 Form Auto-Filler
(function() {
    'use strict';
    
    window.Mason360Filler = {
        async fillForm(formData, config, utilities) {
            console.log('🎓 Starting Mason360 form fill...');
            let filled = 0;
            const { sleep, triggerChange, scrollToElement, showNotification } = utilities;

            // Wait for form to be ready
            await sleep(1000);

            // 1. Event Name
            const eventNameInput = document.querySelector('#event_name');
            if (eventNameInput && formData.eventTitle) {
                scrollToElement(eventNameInput);
                eventNameInput.value = formData.eventTitle;
                triggerChange(eventNameInput);
                filled++;
                console.log('✅ Filled event name');
            }
            await sleep(config.scrollDelay || 500);

            // 2. Description
            const descTextarea = document.querySelector('#event_short_description');
            if (descTextarea && formData.eventDescription) {
                scrollToElement(descTextarea);
                descTextarea.value = formData.eventDescription;
                triggerChange(descTextarea);
                filled++;
                console.log('✅ Filled description');
            }
            await sleep(config.scrollDelay || 500);

            // 3. Event Type - Select "Meetings" (value="18441")
            const eventTypeSelect = document.querySelector('#select_event_type_lookup');
            if (eventTypeSelect) {
                scrollToElement(eventTypeSelect);
                eventTypeSelect.value = '18441'; // Meetings
                triggerChange(eventTypeSelect);
                filled++;
                console.log('✅ Set event type to Meetings');
            }
            await sleep(config.scrollDelay || 500);

            // 4. Event Tags - Select "Science/Technology" (value="2529593")
            const eventTagsSelect = document.querySelector('#select_event_topic_tags');
            if (eventTagsSelect) {
                scrollToElement(eventTagsSelect);
                eventTagsSelect.value = '2529593'; // Science/Technology
                triggerChange(eventTagsSelect);
                // This triggers an AJAX call to add the tag
                const changeEvent = new Event('change', { bubbles: true });
                eventTagsSelect.dispatchEvent(changeEvent);
                filled++;
                console.log('✅ Set event tag to Science/Technology');
            }
            await sleep(config.scrollDelay || 500);

            // 5. Date and Time
            if (formData.eventDate && formData.startTime && formData.endTime) {
                const { date, startHour, startMinute, startAmPm, endHour, endMinute, endAmPm } = 
                    this.parseMason360DateTime(formData.eventDate, formData.startTime, formData.endTime);

                // Start Date
                const startDateInput = document.querySelector('#event_date');
                if (startDateInput && date) {
                    scrollToElement(startDateInput);
                    startDateInput.value = date;
                    triggerChange(startDateInput);
                    console.log('✅ Set start date:', date);
                }
                await sleep(500);

                // Start Time
                const startHourSelect = document.querySelector('#start_hour');
                const startMinuteSelect = document.querySelector('#start_minute');
                const startAmPmSelect = document.querySelector('#start_ampm');
                
                if (startHourSelect && startHour) {
                    startHourSelect.value = startHour;
                    triggerChange(startHourSelect);
                }
                if (startMinuteSelect && startMinute) {
                    startMinuteSelect.value = startMinute;
                    triggerChange(startMinuteSelect);
                }
                if (startAmPmSelect && startAmPm) {
                    startAmPmSelect.value = startAmPm;
                    triggerChange(startAmPmSelect);
                }
                console.log('✅ Set start time:', startHour, startMinute, startAmPm);
                await sleep(500);

                // End Date (same as start date)
                const endDateInput = document.querySelector('#event_end_date');
                if (endDateInput && date) {
                    endDateInput.value = date;
                    triggerChange(endDateInput);
                    console.log('✅ Set end date:', date);
                }
                await sleep(500);

                // End Time
                const endHourSelect = document.querySelector('#end_hour');
                const endMinuteSelect = document.querySelector('#end_minute');
                const endAmPmSelect = document.querySelector('#end_ampm');
                
                if (endHourSelect && endHour) {
                    endHourSelect.value = endHour;
                    triggerChange(endHourSelect);
                }
                if (endMinuteSelect && endMinute) {
                    endMinuteSelect.value = endMinute;
                    triggerChange(endMinuteSelect);
                }
                if (endAmPmSelect && endAmPm) {
                    endAmPmSelect.value = endAmPm;
                    triggerChange(endAmPmSelect);
                }
                console.log('✅ Set end time:', endHour, endMinute, endAmPm);
                filled += 3;
            }
            await sleep(config.scrollDelay || 500);

            // 6. Location Name
            if (formData.location) {
                const locationInput = document.querySelector('#event_location_name');
                if (locationInput) {
                    scrollToElement(locationInput);
                    locationInput.value = formData.location;
                    triggerChange(locationInput);
                    filled++;
                    console.log('✅ Filled location name:', formData.location);
                }
            }
            await sleep(config.scrollDelay || 500);

            // 7. Dress Code - Select "Casual (jeans ok)" (value="18420")
            const dressCodeSection = document.querySelector('#dress_code_desc');
            if (dressCodeSection) {
                scrollToElement(dressCodeSection);
                await sleep(300);
                const dressCodeSelect = document.querySelector('#select_event_dress_code_lookup');
                if (dressCodeSelect) {
                    dressCodeSelect.value = '18420'; // Casual (jeans ok)
                    triggerChange(dressCodeSelect);
                    filled++;
                    console.log('✅ Set dress code to Casual (jeans ok)');
                }
            }
            await sleep(config.scrollDelay || 500);

            // 8. Who is allowed to register - Everyone (value="0")
            const everyoneRadio = document.querySelector('input[name="privacy_level"][value="0"]');
            if (everyoneRadio && !everyoneRadio.checked) {
                const accessSection = document.querySelector('#access');
                if (accessSection) scrollToElement(accessSection);
                await sleep(300);
                everyoneRadio.checked = true;
                everyoneRadio.click();
                triggerChange(everyoneRadio);
                filled++;
                console.log('✅ Set registration to Everyone');
            }
            await sleep(config.scrollDelay || 500);

            // 9. Who can see this event - Everyone (value="0")
            const visibilityRadio = document.querySelector('input[name="hide_from_calendar"][value="0"]');
            if (visibilityRadio && !visibilityRadio.checked) {
                visibilityRadio.checked = true;
                visibilityRadio.click();
                triggerChange(visibilityRadio);
                filled++;
                console.log('✅ Set visibility to Everyone');
            }

            await sleep(500);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (config.enableNotification) {
                showNotification(`Mason360: Auto-filled ${filled} fields successfully!`);
            }
            
            console.log(`✅ Mason360 form fill complete! Filled ${filled} fields.`);
        },

        parseMason360DateTime(eventDate, startTime, endTime) {
            // Format date as "dd MMM yyyy" (e.g., "15 Nov 2025")
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = eventDate.getDate();
            const month = months[eventDate.getMonth()];
            const year = eventDate.getFullYear();
            const formattedDate = `${day} ${month} ${year}`;

            // Parse start time (format: "6:00 pm")
            const startMatch = startTime.match(/(\d+):(\d+)\s*(am|pm)/i);
            let startHour = '01', startMinute = '00', startAmPm = 'PM';
            if (startMatch) {
                startHour = String(parseInt(startMatch[1])).padStart(2, '0');
                startMinute = startMatch[2].padStart(2, '0');
                startAmPm = startMatch[3].toUpperCase();
            }

            // Parse end time
            const endMatch = endTime.match(/(\d+):(\d+)\s*(am|pm)/i);
            let endHour = '01', endMinute = '00', endAmPm = 'PM';
            if (endMatch) {
                endHour = String(parseInt(endMatch[1])).padStart(2, '0');
                endMinute = endMatch[2].padStart(2, '0');
                endAmPm = endMatch[3].toUpperCase();
            }

            return {
                date: formattedDate,
                startHour,
                startMinute,
                startAmPm,
                endHour,
                endMinute,
                endAmPm
            };
        }
    };
})();

