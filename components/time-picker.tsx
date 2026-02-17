"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Check } from "lucide-react"

interface TimePickerProps {
    value?: string;
    onChange?: (time: string | null) => void;
}

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
    const [open, setOpen] = useState(false)

    // Temporary state for the picker (only saved on confirm)
    const [tempHour, setTempHour] = useState<string>("10")
    const [tempMinute, setTempMinute] = useState<string>("00")
    const [tempPeriod, setTempPeriod] = useState<string>("AM")

    // Confirmed/saved time value
    const [confirmedTime, setConfirmedTime] = useState<string | null>(value || null)

    const handleOpen = (isOpen: boolean) => {
        if (isOpen && confirmedTime) {
            // Parse existing time when reopening
            const match = confirmedTime.match(/(\d{2}):(\d{2})\s(AM|PM)/)
            if (match) {
                setTempHour(match[1])
                setTempMinute(match[2])
                setTempPeriod(match[3])
            }
        } else if (isOpen && !confirmedTime) {
            // Reset to default when opening with no selection
            setTempHour("10")
            setTempMinute("00")
            setTempPeriod("AM")
        }
        setOpen(isOpen)
    }

    const handleCancel = () => {
        setOpen(false)
        // Reset temp values (they'll be restored from confirmedTime on next open)
    }

    const handleConfirm = () => {
        const time = `${tempHour}:${tempMinute} ${tempPeriod}`
        setConfirmedTime(time)
        if (onChange) {
            onChange(time)
        }
        setOpen(false)
    }

    const handleClear = () => {
        setConfirmedTime(null)
        if (onChange) {
            onChange(null)
        }
        setOpen(false)
    }

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
    const minutes = ["00", "15", "30", "45"]
    const periods = ["AM", "PM"]

    return (
        <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={`w-full sm:w-[280px] justify-start text-left font-normal border-slate-300 
          bg-white dark:bg-slate-900 shadow-sm
          hover:border-sky-400 hover:ring-1 hover:ring-sky-200 transition-all
          ${!confirmedTime ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}
                >
                    <Clock className="mr-2 h-4 w-4 text-sky-500" />
                    <span className="truncate">{confirmedTime || "Select Time"}</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[calc(100vw-2rem)] sm:w-auto p-0 rounded-xl shadow-2xl border-0 ring-1 ring-slate-200 dark:ring-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                align="center"
                sideOffset={8}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-600 text-center">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Preview</p>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide">
                        {tempHour}:{tempMinute} <span className="text-sky-500">{tempPeriod}</span>
                    </div>
                </div>

                {/* Columns */}
                <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 h-[240px] sm:h-64">
                    {/* Hours - Scrollable */}
                    <div className="relative flex flex-col">
                        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center block">HOUR</span>
                        </div>
                        <ScrollArea className="flex-1 h-full">
                            <div className="flex flex-col p-2 gap-1 pb-4">
                                {hours.map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setTempHour(h)}
                                        className={`w-full py-2.5 sm:py-3 px-2 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200
                                            ${tempHour === h
                                                ? "bg-sky-500 text-white shadow-lg scale-105 ring-2 ring-sky-300"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:scale-102"
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Minutes - Scrollable */}
                    <div className="relative flex flex-col">
                        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center block">MIN</span>
                        </div>
                        <ScrollArea className="flex-1 h-full">
                            <div className="flex flex-col p-2 gap-1 pb-4">
                                {minutes.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setTempMinute(m)}
                                        className={`w-full py-2.5 sm:py-3 px-2 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200
                                            ${tempMinute === m
                                                ? "bg-sky-500 text-white shadow-lg scale-105 ring-2 ring-sky-300"
                                                : "text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:scale-102"
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Period - Fixed (no scroll needed) */}
                    <div className="relative flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="sticky top-0 z-20 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 py-2">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center block">PERIOD</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center p-2 gap-2 sm:gap-3">
                            {periods.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setTempPeriod(p)}
                                    className={`w-full py-4 sm:py-5 rounded-lg text-base sm:text-lg font-bold transition-all duration-200
                                        ${tempPeriod === p
                                            ? "bg-sky-500 text-white shadow-xl ring-4 ring-sky-200 dark:ring-sky-900 scale-105"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:scale-102"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-2">
                    {confirmedTime && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 font-medium transition-all"
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirm}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Confirm
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
