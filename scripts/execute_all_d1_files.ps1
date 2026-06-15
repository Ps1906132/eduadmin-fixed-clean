# ========================================
# D1 BATCH EXECUTE SCRIPT (PowerShell)
# Execute semua 28 SQL files sekaligus
# ========================================

Write-Host "🚀 STARTING D1 DATABASE SETUP" -ForegroundColor Green
Write-Host "Database ID: 77d7d271-5515-4cd1-8865-5cd676d4752b" -ForegroundColor Cyan
Write-Host "Total Tables: 28" -ForegroundColor Cyan
Write-Host ""

# Array of files to execute
$files = @(
    "d1_sql/01_profiles.sql",
    "d1_sql/02_staff.sql",
    "d1_sql/03_academic_years.sql",
    "d1_sql/04_subject_groups.sql",
    "d1_sql/05_subjects.sql",
    "d1_sql/06_classes.sql",
    "d1_sql/07_students.sql",
    "d1_sql/08_class_students.sql",
    "d1_sql/09_schedule_periods.sql",
    "d1_sql/10_schedules.sql",
    "d1_sql/11_attendance.sql",
    "d1_sql/12_grades.sql",
    "d1_sql/13_announcements.sql",
    "d1_sql/14_broadcasts.sql",
    "d1_sql/15_student_bills.sql",
    "d1_sql/16_payment_transactions.sql",
    "d1_sql/17_expenses.sql",
    "d1_sql/18_savings_accounts.sql",
    "d1_sql/19_savings_transactions.sql",
    "d1_sql/20_library_books.sql",
    "d1_sql/21_tutoring_classes.sql",
    "d1_sql/22_ai_providers.sql",
    "d1_sql/23_ai_api_keys.sql",
    "d1_sql/24_ai_system_settings.sql",
    "d1_sql/25_school_settings.sql",
    "d1_sql/26_multimedia_settings.sql",
    "d1_sql/27_promotion_history.sql",
    "d1_sql/28_audit_logs.sql",
    "d1_sql/35_tutoring_tables.sql"
)

# Counter
$count = 0
$success = 0
$failed = 0

# Execute each file
foreach ($file in $files) {
    $count++
    Write-Host "[$count/$($files.Count)] Executing: $file" -ForegroundColor Yellow
    
    try {
        & wrangler d1 execute eduadmin_db --file $file 2>$null
        if ($LASTEXITCODE -eq 0) {
            $success++
            Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        }
        else {
            $failed++
            Write-Host "  ❌ FAILED (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
        }
    }
    catch {
        $failed++
        Write-Host "  ❌ ERROR: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Summary
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📊 EXECUTION SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Total Files: $count"
Write-Host "✅ Success: $success" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 ALL FILES EXECUTED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Verify tables:" -ForegroundColor White
    Write-Host "   wrangler d1 execute eduadmin_db --command `"SELECT COUNT(*) FROM sqlite_master WHERE type='table';`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start dev server:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Login with:" -ForegroundColor White
    Write-Host "   Email: admin@eduadmin.com" -ForegroundColor Gray
    Write-Host "   Password: EduAdmin@2026!" -ForegroundColor Gray
}
else {
    Write-Host "Some files failed. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
