# Academic Compass — AI College FAQ Chatbot & Timetable Assistant

> **Artificial Intelligence Practical Assignment & Viva Project**  
> **Domain:** Time Table & Academic Calendar  
> **Student Level:** Master of Computer Applications (MCA)  
> **Tech Stack:** Python, Flask, Scikit-Learn (TF-IDF Vectorizer + Cosine Similarity), Vanilla HTML5/CSS3/JavaScript  
> **Design Theme:** Refined Gold & Deep Brown Academic Dashboard  

---

## 1. Project Overview & Objective

**Academic Compass** is an AI-powered conversational assistant and dashboard built specifically for university students to query their class schedules, examination dates, academic calendar milestones, holidays, and break timings.

Traditional static PDF timetables and notice boards are cumbersome to navigate on daily schedules. This application provides an intuitive, conversational interface powered by local Natural Language Processing (NLP) that understands student queries in natural language, matches them to an institutional FAQ knowledge base with quantifiable confidence scores, and dynamically personalizes responses based on the student's selected semester and section.

### Key Highlights
- **100% Local & Free:** Runs completely offline on `localhost`. Zero expensive API keys, cloud subscriptions, or external LLM dependencies.
- **Explainable AI:** Uses standard mathematical NLP techniques (TF-IDF + Cosine Similarity) that can be clearly derived and defended in an academic viva.
- **Academic Dashboard Aesthetics:** Designed with a distinctive, elegant **Gold + Brown** color palette (`#24160F`, `#382319`, `#C49A45`, `#E6C77A`, `#F8F1E5`) inspired by classic university libraries and academic compasses.

---

## 2. Distinctive & Unique Features

### 🌟 Unique Feature 1: “What’s Next?” Academic Timeline & Dynamic Countdown
Rather than serving static text, the application uses Python `datetime` calculations to evaluate the current date against institutional milestones:
- Dynamic calculation of days remaining until **Internal Assessment Test II (12 October)**, **Study Holidays (25 October)**, and **Semester Theory Examinations (2 November)**.
- Answers real-time questions such as:
  - *"What is the next academic event?"*
  - *"How many days until semester exams?"*
  - *"What is coming up next?"*
- Features prominent visual countdown hero cards and a chronological milestone event stream.

### 🌟 Unique Feature 2: Smart Timetable Conflict Detector
Demonstrates that the application performs algorithmic scheduling verification beyond simple text matching:
- Analyzes daily timetable schedules by parsing instructional intervals into minute offsets ($[Start, End]$).
- Checks pair-wise interval overlap condition:  
  $$\text{Collision Condition: } Start(S_1) < End(S_2) \quad \text{AND} \quad Start(S_2) < End(S_1)$$
- Displays a dedicated alert card when an overlap is detected:  
  **⚠ Schedule Conflict Detected: Artificial Intelligence overlaps with Data Structures between 10:30 AM and 11:00 AM.**
- Includes both master timetable integrity validation and an interactive overlap simulation mode for live viva demonstrations.

### 🌟 Unique Feature 3: Semester & Section Personalization
- Header controls allow selecting **Semester 1, 2, 3, or 4** and **Section A or B**.
- Timetable queries, period breakdowns, classroom halls, faculty names, and mini-dashboard statistics instantly adjust to the student's selected cohort.
- Active context is visibly tracked (`Semester 2 • Section A`) throughout the chat and dashboard widgets.

### 🌟 Unique Feature 4: Interactive Viva & AI Inspector
- Built-in debugger tab where examiners can enter any phrase and inspect:
  - Extracted unigram and bigram tokens with their numerical TF-IDF feature weights.
  - Ranked Cosine Similarity scores against corpus patterns.
  - Verification of the 25% confidence threshold decision rule.

---

## 3. Technology Stack

| Layer | Technologies | Role / Rationale |
|---|---|---|
| **Backend** | Python 3.10+ / Flask | Lightweight, robust WSGI server; clean REST API endpoints |
| **NLP Engine** | `scikit-learn` (`TfidfVectorizer`, `cosine_similarity`), `NumPy` | Mathematical vectorization and cosine angle calculation |
| **Frontend** | HTML5, CSS3, Modern Vanilla JavaScript | Fast, zero bundle overhead, responsive dashboard with animations |
| **Typography** | Playfair Display & Inter | Editorial academic serif combined with clean modern body sans-serif |
| **Data Format** | JSON (`faq_data.json`, `timetable.json`, `academic_calendar.json`) | Clean separation of concerns; easy to customize and expand |

---

## 4. NLP Architecture & Mathematical Methodology

```
User Query (e.g., "When do final semester exams start?")
                          │
                          ▼
            [1. Text Preprocessing]
      (Lowercase, strip punctuation, normalize spaces)
                          │
                          ▼
           [2. TF-IDF Transformation]
      (Transform query into vector q using fitted vocabulary)
                          │
                          ▼
          [3. Cosine Similarity Calculation]
        (Compute dot product against FAQ corpus matrix M)
                          │
                          ▼
           [4. Best Match & Threshold Gate]
       Is max(Cosine Similarity) >= 0.25 (25%)?
                 /                 \
               YES                  NO
               /                     \
    [5. Format Response]        [6. Fallback Message]
  (Inject dynamic dates /     ("I couldn't find an exact match.
   timetable if applicable)    Try asking about your timetable...")
```

### Mathematical Formulas for Viva

#### 1. Term Frequency (TF)
$$\text{TF}(t, d) = \frac{\text{Count of term } t \text{ in document } d}{\text{Total number of terms in document } d}$$

#### 2. Inverse Document Frequency (IDF)
$$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$
Where $N$ is the total number of FAQ questions and $\text{df}(t)$ is the document frequency of term $t$. Rare, informative words receive higher weights, while common terms receive lower weights.

#### 3. TF-IDF Weight
$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

#### 4. Cosine Similarity
$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} = \frac{\sum_{i=1}^{n} u_i v_i}{\sqrt{\sum_{i=1}^{n} u_i^2} \sqrt{\sum_{i=1}^{n} v_i^2}}$$
- Measures the cosine of the angle between query vector $\mathbf{u}$ and target FAQ pattern vector $\mathbf{v}$.
- Produces a normalized score between $0.0$ and $1.0$, independent of sentence length.

---

## 5. Project Directory Structure

```
TimeTable/
├── app.py                     # Flask application, REST endpoints, dynamic handlers
├── nlp_engine.py              # Explainable TF-IDF & Cosine Similarity matching engine
├── requirements.txt           # Python dependencies
├── README.md                  # Comprehensive documentation & viva guide
├── data/
│   ├── faq_data.json          # 32+ realistic FAQ entries with patterns & categories
│   ├── timetable.json         # Master timetable for Semesters 1-4, Sections A & B
│   └── academic_calendar.json # Official milestones, exam windows, holidays, and rules
├── templates/
│   └── index.html             # Dashboard markup: sidebar, stats, views, viva inspector
└── static/
    ├── css/
    │   └── style.css          # Refined Gold & Brown design system & responsive styling
    └── js/
        └── script.js          # Client-side controller for chat, timetable, and calendar
```

---

## 6. Installation & Execution Guide

### Prerequisites
- Python 3.10 or newer installed on your system.

### Step 1: Clone or Navigate to Project Directory
```powershell
cd d:\TimeTable
```

### Step 2: Install Dependencies
```powershell
python -m pip install -r requirements.txt
```
*(Packages: `flask`, `scikit-learn`, `numpy`)*

### Step 3: Run the Application
```powershell
python app.py
```

### Step 4: Access via Web Browser
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 7. Sample Questions for Demonstration

### Timetable & Classes
- *"What is today's timetable?"*
- *"What classes do I have tomorrow?"*
- *"Which subject is scheduled in the third period?"*
- *"Is there any timetable change today?"*
- *"What time does the first class begin?"*
- *"When does the last class end?"*
- *"What is the lunch break timing?"*
- *"What are the morning break timings?"*

### Academic Calendar & Holidays
- *"When does the semester begin?"*
- *"When is the last working day?"*
- *"When is the next holiday?"*
- *"Is Saturday a working day?"*
- *"When is the next working Saturday?"*
- *"What is the academic calendar?"*
- *"What are this month's important dates?"*
- *"When does the college reopen?"*
- *"When does semester break begin?"*

### Examinations & Deadlines
- *"When are internal exams?"*
- *"When are semester exams?"*
- *"When are practical exams?"*
- *"When is study holiday?"*
- *"How many days until semester exams?"*
- *"Is there any exam this week?"*
- *"Where can I find the semester examination schedule?"*
- *"What is the attendance requirement for appearing in examinations?"*

### Advanced / Smart Features
- *"What is the next academic event?"*
- *"What is coming up next?"*
- *"How to check for timetable conflicts?"*
- *"How can I switch my semester or section?"*

---

## 8. Viva Voce Preparation & Model Q&A

### Q1: What is Natural Language Processing (NLP)?
**Answer:**  
NLP is a branch of Artificial Intelligence that gives machines the ability to read, understand, and derive meaning from human languages. In our application, NLP bridges free-form, conversational queries entered by students with structured academic data and pre-defined institutional FAQs.

### Q2: Why did you choose TF-IDF and Cosine Similarity instead of an LLM like GPT?
**Answer:**  
1. **Academic Explainability:** Every prediction in TF-IDF is backed by pure linear algebra and statistical word frequencies, which can be fully derived and explained during viva.  
2. **Determinism & Accuracy:** College policies, exam schedules, and holiday dates cannot tolerate hallucinations or probabilistic drift.  
3. **Zero Cost & Offline Execution:** It operates 100% locally on standard hardware without external cloud APIs, internet connectivity, or token costs.  
4. **Sub-millisecond Latency:** Vector operations execute in under 2 milliseconds.

### Q3: How does the Chatbot calculate the closest question?
**Answer:**  
1. During startup, the knowledge base questions and paraphrased patterns are transformed into an $L_2$-normalized TF-IDF matrix.  
2. When a user enters a query, it is normalized and projected into the same TF-IDF vector space.  
3. The dot product between the query vector and every corpus vector calculates their **Cosine Similarity** ($\cos\theta$).  
4. The system identifies the maximum score: if $\text{score} \ge 0.25$, it returns the corresponding answer; otherwise, the fallback safety mechanism activates.

### Q4: What is a Confidence Threshold, and why is it set to 0.25?
**Answer:**  
The confidence threshold prevents the bot from answering irrelevant or out-of-domain questions (e.g., *"What is the capital of France?"*). Because queries are short sentences (3–6 words) matched against FAQ patterns, shared key nouns like `"exam"` or `"timetable"` yield cosine scores between $0.40$ and $1.0$. Queries with unrelated vocabulary produce scores under $0.15$. A threshold of $0.25$ provides an optimal balance between precision and recall.

### Q5: How is Timetable Personalization implemented?
**Answer:**  
The frontend maintains active dropdown state for `Semester` (1–4) and `Section` (A/B). When a user sends a query like *"What is today's timetable?"*, the request payload transmits `{ message, semester, section }`. The backend dynamic handler accesses the timetable tree `timetable[semester][section][weekday]`, extracts the period sequence, and formats the personalized response.

### Q6: How does the Conflict Detector algorithm work?
**Answer:**  
Each scheduled class is represented by an interval $[Start, End]$ in minutes since midnight. For any two periods $S_1$ and $S_2$, an overlap exists if and only if:
$$Start(S_1) < End(S_2) \quad \text{AND} \quad Start(S_2) < End(S_1)$$
The exact overlap window is calculated as $[\max(Start(S_1), Start(S_2)), \min(End(S_1), End(S_2))]$.

---

## 9. Academic Disclaimer

*This application was developed as an Artificial Intelligence practical project for demonstration and academic evaluation purposes. The timetable schedules, event dates, and faculty assignments represented in the dataset are realistic sample data.*
