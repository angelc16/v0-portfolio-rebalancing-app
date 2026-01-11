"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

interface Position {
  ticker: string
  totalValue: number
  percentage: number
  color?: string
}

interface PortfolioChartProps {
  positions: Position[]
  totalValue: number
}

export function PortfolioChart({ positions, totalValue }: PortfolioChartProps) {
  const chartData = positions.map((pos) => ({
    name: pos.ticker,
    value: pos.totalValue,
    percentage: pos.percentage,
    color: pos.color || "#666"
  }))

  return (
    <div className="relative mx-auto my-8 h-[360px] w-full max-w-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {chartData.map((entry) => (
              <filter key={entry.name} id={`glow-${entry.name}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
        <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={110}
            paddingAngle={4}
            cornerRadius={8}
            dataKey="value"
            stroke="none"
            labelLine={{ stroke: '#525252', strokeWidth: 1 }}
            label={({ x, y, cx, name, percentage, color }) => {
              return (
                 <text
                    x={x}
                    y={y}
                    fill={color}
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    className="text-xs font-semibold"
                 >
                    {`${name} (${Math.round(percentage)}%)`}
                 </text>
              );
            }}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                style={{ filter: `url(#glow-${entry.name})` }}
              />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 10} className="fill-gray-400 text-sm font-medium">
                        Total
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 15} className="fill-white text-2xl font-bold">
                        ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
