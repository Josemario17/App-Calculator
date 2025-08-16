import type React from "react"
import { useState, useMemo } from "react"
import { createPortal } from "react-dom"
import CardStats from "./CardStats"

interface HeatmapCell {
  rowIndex: number
  colIndex: number
  value: number
  intensity: number
  label?: string
}

interface ProjectData {
  name: string
  rows: string[]
  data: number[][]
}

interface TooltipData {
  rowLabel: string
  colIndex: number
  value: number
  x: number
  y: number
  show: boolean
}

export function EnergyConsumptionHeatmap() {
  const [tooltip, setTooltip] = useState<TooltipData>({
    rowLabel: "",
    colIndex: 0,
    value: 0,
    x: 0,
    y: 0,
    show: false,
  })

  // Sample project data - replace with your actual data
  const projectsData: ProjectData[] = [
    {
      name: "PedroMag",
      rows: ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"],
      data: [
        [180, 220, 150, 300, 250, 190, 280, 160, 240, 200, 170, 310, 260, 180, 290, 150, 230, 200, 180, 270, 190, 160, 240, 210, 180, 200],
        [160, 200, 180, 280, 230, 170, 260, 140, 220, 180, 150, 290, 240, 160, 270, 130, 210, 180, 160, 250, 170, 140, 220, 190, 160, 180],
        [200, 240, 170, 320, 270, 210, 300, 180, 260, 220, 190, 330, 280, 200, 310, 170, 250, 220, 200, 290, 210, 180, 260, 230, 200, 220],
        [140, 180, 130, 260, 210, 150, 240, 120, 200, 160, 130, 270, 220, 140, 250, 110, 190, 160, 140, 230, 150, 120, 200, 170, 140, 160],
        [220, 260, 190, 340, 290, 230, 320, 200, 280, 240, 210, 350, 300, 220, 330, 190, 270, 240, 220, 310, 230, 200, 280, 250, 220, 240]
      ]
    },
    {
      name: "Other Project",
      rows: ["Item A", "Item B", "Item C"],
      data: [
        [120, 160, 110, 200, 170, 130, 180, 100, 150, 120, 100, 210, 160, 120, 190, 90, 140, 120, 100, 170, 130, 100, 150, 130, 120, 140],
        [100, 140, 90, 180, 150, 110, 160, 80, 130, 100, 80, 190, 140, 100, 170, 70, 120, 100, 80, 150, 110, 80, 130, 110, 100, 120],
        [140, 180, 130, 220, 190, 150, 200, 120, 170, 140, 120, 230, 180, 140, 210, 110, 160, 140, 120, 190, 150, 120, 170, 150, 140, 160]
      ]
    }
  ]

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  const heatmapData = useMemo((): { projects: Array<{ name: string; cells: HeatmapCell[] }> } => {
    const result: { projects: Array<{ name: string; cells: HeatmapCell[] }> } = { projects: [] }
    let allValues: number[] = []

    // First pass: collect all values to calculate global min/max
    projectsData.forEach(project => {
      project.data.forEach(row => {
        allValues = allValues.concat(row)
      })
    })

    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const range = maxValue - minValue

    // Second pass: create cells with normalized intensity
    projectsData.forEach(project => {
      const cells: HeatmapCell[] = []
      
      project.data.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          // Add some random variation
          const seed = rowIndex * 100 + colIndex * 10 + project.name.length
          const randomVariation = (seededRandom(seed) - 0.5) * 20
          const finalValue = Math.max(50, value + randomVariation)
          
          cells.push({
            rowIndex,
            colIndex,
            value: finalValue,
            intensity: range > 0 ? (finalValue - minValue) / range : 0,
            label: project.rows[rowIndex]
          })
        })
      })

      result.projects.push({
        name: project.name,
        cells
      })
    })

    return result
  }, [])

  const getIntensityColor = (intensity: number) => {
    const opacity = Math.max(0.15, intensity * 0.9)
    return `rgba(3, 44, 210, ${opacity})`
  }

  const getCellValue = (projectIndex: number, rowIndex: number, colIndex: number) => {
    return heatmapData.projects[projectIndex]?.cells.find(
      cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex
    )
  }

  const handleCellHover = (event: React.MouseEvent, rowLabel: string, colIndex: number, value: number) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top - 10

    setTooltip({
      rowLabel,
      colIndex,
      value,
      x,
      y,
      show: true,
    })
  }

  const handleCellLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }))
  }

  const TooltipPortal = () => {
    if (!tooltip.show || typeof window === "undefined") return null

    return createPortal(
      <div
        className="fixed bg-[rgb(var(--blue-500))] border border-[rgb(var(--blue-600))] rounded-lg px-3 py-2 text-xs whitespace-nowrap text-[#EDEDED] pointer-events-none transition-all duration-200 shadow-xl z-[99999]"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: "translateX(-50%)",
        }}
      >
        <div className="font-semibold text-white">
          {tooltip.rowLabel} - Column {tooltip.colIndex + 1}
        </div>
        <div className="text-white mt-1">{tooltip.value.toFixed(1)} AOA</div>
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: "4px solid #2A2A2A",
          }}
        />
      </div>,
      document.body,
    )
  }

  // Get the maximum number of columns across all projects
  const maxColumns = Math.max(...projectsData.map(project => 
    Math.max(...project.data.map(row => row.length))
  ))

  return (
    <>
      <Card className="border-gray-200 w-full">
        <CardHeader className="mb-0">
          <div className="grid mb-0">
            <span className="flex items-center gap-2 text-lg font-semibold">
              Heatmap de Ocupação de Imóveis e Locais
            </span>
            <span className="text-[#9A9A9A] text-sm">
              Padrões de ocupação organizados por projeto
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 mt-0">
          <div className="flex flex-col w-full mt-0 space-y-6">
            {heatmapData.projects.map((project, projectIndex) => (
              <div key={project.name} className="flex flex-col">
                {/* Project Header */}
                <div className="flex mb-2">
                  <div className="w-20"></div>
                  <div className="text-center font-semibold w-full border-b border-gray-300 pb-2">
                    {project.name}
                  </div>
                </div>

                {/* Project Heatmap */}
                <div className="flex flex-col gap-1 mb-4">
                  {projectsData[projectIndex].rows.map((rowLabel, rowIndex) => (
                    <div key={`${project.name}-${rowIndex}`} className="flex items-center">
                      <div className="w-20 text-[11px] text-[#9A9A9A] font-medium pr-2 text-right truncate">
                        {rowLabel}
                      </div>
                      <div className="flex gap-[4px] w-full">
                        {Array.from({ length: maxColumns }, (_, colIndex) => {
                          const cell = getCellValue(projectIndex, rowIndex, colIndex)
                          return (
                            <div
                              key={colIndex}
                              className="aspect-square size-8 max-w-8 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:brightness-125 hover:shadow-lg"
                              style={{
                                backgroundColor: cell ? getIntensityColor(cell.intensity) : "rgb(var(--blue-50))",
                                border: cell && cell.intensity > 0.7 ? "1px solid rgba(255, 107, 0, 0.3)" : "none",
                              }}
                              onMouseEnter={(e) => cell && handleCellHover(e, rowLabel, colIndex, cell.value)}
                              onMouseLeave={handleCellLeave}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Project Separator */}
                {projectIndex < heatmapData.projects.length - 1 && (
                  <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
                )}
              </div>
            ))}

            {/* Legend and Scale */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A2A2A]">
              <div className="flex items-center gap-3 text-xs text-[#9A9A9A]">
                <span>Low</span>
                <div className="flex gap-1">
                  {[0.15, 0.35, 0.55, 0.75, 0.9].map((intensity) => (
                    <div
                      key={intensity}
                      className="size-5 rounded-sm border border-[#2A2A2A]"
                      style={{ backgroundColor: getIntensityColor(intensity) }}
                    />
                  ))}
                </div>
                <span>High</span>
              </div>
              <div className="text-xs text-[#9A9A9A]">
                Faixa: {Math.min(...heatmapData.projects.flatMap(p => p.cells.map(c => c.value))).toFixed(0)} -{" "}
                {Math.max(...heatmapData.projects.flatMap(p => p.cells.map(c => c.value))).toFixed(0)} ocupações
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TooltipPortal />
    </>
  )
}