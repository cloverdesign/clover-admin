"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { SpecimenGroup } from "@/components/playground/section"

const chartData = [
  { month: "Jan", value: 12 },
  { month: "Feb", value: 19 },
  { month: "Mar", value: 15 },
  { month: "Apr", value: 27 },
  { month: "May", value: 24 },
  { month: "Jun", value: 33 },
]

const chartConfig = {
  value: { label: "Deliverables", color: "var(--chart-3)" },
} satisfies ChartConfig

const invoices = [
  { no: "INV-001", client: "Acme Co.", amount: "$4,200", status: "Paid" },
  { no: "INV-002", client: "Globex", amount: "$1,800", status: "Sent" },
  { no: "INV-003", client: "Initech", amount: "$3,050", status: "Overdue" },
]

export function DataSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Website redesign</CardTitle>
            <CardDescription>Acme Co. · Development phase</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">72%</span>
            </div>
            <Progress value={72} />
          </CardContent>
        </Card>
      </SpecimenGroup>

      <SpecimenGroup label="Table">
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.no}>
                  <TableCell className="font-mono text-xs">{inv.no}</TableCell>
                  <TableCell>{inv.client}</TableCell>
                  <TableCell className="tabular-nums">{inv.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={inv.status === "Overdue" ? "destructive" : "secondary"}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Avatars">
        <AvatarGroup>
          {["TJ", "DP", "MK", "AR"].map((initials) => (
            <Avatar key={initials}>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </SpecimenGroup>

      <SpecimenGroup label="Chart">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={6} />
          </BarChart>
        </ChartContainer>
      </SpecimenGroup>

      <SpecimenGroup label="Skeleton">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </SpecimenGroup>
    </div>
  )
}
