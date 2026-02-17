"use client"

import * as React from "react"
import { TrendingUp, Users, DollarSign, CreditCard, Activity } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Label } from "recharts"

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

// --- Mock Data ---
const chartData = [
    { month: "January", revenue: 18600, bookings: 8000 },
    { month: "February", revenue: 30500, bookings: 2000 },
    { month: "March", revenue: 23700, bookings: 1200 },
    { month: "April", revenue: 7300, bookings: 1900 },
    { month: "May", revenue: 20900, bookings: 1300 },
    { month: "June", revenue: 21400, bookings: 1400 },
]

const serviceData = [
    { service: "plumbing", visitors: 275, fill: "var(--color-plumbing)" },
    { service: "electrical", visitors: 200, fill: "var(--color-electrical)" },
    { service: "cleaning", visitors: 287, fill: "var(--color-cleaning)" },
    { service: "repairs", visitors: 173, fill: "var(--color-repairs)" },
    { service: "other", visitors: 190, fill: "var(--color-other)" },
]

// --- Chart Configs ---
const barChartConfig = {
    revenue: {
        label: "Revenue",
        color: "#22c55e", // Green-500
    },
    bookings: {
        label: "Bookings",
        color: "#64748b", // Slate-500 (Gray)
    },
} satisfies ChartConfig

const pieChartConfig = {
    visitors: {
        label: "Visitors",
    },
    plumbing: {
        label: "Plumbing",
        color: "var(--chart-1)",
    },
    electrical: {
        label: "Electrical",
        color: "var(--chart-2)",
    },
    cleaning: {
        label: "Cleaning",
        color: "var(--chart-3)",
    },
    repairs: {
        label: "Repairs",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

// --- Stats Data Array ---
const statsData = [
    {
        title: "Total Revenue",
        value: "Rs. 45,231",
        description: "+20.1% from last month",
        icon: DollarSign,
    },
    {
        title: "Total Users",
        value: "12,482",
        description: "+180 new users",
        icon: Users,
    },
    {
        title: "Bookings",
        value: "1,204",
        description: "+19% month over month",
        icon: CreditCard,
    },
    {
        title: "Active Now",
        value: "573",
        description: "+201 since last hour",
        icon: Activity,
    },
]

export default function AdminDashboard() {
    const totalVisitors = React.useMemo(() => {
        return serviceData.reduce((acc, curr) => acc + curr.visitors, 0)
    }, [])

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
                {/* Bar Chart - Revenue & Bookings */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Revenue & Bookings</CardTitle>
                        <CardDescription>January - June 2024</CardDescription>
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
                                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing total revenue and bookings for the last 6 months
                        </div>
                    </CardFooter>
                </Card>

                {/* Pie Chart - Service Distribution */}
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Service Distribution</CardTitle>
                        <CardDescription>Jan - Jun 2024</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer
                            config={pieChartConfig}
                            className="mx-auto aspect-square max-h-[600px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
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
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {totalVisitors.toLocaleString()}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={(viewBox.cy || 0) + 24}
                                                            className="fill-muted-foreground"
                                                        >
                                                            Services
                                                        </tspan>
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
                    <CardFooter className="flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium leading-none">
                            Cleaning is trending up by 5.2% <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Showing total service requests distribution
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
