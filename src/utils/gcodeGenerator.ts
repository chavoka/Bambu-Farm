// Helper to generate visual 2D toolpath paths for G-Code layer rendering canvas

export interface ToolpathSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'perimeter' | 'infill' | 'travel' | 'support';
}

export function generateLayerToolpaths(layerNum: number, fileId: string, buildWidth = 300, buildHeight = 300): ToolpathSegment[] {
  const segments: ToolpathSegment[] = [];
  const centerX = buildWidth / 2;
  const centerY = buildHeight / 2;

  if (fileId === 'file-voron-cube') {
    // 30x30 Cube toolpath
    const size = 60; // scale for view
    const left = centerX - size / 2;
    const top = centerY - size / 2;
    const right = left + size;
    const bottom = top + size;

    // Outer perimeter
    segments.push({ x1: left, y1: top, x2: right, y2: top, type: 'perimeter' });
    segments.push({ x1: right, y1: top, x2: right, y2: bottom, type: 'perimeter' });
    segments.push({ x1: right, y1: bottom, x2: left, y2: bottom, type: 'perimeter' });
    segments.push({ x1: left, y1: bottom, x2: left, y2: top, type: 'perimeter' });

    // Inner perimeter offset
    const innerMargin = 4;
    segments.push({ x1: left + innerMargin, y1: top + innerMargin, x2: right - innerMargin, y2: top + innerMargin, type: 'perimeter' });
    segments.push({ x1: right - innerMargin, y1: top + innerMargin, x2: right - innerMargin, y2: bottom - innerMargin, type: 'perimeter' });
    segments.push({ x1: right - innerMargin, y1: bottom - innerMargin, x2: left + innerMargin, y2: bottom - innerMargin, type: 'perimeter' });
    segments.push({ x1: left + innerMargin, y1: bottom - innerMargin, x2: left + innerMargin, y2: top + innerMargin, type: 'perimeter' });

    // Grid Infill
    const gridSpacing = 8;
    for (let x = left + innerMargin + 4; x < right - innerMargin; x += gridSpacing) {
      segments.push({ x1: x, y1: top + innerMargin, x2: x, y2: bottom - innerMargin, type: 'infill' });
    }
    for (let y = top + innerMargin + 4; y < bottom - innerMargin; y += gridSpacing) {
      segments.push({ x1: left + innerMargin, y1: y, x2: right - innerMargin, y2: y, type: 'infill' });
    }
  } else if (fileId === 'file-benchy') {
    // Boat hull shape for Benchy
    const scale = 1.8;
    // Bow tip, cabin, stern
    const points = [
      { x: centerX, y: centerY - 50 * scale }, // Bow tip
      { x: centerX + 25 * scale, y: centerY - 20 * scale },
      { x: centerX + 22 * scale, y: centerY + 40 * scale }, // Right stern
      { x: centerX - 22 * scale, y: centerY + 40 * scale }, // Left stern
      { x: centerX - 25 * scale, y: centerY - 20 * scale },
    ];

    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      segments.push({ x1: points[i].x, y1: points[i].y, x2: next.x, y2: next.y, type: 'perimeter' });
    }

    // Cabin box in center if layer > 50
    if (layerNum > 40) {
      const cabinWidth = 28 * scale;
      const cabinHeight = 35 * scale;
      const cLeft = centerX - cabinWidth / 2;
      const cTop = centerY - 10 * scale;
      segments.push({ x1: cLeft, y1: cTop, x2: cLeft + cabinWidth, y2: cTop, type: 'perimeter' });
      segments.push({ x1: cLeft + cabinWidth, y1: cTop, x2: cLeft + cabinWidth, y2: cTop + cabinHeight, type: 'perimeter' });
      segments.push({ x1: cLeft + cabinWidth, y1: cTop + cabinHeight, x2: cLeft, y2: cTop + cabinHeight, type: 'perimeter' });
      segments.push({ x1: cLeft, y1: cTop + cabinHeight, x2: cLeft, y2: cTop, type: 'perimeter' });
    }

    // Diagonal Infill
    const step = 10;
    for (let offset = -40; offset <= 40; offset += step) {
      segments.push({
        x1: centerX + offset - 15,
        y1: centerY - 20,
        x2: centerX + offset + 15,
        y2: centerY + 25,
        type: 'infill',
      });
    }
  } else {
    // Circular / organic art model shape
    const numPoints = 16;
    const radius = 50 + Math.sin(layerNum * 0.1) * 15;
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius + (i % 2 === 0 ? 10 : -5);
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
      });
    }
    for (let i = 0; i < points.length; i++) {
      const next = points[(i + 1) % points.length];
      segments.push({ x1: points[i].x, y1: points[i].y, x2: next.x, y2: next.y, type: 'perimeter' });
    }

    // Concentric infill rings
    for (let r = radius - 12; r > 10; r -= 10) {
      for (let i = 0; i < 8; i++) {
        const a1 = (i / 8) * Math.PI * 2;
        const a2 = ((i + 1) / 8) * Math.PI * 2;
        segments.push({
          x1: centerX + Math.cos(a1) * r,
          y1: centerY + Math.sin(a1) * r,
          x2: centerX + Math.cos(a2) * r,
          y2: centerY + Math.sin(a2) * r,
          type: 'infill',
        });
      }
    }
  }

  // Add travel lines
  segments.push({ x1: 20, y1: 20, x2: segments[0]?.x1 || centerX, y2: segments[0]?.y1 || centerY, type: 'travel' });

  return segments;
}
