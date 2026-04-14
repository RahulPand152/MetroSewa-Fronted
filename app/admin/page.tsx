"use client"

import * as React from "react"
import { TrendingUp, Users, DollarSign, CreditCard, Activity, Loader2 } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Label } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import axiosInstance from "@/src/lib/axios"

// --- Chart Configs ---
const barChartConfig = {
    revenue: {
        label: "Revenue",
        color: "#22c55e", // Green
    },
    users: {
        label: "New Users",
        color: "#3b82f6", // Blue
    },
} satisfies ChartConfig

export default function AdminDashboard() {
    const [dashboardStats, setDashboardStats] = React.useState<any>(null)
    const [analytics, setAnalytics] = React.useState<any>(null)
    const [recentUsers, setRecentUsers] = React.useState<any[]>([])
    const [recentBookings, setRecentBookings] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [statsRes, analyticsRes, usersRes, bookingsRes] = await Promise.all([
                    axiosInstance.get("/admin/dashboard"),
                    axiosInstance.get("/admin/analytics"),
                    axiosInstance.get("/admin/users"),
                    axiosInstance.get("/admin/bookings?limit=5")
                ])

                setDashboardStats(statsRes.data?.data || statsRes.data)
                setAnalytics(analyticsRes.data?.data || analyticsRes.data)
                
                // Get all users and limit to 5 on frontend
                const allUsers = usersRes.data?.data || usersRes.data || []
                setRecentUsers(allUsers.slice(0, 5))
                
                // Bookings are already limited by backend query parameter
                setRecentBookings(bookingsRes.data?.data || bookingsRes.data || [])

            } catch (error) {
                console.error("Failed to load admin dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAllData()
    }, [])

    const statsData = dashboardStats ? [
        {
            title: "Total Revenue",
            value: `Rs. ${dashboardStats.totalRevenue?.toLocaleString() || 0}`,
            description: "Total booked amount",
            icon: DollarSign,
        },
        {
            title: "Total Users",
            value: dashboardStats.totalUsers?.toLocaleString() || "0",
            description: "Registered customers",
            icon: Users,
        },
        {
            title: "Bookings",
            value: dashboardStats.totalBookings?.toLocaleString() || "0",
            description: `${dashboardStats.completedBookings || 0} completed`,
            icon: CreditCard,
        },
        {
            title: "Services",
            value: dashboardStats.totalServices?.toLocaleString() || "0",
            description: `Across ${dashboardStats.totalCategories || 0} categories`,
            icon: Activity,
        },
    ] : []

    // Map analytics data into charts
    const chartData = React.useMemo(() => {
        if (!analytics) return []
        
        const revMonths = Object.keys(analytics.revenueByMonth || {})
        const userMonths = Object.keys(analytics.usersByMonth || {})
        const allMonths = Array.from(new Set([...revMonths, ...userMonths]))
        
        return allMonths.map(month => ({
            month,
            revenue: analytics.revenueByMonth?.[month] || 0,
            users: analytics.usersByMonth?.[month] || 0
        }))
    }, [analytics])

    const serviceData = React.useMemo(() => {
        if (!analytics?.servicesByCategory) return []
        
        return analytics.servicesByCategory.map((item: any, i: number) => {
            // Transform category into a valid CSS variable key (e.g. "Air Conditioning" -> "airconditioning")
            const safeKey = item.category.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || `category${i}`
            return {
                service: safeKey,
                displayName: item.category,
                visitors: Math.max(item.count || 0, 1), // Minimum of 1 so it always visually renders
                actualCount: item.count || 0,
                services: item.services || [], // Add the list of services directly from backend if available
                fill: `var(--color-${safeKey})`
            }
        })
    }, [analytics])

    const totalVisitors = React.useMemo(() => {
        // Show the true count in the center of the pie
        return serviceData.reduce((acc: number, curr: any) => acc + curr.actualCount, 0)
    }, [serviceData])

    const pieChartConfig = React.useMemo(() => {
        const config: Record<string, any> = {
            visitors: { label: "Services" }
        }
        serviceData.forEach((s: any, i: number) => {
            config[s.service] = {
                label: s.displayName, // Display original name in legend & tooltip
                color: `var(--chart-${(i % 5) + 1})`
            }
        })
        return config satisfies ChartConfig
    }, [serviceData])

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-sm text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Stats Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statsData.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Bar Chart - Revenue & Users */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Revenue & New Users</CardTitle>
                        <CardDescription>Metrics over the last few months</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer config={barChartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart - Service Distribution */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Service Distribution</CardTitle>
                        <CardDescription>Available services by category</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={pieChartConfig}
                            className="mx-auto aspect-square max-h-[600px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="rounded-lg border bg-white p-3 shadow-md dark:bg-slate-950 sm:min-w-[12rem]">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                                                        {data.displayName}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        Total Services: <span className="font-semibold text-slate-900 dark:text-white">{data.actualCount}</span>
                                                    </p>
                                                    {data.services && data.services.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {data.services.map((name: string, idx: number) => (
                                                                <Badge key={idx} variant="outline" className="text-[10px] py-0">{name}</Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Pie
                                    data={serviceData}
                                    dataKey="visitors"
                                    nameKey="service"
                                    innerRadius={70}
                                    outerRadius={100}
                                    strokeWidth={2}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="service" />}
                                    className="-translate-y-2 flex-col gap-2 items-start"
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings and Users */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Bookings */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest 5 service bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-6">
                             {recentBookings.length > 0 ? recentBookings.map((b) => (
                                  <div key={b.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                             <AvatarFallback className="bg-sky-50 text-sky-600 font-semibold">
                                                {b.user?.firstName?.charAt(0) || "U"}
                                             </AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="text-sm font-semibold text-slate-800">{b.user?.firstName} {b.user?.lastName}</p>
                                              <p className="text-xs text-muted-foreground mt-0.5">{b.service?.name || "Unknown Service"}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <Badge variant={b.status === "COMPLETED" ? "default" : "secondary"} className="shadow-sm">
                                              {b.status}
                                          </Badge>
                                          <p className="text-xs text-muted-foreground mt-1.5 font-medium">Rs. {b.amount || b.service?.price || 0}</p>
                                      </div>
                                  </div>
                             )) : (
                                <div className="text-sm text-slate-500 py-4 text-center">No recent bookings</div>
                             )}
                         </div>
                    </CardContent>
                </Card>

                {/* Recent Users */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                        <CardDescription>Latest 5 registered customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-6">
                             {recentUsers.length > 0 ? recentUsers.map((u) => (
                                  <div key={u.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                             <AvatarImage src={u.avatar} />
                                             <AvatarFallback className="bg-emerald-50 text-emerald-600 font-semibold">
                                                {u.firstName?.charAt(0) || "U"}
                                             </AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="text-sm font-semibold text-slate-800">{u.firstName} {u.lastName}</p>
                                              <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <p className="text-sm font-bold text-slate-700">{u._count?.bookings || 0} <span className="font-normal text-xs text-slate-500">Bookings</span></p>
                                          <p className="text-xs text-muted-foreground mt-1.5">{new Date(u.createdAt).toLocaleDateString()}</p>
                                      </div>
                                  </div>
                             )) : (
                                <div className="text-sm text-slate-500 py-4 text-center">No recent users</div>
                             )}
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
