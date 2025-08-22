"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  initialStartDate?: string
  initialEndDate?: string
}

export function DateRangePicker({
  initialStartDate,
  initialEndDate,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
    from: initialStartDate ? new Date(initialStartDate) : undefined,
    to: initialEndDate ? new Date(initialEndDate) : undefined,
  }))

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[250px] justify-start text-left font-normal h-10"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                `${format(date.from, "LLL dd, y")} - ${format(
                  date.to,
                  "LLL dd, y",
                )}`
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <input
        type="hidden"
        name="startDate"
        value={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
      />
      <input
        type="hidden"
        name="endDate"
        value={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
      />
    </div>
  )
}