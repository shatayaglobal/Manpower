// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   Calendar,
//   LogIn,
//   LogOut,
//   Coffee,
//   AlertCircle,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   ChevronRight,
//   User,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useWorkforce } from "@/lib/redux/use-workforce";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/lib/redux/useAuth";

// const StaffPortalPage: React.FC = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
//   const [isClocking, setIsClocking] = useState(false);

//   const router = useRouter();
//   const { user } = useAuth();

//   const {
//     myStaffProfile,
//     myShifts,
//     myHoursCards,
//     todayHoursCard,
//     staffLoading,
//     loadMyStaffProfile,
//     loadMyShifts,
//     loadMyHoursCards,
//     clockIn,
//     clockOut,
//     startBreak,
//     endBreak,
//   } = useWorkforce();

//   useEffect(() => {
//     // Update clock every second
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (user) {
//       loadMyStaffProfile();
//       loadMyShifts();
//       loadMyHoursCards();
//     }
//   }, [user, loadMyStaffProfile, loadMyShifts, loadMyHoursCards]);

//   const handleClockIn = async () => {
//     setIsClocking(true);
//     try {
//       await clockIn();
//       toast.success("Clocked in successfully!");
//       loadMyHoursCards();
//     } catch (error: any) {
//       toast.error(error.response?.data?.detail || "Failed to clock in");
//     } finally {
//       setIsClocking(false);
//     }
//   };

//   const handleClockOut = async () => {
//     setIsClocking(true);
//     try {
//       await clockOut();
//       toast.success("Clocked out successfully!");
//       loadMyHoursCards();
//     } catch (error: any) {
//       toast.error(error.response?.data?.detail || "Failed to clock out");
//     } finally {
//       setIsClocking(false);
//     }
//   };

//   const handleStartBreak = async () => {
//     setIsClocking(true);
//     try {
//       await startBreak();
//       toast.success("Break started");
//       loadMyHoursCards();
//     } catch (error: any) {
//       toast.error(error.response?.data?.detail || "Failed to start break");
//     } finally {
//       setIsClocking(false);
//     }
//   };

//   const handleEndBreak = async () => {
//     setIsClocking(true);
//     try {
//       await endBreak();
//       toast.success("Break ended");
//       loadMyHoursCards();
//     } catch (error: any) {
//       toast.error(error.response?.data?.detail || "Failed to end break");
//     } finally {
//       setIsClocking(false);
//     }
//   };

//   const formatTime = (date: Date) => {
//     return date.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: true
//     });
//   };

//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const getTodayShifts = () => {
//     const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
//     return myShifts.filter(shift => shift.day_of_week === today && shift.is_active);
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
//       PENDING: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
//       APPROVED: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
//       REJECTED: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
//       REVISED: { bg: "bg-blue-100", text: "text-blue-800", label: "Needs Revision" },
//     };

//     const config = statusConfig[status] || statusConfig.PENDING;
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const calculateWorkedHours = () => {
//     if (!todayHoursCard?.clock_in) return "0:00";

//     const clockInTime = new Date(`${todayHoursCard.date}T${todayHoursCard.clock_in}`);
//     const now = new Date();
//     const diff = now.getTime() - clockInTime.getTime();
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}:${minutes.toString().padStart(2, '0')}`;
//   };

//   const isOnBreak = todayHoursCard?.break_start && !todayHoursCard?.break_end;
//   const isClockedIn = todayHoursCard?.clock_in && !todayHoursCard?.clock_out;

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
//           <p className="text-gray-600 mb-8">You need to be logged in to access the staff portal.</p>
//           <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700 text-white">
//             Go to Login
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (staffLoading && !myStaffProfile) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//       </div>
//     );
//   }

//   if (!myStaffProfile) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">No Staff Profile Found</h2>
//           <p className="text-gray-600 mb-8">
//             You need to be added as a staff member by your employer to use this portal.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const todayShifts = getTodayShifts();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Staff Portal</h1>
//           <p className="text-gray-600 mt-1">Welcome back, {myStaffProfile.name}!</p>
//         </div>

//         {/* Current Time Card */}
//         <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 text-white mb-8 shadow-lg">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="text-5xl font-bold mb-2">{formatTime(currentTime)}</div>
//               <div className="text-blue-100 text-lg">{formatDate(currentTime)}</div>
//             </div>
//             <Clock className="w-20 h-20 text-blue-200 opacity-50" />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//           {/* Clock Actions Card */}
//           <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
//             <h2 className="text-xl font-semibold text-gray-900 mb-6">Time Clock</h2>

//             {/* Current Status */}
//             {isClockedIn && (
//               <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-green-800 font-medium">Currently Clocked In</p>
//                     <p className="text-2xl font-bold text-green-900 mt-1">
//                       {calculateWorkedHours()}
//                     </p>
//                     <p className="text-xs text-green-700 mt-1">
//                       Started at {todayHoursCard?.clock_in}
//                     </p>
//                   </div>
//                   <CheckCircle className="w-12 h-12 text-green-600" />
//                 </div>
//               </div>
//             )}

//             {/* Break Status */}
//             {isOnBreak && (
//               <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm text-yellow-800 font-medium">On Break</p>
//                     <p className="text-xs text-yellow-700 mt-1">
//                       Started at {todayHoursCard?.break_start}
//                     </p>
//                   </div>
//                   <Coffee className="w-8 h-8 text-yellow-600" />
//                 </div>
//               </div>
//             )}

//             {/* Clock Actions */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {!isClockedIn ? (
//                 <Button
//                   onClick={handleClockIn}
//                   disabled={isClocking}
//                   className="h-24 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
//                   size="lg"
//                 >
//                   {isClocking ? (
//                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                   ) : (
//                     <LogIn className="w-6 h-6 mr-2" />
//                   )}
//                   Clock In
//                 </Button>
//               ) : (
//                 <Button
//                   onClick={handleClockOut}
//                   disabled={isClocking || isOnBreak}
//                   className="h-24 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold"
//                   size="lg"
//                 >
//                   {isClocking ? (
//                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                   ) : (
//                     <LogOut className="w-6 h-6 mr-2" />
//                   )}
//                   Clock Out
//                 </Button>
//               )}

//               {isClockedIn && !isOnBreak && (
//                 <Button
//                   onClick={handleStartBreak}
//                   disabled={isClocking}
//                   variant="outline"
//                   className="h-24 text-lg font-semibold"
//                   size="lg"
//                 >
//                   {isClocking ? (
//                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                   ) : (
//                     <Coffee className="w-6 h-6 mr-2" />
//                   )}
//                   Start Break
//                 </Button>
//               )}

//               {isOnBreak && (
//                 <Button
//                   onClick={handleEndBreak}
//                   disabled={isClocking}
//                   variant="outline"
//                   className="h-24 text-lg font-semibold border-green-600 text-green-600 hover:bg-green-50"
//                   size="lg"
//                 >
//                   {isClocking ? (
//                     <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                   ) : (
//                     <CheckCircle className="w-6 h-6 mr-2" />
//                   )}
//                   End Break
//                 </Button>
//               )}
//             </div>
//           </div>

//           {/* Profile Card */}
//           <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
//             <div className="flex items-center mb-4">
//               <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mr-4">
//                 {myStaffProfile.name.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">{myStaffProfile.name}</h3>
//                 <p className="text-sm text-gray-600">{myStaffProfile.job_title}</p>
//               </div>
//             </div>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Department:</span>
//                 <span className="font-medium text-gray-900">{myStaffProfile.department || 'N/A'}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Employee ID:</span>
//                 <span className="font-medium text-gray-900">{myStaffProfile.staff_id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Status:</span>
//                 <span className={`font-medium ${myStaffProfile.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'}`}>
//                   {myStaffProfile.status}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Today's Shifts */}
//         <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//             <Calendar className="w-5 h-5 mr-2" />
//             Today's Shifts
//           </h2>
//           {todayShifts.length === 0 ? (
//             <p className="text-gray-600 text-center py-8">No shifts scheduled for today</p>
//           ) : (
//             <div className="space-y-3">
//               {todayShifts.map((shift) => (
//                 <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div>
//                     <h3 className="font-medium text-gray-900">{shift.name}</h3>
//                     <p className="text-sm text-gray-600">
//                       {shift.start_time} - {shift.end_time}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       {shift.shift_type.charAt(0) + shift.shift_type.slice(1).toLowerCase().replace('_', ' ')}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Recent Hours */}
//         <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Hours</h2>
//           {myHoursCards.length === 0 ? (
//             <p className="text-gray-600 text-center py-8">No hours recorded yet</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Clock In/Out
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Total Hours
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {myHoursCards.slice(0, 10).map((hours) => (
//                     <tr key={hours.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {new Date(hours.date).toLocaleDateString()}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {new Date(hours.date).toLocaleDateString('en-US', { weekday: 'short' })}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {hours.clock_in} - {hours.clock_out || 'In Progress'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-semibold text-gray-900">
//                           {hours.total_hours_decimal?.toFixed(2) || '0.00'} hrs
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {getStatusBadge(hours.status)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StaffPortalPage;
