import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import Admin from "./Admin";
import Branch from "./Branch";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Profile from "./Profile";
import Exam from "../Exam";
import Leave from "./Leave";
import { useNavigate, useLocation } from "react-router-dom";
import AdminFees from "./Fees";
import { 
  MdHome, 
  MdPerson, 
  MdGroup, 
  MdAccountTree, 
  MdNotifications, 
  MdSchool, 
  MdLibraryBooks, 
  MdPlaylistAddCheck, 
  MdAdminPanelSettings,
  MdPayments
} from "react-icons/md";

const MENU_ITEMS = [
  { id: "home", label: "Overview", component: Profile, icon: MdHome, color: "var(--navy)" },
  { id: "student", label: "Students", component: Student, icon: MdPerson, color: "#3b82f6" },
  { id: "faculty", label: "Faculty", component: Faculty, icon: MdGroup, color: "#10b981" },
  { id: "branch", label: "Branches", component: Branch, icon: MdAccountTree, color: "#8b5cf6" },
  { id: "fees", label: "Finances", component: AdminFees, icon: MdPayments, color: "#f59e0b" },
  { id: "notice", label: "Notices", component: Notice, icon: MdNotifications, color: "#ec4899" },
  { id: "exam", label: "Exams", component: Exam, icon: MdSchool, color: "#f43f5e" },
  { id: "subjects", label: "Subjects", component: Subjects, icon: MdLibraryBooks, color: "#6366f1" },
  { id: "leave", label: "Requests", component: Leave, icon: MdPlaylistAddCheck, color: "#06b6d4" },
  { id: "admin", label: "Core Admin", component: Admin, icon: MdAdminPanelSettings, color: "var(--navy-dark)" },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/admin/my-details`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error fetching user details"
      );
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, userToken]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.pathname]);

  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu === menuId;
    return `menu-item ${isSelected ? "menu-item-active" : "menu-item-inactive"}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">Loading...</div>
      );
    }

    const MenuItem = MENU_ITEMS.find(
      (item) => item.id === selectedMenu
    )?.component;

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    return MenuItem && <MenuItem />;
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/admin?page=${menuId}`);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pb-10">
        {/* Bento Navigation Bar */}
        <div className="bento-card-flat p-2 mb-8 anim-fade-up">
          <ul className="flex flex-wrap justify-center items-center gap-1.5">
            {MENU_ITEMS.map((item) => (
              <li
                key={item.id}
                className={getMenuItemClass(item.id)}
                onClick={() => handleMenuClick(item.id)}
              >
                <item.icon className="text-base" style={{ color: selectedMenu === item.id ? 'white' : item.color }} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="anim-fade-up" key={selectedMenu}>
          {renderContent()}
        </div>
      </div>
      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
