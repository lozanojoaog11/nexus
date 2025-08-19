import React, { useEffect, useRef, useCallback, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphViewProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
  onNodeClick: (node: any) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ graphData, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => updateDimensions());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleNodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.label;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter`;
    
    const r = Math.sqrt(Math.max(0, node.val || 1)) * 2 + 4;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(label, node.x, node.y + r + 5 / globalScale);
  }, []);
  
  const handleNodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const r = Math.sqrt(Math.max(0, node.val || 1)) * 2 + 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
    ctx.fill();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          onNodeClick={onNodeClick}
          nodeCanvasObject={handleNodeCanvasObject}
          nodePointerAreaPaint={handleNodePointerAreaPaint}
          linkColor={() => 'rgba(255, 255, 255, 0.2)'}
          linkWidth={1}
          backgroundColor="rgba(0,0,0,0)"
          cooldownTicks={100}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 100)}
        />
      )}
    </div>
  );
};

export default GraphView;