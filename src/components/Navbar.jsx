import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { NavLink} from 'react-router-dom';

function Navbar() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isLogin, setIsLogin] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    })

    return (
        <div className='max-w-[1320px] mx-auto'>
            <div className='bg-white flex justify-between text-center p-2'>
                <div className='flex gap-1 items-center'>
                    <img className='w-[25px] h-[19px]' src="../images.jpg" alt="logo" />
                    <div className='font-semibold text-[20px] hover:text-blue-500'>Expense Tarcker</div>
                </div>
                <ul className='flex justify-around gap-4 py-1 hover:cursor-pointer'>
                    <li className='font-medium text-[18px]'>
                        <NavLink to="/" className={({isActive}) => isActive ? "text-blue-500" : "text-black"}>Dashboard</NavLink>
                    </li>
                    <li className='font-medium text-[18px] hover:text-blue-500'>
                        <NavLink to="/transactions" className={({isActive}) => isActive ? "text-blue-500" : "text-black"}>Transactions</NavLink>
                    </li>
                    <li className='font-medium text-[18px] hover:text-blue-500'>
                        <NavLink to="/budget" className={({isActive}) => isActive ? "text-blue-500" : "text-black"}>Budget</NavLink>
                    </li>
                    <li className='font-medium text-[18px] hover:text-blue-500'>
                        <NavLink to="/setting" className={({isActive}) => isActive ? "text-blue-500" : "text-black"}>Setting</NavLink>
                    </li>
                    <Button variant="outlined">{isLogin ? "Logout" : "Logout"}</Button>
                </ul>
            </div>
        </div>
    )
}

export default Navbar
