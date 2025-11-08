import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { PieChart, Pie, ResponsiveContainer, Cell, LineChart, Line, XAxis, YAxis, Legend } from "recharts";
import { FaBars } from "react-icons/fa";
import { IconButton, Table, Tooltip, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { getDashboardStats } from "../api/dashboard";
import { getTransactions } from "../api/transaction";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showSidebar, setShowSidebar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        topCategory: "N/A",
        topCategorySpent: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLogin(true);
            fetchDashboardData();
        } else {
            setIsLogin(false);
            setLoading(false);
        }
    }, []);

    // Listen for transaction updates to refresh dashboard data
    useEffect(() => {
        const handleTransactionUpdate = () => {
            fetchDashboardData();
        };

        window.addEventListener("transactionUpdated", handleTransactionUpdate);
        
        return () => {
            window.removeEventListener("transactionUpdated", handleTransactionUpdate);
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, transactionsRes] = await Promise.all([
                getDashboardStats(),
                getTransactions(),
            ]);

            setStats(statsRes.data);
            setTransactions(transactionsRes.data.slice(0, 5)); // Get latest 5 transactions

            // Calculate pie chart data from transactions
            const categorySpend = {};
            transactionsRes.data.forEach((tx) => {
                if (tx.type === "Expense") {
                    categorySpend[tx.category] = (categorySpend[tx.category] || 0) + tx.amount;
                }
            });

            const pieChartData = Object.entries(categorySpend)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 4);

            setPieData(pieChartData);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setIsLogin(false);
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLogin(false);
        navigate("/login");
    };

    const formatCurrency = (amount) => {
        return `₹ ${amount.toLocaleString("en-IN")}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    const Cards = [
        {
            id: 1,
            title: "Total Balance",
            amount: formatCurrency(stats.balance),
            color: "bg-blue-500",
        },
        {
            id: 2,
            title: "Total Income",
            amount: formatCurrency(stats.totalIncome),
            color: "bg-green-500",
        },
        {
            id: 3,
            title: "Total Expense",
            amount: formatCurrency(stats.totalExpense),
            color: "bg-red-500",
        },
    ];

    const COLORS = ["#2bfb8b", "#0088FE", "#fb872b", "#fb2b35"];

    const barData = [
        { name: "Apr", Rent: 2000, Other: 2000, Food: 1000 },
        { name: "May", Rent: 3000, Other: 3000, Food: 2000 },
        { name: "Jun", Rent: 4000, Other: 1000, Food: 4000 },
        { name: "Jul", Rent: 5000, Other: 3000, Food: 1500 },
    ];
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
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                    </div>

                    <button
                        onClick={isLogin ? handleLogout : () => navigate("/login")}
                        className="px-4 py-2 bg-gray-200 rounded-lg"
                    >
                        {isLogin ? "Logout" : "Login"}
                    </button>
                </div>

                {/* ✅ Cards Section */}
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        {Cards.map(({ id, title, amount, color }) => (
                            <StatCard key={id} title={title} amount={amount} color={color} />
                        ))}
                    </div>
                )}

                {/* ✅ Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <div className="font-semibold mb-2">Expense Chart</div>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={isMobile ? 70 : 100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={!isMobile ? ({ name, value }) => `${name}: ₹${value.toLocaleString()}` : false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: "12px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-8 text-gray-500">No expense data available</div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-md">
                        <div className="font-semibold mb-2">Monthly Expenses Chart</div>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis />

                                {/* Tooltip */}
                                <Tooltip
                                    contentStyle={{ fontSize: '12px' }}
                                    cursor={{ stroke: 'rgba(0,0,0,0.2)', strokeWidth: 2 }}
                                />

                                {/* Legend */}
                                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />

                                {/* Lines */}
                                <Line
                                    type="monotone"
                                    dataKey="Rent"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    name="Rent"
                                    activeDot={{ r: 6 }} // hover point highlight
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Other"
                                    stroke="#FF8042"
                                    strokeWidth={2}
                                    name="Other"
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Food"
                                    stroke="#2bfb8b"
                                    strokeWidth={2}
                                    name="Food"
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table section */}
                <div className="bg-white p-5 rounded-xl shadow-md">
                    <div className="flex justify-between mb-4">
                        <div className="font-semibold">Recent Transaction</div>
                        <button
                            onClick={() => navigate("/transactions")}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                            ➕ Add
                        </button>
                    </div>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : transactions.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Type</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((row) => (
                                        <TableRow key={row._id} hover sx={{ cursor: "pointer" }}>
                                            <TableCell>{formatDate(row.date)}</TableCell>
                                            <TableCell>{row.category}</TableCell>
                                            <TableCell>{row.description || "-"}</TableCell>
                                            <TableCell>{formatCurrency(row.amount)}</TableCell>
                                            <TableCell style={{ color: row.type === "Expense" ? "red" : "green" }}>
                                                {row.type}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <div className="text-center py-8 text-gray-500">No transactions found</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
