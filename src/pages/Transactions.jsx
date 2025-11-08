import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { FaFilter, FaPlus, FaBars } from "react-icons/fa";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "../api/transaction";
import { useNavigate } from "react-router-dom";

function Transactions() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: "Expense",
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
      fetchTransactions();
    } else {
      setIsLogin(false);
      setLoading(false);
      navigate("/login");
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setIsLogin(false);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date).toISOString().split("T")[0],
        description: transaction.description || "",
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        type: "Expense",
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      type: "Expense",
      category: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, data);
      } else {
        await addTransaction(data);
      }
      await fetchTransactions();
      handleCloseDialog();
      // Dispatch custom event to notify other components (like Budget page)
      window.dispatchEvent(new CustomEvent("transactionUpdated"));
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert(error.response?.data?.message || "Failed to save transaction");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        await fetchTransactions();
        // Dispatch custom event to notify other components (like Budget page)
        window.dispatchEvent(new CustomEvent("transactionUpdated"));
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert(error.response?.data?.message || "Failed to delete transaction");
      }
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

  const filteredData = transactions.filter((t) => {
    const matchesSearch =
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesCategory = filterCategory === "All" || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = [...new Set(transactions.map((t) => t.category))];

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* ✅ Sidebar */}
      <Sidebar isOpen={showSidebar} setIsOpen={setShowSidebar} />

      {/* ✅ Overlay on mobile */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* ✅ Main Content */}
      <div className="flex-1 p-4 sm:p-6 w-full">
        {/* ✅ Navbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 bg-gray-200 rounded-lg"
              >
                <FaBars />
              </button>
            )}
            <h1 className="text-xl sm:text-2xl font-bold">Transactions</h1>
          </div>

          <button
            onClick={isLogin ? handleLogout : () => navigate("/login")}
            className="px-3 sm:px-4 py-2 bg-gray-200 rounded-lg text-sm sm:text-base"
          >
            {isLogin ? "Logout" : "Login"}
          </button>
        </div>

        {/* ✅ Search + Filter + Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="🔍 Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />

            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1 border rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
            >
              <FaFilter />
              <span>Filter</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto"
          >
            <FaPlus />
            Add Transaction
          </button>
        </div>

        {/* ✅ Filter Section */}
        {filterOpen && (
          <div className="bg-gray-100 rounded-lg p-3 mb-4 text-sm">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <FormControl size="small" className="w-full sm:w-auto min-w-[150px]">
                <InputLabel>Type</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Income">Income</MenuItem>
                  <MenuItem value="Expense">Expense</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="w-full sm:w-auto min-w-[150px]">
                <InputLabel>Category</InputLabel>
                <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="Category">
                  <MenuItem value="All">All</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>
        )}

        {/* ✅ Table Section */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredData.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.category}</TableCell>
                      <TableCell>{row.description || "-"}</TableCell>
                      <TableCell>{formatCurrency(row.amount)}</TableCell>
                      <TableCell
                        style={{
                          color: row.type === "Expense" ? "red" : "green",
                          fontWeight: 500,
                        }}
                      >
                        {row.type}
                      </TableCell>
                      <TableCell align="center" className="whitespace-nowrap">
                        <Tooltip title="Edit">
                          <IconButton color="primary" size="small" onClick={() => handleOpenDialog(row)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" size="small" onClick={() => handleDelete(row._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
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

        {/* Add/Edit Transaction Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <div className="space-y-4 pt-2">
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    label="Type"
                    required
                  >
                    <MenuItem value="Income">Income</MenuItem>
                    <MenuItem value="Expense">Expense</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {editingTransaction ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </div>
  );
}

export default Transactions;
