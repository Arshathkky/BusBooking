import React, { useState, useEffect } from "react";
import { 
    TrendingUp, 
    Calendar, 
    Download, 
    Filter, 
    BarChart3, 
    PieChart, 
    ArrowUpRight, 
    ArrowDownRight,
    Users,
    DollarSign,
    Bus
} from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://bus-booking-nt91.onrender.com/api";

interface ReportsTabProps {
    ownerId: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ ownerId }) => {
    const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = "";
            if (reportType === "daily") {
                url = `${BASE_URL}/reports/daily?date=${selectedDate}&ownerId=${ownerId}`;
            } else {
                url = `${BASE_URL}/reports/aggregated?type=${reportType}&ownerId=${ownerId}`;
            }
            const res = await axios.get(url);
            setReportData(res.data);
        } catch (error) {
            console.error("Fetch report error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType, selectedDate]);

    const stats = [
        { label: "Total Revenue", value: `LKR ${reportData?.summary?.totalRevenue || 0}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
        { label: "Total Bookings", value: reportData?.summary?.totalBookings || 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Seats Sold", value: reportData?.summary?.totalSeats || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Active Buses", value: "8", icon: Bus, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-[#fdc106]" />
                        Business Analytics
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Monitor your performance and revenue trends</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                        {(["daily", "weekly", "monthly", "yearly"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setReportType(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                    reportType === t 
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {reportType === "daily" && (
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm font-bold focus:ring-2 focus:ring-[#fdc106]"
                        />
                    )}

                    <button className="flex items-center gap-2 px-4 py-2 bg-[#fdc106] text-gray-900 rounded-xl font-bold text-sm hover:bg-[#e6ad05] transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                                <ArrowUpRight className="w-4 h-4" />
                                12.5%
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold">Revenue Performance</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#fdc106]"></div> Online
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div> Offline
                            </div>
                        </div>
                    </div>
                    
                    {/* Visual Chart Rendering */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {(() => {
                            const statsObj = reportData?.stats || {};
                            const dates = Object.keys(statsObj).sort();
                            const maxRevenue = Math.max(...Object.values(statsObj).map((s: any) => s.revenue), 10000);
                            
                            // If no data, show empty placeholders
                            const items = dates.length > 0 ? dates : Array.from({ length: 12 }, (_, i) => `Empty ${i}`);
                            
                            return items.map((date, i) => {
                                const h = dates.length > 0 ? (statsObj[date].revenue / maxRevenue) * 100 : 20;
                                return (
                                    <div key={i} className="flex-1 space-y-2 group relative">
                                        <div 
                                            className="w-full bg-[#fdc106]/20 group-hover:bg-[#fdc106]/40 rounded-t-lg transition-all flex flex-col justify-end overflow-hidden" 
                                            style={{ height: `${Math.max(h, 5)}%` }}
                                        >
                                            <div 
                                                className="w-full bg-[#fdc106] rounded-t-sm transition-all" 
                                                style={{ height: `70%` }}
                                            ></div>
                                        </div>
                                        <div className="text-[9px] text-gray-400 font-bold text-center truncate max-w-[40px]">
                                            {dates.length > 0 ? date.split('-').slice(1).join('/') : "-"}
                                        </div>
                                        
                                        {/* Hover Tooltip */}
                                        {dates.length > 0 && (
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                                LKR {statsObj[date].revenue}
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Booking Breakdown */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-8">Booking Status</h3>
                    <div className="space-y-6">
                        {[
                            { label: "Completed", count: reportData?.summary?.paidBookings || 0, color: "bg-green-500" },
                            { label: "Pending", count: reportData?.summary?.pendingBookings || 0, color: "bg-blue-500" },
                            { label: "Cancelled", count: 12, color: "bg-red-500" },
                            { label: "Blocked", count: reportData?.summary?.blockedBookings || 0, color: "bg-gray-500" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${item.color}`} 
                                        style={{ width: `${(item.count / (reportData?.summary?.totalBookings || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                        <PieChart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 font-medium italic">Detailed category breakdown available in export</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
