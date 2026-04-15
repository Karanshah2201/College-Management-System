import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Timetable from "./Timetable";
import Material from "./Material";
import StudentFinder from "./StudentFinder";
import Profile from "./Profile";
import Marks from "./AddMarks";
import Exam from "../Exam";
import Attendance from "./Attendance";
import { 
  MdHome, MdSchedule, MdLibraryBooks, MdNotifications, 
  MdSearch, MdAssessment, MdSchool, MdHowToReg 
} from "react-icons/md";

const MENU_ITEMS = [
  { id: "home", label: "Dashboard", component: null, icon: MdHome, color: "var(--navy)" },
  { id: "attendance", label: "Attendance", component: Attendance, icon: MdHowToReg, color: "#10b981" },
  { id: "marks", label: "Marks", component: Marks, icon: MdAssessment, color: "#f59e0b" },
  { id: "timetable", label: "Timetable", component: Timetable, icon: MdSchedule, color: "#3b82f6" },
  { id: "material", label: "Materials", component: Material, icon: MdLibraryBooks, color: "#6366f1" },
  { id: "notice", label: "Notices", component: Notice, icon: MdNotifications, color: "#ec4899" },
  { id: "student info", label: "Students", component: StudentFinder, icon: MdSearch, color: "#8b5cf6" },
  { id: "exam", label: "Exams", component: Exam, icon: MdSchool, color: "#f43f5e" },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [profileData, setProfileData] = useState(null);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosWrapper.get("/faculty/my-details", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (response.data.success) {
          setProfileData(response.data.data);
          dispatch(setUserData(response.data.data));
        }
      } catch (error) { toast.error("Failed to load faculty profile"); }
    };
    fetchUserDetails();
  }, [dispatch, userToken]);

  const renderContent = () => {
    if ((selectedMenu === "Dashboard" || selectedMenu === "Home") && profileData) {
      return <Profile profileData={profileData} />;
    }
    const menuItem = MENU_ITEMS.find(item => item.label === selectedMenu);
    if (menuItem && menuItem.component) {
      const Component = menuItem.component;
      return <Component profileData={profileData} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bento Navigation Bar */}
        <div className="bento-card-flat p-2 mb-10 overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-2 min-w-max">
            {MENU_ITEMS.map((item) => (
              <li
                key={item.id}
                onClick={() => setSelectedMenu(item.label)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                  selectedMenu === item.label
                    ? "bg-[var(--navy)] text-white shadow-lg scale-105"
                    : "hover:bg-[var(--bg-inset)] text-gray-500 hover:text-[var(--navy)]"
                }`}
              >
                <item.icon size={20} style={{ color: selectedMenu === item.label ? "white" : item.color }} />
                <span className="text-sm font-bold tracking-tight whitespace-nowrap">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="anim-fade-up">
          {renderContent()}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default Home;
