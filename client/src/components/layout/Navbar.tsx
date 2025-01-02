import { connectPrinter } from "@/lib/printer/printer";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import {
 Dropdown,
 DropdownItem,
 DropdownMenu,
 DropdownTrigger,
 User,
 Switch,
} from "@nextui-org/react";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import FlexContainer from "./FlexContainer";
import NotificationCenter from "./NotificationCenter";
import toast from "react-hot-toast";
import axios from "axios";

const Navbar = () => {
 const {
   user,
   setUser,
   selectedRestaurant,
   isConnected,
   setIsConnected,
   error,
   setError,
   device,
   setDevice,
 } = useGlobalContext();

 const navigate = useNavigate();

 const [swiggyToggle, setSwiggyToggle] = useState(true);
 const [zomatoToggle, setZomatoToggle] = useState(true);

 const handleLogout = () => {
   localStorage.removeItem("_session");
   setUser(null);
   navigate("/auth/login");
 };

 const handleOutletToggle = async (platform: 'swiggy' | 'zomato', isToggled: boolean) => {
   const now = new Date();
   now.setMinutes(now.getMinutes() + 5);

   const platformIds = {
     swiggy: '964669',
     zomato: '21457286'
   };

   if (!isToggled) {
     try {
       const response = await axios.post(
         `${import.meta.env.VITE_CHANNEL_API_URL}/api/v1/${platform}/close_outlet/${platformIds[platform]}`,
         {}, 
         {
           params: {
             date: now.getDate(),
             month: now.getMonth() + 1,
             year: now.getFullYear(),
             hour: now.getHours(),
             min: now.getMinutes(),
             sec: now.getSeconds()
           },
           headers: {
             'accept': 'application/json'
           }
         }
       );

       toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} outlet closed successfully`);
       
       if (platform === 'swiggy') {
         setSwiggyToggle(false);
       } else {
         setZomatoToggle(false);
       }
     } catch (error: any) {
       if (error.response && error.response.status === 403) {
         toast.error('Access Denied. Please check your permissions.');
       } else {
         toast.error(`Failed to close ${platform} outlet`);
       }
       console.error(error);
     }
   } else {
     if (platform === 'swiggy') {
       setSwiggyToggle(true);
     } else {
       setZomatoToggle(true);
     }
   }
 };

 return (
   <FlexContainer
     variant="row-end"
     alignItems="center"
     className={"p-5 w-full border-b h-[80px] bg-white"}
   >
     <Dropdown>
       <DropdownTrigger>
         <Button 
           variant="outline" 
           className="flex items-center justify-between w-[150px] mr-auto"
         >
           Outlet
           <ChevronDown className="ml-2 h-4 w-4" />
         </Button>
       </DropdownTrigger>
       <DropdownMenu aria-label="Outlet List">
         <DropdownItem 
           key="swiggy" 
           className="flex justify-between items-center"
         >
           Swiggy
           <Switch
             isSelected={swiggyToggle}
             onValueChange={(isSelected) => handleOutletToggle('swiggy', isSelected)}
             color="success"
           />
         </DropdownItem>
         <DropdownItem 
           key="zomato" 
           className="flex justify-between items-center"
         >
           Zomato
           <Switch
             isSelected={zomatoToggle}
             onValueChange={(isSelected) => handleOutletToggle('zomato', isSelected)}
             color="success"
           />
         </DropdownItem>
       </DropdownMenu>
     </Dropdown>

     <Button
       variant={"secondary"}
       className="bg-black hover:bg-zinc-800 text-white"
     >
       {selectedRestaurant?.restaurantName} Restaurant
     </Button>

     <Button
       variant={isConnected ? "outline" : "destructive"}
       size={"sm"}
       className={cn(
         isConnected && !error && "text-green-700 border-green-500 shadow-none"
       )}
       onClick={() =>
         connectPrinter({
           setDevice,
           setIsConnected,
           setError,
         })
       }
     >
       {isConnected && !error && "Printer is Online"}
       {!isConnected && !error && "Printer is Offline"}
       {error && error.length > 25 ? error.slice(0, 25) + "..." : error}
     </Button>

     <NotificationCenter />

     {user && (
       <Dropdown placement="bottom-end">
         <DropdownTrigger>
           <User
             name={`${user.fname} ${user.lname}`}
             description={user.role}
             avatarProps={{
               src: user.profile_pic,
             }}
             className="cursor-pointer p-2 bg-zinc-100 rounded-2xl"
           />
         </DropdownTrigger>
         <DropdownMenu aria-label="profile_actions" variant="flat">
           <DropdownItem
             key="profile"
             onPress={() => {
               navigate("/profile");
             }}
           >
             My Profile
           </DropdownItem>
           <DropdownItem key="logout" onPress={handleLogout}>
             Logout
           </DropdownItem>
         </DropdownMenu>
       </Dropdown>
     )}
   </FlexContainer>
 );
};

export default Navbar;