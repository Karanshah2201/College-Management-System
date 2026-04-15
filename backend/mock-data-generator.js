const mongoose = require("mongoose");
const connectToMongo = require("./database/db");
const AdminDetail = require("./models/details/admin-details.model");
const FacultyDetail = require("./models/details/faculty-details.model");
const StudentDetail = require("./models/details/student-details.model.js");
const Branch = require("./models/branch.model");
const Subject = require("./models/subject.model");
const Notice = require("./models/notice.model");
const Fee = require("./models/fees.model");
const Material = require("./models/material.model");
const Exam = require("./models/exam.model");

const MOCK_PASSWORD = "password123";

const seedMockData = async () => {
  try {
    await connectToMongo();
    console.log("Connected to MongoDB for seeding...");

    // 1. Clear existing data
    console.log("Purging existing data...");
    await Promise.all([
      AdminDetail.deleteMany({}),
      FacultyDetail.deleteMany({}),
      StudentDetail.deleteMany({}),
      Branch.deleteMany({}),
      Subject.deleteMany({}),
      Notice.deleteMany({}),
      Fee.deleteMany({}),
      Material.deleteMany({}),
      Exam.deleteMany({}),
    ]);
    console.log("Existing data purged successfully.");

    // 2. Create Branches
    console.log("Generating academic branches...");
    const branches = await Branch.create([
      { branchId: "CS", name: "Computer Science & Engineering" },
      { branchId: "ME", name: "Mechanical Engineering" },
      { branchId: "EE", name: "Electrical Engineering" },
    ]);

    // 3. Create Admin
    console.log("Establishing administrative authority...");
    await AdminDetail.create({
      employeeId: 1001,
      firstName: "Sundar",
      lastName: "Pichai",
      email: "admin@college.edu",
      phone: "9876543210",
      profile: "admin_pichai.jpg",
      address: "1600 Amphitheatre Pkwy",
      city: "Mountain View",
      state: "California",
      pincode: "94043",
      country: "USA",
      gender: "male",
      dob: new Date("1972-06-10"),
      designation: "Chief Administrator",
      joiningDate: new Date("2020-01-01"),
      salary: 150000,
      status: "active",
      isSuperAdmin: true,
      emergencyContact: {
        name: "Anjali Pichai",
        relationship: "Spouse",
        phone: "9000000000",
      },
      bloodGroup: "O+",
      password: MOCK_PASSWORD,
    });

    // 4. Create Faculties
    console.log("Onboarding faculty members...");
    const faculty1 = await FacultyDetail.create({
      employeeId: 2001,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@college.edu",
      phone: "8888888888",
      gender: "female",
      branchId: branches[0]._id, // CS
      designation: "Senior Professor",
      salary: 85000,
      joiningDate: new Date("2015-08-12"),
      dob: new Date("1985-12-10"),
      address: "Algorithmic Way",
      city: "London",
      pincode: "SW1A",
      country: "UK",
      status: "active",
      emergencyContact: { name: "Lord Byron", relationship: "Father", phone: "1111111111" },
      bloodGroup: "A-",
      password: MOCK_PASSWORD,
      state: "Greater London"
    });

    // 5. Create Subjects
    console.log("Structuring curriculum...");
    const subjects = await Subject.create([
      { 
        name: "Introduction to Quantum Computing", 
        code: "QC101", 
        branch: branches[0]._id, 
        semester: 4, 
        credits: 4, 
        facultyId: faculty1._id 
      },
      { 
        name: "Advanced Neural Networks", 
        code: "ANN202", 
        branch: branches[0]._id, 
        semester: 4, 
        credits: 3, 
        facultyId: faculty1._id 
      }
    ]);

    // 6. Create Students
    console.log("Enrolling scholars...");
    const students = await StudentDetail.create([
      {
        enrollmentNo: 2024001,
        firstName: "Elon",
        middleName: "Reeve",
        lastName: "Musk",
        email: "student@college.edu",
        phone: "9999999999",
        semester: 4,
        branchId: branches[0]._id,
        gender: "male",
        dob: new Date("2004-06-28"),
        address: "Starship Base",
        city: "Boca Chica",
        state: "Texas",
        pincode: "78521",
        country: "USA",
        bloodGroup: "B+",
        emergencyContact: { name: "Maye Musk", relationship: "Mother", phone: "3333333333" },
        password: MOCK_PASSWORD
      },
      {
        enrollmentNo: 2024002,
        firstName: "Marie",
        middleName: "S.",
        lastName: "Curie",
        email: "marie@college.edu",
        phone: "9111111111",
        semester: 4,
        branchId: branches[0]._id,
        gender: "female",
        dob: new Date("2003-11-07"),
        address: "Polonium St",
        city: "Warsaw",
        state: "Mazovia",
        pincode: "00-001",
        country: "Poland",
        bloodGroup: "AB-",
        emergencyContact: { name: "Pierre Curie", relationship: "Spouse", phone: "4444444444" },
        password: MOCK_PASSWORD
      }
    ]);

    // 7. Create Notices
    console.log("Broadcasting institutional news...");
    await Notice.create([
      {
        title: "Annual Tech Symposium 2026",
        description: "Join us for the largest tech gathering this semester. Guest speakers from leading AI labs will be present.",
        type: "both",
        link: "https://tech-sympo.edu"
      },
      {
        title: "Spring Break Holiday Notice",
        description: "The college will remain closed from April 1st to April 7th for scheduled maintenance.",
        type: "student"
      }
    ]);

    // 8. Create Fees
    console.log("Configuring fiscal protocols...");
    const fees = [];
    students.forEach(student => {
      fees.push({
        studentId: student._id,
        title: "Academic Tuition - Fall 2025",
        amount: 45000,
        dueDate: new Date("2025-08-30"),
        status: "paid",
        transactionId: "TXN_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        paidAt: new Date("2025-08-25")
      });
      fees.push({
        studentId: student._id,
        title: "Infrastructure & Lab Maintenance",
        amount: 12000,
        dueDate: new Date("2026-04-15"),
        status: "unpaid"
      });
    });
    await Fee.create(fees);

    // 9. Create Exams
    console.log("Scheduling assessments...");
    await Exam.create({
      name: "Mid-Semester Assessment Q2",
      date: new Date("2026-05-15"),
      semester: 4,
      examType: "mid",
      timetableLink: "https://college.edu/timetable/mid-q2",
      totalMarks: 50
    });

    console.log("\n==================================");
    console.log("✅ SESSION POPULATION SUCCESSFUL");
    console.log("==================================");
    console.log("Admin: admin@college.edu / password123");
    console.log("Student: student@college.edu / password123");
    console.log("Faculty: ada@college.edu / password123");
    console.log("==================================\n");

  } catch (error) {
    console.error("Critical Seeding Failure:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedMockData();
