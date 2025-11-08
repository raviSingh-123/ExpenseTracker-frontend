import API from "./axios";

export const getBudgets = () => API.get("/budget");
export const createBudget = (data) => API.post("/budget", data);
export const updateBudget = (id, data) => API.put(`/budget/${id}`, data);
export const deleteBudget = (id) => API.delete(`/budget/${id}`);

