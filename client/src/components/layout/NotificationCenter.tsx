import React, { useState, useEffect } from "react";
import { Button, Select, SelectItem } from "@nextui-org/react";
import { Bell, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import io from 'socket.io-client';

interface Notification {
 id: string;
 message: string;
 timestamp: string;
 type?: 'order' | 'system' | 'alert';
 vendor?: 'swiggy' | 'zomato';
 orderId: string;
 itemId?: string;
 orderDetails?: any;
 status?: 'pending' | 'accepted' | 'ready';
 prepTime?: number;
 remainingTime?: number;
 timerStarted?: boolean;
 selectedTime?: number;
}

interface NotificationCenterProps {
 // You might want to pass any necessary props here
}

const NotificationCenter: React.FC<NotificationCenterProps> = () => {
 const [notifications, setNotifications] = useState<Notification[]>(() => {
   const savedNotifications = localStorage.getItem('notifications');
   return savedNotifications ? JSON.parse(savedNotifications) : [];
 });
 const [unreadCount, setUnreadCount] = useState(0);
 const [isNotificationOpen, setIsNotificationOpen] = useState(false);

 // Effect to update localStorage when notifications change
 useEffect(() => {
   localStorage.setItem('notifications', JSON.stringify(notifications));
   setUnreadCount(notifications.filter(n => n.status !== 'ready').length);
 }, [notifications]);

 // Timer effect for tracking order preparation time
 useEffect(() => {
   const timers = notifications
     .filter(n => n.status === 'accepted' && !n.timerStarted)
     .map(notification => {
       const timer = setInterval(() => {
         setNotifications(prev => 
           prev.map(n => {
             if (n.id === notification.id) {
               const newRemainingTime = (n.remainingTime || (n.prepTime || 0) * 60) - 1;
               
               if (newRemainingTime <= 0) {
                 // Stop the timer when time is up
                 clearInterval(timer);
                 return { 
                   ...n, 
                   remainingTime: 0, 
                   timerStarted: false 
                 };
               }
               
               return { 
                 ...n, 
                 remainingTime: newRemainingTime, 
                 timerStarted: true 
               };
             }
             return n;
           })
         );
       }, 1000);

       return timer;
     });

   // Cleanup timers
   return () => {
     timers.forEach(timer => clearInterval(timer));
   };
 }, [notifications]);

 // Socket connection and notification handling
 useEffect(() => {
   const socket = io('https://rmsapis.appostel.com', {
     transports: ['websocket'],
     reconnection: true,
     reconnectionAttempts: 5,
     reconnectionDelay: 1000
   });

   socket.on('connect', () => {
     console.group('🟢 SOCKET CONNECTION');
     console.log('Connected Successfully');
     console.log('Socket ID:', socket.id);
     console.groupEnd();
   });

   socket.on('newOrder', (data: any) => {
     console.group('🔔 NEW ORDER RECEIVED');
     console.log('Raw Data:', JSON.stringify(data, null, 2));
     
     if (!data || !data.orders) {
       console.error('Invalid order data received');
       console.groupEnd();
       return;
     }

     console.log('Orders Count:', data.orders.length);
     
     const newNotifications: Notification[] = data.orders.map((order: any) => ({
       id: order.orderId.toString(),
       orderId: order.orderId.toString(),
       message: `New order received: ${order.vendor} - ${order.name} (₹${order.total.toFixed(2)})`,
       timestamp: new Date(data.timestamp || Date.now()).toLocaleString(),
       type: 'order',
       vendor: order.vendor.toLowerCase() as 'swiggy' | 'zomato',
       itemId: order.itemId,
       orderDetails: order,
       status: 'pending'
     }));

     setNotifications(prev => [...newNotifications, ...prev]);
   });

   socket.on('connect_error', (error) => {
     console.error('🔴 SOCKET: Connection Error', error);
   });

   socket.on('disconnect', (reason) => {
     console.log('🟠 SOCKET: Disconnected', reason);
   });

   return () => {
     socket.disconnect();
   };
 }, []);

 const clearNotifications = () => {
   setNotifications([]);
   localStorage.removeItem('notifications');
   setUnreadCount(0);
   setIsNotificationOpen(false);
 };

 const toggleNotifications = () => {
   setIsNotificationOpen(!isNotificationOpen);
 };

 const handleRejectOrder = async (notification: Notification) => {
   try {
     if (!notification.itemId) {
       toast.error('No item ID found for this order');
       return;
     }

     const response = await axios.post(
       `${import.meta.env.VITE_CHANNEL_API_URL}/api/v1/${notification.vendor}/items/outofstock`, 
       {},
       {
         params: {
           item_id: notification.itemId
         },
         headers: {
           'accept': 'application/json'
         }
       }
     );

     setNotifications(prev => prev.filter(n => n.id !== notification.id));
     toast.success(`Order ${notification.id} rejected`);
   } catch (error: any) {
     console.error('Error rejecting order:', error);
     toast.error(`Failed to reject order ${notification.id}`);
   }
 };

 const handleAcceptOrder = async (notification: Notification, prepTime: number) => {
   try {
     const response = await axios.post(
       `${import.meta.env.VITE_CHANNEL_API_URL}/api/v1/${notification.vendor}/orders/accept`, 
       {},
       {
         params: {
           order_id: notification.id,
           prep_time: prepTime
         },
         headers: {
           'accept': 'application/json'
         }
       }
     );

     setNotifications(prev => 
       prev.map(n => 
         n.id === notification.id 
           ? { 
               ...n, 
               status: 'accepted', 
               prepTime: prepTime,
               remainingTime: prepTime * 60,  // Convert minutes to seconds
               timerStarted: false,  // Will be set to true by timer effect
               selectedTime: prepTime  // Add this to track the selected time
             } 
           : n
       )
     );

     toast.success(`Order ${notification.id} accepted with ${prepTime} minutes preparation time`);
   } catch (error: any) {
     console.error('Error accepting order:', error);
     toast.error(`Failed to accept order ${notification.id}`);
   }
 };

 const handleMarkAsReady = async (notification: Notification) => {
   try {
     const response = await axios.post(
       `${import.meta.env.VITE_CHANNEL_API_URL}/api/v1/${notification.vendor}/orders/ready`, 
       {},
       {
         params: {
           order_id: notification.id
         },
         headers: {
           'accept': 'application/json'
         }
       }
     );

     setNotifications(prev => 
       prev.filter(n => n.id !== notification.id)
     );

     toast.success(`Order ${notification.id} marked as ready`);
   } catch (error: any) {
     console.error('Error marking order as ready:', error);
     toast.error(`Failed to mark order ${notification.id} as ready`);
   }
 };

 const renderOrderActions = (notification: Notification) => {
   if (notification.status === 'pending') {
     return (
       <>
         <Button
           className="bg-green-500 hover:bg-green-600 text-white"
           onClick={() => handleAcceptOrder(notification, 15)}
         >
           Accept
         </Button>
         <Button
           className="bg-red-500 hover:bg-red-600 text-white"
           onClick={() => handleRejectOrder(notification)}
         >
           Reject
         </Button>
       </>
     );
   }

   if (notification.status === 'accepted') {
     // If no timer has been started, show time selection buttons
     if (!notification.timerStarted) {
       return (
         <div className="flex items-center space-x-2">
           <Button
             className={`${notification.selectedTime === 10
                 ? 'bg-blue-500 text-white'
                 : 'bg-gray-200 text-gray-700'
               }`}
             onClick={() => handleAcceptOrder(notification, 10)}
           >
             10
           </Button>
           <Button
             className={`${notification.selectedTime === 15
                 ? 'bg-blue-500 text-white'
                 : 'bg-gray-200 text-gray-700'
               }`}
             onClick={() => handleAcceptOrder(notification, 15)}
           >
             15
           </Button>
           <Select
             placeholder="Custom"
             className="w-24"
             onSelectionChange={(keys) => {
               const selectedTime = Array.from(keys)[0] as string;
               handleAcceptOrder(notification, parseInt(selectedTime));
             }}
           >
             {[20, 25, 30, 50].map((time) => (
               <SelectItem key={time} value={time}>
                 {time}
               </SelectItem>
             ))}
           </Select>
         </div>
       );
     }

     // If timer is running
     if (notification.remainingTime !== undefined && notification.remainingTime > 0) {
       const minutes = Math.floor((notification.remainingTime || 0) / 60);
       const seconds = (notification.remainingTime || 0) % 60;
       
       return (
         <div className="flex items-center space-x-2">
           <div className="flex items-center bg-blue-100 px-2 py-1 rounded">
             <Clock className="mr-2 w-4 h-4" />
             <span>{`${minutes}:${seconds.toString().padStart(2, '0')}`}</span>
           </div>
           <Button
             className="bg-blue-500 hover:bg-blue-600 text-white"
             onClick={() => handleMarkAsReady(notification)}
           >
             Mark as Ready
           </Button>
         </div>
       );
     }

     // Fallback (shouldn't happen, but just in case)
     return null;
   }

   return null;
 };

 return (
   <div className="relative">
     <button 
       onClick={toggleNotifications} 
       className="relative p-2 bg-zinc-100 rounded-full"
     >
       <Bell className="w-4 h-4" />
       {unreadCount > 0 && (
         <span className="absolute -top-1 -right-1 text-xs font-medium text-white bg-red-500 rounded-full px-1">
           {unreadCount}
         </span>
       )}
     </button>

     {isNotificationOpen && (
       <div className="absolute right-0 mt-2 w-96 bg-white border rounded-lg shadow-lg z-50">
         <div className="flex justify-between items-center p-4 border-b">
           <h3 className="text-lg font-semibold">Notifications</h3>
           {notifications.length > 0 && (
             <button 
               onClick={clearNotifications} 
               className="text-sm text-red-500"
             >
               Clear All
             </button>
           )}
         </div>

         <div className="max-h-[300px] overflow-y-auto">
           {notifications.length === 0 ? (
             <div className="p-4 text-center text-gray-500">
               No notifications
             </div>
           ) : (
             notifications.map((notification, index) => (
               <div 
                 key={`${notification.id}-${index}`}
                 className="p-4 border-b last:border-b-0"
               >
                 <div className="font-medium">{notification.message}</div>
                 <small className="text-gray-500">
                   {notification.timestamp}
                 </small>
                 <div className="flex items-center justify-between mt-2 space-x-2">
                   {renderOrderActions(notification)}
                 </div>
               </div>
             ))
           )}
         </div>
       </div>
     )}
   </div>
 );
};

export default NotificationCenter;
