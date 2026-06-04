#!/bin/bash
# ========================================
# D1 BATCH EXECUTE SCRIPT
# Execute semua 28 SQL files sekaligus
# ========================================

echo "🚀 STARTING D1 DATABASE SETUP"
echo "Database ID: 77d7d271-5515-4cd1-8865-5cd676d4752b"
echo "Total Tables: 28"
echo ""

# Array of files to execute
files=(
  "d1_sql/01_profiles.sql"
  "d1_sql/02_staff.sql"
  "d1_sql/03_academic_years.sql"
  "d1_sql/04_subject_groups.sql"
  "d1_sql/05_subjects.sql"
  "d1_sql/06_classes.sql"
  "d1_sql/07_students.sql"
  "d1_sql/08_class_students.sql"
  "d1_sql/09_schedule_periods.sql"
  "d1_sql/10_schedules.sql"
  "d1_sql/11_attendance.sql"
  "d1_sql/12_grades.sql"
  "d1_sql/13_announcements.sql"
  "d1_sql/14_broadcasts.sql"
  "d1_sql/15_student_bills.sql"
  "d1_sql/16_payment_transactions.sql"
  "d1_sql/17_expenses.sql"
  "d1_sql/18_savings_accounts.sql"
  "d1_sql/19_savings_transactions.sql"
  "d1_sql/20_library_books.sql"
  "d1_sql/21_tutoring_classes.sql"
  "d1_sql/22_ai_providers.sql"
  "d1_sql/23_ai_api_keys.sql"
  "d1_sql/24_ai_system_settings.sql"
  "d1_sql/25_school_settings.sql"
  "d1_sql/26_multimedia_settings.sql"
  "d1_sql/27_promotion_history.sql"
  "d1_sql/28_audit_logs.sql"
  "d1_sql/35_tutoring_tables.sql"
)

# Counter
count=0
success=0
failed=0

# Execute each file
for file in "${files[@]}"; do
  count=$((count + 1))
  echo "[$count/28] Executing: $file"
  
  if wrangler d1 execute eduadmin_db --file "$file"; then
    success=$((success + 1))
    echo "  ✅ SUCCESS"
  else
    failed=$((failed + 1))
    echo "  ❌ FAILED"
  fi
  
  echo ""
done

# Summary
echo "=========================================="
echo "📊 EXECUTION SUMMARY"
echo "=========================================="
echo "Total Files: $count"
echo "✅ Success: $success"
echo "❌ Failed: $failed"
echo ""

if [ $failed -eq 0 ]; then
  echo "🎉 ALL FILES EXECUTED SUCCESSFULLY!"
  echo ""
  echo "Next steps:"
  echo "1. Verify tables: wrangler d1 execute eduadmin_db --command \"SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table';\""
  echo "2. Start dev server: npm run dev"
  echo "3. Login with: admin@eduadmin.com / EduAdmin@2026!"
else
  echo "⚠️ Some files failed. Please check the errors above."
fi

echo ""
echo "=========================================="
