# College Management System — Test Case Report

**Project:** College Management System  
**Date:** 2026-04-15  
**Tester:** Karan Shah  
**Total Test Cases:** 20 | ✅ Passed: 17 | ❌ Failed: 3 | **Pass Rate: 85%**

---

## Module 1: Admin Authentication & Registration

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-01 | Admin Login – Valid Credentials | 1. Navigate to Admin Login 2. Enter valid email & password 3. Click Login | Email: `admin@cms.com` Pass: `admin123` | 200 OK; JWT token; "Login successful" | 200 OK; JWT token returned; "Login successful" | ✅ Pass |
| TC-02 | Admin Login – Invalid Password | 1. Navigate to Admin Login 2. Enter valid email 3. Enter wrong password 4. Click Login | Email: `admin@cms.com` Pass: `wrongpass` | 401 Unauthorized; "Invalid password" | 401 Unauthorized; "Invalid password" | ✅ Pass |
| TC-03 | Admin Login – Unregistered Email | 1. Navigate to Admin Login 2. Enter unregistered email 3. Click Login | Email: `ghost@cms.com` Pass: `anypass` | 404 Not Found; "User not found" | 404 Not Found; "User not found" | ✅ Pass |
| TC-04 | Admin Registration – Valid Data | 1. POST /api/admin/register 2. Provide all fields + profile image | Name: `John Doe` Email: `john@cms.com` Phone: `9876543210` | 201 Created; auto 6-digit employeeId; sanitized response | 201 Created; employeeId generated; password excluded from response | ✅ Pass |
| TC-05 | Admin Registration – Duplicate Email | 1. Register admin 2. Register again with same email | Email: `john@cms.com` (exists) Phone: `9998887770` | 409 Conflict; "Admin with these details already exists" | 409 Conflict; duplicate detected via $or query | ✅ Pass |

---

## Module 2: Admin Validation & Password

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-06 | Admin Registration – Invalid Phone | 1. POST /api/admin/register 2. Provide phone < 10 digits | Phone: `12345` Email: `jane@cms.com` | 400 Bad Request; "Phone number must be 10 digits" | 400 Bad Request; regex fails; error returned | ✅ Pass |
| TC-07 | Admin Forgot Password – Unregistered Email | 1. POST /api/admin/forgot-password 2. Enter non-existent email | Email: `notexist@cms.com` | 404 Not Found; "No Admin Found" | ❌ 500 Internal Server Error; SMTP config causes unhandled exception in sendResetMail() | ❌ Fail |

---

## Module 3: Student Authentication & Registration

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-08 | Student Login – Valid Credentials | 1. Navigate to Student Login 2. Enter enrollment email & password 3. Click Login | Email: `123456@gmail.com` Pass: `student123` | 200 OK; JWT token; "Login successful" | 200 OK; JWT token returned; student authenticated | ✅ Pass |
| TC-09 | Student Login – Wrong Password | 1. Navigate to Student Login 2. Enter valid email 3. Enter wrong password | Email: `123456@gmail.com` Pass: `wrongpassword` | 401 Unauthorized; "Invalid password" | 401 Unauthorized; bcrypt compare fails; error returned | ✅ Pass |
| TC-10 | Student Registration – Valid Data | 1. POST /api/student/register as Admin 2. Provide all fields + photo | Name: `Riya Shah` Branch: `<valid_id>` Semester: `3` | 201 Created; auto enrollmentNo; email auto-generated | 201 Created; enrollment & email generated; password not exposed | ✅ Pass |

---

## Module 4: Student Search & Password Update

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-11 | Student Search – By Enrollment | 1. Login as Admin 2. POST /api/student/search 3. Provide enrollmentNo | `{ "enrollmentNo": 123456 }` | 200 OK; matching student with populated branch | 200 OK; student found with branch data populated | ✅ Pass |
| TC-12 | Student Search – No Filter | 1. Login as Admin 2. POST /api/student/search 3. Send empty body | `{}` (empty body) | 400 Bad Request; "Select at least one filter" | 400 Bad Request; all-null check triggers correctly | ✅ Pass |
| TC-13 | Update Student Password – Weak | 1. Login as student 2. PUT /api/student/update-password 3. Provide short password | currentPass: `student123` newPass: `abc` | 400 Bad Request; "New password must be at least 8 characters long" | 400 Bad Request; length < 8 check triggers | ✅ Pass |

---

## Module 5: Attendance Management

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-14 | Mark Attendance – Valid Data | 1. Login as faculty 2. POST /api/attendance/mark 3. Provide all fields | subjectId, date: `2026-04-15`, semester: `3`, attendanceList: `[{studentId, status:"present"}]` | 200 OK; "Attendance marked successfully" | 200 OK; bulkWrite upsert creates records; success message | ✅ Pass |
| TC-15 | Mark Attendance – Missing Fields | 1. Login as faculty 2. POST /api/attendance/mark 3. Omit branchId & attendanceList | `{ "subjectId": "<id>", "date": "2026-04-15" }` | 400 Bad Request; "All fields are required" | 400 Bad Request; missing field check triggers | ✅ Pass |
| TC-16 | Get Student Attendance Summary | 1. Login as student 2. GET /api/attendance/my-attendance | Auth Token (logged-in student) | 200 OK; array of `{ subjectName, present, total, percentage }` | 200 OK; records grouped by subject; percentage calculated correctly | ✅ Pass |

---

## Module 6: Fees Management

| TC ID | Test Case Name | Test Steps | Test Data | Expected Output | Actual Output | Status |
|-------|---------------|------------|-----------|-----------------|---------------|--------|
| TC-17 | Create Fee – Valid Data | 1. Login as admin 2. POST /api/fees/create 3. Provide all fields | studentId: `<id>` title: `Semester Fee` amount: `15000` dueDate: `2026-05-01` | 201 Created; fee with status "unpaid" | 201 Created; fee document created; status "unpaid" | ✅ Pass |
| TC-18 | Create Fee – Missing dueDate | 1. Login as admin 2. POST /api/fees/create 3. Omit dueDate | studentId: `<id>` title: `Tuition Fee` amount: `10000` | 400 Bad Request; "All fields are required" | ❌ 500 Internal Server Error; dueDate validation passes null to Mongoose; unhandled cast error | ❌ Fail |
| TC-19 | Late Fee Penalty – Overdue Fee | 1. Create fee with past dueDate & status "unpaid" 2. GET /api/fees/my-fees | dueDate: `2026-04-05` amount: `5000` status: `unpaid` (10 days overdue) | lateFee = 500 (10×₹50); totalAmount = 5500 | ❌ lateFee = 0; totalAmount = 5000; dueDate string causes NaN in Date comparison | ❌ Fail |
| TC-20 | Bulk Assign Fees – Missing Amount | 1. Login as admin 2. POST /api/fees/bulk-assign 3. Omit amount | `{ "startDate": "2026-04-01", "titlePrefix": "Semester Fee" }` | 400 Bad Request; "Start Date and Amount are required" | 400 Bad Request; !amount check triggers; correct error | ✅ Pass |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 20 |
| **Passed** | 17 |
| **Failed** | 3 |
| **Pass Rate** | 85% |

### Failed Test Cases Summary

| TC ID | Issue | Root Cause | Severity |
|-------|-------|------------|----------|
| TC-07 | Forgot password returns 500 instead of 404 | SMTP misconfiguration causes unhandled exception in `sendResetMail()` before 404 response | High |
| TC-18 | Missing dueDate causes 500 instead of 400 | Controller check passes but Mongoose schema cast error is unhandled | Medium |
| TC-19 | Late fee penalty not calculated | dueDate stored as string causes `NaN` in Date comparison; penalty logic skipped | High |
