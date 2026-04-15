import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Timetable from "./Timetable";
import Material from "./Material";
import Profile from "./Profile";
import Exam from "../Exam";
import ViewMarks from "./ViewMarks";
import Attendance from "./Attendance";
import Fees from "./Fees";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MdHome, MdSchedule, MdLibraryBooks, MdNotifications, 
  MdSchool, MdAssessment, MdHowToReg, MdMonetizationOn 
} from "react-icons/md";

const MENU_ITEMS = [
  { id: "home", label: "Dashboard", component: null, icon: MdHome, color: "var(--navy)" },
  { id: "attendance", label: "Attendance", component: Attendance, icon: MdHowToReg, color: "#10b981" },
  { id: "marks", label: "Academic Results", component: ViewMarks, icon: MdAssessment, color: "#f59e0b" },
  { id: "fees", label: "Fee Payments", component: Fees, icon: MdMonetizationOn, color: "#ef4444" },
  { id: "timetable", label: "Class Schedule", component: Timetable, icon: MdSchedule, color: "#3b82f6" },
  { id: "material", label: "Study Materials", component: Material, icon: MdLibraryBooks, color: "#6366f1" },
  { id: "notice", label: "Notice Board", component: Notice, icon: MdNotifications, color: "#ec4899" },
  { id: "exam", label: "Exam Calendar", component: Exam, icon: MdSchool, color: "#f43f5e" },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axiosWrapper.get(`/student/my-details`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      }
    } catch (error) { toast.error("Failed to load student details"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchUserDetails(); }, [dispatch, userToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.search]);

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/student?page=${menuId}`);
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-[var(--navy)] border-t-transparent rounded-full" /></div>;
    if (selectedMenu === "home" && profileData) return <Profile profileData={profileData} />;
    const MenuItem = MENU_ITEMS.find(item => item.id === selectedMenu)?.component;
    return MenuItem && <MenuItem profileData={profileData} />;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bento Contextual Navigation */}
        <div className="bento-card-flat p-2 mb-10 overflow-x-auto no-scrollbar">
          <ul className="flex items-center gap-2 min-w-max">
            {MENU_ITEMS.map((item) => (
              <li
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl cursor-pointer transition-all duration-300 transform ${
                  selectedMenu === item.id
                    ? "bg-[var(--navy)] text-white shadow-lg scale-105"
                    : "hover:bg-[var(--bg-inset)] text-gray-500 hover:text-[var(--navy)]"
                }`}
              >
                <item.icon size={20} style={{ color: selectedMenu === item.id ? "white" : item.color }} />
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
