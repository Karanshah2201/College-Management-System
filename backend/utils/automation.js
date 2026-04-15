const cron = require("node-cron");
const StudentDetail = require("../models/details/student-details.model");
const Fee = require("../models/fees.model");
const Notice = require("../models/notice.model");

// Configure the automated fee assignment that runs every midnight
const setupAutomation = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running Daily Semester Automation Check...");
    try {
      const today = new Date();
      const students = await StudentDetail.find({ status: "active" });

      for (const student of students) {
        const joinDate = student.semesterStartedAt || student.createdAt;
        const diffInMonths = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth());

        // If 6 months or more have passed in this semester
        if (diffInMonths >= 6) {
          const nextSemester = student.semester + 1;
          
          if (nextSemester <= 8) { // Assuming 8 semesters in a degree
            console.log(`Automatically promoting student ${student.firstName} to Semester ${nextSemester} and assigning fees...`);
            
            // 1. Assign New Fee
            const dueDate = new Date(today.getTime());
            dueDate.setMonth(dueDate.getMonth() + 2); // Due exactly 2 months after semester starts

            await Fee.create({
              studentId: student._id,
              title: `Semester ${nextSemester} Tuition Fees`,
              amount: 50000, 
              dueDate: dueDate,
            });

            // 2. Add Automation Notice
            await Notice.create({
              title: "New Semester Fee Assigned",
              description: `Congratulations on finishing a semester! You have been promoted to Semester ${nextSemester}. A new fee of ₹50,000 has been assigned to your account.`,
              type: "Student",
              date: today.toLocaleDateString(),
            });

            // 3. Update Student Record
            student.semester = nextSemester;
            student.semesterStartedAt = today;
            await student.save();
          }
        }
      }
    } catch (error) {
      console.error("Automation Job Failed:", error);
    }
  });

  console.log("Semester Fee Automation Initialized.");
};

module.exports = setupAutomation;
