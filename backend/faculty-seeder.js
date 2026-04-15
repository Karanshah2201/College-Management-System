const connectToMongo = require("./database/db");
const mongoose = require("mongoose");
const facultyDetails = require("./models/details/faculty-details.model");
const Branch = require("./models/branch.model");

const seedFacultyData = async () => {
  try {
    await connectToMongo();

    // Clear existing faculty data
    await facultyDetails.deleteMany({});
    
    // Check if there's any branch
    let branch = await Branch.findOne();
    if (!branch) {
      branch = await Branch.create({ name: "Computer Science" });
      console.log("Created a default Computer Science Branch...");
    }

    const password = "faculty123";
    const employeeId = 654321;

    const facultyDetail = {
      employeeId: employeeId,
      firstName: "Alan",
      lastName: "Turing",
      email: "faculty@gmail.com",
      phone: "0987654321",
      profile: "Faculty_Profile_654321.jpg",
      address: "123 Faculty Lane",
      city: "College City",
      state: "State",
      pincode: "123456",
      country: "India",
      gender: "male",
      dob: new Date("1980-01-01"),
      designation: "Professor",
      joiningDate: new Date(),
      salary: 60000,
      status: "active",
      emergencyContact: {
        name: "Emergency Contact",
        relationship: "Sibling",
        phone: "9876543210",
      },
      bloodGroup: "A+",
      branchId: branch._id,
      password: password,
    };

    await facultyDetails.create(facultyDetail);

    console.log("\n=== Faculty Credentials ===");
    console.log("Employee ID:", employeeId);
    console.log("Password:", password);
    console.log("Email:", facultyDetail.email);
    console.log("=======================\n");
    console.log("Faculty seeding completed successfully!");
  } catch (error) {
    console.error("Error while seeding faculty:", error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

seedFacultyData();
