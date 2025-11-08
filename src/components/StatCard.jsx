import React from "react";
const StatCard = ({ title, amount, color }) => {
  return (
    <div className={`p-5 rounded-xl  text-center  shadow-md text-white ${color}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold mt-2">{amount}</p>
    </div>
  );
};

export default StatCard;
