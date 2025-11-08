import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Setting() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
      // You can decode the token to get user info or fetch from API
      // For now, we'll just check if token exists
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          setUserInfo(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      setIsLogin(false);
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLogin(false);
    navigate("/login");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* ✅ Sidebar (always visible on desktop, toggle on mobile) */}
      <Sidebar isOpen={showSidebar} setIsOpen={setShowSidebar} />


      {/* ✅ Overlay on mobile when sidebar is open */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* ✅ Main Content */}
      <div className="flex-1 p-6 w-full">
        {/* ✅ Navbar section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {/* 👇 Menu button visible only on mobile */}
            {isMobile && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 bg-gray-200 rounded-lg"
              >
                <FaBars />
              </button>
            )}
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <button
            onClick={isLogin ? handleLogout : () => navigate("/login")}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            {isLogin ? "Logout" : "Login"}
          </button>
        </div>

        {/* Settings Content */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          
          {userInfo && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{userInfo.name || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{userInfo.email || "N/A"}</p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Logout
            </button>
            {/* <h1>Setting page under progress...</h1> */}
          </div>
        </div>
      </div>  
    </div>
  )
}

export default Setting
