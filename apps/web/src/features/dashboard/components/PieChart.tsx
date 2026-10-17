import React, { useMemo } from 'react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  height?: number;
  width?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  height = 200,
  width = 200
}) => {
  // Calculate total value
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  // If no data, show empty state
  if (total === 0) {
    return (
      <div className="bg-surface rounded-xl border border-stone-200/80 shadow-xs p-5">
        <h3 className="font-bold text-text-primary mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 rounded-full border-2 border-stone-200 border-dashed flex items-center justify-center">
            <span className="text-2xl text-text-secondary">0%</span>
          </div>
          <p className="text-sm text-text-secondary mt-3">कोई डेटा उपलब्ध नहीं</p>
        </div>
      </div>
    );
  }

  // Calculate angles for pie slices
  const segments = useMemo(() => {
    let cumulativePercentage = 0;
    return data.map((item) => {
      const percentage = (item.value / total) * 100;
      const startAngle = (cumulativePercentage / 100) * 360;
      cumulativePercentage += percentage;
      const endAngle = (cumulativePercentage / 100) * 360;

      return {
        ...item,
        percentage: Math.round(percentage),
        startAngle,
        endAngle
      };
    });
  }, [data, total]);

  // Create SVG path for a pie slice
  const createPieSlice = (startAngle: number, endAngle: number) => {
    if (endAngle - startAngle === 360) {
      // Full circle
      return `
        M ${width/2},${height/2}
        m 0,-${height/2-2}
        a ${width/2-2},${height/2-2} 0 1,1 0,${(height/2-2)*2}
        a ${width/2-2},${height/2-2} 0 1,1 0,-${(height/2-2)*2}
        z
      `;
    }

    const start = polarToCartesian(width/2, height/2, width/2-2, endAngle);
    const end = polarToCartesian(width/2, height/2, width/2-2, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", width/2, height/2,
      "L", start.x, start.y,
      "A", width/2-2, height/2-2, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  // Convert polar coordinates to cartesian
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  return (
    <div className="bg-surface rounded-xl border border-stone-200/80 shadow-xs p-5">
      <h3 className="font-bold text-text-primary mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={width} height={height} className="transform -rotate-90" data-testid="pie-chart-svg">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPieSlice(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-300 hover:opacity-90"
              />
            ))}
          </svg>

          {/* Center label with total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-text-primary">{total}</span>
            <span className="text-xs text-text-secondary">कुल</span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-[200px]">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-sm mr-2"
                style={{ backgroundColor: segment.color }}
              />
              <div className="text-xs">
                <span className="font-medium text-text-primary block">{segment.name}</span>
                <span className="text-text-secondary">{segment.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
