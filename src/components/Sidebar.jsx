import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaExchangeAlt, FaWallet, FaCog } from "react-icons/fa";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navItems = [
        { path: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
        { path: "/transactions", label: "Transactions", icon: <FaExchangeAlt /> },
        { path: "/budget", label: "Budget", icon: <FaWallet /> },
        { path: "/setting", label: "Settings", icon: <FaCog /> },
    ];

    return (
        <>
            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-md p-5 flex flex-col transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 sm:static`}
            >
                <h2 className="text-2xl font-bold mb-8 hidden sm:block">
                    Expense Tracker
                </h2>

                <nav className="space-y-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-2 px-3 py-2 rounded-lg w-full hover:bg-gray-100 transition-all duration-200 ${isActive ? "text-blue-700 font-semibold" : "text-gray-800"
                                }`
                            }
                            onClick={() => setIsOpen(false)} // close sidebar on click (mobile)
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 sm:hidden z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
