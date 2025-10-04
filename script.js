// Global variables
let currentCardIndex = 0;
let currentSlideIndex = 0;
let syllabiData = [];
let uploadedFiles = [];
let currentClassData = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const uploadAreaResults = document.getElementById('uploadAreaResults');
const fileInputResults = document.getElementById('fileInputResults');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const uploadMoreSection = document.getElementById('uploadMoreSection');
const classesGrid = document.getElementById('classesGrid');
const slideshowModal = document.getElementById('slideshowModal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const slidesContainer = document.getElementById('slidesContainer');
const slideIndicators = document.getElementById('slideIndicators');
const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    // Show results immediately with static class rectangles
    showResults();
});

// Load demo data function
function loadDemoData() {
    showLoading();
    setTimeout(() => {
        generateMockData();
        showResults();
    }, 1500); // Simulate processing time
}

function setupEventListeners() {
    // File input change
    fileInputResults.addEventListener('change', handleFileSelect);
    
    // Drag and drop for both upload areas
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    uploadAreaResults.addEventListener('dragover', handleDragOver);
    uploadAreaResults.addEventListener('dragleave', handleDragLeave);
    uploadAreaResults.addEventListener('drop', handleDrop);
    
    // Modal controls
    closeModal.addEventListener('click', closeSlideshowModal);
    slideshowModal.addEventListener('click', (e) => {
        if (e.target === slideshowModal) {
            closeSlideshowModal();
        }
    });
    
    // Slideshow navigation
    prevSlide.addEventListener('click', () => navigateSlides(-1));
    nextSlide.addEventListener('click', () => navigateSlides(1));
}

// File handling functions
function handleFileSelect(event) {
    console.log('File selected!', event.target.files);
    const files = Array.from(event.target.files);
    console.log('Files to process:', files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    event.target.closest('.upload-area').classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.target.closest('.upload-area').classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.target.closest('.upload-area').classList.remove('dragover');
    const files = Array.from(event.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    processFiles(pdfFiles);
}

function processFiles(files) {
    console.log('processFiles called with:', files);
    if (files.length === 0) {
        console.log('No files to process');
        return;
    }
    
    uploadedFiles = files;
    console.log('Showing loading...');
    showLoading();
    
    // Try to process with ChatGPT API, fallback to demo data
    processSyllabiWithChatGPT(files)
        .then(data => {
            syllabiData = data.data || data;
            showResults();
        })
        .catch(error => {
            console.log('Using demo data for demonstration:', error);
            generateMockData();
            showResults();
        });
}

function showLoading() {
    resultsSection.style.display = 'none';
    loadingSection.style.display = 'flex';
}

function showResults() {
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';
    uploadMoreSection.style.display = 'block';
    // Classes are now static in HTML, no need to generate them
}

function generateMockData() {
    // Mock data for demonstration - multiple classes with individual slideshows
    syllabiData = [
        {
            className: "Computer Science 101",
            classCode: "CS 101",
            instructor: "Dr. Smith",
            semester: "Spring 2024",
            slides: [
        {
            title: "Grade Weights Wrapped",
            type: "grades",
            data: {
                        totalAssignments: 15,
                        examWeight: 45,
                        homeworkWeight: 35,
                        participationWeight: 15,
                        projectWeight: 5,
                topCategories: [
                    { name: "Midterm Exam", weight: 25, color: "#ff6b6b" },
                            { name: "Final Exam", weight: 20, color: "#4ecdc4" },
                            { name: "Homework", weight: 35, color: "#45b7d1" },
                            { name: "Participation", weight: 15, color: "#96ceb4" },
                            { name: "Final Project", weight: 5, color: "#feca57" }
                ]
            }
        },
        {
            title: "Important Dates Wrapped",
            type: "dates",
            data: {
                        totalDates: 12,
                        upcomingDeadlines: 4,
                        examCount: 3,
                        assignmentCount: 8,
                importantDates: [
                    { name: "Midterm Exam", date: "March 15, 2024", type: "exam", priority: "high" },
                    { name: "Final Project Due", date: "May 20, 2024", type: "assignment", priority: "high" },
                    { name: "Final Exam", date: "June 10, 2024", type: "exam", priority: "high" },
                    { name: "Homework 5", date: "April 5, 2024", type: "assignment", priority: "medium" },
                    { name: "Quiz 3", date: "April 12, 2024", type: "quiz", priority: "medium" }
                ]
            }
        },
        {
            title: "Policies Wrapped",
            type: "policies",
            data: {
                        totalPolicies: 8,
                        latePolicy: "10% deduction per day late, maximum 3 days",
                attendanceRequired: true,
                        plagiarismPolicy: "Zero tolerance - automatic failure",
                policies: [
                            { name: "Late Policy", description: "10% deduction per day late, maximum 3 days", severity: "moderate" },
                            { name: "Attendance", description: "Required - 3 absences max before grade penalty", severity: "high" },
                            { name: "Plagiarism", description: "Zero tolerance policy - automatic failure", severity: "critical" },
                            { name: "Makeup Exams", description: "Only with valid medical excuse and prior approval", severity: "moderate" },
                            { name: "Grade Appeals", description: "Must be submitted within 1 week of grade posting", severity: "low" }
                ]
            }
        },
        {
            title: "Course Stats Wrapped",
            type: "stats",
            data: {
                totalCredits: 4,
                totalHours: 120,
                        averageWorkload: "8-12 hours/week",
                difficulty: "Intermediate",
                stats: [
                    { name: "Total Credits", value: 4, unit: "units" },
                    { name: "Lecture Hours", value: 3, unit: "hours/week" },
                    { name: "Lab Hours", value: 2, unit: "hours/week" },
                            { name: "Expected Study Time", value: 6, unit: "hours/week" },
                    { name: "Prerequisites", value: 2, unit: "courses" }
                ]
            }
                }
            ]
        },
        {
            className: "Mathematics 201",
            classCode: "MATH 201",
            instructor: "Prof. Johnson",
            semester: "Spring 2024",
            slides: [
                {
                    title: "Grade Weights Wrapped",
                    type: "grades",
                    data: {
                        totalAssignments: 20,
                        examWeight: 60,
                        homeworkWeight: 25,
                        participationWeight: 10,
                        projectWeight: 5,
                        topCategories: [
                            { name: "Midterm 1", weight: 20, color: "#ff6b6b" },
                            { name: "Midterm 2", weight: 20, color: "#4ecdc4" },
                            { name: "Final Exam", weight: 20, color: "#45b7d1" },
                            { name: "Homework", weight: 25, color: "#96ceb4" },
                            { name: "Participation", weight: 10, color: "#feca57" },
                            { name: "Final Project", weight: 5, color: "#ff9ff3" }
                        ]
                    }
                },
                {
                    title: "Important Dates Wrapped",
                    type: "dates",
                    data: {
                        totalDates: 15,
                        upcomingDeadlines: 6,
                        examCount: 3,
                        assignmentCount: 12,
                        importantDates: [
                            { name: "Midterm 1", date: "February 28, 2024", type: "exam", priority: "high" },
                            { name: "Midterm 2", date: "April 10, 2024", type: "exam", priority: "high" },
                            { name: "Final Exam", date: "May 25, 2024", type: "exam", priority: "high" },
                            { name: "Problem Set 8", date: "March 15, 2024", type: "assignment", priority: "medium" },
                            { name: "Problem Set 12", date: "April 20, 2024", type: "assignment", priority: "medium" }
                        ]
                    }
                },
                {
                    title: "Policies Wrapped",
                    type: "policies",
                    data: {
                        totalPolicies: 6,
                        latePolicy: "No late homework accepted",
                        attendanceRequired: false,
                        plagiarismPolicy: "Academic integrity violation",
                        policies: [
                            { name: "Late Policy", description: "No late homework accepted - submit early", severity: "critical" },
                            { name: "Attendance", description: "Not required but highly recommended", severity: "low" },
                            { name: "Plagiarism", description: "Academic integrity violation - report to dean", severity: "critical" },
                            { name: "Calculator Policy", description: "Scientific calculator allowed on exams only", severity: "moderate" },
                            { name: "Office Hours", description: "Mon/Wed/Fri 2-4 PM, or by appointment", severity: "low" }
                        ]
                    }
                }
            ]
        },
        {
            className: "Physics 150",
            classCode: "PHYS 150",
            instructor: "Dr. Williams",
            semester: "Spring 2024",
            slides: [
                {
                    title: "Grade Weights Wrapped",
                    type: "grades",
                    data: {
                        totalAssignments: 18,
                        examWeight: 50,
                        homeworkWeight: 30,
                        labWeight: 15,
                        participationWeight: 5,
                        topCategories: [
                            { name: "Midterm Exam", weight: 25, color: "#ff6b6b" },
                            { name: "Final Exam", weight: 25, color: "#4ecdc4" },
                            { name: "Homework", weight: 30, color: "#45b7d1" },
                            { name: "Lab Reports", weight: 15, color: "#96ceb4" },
                            { name: "Participation", weight: 5, color: "#feca57" }
                        ]
                    }
                },
                {
                    title: "Important Dates Wrapped",
                    type: "dates",
                    data: {
                        totalDates: 10,
                        upcomingDeadlines: 3,
                        examCount: 2,
                        assignmentCount: 6,
                        importantDates: [
                            { name: "Midterm Exam", date: "March 22, 2024", type: "exam", priority: "high" },
                            { name: "Final Exam", date: "June 5, 2024", type: "exam", priority: "high" },
                            { name: "Lab Report 4", date: "April 8, 2024", type: "assignment", priority: "medium" },
                            { name: "Homework 6", date: "April 15, 2024", type: "assignment", priority: "medium" }
                        ]
                    }
                },
                {
                    title: "Policies Wrapped",
                    type: "policies",
                    data: {
                        totalPolicies: 7,
                        latePolicy: "5% deduction per day, maximum 1 week",
                        attendanceRequired: true,
                        plagiarismPolicy: "Zero tolerance",
                        policies: [
                            { name: "Late Policy", description: "5% deduction per day, maximum 1 week late", severity: "moderate" },
                            { name: "Attendance", description: "Required - 2 absences max", severity: "high" },
                            { name: "Lab Safety", description: "Safety glasses required in all labs", severity: "critical" },
                            { name: "Plagiarism", description: "Zero tolerance - automatic course failure", severity: "critical" },
                            { name: "Makeup Labs", description: "Must be completed within 1 week", severity: "moderate" }
                        ]
                    }
                }
            ]
        }
    ];
}

function generateClasses() {
    classesGrid.innerHTML = '';
    
    syllabiData.forEach((classData, index) => {
        const classRectangle = document.createElement('div');
        classRectangle.className = 'class-rectangle fade-in';
        classRectangle.innerHTML = generateClassHTML(classData, index);
        classRectangle.addEventListener('click', () => openSlideshowModal(classData));
        classesGrid.appendChild(classRectangle);
    });
}

function generateClassHTML(classData, index) {
    const totalSlides = classData.slides.length;
    const totalAssignments = classData.slides.find(s => s.type === 'grades')?.data?.totalAssignments || 0;
    const upcomingDeadlines = classData.slides.find(s => s.type === 'dates')?.data?.upcomingDeadlines || 0;
    
    return `
        <div class="class-number">${index + 1}</div>
        <div class="class-content">
            <div class="class-title">${classData.className}</div>
            <div class="class-subtitle">${classData.classCode} • ${classData.instructor} • ${classData.semester}</div>
            <div class="class-preview">
                <div class="preview-stat">
                    <span class="preview-number">${totalSlides}</span>
                    <div class="preview-label">Slides</div>
                </div>
                <div class="preview-stat">
                    <span class="preview-number">${totalAssignments}</span>
                    <div class="preview-label">Assignments</div>
                </div>
                <div class="preview-stat">
                    <span class="preview-number">${upcomingDeadlines}</span>
                    <div class="preview-label">Deadlines</div>
                </div>
            </div>
        </div>
    `;
}

async function openSlideshowModal(classId) {
    currentSlideIndex = 0;
    
    // Get class data based on ID
    const classData = await getClassData(classId);
    currentClassData = classData;
    
    modalTitle.textContent = `${classData.className} Wrapped`;
    slideshowModal.style.display = 'flex';
    generateSlides();
    setupSlideshowNavigation();
}

async function getClassData(classId) {
    try {
        // Try to get real data from database first
        const response = await fetch(`http://localhost:3000/api/classes/${classId}`);
        if (response.ok) {
            const data = await response.json();
            const classData = data.class;
            const syllabusData = data.syllabusData;
            
            // Convert database data to slideshow format
            const slides = [];
            
            if (syllabusData.gradeWeights) {
                slides.push({
                    title: 'Grade Weights Wrapped',
                    type: 'grades',
                    data: syllabusData.gradeWeights
                });
            }
            
            if (syllabusData.importantDates) {
                slides.push({
                    title: 'Important Dates Wrapped',
                    type: 'dates',
                    data: syllabusData.importantDates
                });
            }
            
            if (syllabusData.policies) {
                slides.push({
                    title: 'Policies Wrapped',
                    type: 'policies',
                    data: syllabusData.policies
                });
            }
            
            if (syllabusData.courseStats) {
                slides.push({
                    title: 'Course Stats Wrapped',
                    type: 'stats',
                    data: syllabusData.courseStats
                });
            }
            
            return {
                className: classData.class_name,
                classCode: classData.class_name,
                instructor: classData.instructor,
                semester: classData.semester,
                slides: slides
            };
        }
    } catch (error) {
        console.error('Error fetching class data from database:', error);
    }
    
    // Fallback to demo data if database fetch fails
    const classDataMap = {
        'cs101': {
            className: 'Computer Science 101',
            classCode: 'CS 101',
            instructor: 'Dr. Smith',
            semester: 'Spring 2024',
            slides: [
                {
                    title: 'Grade Weights Wrapped',
                    type: 'grades',
                    data: {
                        totalAssignments: 15,
                        examWeight: 45,
                        homeworkWeight: 35,
                        participationWeight: 15,
                        projectWeight: 5,
                        topCategories: [
                            { name: 'Midterm Exam', weight: 25, color: '#ff6b6b' },
                            { name: 'Final Exam', weight: 20, color: '#4ecdc4' },
                            { name: 'Homework', weight: 35, color: '#45b7d1' },
                            { name: 'Participation', weight: 15, color: '#96ceb4' },
                            { name: 'Final Project', weight: 5, color: '#feca57' }
                        ]
                    }
                },
                {
                    title: 'Important Dates Wrapped',
                    type: 'dates',
                    data: {
                        totalDates: 12,
                        upcomingDeadlines: 4,
                        examCount: 3,
                        assignmentCount: 8,
                        importantDates: [
                            { name: 'Midterm Exam', date: 'March 15, 2024', type: 'exam', priority: 'high' },
                            { name: 'Final Project Due', date: 'May 20, 2024', type: 'assignment', priority: 'high' },
                            { name: 'Final Exam', date: 'June 10, 2024', type: 'exam', priority: 'high' },
                            { name: 'Homework 5', date: 'April 5, 2024', type: 'assignment', priority: 'medium' },
                            { name: 'Quiz 3', date: 'April 12, 2024', type: 'quiz', priority: 'medium' }
                        ]
                    }
                },
                {
                    title: 'Policies Wrapped',
                    type: 'policies',
                    data: {
                        totalPolicies: 8,
                        latePolicy: '10% deduction per day late, maximum 3 days',
                        attendanceRequired: true,
                        plagiarismPolicy: 'Zero tolerance - automatic failure',
                        policies: [
                            { name: 'Late Policy', description: '10% deduction per day late, maximum 3 days', severity: 'moderate' },
                            { name: 'Attendance', description: 'Required - 3 absences max before grade penalty', severity: 'high' },
                            { name: 'Plagiarism', description: 'Zero tolerance policy - automatic failure', severity: 'critical' },
                            { name: 'Makeup Exams', description: 'Only with valid medical excuse and prior approval', severity: 'moderate' },
                            { name: 'Grade Appeals', description: 'Must be submitted within 1 week of grade posting', severity: 'low' }
                        ]
                    }
                },
                {
                    title: 'Course Stats Wrapped',
                    type: 'stats',
                    data: {
                        totalCredits: 4,
                        totalHours: 120,
                        averageWorkload: '8-12 hours/week',
                        difficulty: 'Intermediate',
                        stats: [
                            { name: 'Total Credits', value: 4, unit: 'units' },
                            { name: 'Lecture Hours', value: 3, unit: 'hours/week' },
                            { name: 'Lab Hours', value: 2, unit: 'hours/week' },
                            { name: 'Expected Study Time', value: 6, unit: 'hours/week' },
                            { name: 'Prerequisites', value: 2, unit: 'courses' }
                        ]
                    }
                }
            ]
        },
        'math201': {
            className: 'Mathematics 201',
            classCode: 'MATH 201',
            instructor: 'Prof. Johnson',
            semester: 'Spring 2024',
            slides: [
                {
                    title: 'Grade Weights Wrapped',
                    type: 'grades',
                    data: {
                        totalAssignments: 20,
                        examWeight: 60,
                        homeworkWeight: 25,
                        participationWeight: 10,
                        projectWeight: 5,
                        topCategories: [
                            { name: 'Midterm 1', weight: 20, color: '#ff6b6b' },
                            { name: 'Midterm 2', weight: 20, color: '#4ecdc4' },
                            { name: 'Final Exam', weight: 20, color: '#45b7d1' },
                            { name: 'Homework', weight: 25, color: '#96ceb4' },
                            { name: 'Participation', weight: 10, color: '#feca57' },
                            { name: 'Final Project', weight: 5, color: '#ff9ff3' }
                        ]
                    }
                },
                {
                    title: 'Important Dates Wrapped',
                    type: 'dates',
                    data: {
                        totalDates: 15,
                        upcomingDeadlines: 6,
                        examCount: 3,
                        assignmentCount: 12,
                        importantDates: [
                            { name: 'Midterm 1', date: 'February 28, 2024', type: 'exam', priority: 'high' },
                            { name: 'Midterm 2', date: 'April 10, 2024', type: 'exam', priority: 'high' },
                            { name: 'Final Exam', date: 'May 25, 2024', type: 'exam', priority: 'high' },
                            { name: 'Problem Set 8', date: 'March 15, 2024', type: 'assignment', priority: 'medium' },
                            { name: 'Problem Set 12', date: 'April 20, 2024', type: 'assignment', priority: 'medium' }
                        ]
                    }
                },
                {
                    title: 'Policies Wrapped',
                    type: 'policies',
                    data: {
                        totalPolicies: 6,
                        latePolicy: 'No late homework accepted',
                        attendanceRequired: false,
                        plagiarismPolicy: 'Academic integrity violation',
                        policies: [
                            { name: 'Late Policy', description: 'No late homework accepted - submit early', severity: 'critical' },
                            { name: 'Attendance', description: 'Not required but highly recommended', severity: 'low' },
                            { name: 'Plagiarism', description: 'Academic integrity violation - report to dean', severity: 'critical' },
                            { name: 'Calculator Policy', description: 'Scientific calculator allowed on exams only', severity: 'moderate' },
                            { name: 'Office Hours', description: 'Mon/Wed/Fri 2-4 PM, or by appointment', severity: 'low' }
                        ]
                    }
                }
            ]
        },
        'phys150': {
            className: 'Physics 150',
            classCode: 'PHYS 150',
            instructor: 'Dr. Williams',
            semester: 'Spring 2024',
            slides: [
                {
                    title: 'Grade Weights Wrapped',
                    type: 'grades',
                    data: {
                        totalAssignments: 18,
                        examWeight: 50,
                        homeworkWeight: 30,
                        labWeight: 15,
                        participationWeight: 5,
                        topCategories: [
                            { name: 'Midterm Exam', weight: 25, color: '#ff6b6b' },
                            { name: 'Final Exam', weight: 25, color: '#4ecdc4' },
                            { name: 'Homework', weight: 30, color: '#45b7d1' },
                            { name: 'Lab Reports', weight: 15, color: '#96ceb4' },
                            { name: 'Participation', weight: 5, color: '#feca57' }
                        ]
                    }
                },
                {
                    title: 'Important Dates Wrapped',
                    type: 'dates',
                    data: {
                        totalDates: 10,
                        upcomingDeadlines: 3,
                        examCount: 2,
                        assignmentCount: 6,
                        importantDates: [
                            { name: 'Midterm Exam', date: 'March 22, 2024', type: 'exam', priority: 'high' },
                            { name: 'Final Exam', date: 'June 5, 2024', type: 'exam', priority: 'high' },
                            { name: 'Lab Report 4', date: 'April 8, 2024', type: 'assignment', priority: 'medium' },
                            { name: 'Homework 6', date: 'April 15, 2024', type: 'assignment', priority: 'medium' }
                        ]
                    }
                },
                {
                    title: 'Policies Wrapped',
                    type: 'policies',
                    data: {
                        totalPolicies: 7,
                        latePolicy: '5% deduction per day, maximum 1 week',
                        attendanceRequired: true,
                        plagiarismPolicy: 'Zero tolerance',
                        policies: [
                            { name: 'Late Policy', description: '5% deduction per day, maximum 1 week late', severity: 'moderate' },
                            { name: 'Attendance', description: 'Required - 2 absences max', severity: 'high' },
                            { name: 'Lab Safety', description: 'Safety glasses required in all labs', severity: 'critical' },
                            { name: 'Plagiarism', description: 'Zero tolerance - automatic course failure', severity: 'critical' },
                            { name: 'Makeup Labs', description: 'Must be completed within 1 week', severity: 'moderate' }
                        ]
                    }
                }
            ]
        }
    };
    
    return classDataMap[classId] || classDataMap['cs101'];
}

function closeSlideshowModal() {
    slideshowModal.style.display = 'none';
    currentClassData = null;
    currentSlideIndex = 0;
}

function generateSlides() {
    slidesContainer.innerHTML = '';
    slideIndicators.innerHTML = '';
    
    currentClassData.slides.forEach((slide, index) => {
        // Create slide
        const slideElement = document.createElement('div');
        slideElement.className = `slide ${slide.type} fade-in`;
        slideElement.innerHTML = generateSlideHTML(slide);
        slidesContainer.appendChild(slideElement);
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => goToSlide(index));
        slideIndicators.appendChild(indicator);
    });
}

function generateSlideHTML(slide) {
    switch (slide.type) {
        case 'grades':
            return generateGradesSlide(slide);
        case 'dates':
            return generateDatesSlide(slide);
        case 'policies':
            return generatePoliciesSlide(slide);
        case 'stats':
            return generateStatsSlide(slide);
        default:
            return generateDefaultSlide(slide);
    }
}

function generateGradesSlide(slide) {
    return `
        <div class="slide-title">${slide.title}</div>
        <div class="slide-content">
            <div class="slide-stat">
                <div class="slide-label">Total Assignments</div>
                <div class="slide-big-number">${slide.data.totalAssignments}</div>
                <div class="slide-description">across all categories</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Top Categories</div>
                <div class="ranking-list">
                    ${slide.data.topCategories.slice(0, 5).map((category, index) => `
                        <div class="ranking-item">
                            <div class="ranking-number">${index + 1}</div>
                            <div class="ranking-text">${category.name}</div>
                            <div class="ranking-value">${category.weight}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Exam Weight</div>
                <div class="slide-big-number">${slide.data.examWeight}%</div>
                <div class="slide-description">of total grade</div>
            </div>
        </div>
    `;
}

function generateDatesSlide(slide) {
    return `
        <div class="slide-title">${slide.title}</div>
        <div class="slide-content">
            <div class="slide-stat">
                <div class="slide-label">Upcoming Deadlines</div>
                <div class="slide-big-number">${slide.data.upcomingDeadlines}</div>
                <div class="slide-description">in the next 30 days</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Total Important Dates</div>
                <div class="slide-big-number">${slide.data.totalDates}</div>
                <div class="slide-description">throughout the semester</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Top Deadlines</div>
                <div class="ranking-list">
                    ${slide.data.importantDates.slice(0, 3).map((date, index) => `
                        <div class="ranking-item">
                            <div class="ranking-number">${index + 1}</div>
                            <div class="ranking-text">${date.name}</div>
                            <div class="ranking-value">${date.date}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generatePoliciesSlide(slide) {
    return `
        <div class="slide-title">${slide.title}</div>
        <div class="slide-content">
            <div class="slide-stat">
                <div class="slide-label">Total Policies</div>
                <div class="slide-big-number">${slide.data.totalPolicies}</div>
                <div class="slide-description">key policies to remember</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Late Policy</div>
                <div class="slide-big-number">${slide.data.latePolicy.split(' ')[0]}%</div>
                <div class="slide-description">deduction per day</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Critical Policies</div>
                <div class="ranking-list">
                    ${slide.data.policies.slice(0, 3).map((policy, index) => `
                        <div class="ranking-item">
                            <div class="ranking-number">${index + 1}</div>
                            <div class="ranking-text">${policy.name}</div>
                            <div class="ranking-value">${policy.severity}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateStatsSlide(slide) {
    return `
        <div class="slide-title">${slide.title}</div>
        <div class="slide-content">
            <div class="slide-stat">
                <div class="slide-label">Total Credits</div>
                <div class="slide-big-number">${slide.data.totalCredits}</div>
                <div class="slide-description">credit hours</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Expected Workload</div>
                <div class="slide-big-number">${slide.data.averageWorkload}</div>
                <div class="slide-description">per week</div>
            </div>
            <div class="slide-stat">
                <div class="slide-label">Course Stats</div>
                <div class="ranking-list">
                    ${slide.data.stats.slice(0, 3).map((stat, index) => `
                        <div class="ranking-item">
                            <div class="ranking-number">${index + 1}</div>
                            <div class="ranking-text">${stat.name}</div>
                            <div class="ranking-value">${stat.value} ${stat.unit}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateDefaultSlide(slide) {
    return `
        <div class="slide-title">${slide.title}</div>
        <div class="slide-content">
            <div class="slide-stat">
                <div class="slide-label">Summary</div>
                <div class="slide-description">Your syllabus information has been processed and organized!</div>
            </div>
        </div>
    `;
}

// Removed old card generation functions - now using slide generation

function setupSlideshowNavigation() {
    updateSlideshowNavigation();
}

function navigateSlides(direction) {
    if (!currentClassData) return;
    
    const totalSlides = currentClassData.slides.length;
    currentSlideIndex = (currentSlideIndex + direction + totalSlides) % totalSlides;
    goToSlide(currentSlideIndex);
}

function goToSlide(index) {
    if (!currentClassData) return;
    
    currentSlideIndex = index;
    const slideWidth = slidesContainer.offsetWidth;
    slidesContainer.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
    });
    updateSlideshowNavigation();
}

function updateSlideshowNavigation() {
    if (!currentClassData) return;
    
    // Update indicators
    const indicators = document.querySelectorAll('.slide-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlideIndex);
    });
    
    // Update button states
    prevSlide.disabled = currentSlideIndex === 0;
    nextSlide.disabled = currentSlideIndex === currentClassData.slides.length - 1;
}

// Removed old card navigation functions - now using slideshow modal

function resetUpload() {
    // Reset the application state
    currentCardIndex = 0;
    currentSlideIndex = 0;
    syllabiData = [];
    uploadedFiles = [];
    currentClassData = null;
    
    // Hide results and show loading
    resultsSection.style.display = 'none';
    uploadMoreSection.style.display = 'none';
    slideshowModal.style.display = 'none';
    loadingSection.style.display = 'flex';
    
    // Reset file inputs
    fileInput.value = '';
    fileInputResults.value = '';
    
    // Show results after a brief moment
    setTimeout(() => {
        showResults();
    }, 500);
}

// ChatGPT API Integration
async function processSyllabiWithChatGPT(files) {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });
    
    try {
        const response = await fetch('http://localhost:3000/api/process-syllabi', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error processing syllabi:', error);
        // Fallback to demo data
        return getDemoData();
    }
}

// Demo data fallback
function getDemoData() {
    return {
        "success": true,
        "data": [
            {
                "title": "Grade Weights Wrapped",
                "type": "grades",
                "data": {
                    "totalAssignments": 15,
                    "examWeight": 45,
                    "homeworkWeight": 35,
                    "participationWeight": 15,
                    "projectWeight": 5,
                    "topCategories": [
                        { "name": "Midterm Exam", "weight": 25, "color": "#ff6b6b" },
                        { "name": "Final Exam", "weight": 20, "color": "#4ecdc4" },
                        { "name": "Homework", "weight": 35, "color": "#45b7d1" },
                        { "name": "Participation", "weight": 15, "color": "#96ceb4" },
                        { "name": "Final Project", "weight": 5, "color": "#feca57" }
                    ]
                }
            },
            {
                "title": "Important Dates Wrapped",
                "type": "dates",
                "data": {
                    "totalDates": 12,
                    "upcomingDeadlines": 4,
                    "examCount": 3,
                    "assignmentCount": 8,
                    "importantDates": [
                        { "name": "Midterm Exam", "date": "March 15, 2024", "type": "exam", "priority": "high" },
                        { "name": "Final Project Due", "date": "May 20, 2024", "type": "assignment", "priority": "high" },
                        { "name": "Final Exam", "date": "June 10, 2024", "type": "exam", "priority": "high" },
                        { "name": "Homework 5", "date": "April 5, 2024", "type": "assignment", "priority": "medium" },
                        { "name": "Quiz 3", "date": "April 12, 2024", "type": "quiz", "priority": "medium" }
                    ]
                }
            },
            {
                "title": "Policies Wrapped",
                "type": "policies",
                "data": {
                    "totalPolicies": 8,
                    "latePolicy": "10% deduction per day late, maximum 3 days",
                    "attendanceRequired": true,
                    "plagiarismPolicy": "Zero tolerance - automatic failure",
                    "policies": [
                        { "name": "Late Policy", "description": "10% deduction per day late, maximum 3 days", "severity": "moderate" },
                        { "name": "Attendance", "description": "Required - 3 absences max before grade penalty", "severity": "high" },
                        { "name": "Plagiarism", "description": "Zero tolerance policy - automatic failure", "severity": "critical" },
                        { "name": "Makeup Exams", "description": "Only with valid medical excuse and prior approval", "severity": "moderate" },
                        { "name": "Grade Appeals", "description": "Must be submitted within 1 week of grade posting", "severity": "low" }
                    ]
                }
            },
            {
                "title": "Course Stats Wrapped",
                "type": "stats",
                "data": {
                    "totalCredits": 4,
                    "totalHours": 120,
                    "averageWorkload": "8-12 hours/week",
                    "difficulty": "Intermediate",
                    "stats": [
                        { "name": "Total Credits", "value": 4, "unit": "units" },
                        { "name": "Lecture Hours", "value": 3, "unit": "hours/week" },
                        { "name": "Lab Hours", "value": 2, "unit": "hours/week" },
                        { "name": "Expected Study Time", "value": 6, "unit": "hours/week" },
                        { "name": "Prerequisites", "value": 2, "unit": "courses" }
                    ]
                }
            }
        ],
        "processedFiles": 1
    };
}

// Load classes from database
async function loadClassesFromDatabase() {
    try {
        const response = await fetch('http://localhost:3000/api/classes');
        if (response.ok) {
            const data = await response.json();
            const classes = data.classes;
            
            if (classes.length > 0) {
                // Update the results section with real classes
                const resultsSection = document.getElementById('resultsSection');
                const classesGrid = document.getElementById('classesGrid');
                
                if (resultsSection && classesGrid) {
                    resultsSection.style.display = 'block';
                    classesGrid.innerHTML = '';
                    
                    classes.forEach((classItem, index) => {
                        const classRectangle = document.createElement('div');
                        classRectangle.className = 'class-rectangle';
                        classRectangle.onclick = () => openSlideshowModal(classItem.id);
                        
                        classRectangle.innerHTML = `
                            <div class="class-title">${classItem.class_name}</div>
                            <div class="class-subtitle">${classItem.instructor} • ${classItem.semester}</div>
                            <div class="class-preview">
                                <div class="preview-stat">
                                    <span class="preview-number">${classItem.data_count || 0}</span>
                                    <div class="preview-label">Data Points</div>
                                </div>
                                <div class="preview-stat">
                                    <span class="preview-number">${classItem.credits || 0}</span>
                                    <div class="preview-label">Credits</div>
                                </div>
                                <div class="preview-stat">
                                    <span class="preview-number">${new Date(classItem.created_at).toLocaleDateString()}</span>
                                    <div class="preview-label">Added</div>
                                </div>
                            </div>
                        `;
                        
                        classesGrid.appendChild(classRectangle);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading classes from database:', error);
    }
}

// Load classes on page load
document.addEventListener('DOMContentLoaded', function() {
    // Try to load real classes from database
    loadClassesFromDatabase();
});

// Export functions for potential backend integration
window.SyllabiWrapped = {
    processFiles,
    resetUpload,
    openSlideshowModal,
    closeSlideshowModal,
    navigateSlides,
    goToSlide,
    loadClassesFromDatabase
};
