-- ========================================
-- D1 TABLE 33: EXAM_ANSWERS (Jawaban Siswa)
-- ========================================

CREATE TABLE IF NOT EXISTS exam_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    answer TEXT,
    score DECIMAL(5, 2),
    graded_by TEXT,
    graded_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id),
    FOREIGN KEY (question_id) REFERENCES exam_questions(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (graded_by) REFERENCES profiles(id),
    UNIQUE(session_id, question_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_exam_answers_session ON exam_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_student ON exam_answers(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_question ON exam_answers(question_id);
