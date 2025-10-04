require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new sqlite3.Database('syllabi.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        // Create tables if they don't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_name TEXT NOT NULL,
                instructor TEXT,
                semester TEXT,
                credits INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(`
            CREATE TABLE IF NOT EXISTS syllabus_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER,
                data_type TEXT NOT NULL,
                data_content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_id) REFERENCES classes (id)
            )
        `);
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// ChatGPT API configuration
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY || 'your-api-key-here';
const CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions';

// Extract text from PDF
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw error;
    }
}

// Process syllabus with ChatGPT
async function processSyllabusWithChatGPT(text) {
    const prompt = `
    Analyze this syllabus and extract the following information in JSON format:
    
    {
        "courseInfo": {
            "title": "Course Title",
            "instructor": "Instructor Name",
            "credits": number,
            "semester": "Semester/Quarter"
        },
        "gradeWeights": {
            "totalAssignments": number,
            "examWeight": number,
            "homeworkWeight": number,
            "participationWeight": number,
            "projectWeight": number,
            "topCategories": [
                {
                    "name": "Category Name",
                    "weight": number,
                    "color": "hex color code"
                }
            ]
        },
        "importantDates": {
            "totalDates": number,
            "upcomingDeadlines": number,
            "examCount": number,
            "assignmentCount": number,
            "importantDates": [
                {
                    "name": "Event Name",
                    "date": "Date",
                    "type": "exam/assignment/quiz",
                    "priority": "high/medium/low"
                }
            ]
        },
        "policies": {
            "totalPolicies": number,
            "latePolicy": "Late policy description",
            "attendanceRequired": boolean,
            "plagiarismPolicy": "Plagiarism policy description",
            "policies": [
                {
                    "name": "Policy Name",
                    "description": "Policy description",
                    "severity": "critical/high/moderate/low"
                }
            ]
        },
        "courseStats": {
            "totalCredits": number,
            "totalHours": number,
            "averageWorkload": "Workload description",
            "difficulty": "Beginner/Intermediate/Advanced",
            "stats": [
                {
                    "name": "Stat Name",
                    "value": number,
                    "unit": "unit"
                }
            ]
        }
    }
    
    Syllabus text:
    ${text}
    `;

    try {
        const response = await axios.post(CHATGPT_API_URL, {
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that extracts structured information from academic syllabi. Always respond with valid JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${CHATGPT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content;
        
        // Try to parse JSON from response
        try {
            return JSON.parse(content);
        } catch (parseError) {
            // If JSON parsing fails, try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Could not parse JSON from ChatGPT response');
        }
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        throw error;
    }
}

// Routes
app.post('/api/process-syllabi', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = [];

        for (const file of req.files) {
            try {
                // Extract text from PDF
                const text = await extractTextFromPDF(file.path);
                
                // Process with ChatGPT
                const processedData = await processSyllabusWithChatGPT(text);
                
                // Add file info
                processedData.fileInfo = {
                    originalName: file.originalname,
                    size: file.size,
                    uploadDate: new Date().toISOString()
                };
                
                results.push(processedData);
                
                // Clean up uploaded file
                fs.unlinkSync(file.path);
                
            } catch (error) {
                console.error(`Error processing file ${file.originalname}:`, error);
                // Clean up file even if processing failed
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        // Save processed data to database
        const savedClasses = [];
        for (const result of results) {
            const classId = await saveClassToDatabase(result);
            if (classId) {
                savedClasses.push(classId);
            }
        }
        
        // Generate wrapped data
        const wrappedData = generateWrappedData(results);
        
        res.json({
            success: true,
            data: wrappedData,
            processedFiles: results.length,
            savedClasses: savedClasses
        });

    } catch (error) {
        console.error('Error processing syllabi:', error);
        res.status(500).json({ 
            error: 'Failed to process syllabi',
            details: error.message 
        });
    }
});

// Save class data to database
function saveClassToDatabase(syllabusData) {
    return new Promise((resolve, reject) => {
        const courseInfo = syllabusData.courseInfo || {};
        
        // Insert class
        db.run(
            `INSERT INTO classes (class_name, instructor, semester, credits) VALUES (?, ?, ?, ?)`,
            [
                courseInfo.title || 'Unknown Course',
                courseInfo.instructor || 'Unknown Instructor',
                courseInfo.semester || 'Unknown Semester',
                courseInfo.credits || 0
            ],
            function(err) {
                if (err) {
                    console.error('Error saving class:', err);
                    reject(err);
                    return;
                }
                
                const classId = this.lastID;
                
                // Save each data type separately
                const dataTypes = ['gradeWeights', 'importantDates', 'policies', 'courseStats'];
                let completed = 0;
                
                dataTypes.forEach(dataType => {
                    if (syllabusData[dataType]) {
                        db.run(
                            `INSERT INTO syllabus_data (class_id, data_type, data_content) VALUES (?, ?, ?)`,
                            [classId, dataType, JSON.stringify(syllabusData[dataType])],
                            (err) => {
                                if (err) console.error(`Error saving ${dataType}:`, err);
                                completed++;
                                if (completed === dataTypes.length) {
                                    resolve(classId);
                                }
                            }
                        );
                    } else {
                        completed++;
                        if (completed === dataTypes.length) {
                            resolve(classId);
                        }
                    }
                });
            }
        );
    });
}

// Generate wrapped data from processed syllabi
function generateWrappedData(syllabi) {
    const wrappedData = [];
    
    // Grade Weights Wrapped
    const allGradeWeights = syllabi.map(s => s.gradeWeights).filter(Boolean);
    if (allGradeWeights.length > 0) {
        const combinedGrades = combineGradeWeights(allGradeWeights);
        wrappedData.push({
            title: "Grade Weights Wrapped",
            type: "grades",
            data: combinedGrades
        });
    }
    
    // Important Dates Wrapped
    const allDates = syllabi.map(s => s.importantDates).filter(Boolean);
    if (allDates.length > 0) {
        const combinedDates = combineImportantDates(allDates);
        wrappedData.push({
            title: "Important Dates Wrapped",
            type: "dates",
            data: combinedDates
        });
    }
    
    // Policies Wrapped
    const allPolicies = syllabi.map(s => s.policies).filter(Boolean);
    if (allPolicies.length > 0) {
        const combinedPolicies = combinePolicies(allPolicies);
        wrappedData.push({
            title: "Policies Wrapped",
            type: "policies",
            data: combinedPolicies
        });
    }
    
    // Course Stats Wrapped
    const allStats = syllabi.map(s => s.courseStats).filter(Boolean);
    if (allStats.length > 0) {
        const combinedStats = combineCourseStats(allStats);
        wrappedData.push({
            title: "Course Stats Wrapped",
            type: "stats",
            data: combinedStats
        });
    }
    
    return wrappedData;
}

// Helper functions to combine data from multiple syllabi
function combineGradeWeights(gradeWeights) {
    const totalAssignments = gradeWeights.reduce((sum, g) => sum + (g.totalAssignments || 0), 0);
    const avgExamWeight = gradeWeights.reduce((sum, g) => sum + (g.examWeight || 0), 0) / gradeWeights.length;
    const avgHomeworkWeight = gradeWeights.reduce((sum, g) => sum + (g.homeworkWeight || 0), 0) / gradeWeights.length;
    const avgParticipationWeight = gradeWeights.reduce((sum, g) => sum + (g.participationWeight || 0), 0) / gradeWeights.length;
    const avgProjectWeight = gradeWeights.reduce((sum, g) => sum + (g.projectWeight || 0), 0) / gradeWeights.length;
    
    // Combine all categories
    const allCategories = [];
    gradeWeights.forEach(g => {
        if (g.topCategories) {
            allCategories.push(...g.topCategories);
        }
    });
    
    // Group by name and average weights
    const categoryMap = {};
    allCategories.forEach(cat => {
        if (categoryMap[cat.name]) {
            categoryMap[cat.name].weight += cat.weight;
            categoryMap[cat.name].count += 1;
        } else {
            categoryMap[cat.name] = { ...cat, count: 1 };
        }
    });
    
    const topCategories = Object.values(categoryMap)
        .map(cat => ({
            ...cat,
            weight: Math.round(cat.weight / cat.count)
        }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5);
    
    return {
        totalAssignments,
        examWeight: Math.round(avgExamWeight),
        homeworkWeight: Math.round(avgHomeworkWeight),
        participationWeight: Math.round(avgParticipationWeight),
        projectWeight: Math.round(avgProjectWeight),
        topCategories
    };
}

function combineImportantDates(dates) {
    const allDates = [];
    dates.forEach(d => {
        if (d.importantDates) {
            allDates.push(...d.importantDates);
        }
    });
    
    const totalDates = allDates.length;
    const upcomingDeadlines = allDates.filter(d => {
        const eventDate = new Date(d.date);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= thirtyDaysFromNow;
    }).length;
    
    const examCount = allDates.filter(d => d.type === 'exam').length;
    const assignmentCount = allDates.filter(d => d.type === 'assignment').length;
    
    return {
        totalDates,
        upcomingDeadlines,
        examCount,
        assignmentCount,
        importantDates: allDates.sort((a, b) => new Date(a.date) - new Date(b.date))
    };
}

function combinePolicies(policies) {
    const allPolicies = [];
    policies.forEach(p => {
        if (p.policies) {
            allPolicies.push(...p.policies);
        }
    });
    
    const totalPolicies = allPolicies.length;
    const latePolicy = policies.find(p => p.latePolicy)?.latePolicy || "Varies by course";
    const attendanceRequired = policies.some(p => p.attendanceRequired);
    const plagiarismPolicy = policies.find(p => p.plagiarismPolicy)?.plagiarismPolicy || "Standard academic integrity policy";
    
    return {
        totalPolicies,
        latePolicy,
        attendanceRequired,
        plagiarismPolicy,
        policies: allPolicies
    };
}

function combineCourseStats(stats) {
    const totalCredits = stats.reduce((sum, s) => sum + (s.totalCredits || 0), 0);
    const totalHours = stats.reduce((sum, s) => sum + (s.totalHours || 0), 0);
    const avgWorkload = stats.reduce((sum, s) => {
        const workload = s.averageWorkload || "8-10 hours/week";
        const hours = parseInt(workload.match(/\d+/)?.[0] || "9");
        return sum + hours;
    }, 0) / stats.length;
    
    const difficulties = stats.map(s => s.difficulty).filter(Boolean);
    const mostCommonDifficulty = difficulties.length > 0 ? 
        difficulties.sort((a,b) => 
            difficulties.filter(v => v === a).length - difficulties.filter(v => v === b).length
        ).pop() : "Intermediate";
    
    const allStats = [];
    stats.forEach(s => {
        if (s.stats) {
            allStats.push(...s.stats);
        }
    });
    
    return {
        totalCredits,
        totalHours,
        averageWorkload: `${Math.round(avgWorkload)}-${Math.round(avgWorkload + 2)} hours/week`,
        difficulty: mostCommonDifficulty,
        stats: allStats
    };
}

// Get all saved classes
app.get('/api/classes', (req, res) => {
    db.all(`
        SELECT c.*, 
               COUNT(sd.id) as data_count
        FROM classes c
        LEFT JOIN syllabus_data sd ON c.id = sd.class_id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `, (err, rows) => {
        if (err) {
            console.error('Error fetching classes:', err);
            return res.status(500).json({ error: 'Failed to fetch classes' });
        }
        res.json({ classes: rows });
    });
});

// Get specific class data
app.get('/api/classes/:id', (req, res) => {
    const classId = req.params.id;
    
    // Get class info
    db.get('SELECT * FROM classes WHERE id = ?', [classId], (err, classRow) => {
        if (err) {
            console.error('Error fetching class:', err);
            return res.status(500).json({ error: 'Failed to fetch class' });
        }
        
        if (!classRow) {
            return res.status(404).json({ error: 'Class not found' });
        }
        
        // Get syllabus data
        db.all('SELECT * FROM syllabus_data WHERE class_id = ?', [classId], (err, dataRows) => {
            if (err) {
                console.error('Error fetching class data:', err);
                return res.status(500).json({ error: 'Failed to fetch class data' });
            }
            
            // Reconstruct the syllabus data
            const syllabusData = {
                courseInfo: {
                    title: classRow.class_name,
                    instructor: classRow.instructor,
                    semester: classRow.semester,
                    credits: classRow.credits
                }
            };
            
            dataRows.forEach(row => {
                try {
                    syllabusData[row.data_type] = JSON.parse(row.data_content);
                } catch (parseErr) {
                    console.error(`Error parsing ${row.data_type}:`, parseErr);
                }
            });
            
            res.json({ class: classRow, syllabusData });
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
