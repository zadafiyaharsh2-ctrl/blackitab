/**
 * ============================================================================
 * PDF EXPORT CONTROLLER
 * ============================================================================
 * 
 * Generates formatted question papers as downloadable PDFs.
 * Uses PDFKit for server-side PDF generation.
 * 
 * Endpoint: GET /api/exams/questions/export-pdf
 * Query params: exam, subject, difficulty, limit, includeAnswers
 * Access: teacher, hod, institute only
 */

const PDFDocument = require('pdfkit');
const ExamQuestion = require('../../models/ExamQuestion');

// ── Constants ────────────────────────────────────────────────────────────────
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const DIFFICULTY_MARKS = { Easy: 1, Medium: 2, Hard: 3 };

// ── Main Export Handler ──────────────────────────────────────────────────────
exports.exportQuestionPaper = async (req, res) => {
    try {
        const {
            exam = '',
            subject = '',
            difficulty = '',
            limit = 20,
            includeAnswers = 'true',
            title = ''} = req.query;

        // Build query filter
        const filter = {};
        if (exam) filter.exam = exam.toLowerCase();
        if (subject) filter.subject = { $regex: new RegExp(subject, 'i') };
        if (difficulty) filter.difficulty = difficulty;

        // Scope: if not admin, only show public questions + own institute's
        const user = req.user;
        if (user.role !== 'institute') {
            filter.$or = [
                { isPublic: true },
                ...(user.instituteId ? [{ instituteId: user.instituteId }] : []),
                { createdBy: user._id }
            ];
        }

        // Fetch questions
        const questions = await ExamQuestion.find(filter)
            .limit(parseInt(limit) || 20)
            .sort({ difficulty: 1, createdAt: -1 })
            .lean();

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found with the given filters.'
            });
        }

        // Calculate totals
        const totalMarks = questions.reduce((sum, q) => sum + (DIFFICULTY_MARKS[q.difficulty] || 1), 0);
        const paperTitle = title || `${(exam || 'General').toUpperCase()} - ${subject || 'Mixed'} Question Paper`;
        const showAnswers = includeAnswers === 'true';

        // ── Generate PDF ─────────────────────────────────────────────────────
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
                Title: paperTitle,
                Author: 'Blackitab',
                Subject: subject || 'Mixed',
                Creator: 'Blackitab Platform'}
        });

        // Set response headers for PDF download
        const safeFilename = paperTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.pdf"`);
        doc.pipe(res);

        // ── HEADER ───────────────────────────────────────────────────────────
        doc.fontSize(18).font('Helvetica-Bold')
           .text('BLACKITAB', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(14).font('Helvetica-Bold')
           .text(paperTitle, { align: 'center' });
        doc.moveDown(0.3);

        // Meta info line
        doc.fontSize(9).font('Helvetica')
           .text(
               `Total Questions: ${questions.length}  |  Total Marks: ${totalMarks}  |  Date: ${new Date().toLocaleDateString('en-IN')}`,
               { align: 'center' }
           );
        doc.moveDown(0.2);

        // Divider
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#333333');
        doc.moveDown(0.5);

        // Instructions
        doc.fontSize(9).font('Helvetica-Oblique')
           .text('Instructions: Answer all questions. Each question carries marks as indicated.', {
               align: 'left'
           });
        doc.moveDown(0.8);

        // ── QUESTIONS ────────────────────────────────────────────────────────
        questions.forEach((q, index) => {
            const marks = DIFFICULTY_MARKS[q.difficulty] || 1;
            const qNum = index + 1;

            // Check if we need a new page (leave room for question + options)
            if (doc.y > 680) {
                doc.addPage();
            }

            // Question number + text + marks
            doc.fontSize(10).font('Helvetica-Bold')
               .text(`Q${qNum}. `, { continued: true });
            doc.font('Helvetica')
               .text(`${q.question || q.content || 'Question text unavailable'}`, { continued: true });
            doc.font('Helvetica-Bold')
               .text(`  [${marks} mark${marks > 1 ? 's' : ''}]`, { align: 'left' });

            doc.moveDown(0.3);

            // Difficulty badge
            doc.fontSize(7).font('Helvetica')
               .text(`[${q.difficulty || 'Medium'}]`, { continued: false });
            doc.moveDown(0.2);

            // Options
            if (q.options && q.options.length > 0) {
                q.options.forEach((opt, optIdx) => {
                    const letter = OPTION_LETTERS[optIdx] || String(optIdx + 1);
                    doc.fontSize(10).font('Helvetica')
                       .text(`    ${letter})  ${opt}`, { indent: 20 });
                });
            }

            doc.moveDown(0.6);
        });

        // ── ANSWER KEY (optional) ────────────────────────────────────────────
        if (showAnswers) {
            doc.addPage();

            doc.fontSize(16).font('Helvetica-Bold')
               .text('ANSWER KEY', { align: 'center' });
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#333333');
            doc.moveDown(0.5);

            // Table-style answer key
            const colWidth = 130;
            const cols = 3;
            let colIdx = 0;
            let startX = 50;
            let startY = doc.y;

            questions.forEach((q, index) => {
                const qNum = index + 1;
                const correctLetter = OPTION_LETTERS[q.correctAnswer] || '?';

                const x = startX + (colIdx * colWidth);
                const y = startY;

                doc.fontSize(10).font('Helvetica-Bold')
                   .text(`Q${qNum}: `, x, y, { continued: true, width: colWidth });
                doc.font('Helvetica')
                   .text(correctLetter, { continued: false });

                colIdx++;
                if (colIdx >= cols) {
                    colIdx = 0;
                    startY += 18;

                    if (startY > 750) {
                        doc.addPage();
                        startY = 50;
                    }
                }
            });

            // Explanations section
            doc.moveDown(2);
            doc.fontSize(14).font('Helvetica-Bold')
               .text('EXPLANATIONS', { align: 'center' });
            doc.moveDown(0.5);

            questions.forEach((q, index) => {
                if (q.explanation && q.explanation !== 'No explanation available') {
                    if (doc.y > 700) doc.addPage();

                    doc.fontSize(9).font('Helvetica-Bold')
                       .text(`Q${index + 1}: `, { continued: true });
                    doc.font('Helvetica')
                       .text(q.explanation);
                    doc.moveDown(0.3);
                }
            });
        }

        // ── FOOTER ───────────────────────────────────────────────────────────
        doc.fontSize(7).font('Helvetica')
           .text(
               `Generated by Blackitab | ${new Date().toLocaleString('en-IN')}`,
               50, 780,
               { align: 'center', width: 495 }
           );

        doc.end();

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Error generating PDF'
        });
    }
};

// ── Preview endpoint (returns JSON instead of PDF) ───────────────────────────
exports.previewQuestions = async (req, res) => {
    try {
        const {
            exam = '',
            subject = '',
            difficulty = '',
            limit = 20} = req.query;

        const filter = {};
        if (exam) filter.exam = exam.toLowerCase();
        if (subject) filter.subject = { $regex: new RegExp(subject, 'i') };
        if (difficulty) filter.difficulty = difficulty;

        const user = req.user;
        if (user.role !== 'institute') {
            filter.$or = [
                { isPublic: true },
                ...(user.instituteId ? [{ instituteId: user.instituteId }] : []),
                { createdBy: user._id }
            ];
        }

        const questions = await ExamQuestion.find(filter)
            .limit(parseInt(limit) || 20)
            .sort({ difficulty: 1, createdAt: -1 })
            .select('question options difficulty exam subject tags correctAnswer')
            .lean();

        // Get available filters
        const exams = await ExamQuestion.distinct('exam');
        const subjects = await ExamQuestion.distinct('subject');

        res.json({
            success: true,
            data: {
                questions,
                total: questions.length,
                availableExams: exams,
                availableSubjects: subjects}
        });
    } catch (error) {
        
        res.status(500).json({ success: false, message: 'Error fetching questions' });
    }
};
