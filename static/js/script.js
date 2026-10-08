/**
 * Academic Compass — College FAQ Chatbot & Timetable Assistant
 * Frontend Controller & Interaction Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // State Management
    // -------------------------------------------------------------------------
    const state = {
        currentSemester: "2",
        currentSection: "A",
        activeDay: "Monday",
        currentCalendarMonth: 9, // 0-indexed: 9 = October
        currentCalendarYear: 2026,
        lastQuery: "",
        chatHistory: []
    };

    // DOM Elements
    const semesterSelect = document.getElementById("semesterSelect");
    const sectionSelect = document.getElementById("sectionSelect");
    const sidebarContextText = document.getElementById("sidebarContextText");
    const topContextText = document.getElementById("topContextText");

    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatMessages = document.getElementById("chatMessages");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const typingIndicator = document.getElementById("typingIndicator");

    const navItems = document.querySelectorAll(".nav-item");
    const contentViews = document.querySelectorAll(".content-view");
    const currentViewTitle = document.getElementById("currentViewTitle");
    const currentViewSubtitle = document.getElementById("currentViewSubtitle");

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");

    // Stat Elements
    const statNextClass = document.getElementById("statNextClass");
    const statNextHoliday = document.getElementById("statNextHoliday");
    const statSemExam = document.getElementById("statSemExam");
    const statClassesToday = document.getElementById("statClassesToday");

    // Dynamic View Containers
    const scheduleTimeline = document.getElementById("scheduleTimeline");
    const scheduleSubtext = document.getElementById("scheduleSubtext");
    const dayTabs = document.querySelectorAll(".day-tab");

    const calendarMonthTitle = document.getElementById("calendarMonthTitle");
    const calendarDaysGrid = document.getElementById("calendarDaysGrid");
    const calendarEventsList = document.getElementById("calendarEventsList");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");

    const countdownHeroGrid = document.getElementById("countdownHeroGrid");
    const milestoneStream = document.getElementById("milestoneStream");

    const btnRunMasterCheck = document.getElementById("btnRunMasterCheck");
    const btnSimulateConflict = document.getElementById("btnSimulateConflict");
    const conflictResultArea = document.getElementById("conflictResultArea");

    const debuggerInput = document.getElementById("debuggerInput");
    const btnRunDebugger = document.getElementById("btnRunDebugger");
    const debuggerOutput = document.getElementById("debuggerOutput");
    const btnInspectLast = document.getElementById("btnInspectLast");
    const btnTestConflictQuery = document.getElementById("btnTestConflictQuery");

    // -------------------------------------------------------------------------
    // View Titles Configuration
    // -------------------------------------------------------------------------
    const viewMeta = {
        "chat-view": {
            title: "Academic Compass",
            subtitle: "Your timetable and academic calendar assistant"
        },
        "schedule-view": {
            title: "Today's Schedule",
            subtitle: "Period-by-period class timetable & room allocations"
        },
        "calendar-view": {
            title: "Academic Calendar",
            subtitle: "Official milestones, working days, holidays & examination roster"
        },
        "timeline-view": {
            title: "“What’s Next?” Academic Timeline",
            subtitle: "Real-time dynamic countdown to exams and semester milestones"
        },
        "conflict-view": {
            title: "Smart Timetable Conflict Detector",
            subtitle: "Algorithmic interval overlap checking for schedule integrity"
        },
        "viva-view": {
            title: "Viva & AI Guide",
            subtitle: "NLP concepts, TF-IDF formulas, cosine similarity & live debugger"
        }
    };

    // -------------------------------------------------------------------------
    // Initializer
    // -------------------------------------------------------------------------
    function init() {
        setupNavigation();
        setupPersonalization();
        setupChat();
        setupScheduleView();
        setupCalendarView();
        setupTimelineView();
        setupConflictDetector();
        setupVivaDebugger();
        setupQuickActions();

        // Load initial data
        updateProfileContext();
        fetchDashboardStats();
        loadDailySchedule(state.activeDay);
        loadTimelineData();
        renderCalendar(state.currentCalendarYear, state.currentCalendarMonth);
    }

    // -------------------------------------------------------------------------
    // Navigation Handling
    // -------------------------------------------------------------------------
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener("click", () => {
                const targetViewId = item.getAttribute("data-view");
                switchView(targetViewId);

                // Close mobile sidebar on navigation
                if (window.innerWidth <= 860) {
                    sidebar.classList.remove("open");
                }
            });
        });

        // Mobile Hamburger Toggle
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener("click", () => {
                sidebar.classList.toggle("open");
            });
        }
    }

    function switchView(viewId) {
        navItems.forEach(nav => {
            if (nav.getAttribute("data-view") === viewId) {
                nav.classList.add("active");
            } else {
                nav.classList.remove("active");
            }
        });

        contentViews.forEach(view => {
            if (view.id === viewId) {
                view.classList.add("active");
            } else {
                view.classList.remove("active");
            }
        });

        if (viewMeta[viewId]) {
            currentViewTitle.textContent = viewMeta[viewId].title;
            currentViewSubtitle.textContent = viewMeta[viewId].subtitle;
        }

        // View-specific refreshes
        if (viewId === "schedule-view") {
            loadDailySchedule(state.activeDay);
        } else if (viewId === "timeline-view") {
            loadTimelineData();
        }
    }

    // -------------------------------------------------------------------------
    // Personalization (Unique Feature 3)
    // -------------------------------------------------------------------------
    function setupPersonalization() {
        semesterSelect.addEventListener("change", (e) => {
            state.currentSemester = e.target.value;
            updateProfileContext();
            onContextChanged();
        });

        sectionSelect.addEventListener("change", (e) => {
            state.currentSection = e.target.value;
            updateProfileContext();
            onContextChanged();
        });
    }

    function updateProfileContext() {
        const text = `Semester ${state.currentSemester} • Section ${state.currentSection}`;
        sidebarContextText.textContent = text;
        topContextText.textContent = text;
        scheduleSubtext.textContent = `Displaying schedule for ${text}`;
    }

    function onContextChanged() {
        fetchDashboardStats();
        loadDailySchedule(state.activeDay);

        // Notify user in chat if conversation is ongoing
        if (!welcomeScreen || welcomeScreen.style.display === "none") {
            appendBotMessage({
                answer: `Profile updated to **Semester ${state.currentSemester} • Section ${state.currentSection}**. All subsequent schedule inquiries and timetable cards will reflect your selection.`,
                confidence_percent: "100.0%",
                category: "Personalization",
                related_questions: [
                    "What is today's timetable?",
                    "What classes do I have tomorrow?",
                    "Which subject is scheduled in the third period?"
                ]
            });
        }
    }

    // -------------------------------------------------------------------------
    // Dashboard Stats API
    // -------------------------------------------------------------------------
    async function fetchDashboardStats() {
        try {
            const res = await fetch(`/api/stats?semester=${state.currentSemester}&section=${state.currentSection}`);
            const data = await res.json();
            if (data.success) {
                statClassesToday.textContent = data.classes_today;
                statNextClass.textContent = data.next_class;
                statNextHoliday.textContent = data.next_holiday;
                statSemExam.textContent = data.semester_exam_days;
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    }

    // -------------------------------------------------------------------------
    // Chat System & NLP Interface
    // -------------------------------------------------------------------------
    function setupChat() {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;
            handleUserMessage(message);
        });

        if (btnInspectLast) {
            btnInspectLast.addEventListener("click", () => {
                if (!state.lastQuery) {
                    alert("Ask a question in chat first to inspect its NLP vector weights!");
                    return;
                }
                debuggerInput.value = state.lastQuery;
                switchView("viva-view");
                runNLPDebugger(state.lastQuery);
            });
        }

        if (btnTestConflictQuery) {
            btnTestConflictQuery.addEventListener("click", () => {
                handleUserMessage("How to check for timetable conflicts?");
            });
        }
    }

    function setupQuickActions() {
        const actionCards = document.querySelectorAll(".action-card");
        actionCards.forEach(card => {
            card.addEventListener("click", () => {
                const query = card.getAttribute("data-query");
                if (query) {
                    handleUserMessage(query);
                }
            });
        });
    }

    async function handleUserMessage(message) {
        state.lastQuery = message;

        // Hide welcome screen upon first message
        if (welcomeScreen) {
            welcomeScreen.style.display = "none";
        }

        appendUserMessage(message);
        chatInput.value = "";
        showTypingIndicator();

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message,
                    semester: state.currentSemester,
                    section: state.currentSection
                })
            });

            const data = await res.json();
            hideTypingIndicator();

            if (data.success) {
                appendBotMessage(data);
            } else {
                appendBotMessage({
                    answer: "An error occurred while contacting the NLP engine.",
                    confidence_percent: "0.0%",
                    category: "Error",
                    related_questions: ["What is today's timetable?", "When are semester exams?"]
                });
            }
        } catch (err) {
            hideTypingIndicator();
            console.error("Chat error:", err);
            appendBotMessage({
                answer: "Unable to reach server. Please ensure the local Flask server is running.",
                confidence_percent: "0.0%",
                category: "Network",
                related_questions: []
            });
        }
    }

    function formatTimeNow() {
        const d = new Date();
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendUserMessage(text) {
        const wrapper = document.createElement("div");
        wrapper.className = "message-bubble-wrapper user";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.innerHTML = `
            <div class="message-body">${escapeHtml(text)}</div>
            <div class="message-time">${formatTimeNow()}</div>
        `;

        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
        scrollToBottom();
    }

    function appendBotMessage(data) {
        const wrapper = document.createElement("div");
        wrapper.className = "message-bubble-wrapper bot";

        const category = data.category || "Assistant";
        const confidence = data.confidence_percent || "Match";
        const formattedAnswer = renderMarkdownText(data.answer);

        let relatedHtml = "";
        if (data.related_questions && data.related_questions.length > 0) {
            const chips = data.related_questions.map(q => 
                `<button class="related-chip" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>`
            ).join("");

            relatedHtml = `
                <div class="related-questions-box">
                    <span class="related-label">You may also ask:</span>
                    <div class="related-chips-row">${chips}</div>
                </div>
            `;
        }

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.innerHTML = `
            <div class="message-header-row">
                <span class="bot-sender-tag">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#C49A45"></polygon></svg>
                    Academic Compass
                </span>
                <span class="confidence-chip">${escapeHtml(confidence)} • ${escapeHtml(category)}</span>
            </div>
            <div class="message-body">${formattedAnswer}</div>
            ${relatedHtml}
            <div class="message-time">${formatTimeNow()}</div>
        `;

        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);

        // Bind clicks on related question chips
        wrapper.querySelectorAll(".related-chip").forEach(chip => {
            chip.addEventListener("click", () => {
                const q = chip.getAttribute("data-query");
                if (q) handleUserMessage(q);
            });
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = "flex";
            scrollToBottom();
        }
    }

    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = "none";
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderMarkdownText(raw) {
        if (!raw) return "";
        let formatted = escapeHtml(raw);
        // Bold: **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Italics: *text*
        formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
        // Bullet points: • or -
        formatted = formatted.replace(/^• (.*$)/gim, "&bull; $1");
        // Newlines to <br>
        formatted = formatted.replace(/\n/g, "<br>");
        return formatted;
    }

    // -------------------------------------------------------------------------
    // Today's Schedule View
    // -------------------------------------------------------------------------
    function setupScheduleView() {
        dayTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                dayTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                state.activeDay = tab.getAttribute("data-day");
                loadDailySchedule(state.activeDay);
            });
        });

        // Highlight current day tab initially (e.g. Monday if weekday)
        const d = new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = days[d.getDay()];
        const matchedTab = Array.from(dayTabs).find(t => t.getAttribute("data-day") === todayName);
        if (matchedTab) {
            dayTabs.forEach(t => t.classList.remove("active"));
            matchedTab.classList.add("active");
            state.activeDay = todayName;
        } else {
            // Default to Monday if Sunday
            dayTabs[0].classList.add("active");
            state.activeDay = "Monday";
        }
    }

    async function loadDailySchedule(day) {
        scheduleTimeline.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">Loading timetable...</div>`;
        try {
            const res = await fetch(`/api/schedule?semester=${state.currentSemester}&section=${state.currentSection}&day=${day}`);
            const json = await res.json();
            if (json.success && json.data) {
                renderScheduleCards(json.data);
            }
        } catch (err) {
            console.error("Error loading schedule:", err);
            scheduleTimeline.innerHTML = `<div style="color:#E57373; padding:16px;">Failed to load timetable data.</div>`;
        }
    }

    function renderScheduleCards(data) {
        scheduleTimeline.innerHTML = "";
        const periods = data.periods || [];

        if (periods.length === 0) {
            scheduleTimeline.innerHTML = `
                <div class="schedule-card">
                    <div style="grid-column: 1 / -1; text-align:center; padding: 24px; color: var(--text-muted);">
                        No instructional classes scheduled for <strong>${data.day}</strong>.
                    </div>
                </div>
            `;
            return;
        }

        // Interleave Morning Recess (after Period 2) and Lunch Break (after Period 3)
        periods.forEach((p, index) => {
            // Determine if current period is ongoing (for subtle gold highlight)
            const isHighlight = (index === 0 && data.day !== "Sunday");

            const card = document.createElement("div");
            card.className = `schedule-card ${isHighlight ? "current-class" : ""}`;
            card.innerHTML = `
                <div class="period-time-col">
                    <span class="period-badge">Period ${p.period}</span>
                    <span class="period-time">${p.time}</span>
                </div>
                <div class="subject-details-col">
                    <h4 class="subject-title">${escapeHtml(p.subject)}</h4>
                    <div class="subject-meta">
                        <span class="subject-code">${escapeHtml(p.code)}</span>
                        <span>Hall: ${escapeHtml(p.room || data.classroom)}</span>
                    </div>
                </div>
                <div class="room-faculty-col">
                    <span class="room-chip">${isHighlight ? "Active / Next" : "Lecture"}</span>
                    <span class="faculty-name">${escapeHtml(p.faculty)}</span>
                </div>
            `;
            scheduleTimeline.appendChild(card);

            // Morning Recess Break card after Period 2
            if (p.period === 2) {
                const breakCard = document.createElement("div");
                breakCard.className = "break-card";
                breakCard.innerHTML = `
                    <span class="break-name">☕ Morning Recess / Tea Interval</span>
                    <span>11:00 AM – 11:15 AM (15 mins)</span>
                `;
                scheduleTimeline.appendChild(breakCard);
            }

            // Lunch Break card after Period 3
            if (p.period === 3) {
                const lunchCard = document.createElement("div");
                lunchCard.className = "break-card";
                lunchCard.innerHTML = `
                    <span class="break-name">🍱 Afternoon Lunch Break</span>
                    <span>12:15 PM – 01:00 PM (45 mins)</span>
                `;
                scheduleTimeline.appendChild(lunchCard);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Academic Calendar View
    // -------------------------------------------------------------------------
    function setupCalendarView() {
        prevMonthBtn.addEventListener("click", () => {
            state.currentCalendarMonth--;
            if (state.currentCalendarMonth < 0) {
                state.currentCalendarMonth = 11;
                state.currentCalendarYear--;
            }
            renderCalendar(state.currentCalendarYear, state.currentCalendarMonth);
        });

        nextMonthBtn.addEventListener("click", () => {
            state.currentCalendarMonth++;
            if (state.currentCalendarMonth > 11) {
                state.currentCalendarMonth = 0;
                state.currentCalendarYear++;
            }
            renderCalendar(state.currentCalendarYear, state.currentCalendarMonth);
        });
    }

    async function renderCalendar(year, monthIndex) {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        calendarMonthTitle.textContent = `${monthNames[monthIndex]} ${year}`;

        // Days in month calculation
        const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 = Sun
        const totalDays = new Date(year, monthIndex + 1, 0).getDate();

        calendarDaysGrid.innerHTML = "";

        // Empty cells before start
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "cal-day-cell empty";
            calendarDaysGrid.appendChild(emptyCell);
        }

        // Fetch calendar event milestones to mark cells
        let eventsList = [];
        try {
            const res = await fetch("/api/timeline");
            const data = await res.json();
            if (data.success) {
                eventsList = data.events;
            }
        } catch (e) {}

        // Populate side list
        renderCalendarMilestoneList(eventsList);

        // Render each day of the month
        for (let d = 1; d <= totalDays; d++) {
            const cell = document.createElement("div");
            cell.className = "cal-day-cell";

            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            
            // Check if October 8, 2026 (reference today)
            if (year === 2026 && monthIndex === 9 && d === 8) {
                cell.classList.add("today");
            }

            // Check if event exists on this date
            const matchingEvent = eventsList.find(e => e.date === dateStr);
            let indicatorHtml = "";
            if (matchingEvent) {
                const typeClass = matchingEvent.type || "milestone";
                indicatorHtml = `<div class="cal-event-indicator ${typeClass}" title="${matchingEvent.name}">${escapeHtml(matchingEvent.name)}</div>`;
            }

            cell.innerHTML = `
                <span class="cal-day-number">${d}</span>
                ${indicatorHtml}
            `;
            calendarDaysGrid.appendChild(cell);
        }
    }

    function renderCalendarMilestoneList(events) {
        calendarEventsList.innerHTML = "";
        if (!events || events.length === 0) {
            calendarEventsList.innerHTML = `<p style="color:var(--text-muted);font-size:0.8rem;">No events scheduled for this window.</p>`;
            return;
        }

        events.forEach(ev => {
            const dateObj = new Date(ev.date);
            const dayNum = dateObj.getDate();
            const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });

            const item = document.createElement("div");
            item.className = "event-item-card";
            item.innerHTML = `
                <div class="event-date-chip">
                    <div class="event-date-day">${dayNum}</div>
                    <div class="event-date-month">${monthShort}</div>
                </div>
                <div class="event-info">
                    <h5 class="event-title">${escapeHtml(ev.name)}</h5>
                    <p class="event-desc">${escapeHtml(ev.description)}</p>
                </div>
            `;
            calendarEventsList.appendChild(item);
        });
    }

    // -------------------------------------------------------------------------
    // "What's Next?" Academic Timeline (Unique Feature 1)
    // -------------------------------------------------------------------------
    function setupTimelineView() {}

    async function loadTimelineData() {
        try {
            const res = await fetch("/api/timeline");
            const data = await res.json();
            if (data.success) {
                renderTimelineHero(data.events);
                renderTimelineStream(data.events);
                if (data.reference_date) {
                    const refLabel = document.getElementById("referenceDateLabel");
                    if (refLabel) refLabel.textContent = data.reference_date;
                }
            }
        } catch (err) {
            console.error("Error loading timeline:", err);
        }
    }

    function renderTimelineHero(events) {
        countdownHeroGrid.innerHTML = "";
        if (!events || events.length === 0) return;

        // Take top 3 events for hero cards (e.g. IAT-2, Study Holiday, Semester Exam)
        const top3 = events.slice(0, 3);
        top3.forEach(ev => {
            const card = document.createElement("div");
            card.className = "hero-countdown-card";
            card.innerHTML = `
                <div class="hero-badge-row">
                    <span class="hero-category">${escapeHtml(ev.category)}</span>
                    <span class="hero-days-badge">${escapeHtml(ev.badge)}</span>
                </div>
                <h4 class="hero-event-name">${escapeHtml(ev.name)}</h4>
                <span class="hero-event-date">${escapeHtml(ev.formatted_date)}</span>
                <div class="hero-days-number">${ev.days_remaining}</div>
                <span class="hero-days-sub">Days Remaining</span>
            `;
            countdownHeroGrid.appendChild(card);
        });
    }

    function renderTimelineStream(events) {
        milestoneStream.innerHTML = "";
        if (!events || events.length === 0) return;

        events.forEach(ev => {
            const node = document.createElement("div");
            node.className = "stream-node";
            node.innerHTML = `
                <div class="stream-header">
                    <span class="stream-title">${escapeHtml(ev.name)} — ${escapeHtml(ev.formatted_date)}</span>
                    <span class="stream-days">${escapeHtml(ev.badge)}</span>
                </div>
                <p class="stream-desc">${escapeHtml(ev.description)}</p>
            `;
            milestoneStream.appendChild(node);
        });
    }

    // -------------------------------------------------------------------------
    // Smart Timetable Conflict Detector (Unique Feature 2)
    // -------------------------------------------------------------------------
    function setupConflictDetector() {
        btnRunMasterCheck.addEventListener("click", async () => {
            conflictResultArea.innerHTML = `<div style="color:var(--text-muted);padding:16px;">Scanning active schedule...</div>`;
            try {
                const res = await fetch(`/api/conflict-check?mode=standard&semester=${state.currentSemester}&section=${state.currentSection}&day=${state.activeDay}`);
                const data = await res.json();
                renderConflictResult(data);
            } catch (err) {
                console.error("Error scanning conflicts:", err);
            }
        });

        btnSimulateConflict.addEventListener("click", async () => {
            conflictResultArea.innerHTML = `<div style="color:var(--text-muted);padding:16px;">Generating conflict scenario...</div>`;
            try {
                const res = await fetch("/api/conflict-check?mode=simulate");
                const data = await res.json();
                renderConflictResult(data);
            } catch (err) {
                console.error("Error simulating conflict:", err);
            }
        });
    }

    function renderConflictResult(data) {
        if (!data.has_conflict) {
            conflictResultArea.innerHTML = `
                <div class="status-card-clean">
                    <div class="status-icon-clean">✓</div>
                    <div class="status-text-clean">
                        <h4>Timetable Status: Valid & Conflict-Free</h4>
                        <p>Checked ${data.checked_slots_count || 6} scheduled slots for ${data.day || state.activeDay}. No overlapping periods or room collisions were found.</p>
                        <span class="test-hint">Click <strong>"Run Overlap Simulation"</strong> to verify how the collision detector responds when an overlap occurs.</span>
                    </div>
                </div>
            `;
        } else {
            // Render Alert Card exactly matching the user request
            const slotsHtml = (data.slots || []).map(s => `
                <div class="slot-item">
                    <div class="slot-sub">${escapeHtml(s.subject)}</div>
                    <div class="slot-time">Time: ${s.time} | Room: ${s.room}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Faculty: ${s.faculty}</div>
                </div>
            `).join("");

            conflictResultArea.innerHTML = `
                <div class="conflict-alert-card">
                    <div class="alert-heading-row">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        <h4>⚠ Schedule Conflict Detected</h4>
                    </div>
                    <p class="alert-desc-text">“${escapeHtml(data.conflict_message || data.conflicts[0].description)}”</p>
                    
                    <div class="conflicting-slots-grid">
                        ${slotsHtml}
                    </div>

                    <div class="conflict-rec-box">
                        <strong>Advisor Recommendation:</strong> ${escapeHtml(data.recommendation || "Adjust period bounds to eliminate overlap.")}
                    </div>
                </div>
            `;
        }
    }

    // -------------------------------------------------------------------------
    // Viva & AI Guide (Interactive NLP Inspector)
    // -------------------------------------------------------------------------
    function setupVivaDebugger() {
        btnRunDebugger.addEventListener("click", () => {
            const query = debuggerInput.value.trim();
            if (query) runNLPDebugger(query);
        });
    }

    async function runNLPDebugger(query) {
        debuggerOutput.style.display = "block";
        debuggerOutput.innerHTML = `<span style="color:var(--text-muted);">Calculating TF-IDF weights and cosine similarities...</span>`;

        try {
            const res = await fetch("/api/nlp-explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query })
            });

            const data = await res.json();
            const exp = data.explanation;
            const match = data.match_result;

            const tokensHtml = exp.terms.length > 0
                ? exp.terms.map(t => `<span class="token-chip">${escapeHtml(t.term)} <span class="token-weight">${t.weight}</span></span>`).join("")
                : `<span style="color:var(--text-muted);font-size:0.8rem;">No non-zero vocabulary unigrams/bigrams extracted.</span>`;

            const rowsHtml = (match.top_candidates || []).map((cand, idx) => `
                <tr>
                    <td>#${idx + 1}</td>
                    <td><strong>${escapeHtml(cand.question)}</strong></td>
                    <td><em>“${escapeHtml(cand.matched_phrase)}”</em></td>
                    <td><span class="confidence-chip">${cand.score_percent}</span></td>
                </tr>
            `).join("");

            debuggerOutput.innerHTML = `
                <div style="margin-bottom:14px;">
                    <div class="debugger-section-title">Preprocessed Normalized Query:</div>
                    <code style="background:var(--bg-dark-cocoa); padding:4px 8px; border-radius:4px; color:var(--gold-champagne);">${escapeHtml(exp.cleaned_query)}</code>
                </div>

                <div style="margin-bottom:16px;">
                    <div class="debugger-section-title">Extracted TF-IDF Feature Weights (Vocab Size: ${exp.vocabulary_size}):</div>
                    <div class="token-chips">${tokensHtml}</div>
                </div>

                <div>
                    <div class="debugger-section-title">Top-Ranked Cosine Similarity Matches:</div>
                    <table class="match-scores-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Matched FAQ Target</th>
                                <th>Corpus Pattern</th>
                                <th>Cosine Score</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>

                <div style="margin-top:14px; padding-top:10px; border-top:1px solid rgba(196,154,69,0.2); font-size:0.8rem; color:var(--text-beige);">
                    Status: <strong style="color:${match.matched ? '#559E68' : '#B94A48'}">${match.matched ? 'ACCEPTED (Above 0.25 Threshold)' : 'REJECTED (Trigger Fallback Response)'}</strong>
                    &nbsp;•&nbsp; Final Confidence: <strong>${match.confidence_percent}</strong>
                </div>
            `;
        } catch (err) {
            console.error("Debugger error:", err);
            debuggerOutput.innerHTML = `<span style="color:#E57373;">Failed to run NLP analysis.</span>`;
        }
    }

    // Initialize application
    init();
});
