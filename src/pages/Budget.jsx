import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { FaBars } from "react-icons/fa";
import { getBudgets, createBudget, updateBudget, deleteBudget } from "../api/budget";
import { getTransactions } from "../api/transaction";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

function Budget() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
      fetchData();
    } else {
      setIsLogin(false);
      setLoading(false);
      navigate("/login");
    }
  }, []);

  // Listen for transaction updates to refresh budget data
  useEffect(() => {
    const handleTransactionUpdate = () => {
      // Small delay to ensure transaction is saved in backend
      setTimeout(() => {
        fetchData();
      }, 300);
    };

    window.addEventListener("transactionUpdated", handleTransactionUpdate);
    
    return () => {
      window.removeEventListener("transactionUpdated", handleTransactionUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, transactionsRes] = await Promise.all([
        getBudgets(),
        getTransactions(),
      ]);

      const budgetsData = budgetsRes.data;
      const transactionsData = transactionsRes.data;

      // Calculate spent amount for each budget category (case-insensitive matching)
      const categorySpent = {};
      transactionsData.forEach((tx) => {
        if (tx.type === "Expense" && tx.category) {
          const categoryKey = tx.category.toLowerCase().trim();
          categorySpent[categoryKey] = (categorySpent[categoryKey] || 0) + tx.amount;
        }
      });

      // Add spent amount to budgets (case-insensitive matching)
      const budgetsWithSpent = budgetsData.map((budget) => {
        const budgetCategoryKey = budget.category.toLowerCase().trim();
        const spent = categorySpent[budgetCategoryKey] || 0;
        return {
          ...budget,
          spent: spent,
        };
      });

      setBudgets(budgetsWithSpent);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLogin(false);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: "",
        limit: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBudget(null);
    setFormData({
      category: "",
      limit: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        category: formData.category,
        limit: parseFloat(formData.limit),
      };

      if (editingBudget) {
        await updateBudget(editingBudget._id, data);
      } else {
        await createBudget(data);
      }
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving budget:", error);
      alert(error.response?.data?.message || "Failed to save budget");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(id);
        await fetchData();
      } catch (error) {
        console.error("Error deleting budget:", error);
        alert(error.response?.data?.message || "Failed to delete budget");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogin(false);
    navigate("/login");
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const getColorClass = (percent) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 75) return "bg-yellow-400";
    return "bg-green-500";
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
            <h1 className="text-2xl font-bold">Budget</h1>
          </div>

          <button
            onClick={isLogin ? handleLogout : () => navigate("/login")}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            {isLogin ? "Logout" : "Login"}
          </button>
        </div>



         <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">Monthly Budget Overview</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Total Monthly Budget:</strong> ₹{totalBudget.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Total Spent:</strong> ₹{totalSpent.toLocaleString("en-IN")}
              </p>
              <p>
                <strong>Remaining:</strong> ₹{remaining.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${getColorClass(percent)} h-3 rounded-full`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{percent}%</p>
            </div>
          </>
        )}
      </div>

      {/* Category-wise Budgets */}
      <div className="bg-white p-5 rounded-2xl shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Category-wise Budgets</h2>
          <button
            onClick={() => handleOpenDialog()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow text-sm"
          >
            ➕ Add Budget
          </button>
        </div>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((cat) => {
              const usedPercent = cat.limit > 0
                ? Math.min(Math.round((cat.spent / cat.limit) * 100), 100)
                : 0;
              return (
                <div key={cat._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-gray-800 mb-1">
                        <span className="font-medium">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            ₹{cat.spent.toLocaleString("en-IN")} / ₹{cat.limit.toLocaleString("en-IN")}{" "}
                            <span className="text-gray-500">{usedPercent}%</span>
                          </span>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenDialog(cat)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(cat._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${getColorClass(usedPercent)} h-3 rounded-full transition-all`}
                          style={{ width: `${usedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No budgets set. Click "Add Budget" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <div className="space-y-4 pt-2">
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                placeholder="e.g., Food, Rent, Travel"
              />
              <TextField
                fullWidth
                label="Budget Limit"
                type="number"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="Enter amount"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingBudget ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      </div>
    </div>
  )
}

export default Budget
