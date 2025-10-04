// Demo data for testing without ChatGPT API
const demoData = {
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
                    {
                        "name": "Midterm Exam",
                        "weight": 25,
                        "color": "#ff6b6b"
                    },
                    {
                        "name": "Final Exam",
                        "weight": 20,
                        "color": "#4ecdc4"
                    },
                    {
                        "name": "Homework",
                        "weight": 35,
                        "color": "#45b7d1"
                    },
                    {
                        "name": "Participation",
                        "weight": 15,
                        "color": "#96ceb4"
                    },
                    {
                        "name": "Final Project",
                        "weight": 5,
                        "color": "#feca57"
                    }
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
                    {
                        "name": "Midterm Exam",
                        "date": "March 15, 2024",
                        "type": "exam",
                        "priority": "high"
                    },
                    {
                        "name": "Final Project Proposal",
                        "date": "April 1, 2024",
                        "type": "assignment",
                        "priority": "high"
                    },
                    {
                        "name": "Final Project Due",
                        "date": "May 20, 2024",
                        "type": "assignment",
                        "priority": "high"
                    },
                    {
                        "name": "Final Exam",
                        "date": "June 10, 2024",
                        "type": "exam",
                        "priority": "high"
                    },
                    {
                        "name": "Homework 5",
                        "date": "April 5, 2024",
                        "type": "assignment",
                        "priority": "medium"
                    },
                    {
                        "name": "Quiz 3",
                        "date": "April 12, 2024",
                        "type": "quiz",
                        "priority": "medium"
                    },
                    {
                        "name": "Lab Report 2",
                        "date": "April 19, 2024",
                        "type": "assignment",
                        "priority": "medium"
                    },
                    {
                        "name": "Midterm 2",
                        "date": "May 5, 2024",
                        "type": "exam",
                        "priority": "high"
                    }
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
                    {
                        "name": "Late Policy",
                        "description": "10% deduction per day late, maximum 3 days",
                        "severity": "moderate"
                    },
                    {
                        "name": "Attendance",
                        "description": "Required - 3 absences max before grade penalty",
                        "severity": "high"
                    },
                    {
                        "name": "Plagiarism",
                        "description": "Zero tolerance policy - automatic failure",
                        "severity": "critical"
                    },
                    {
                        "name": "Makeup Exams",
                        "description": "Only with valid medical excuse and prior approval",
                        "severity": "moderate"
                    },
                    {
                        "name": "Grade Appeals",
                        "description": "Must be submitted within 1 week of grade posting",
                        "severity": "low"
                    },
                    {
                        "name": "Office Hours",
                        "description": "Tues/Thurs 2-4 PM, or by appointment",
                        "severity": "low"
                    },
                    {
                        "name": "Technology Policy",
                        "description": "No phones during exams, laptops for notes only",
                        "severity": "moderate"
                    },
                    {
                        "name": "Collaboration",
                        "description": "Individual work unless explicitly stated otherwise",
                        "severity": "high"
                    }
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
                    {
                        "name": "Total Credits",
                        "value": 4,
                        "unit": "units"
                    },
                    {
                        "name": "Lecture Hours",
                        "value": 3,
                        "unit": "hours/week"
                    },
                    {
                        "name": "Lab Hours",
                        "value": 2,
                        "unit": "hours/week"
                    },
                    {
                        "name": "Expected Study Time",
                        "value": 6,
                        "unit": "hours/week"
                    },
                    {
                        "name": "Prerequisites",
                        "value": 2,
                        "unit": "courses"
                    },
                    {
                        "name": "Textbooks",
                        "value": 1,
                        "unit": "required"
                    },
                    {
                        "name": "Software Required",
                        "value": 3,
                        "unit": "programs"
                    }
                ]
            }
        }
    ],
    "processedFiles": 1
};

// Function to get demo data
function getDemoData() {
    return demoData;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getDemoData };
}
