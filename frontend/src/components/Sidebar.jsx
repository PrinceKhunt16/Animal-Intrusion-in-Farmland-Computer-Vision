import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiHome2Line } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import { PiAddressBookLight } from "react-icons/pi";
import { PiNewspaperClippingLight } from "react-icons/pi";
import { MdOutlineSegment } from "react-icons/md";

const Sidebar = ({ ml, setMl }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isText, setIsText] = useState(false);
    const isActive = (path) => location.pathname === path ? 'active-link text-black' : '';

    const toggleMenu = () => {
        setIsOpen(!isOpen);

        if (isOpen) {
            setTimeout(() => {
                setIsText(!isText);
            }, 200);
        } else {
            setIsText(!isText);
        }

        setMl(!isOpen ? 14 : 64);
    }

    useEffect(() => {
        setMl(isOpen ? 14 : 64);
    }, [isOpen]);

    return (
        <div className={`min-w-14 h-screen bg-gradient-to-b from-gray-800 to-gray-600/90 text-white fixed top-0 flex flex-col ${isOpen ? 'w-14' : 'w-64'} transition-all duration-200`}>
            <div className="h-[70px] pl-4 pt-2 pr-4 pb-2 text-white flex items-center gap-3 relative">
                <button onClick={toggleMenu} className="text-white">
                    <MdOutlineSegment className='w-[22px]' size={22} />
                </button>
                <div>
                    <img
                        src="assets/l2.png"
                        alt="AIiF"
                        className={`h-[33px] border border-white transition-all duration-100 transform ${!isText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} ease-in-out`}
                    />
                </div>
            </div>
            <ul className="list-none flex-1">
                <li className={`h-[52px] flex items-center mb-2 px-4 ${isActive('/')}`}>
                    <Link
                        to="/"
                        className={`flex items-center gap-3 w-full text-lg cursor-pointer py-3 font-light relative`}
                    >
                        <RiHome2Line size={22} color={`${isActive('/') && "black"}`} />
                        <span
                            className={`font-medium transition-text duration-100 transform absolute ${!isText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-5px]'} ease-in-out`}
                            style={{ visibility: !isText ? 'visible' : 'hidden', left: '35px' }}
                        >
                            Home
                        </span>
                    </Link>
                </li>
                <li className={`h-[52px] flex items-center mb-2 px-4 ${isActive('/settings')}`}>
                    <Link
                        to="/settings"
                        className={`flex items-center gap-3 w-full text-lg cursor-pointer py-3 font-light relative`}
                    >
                        <IoIosSettings size={22} color={`${isActive('/settings') && "black"}`} />
                        <span
                            className={`font-medium transition-text duration-100 transform absolute ${!isText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-5px]'} ease-in-out`}
                            style={{ visibility: !isText ? 'visible' : 'hidden', left: '35px' }}
                        >
                            Setting
                        </span>
                    </Link>
                </li>
                <li className={`h-[52px] flex items-center mb-2 px-4 ${isActive('/about')}`}>
                    <Link
                        to="/about"
                        className={`flex items-center gap-3 w-full text-lg cursor-pointer py-3 font-light relative`}
                    >
                        <PiNewspaperClippingLight size={22} color={`${isActive('/about') && "black"}`} />
                        <span
                            className={`font-medium transition-text duration-100 transform absolute ${!isText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-5px]'} ease-in-out`}
                            style={{ visibility: !isText ? 'visible' : 'hidden', left: '35px' }}
                        >
                            About
                        </span>
                    </Link>
                </li>
            </ul>
            <div className={`mt-auto`}>
                <li className={`h-[52px] flex items-center mb-2 px-4 ${isActive('/profile')}`}>
                    <Link
                        to="/profile"
                        className={`flex items-center gap-3 w-full text-lg cursor-pointer py-3 font-light relative`}
                    >
                        <PiAddressBookLight size={22} color={`${isActive('/profile') && "black"}`} />
                        <span
                            className={`font-medium transition-text duration-100 transform absolute ${!isText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-5px]'} ease-in-out`}
                            style={{ visibility: !isText ? 'visible' : 'hidden', left: '35px' }}
                        >
                            Profile
                        </span>
                    </Link>
                </li>
            </div>
        </div>
    )
}

export default Sidebar