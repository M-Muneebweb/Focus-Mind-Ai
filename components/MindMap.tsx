import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3Base from 'd3';
import { MindMapNode } from '../types';
import { ZoomIn, ZoomOut, Edit2, Trash2, Plus, GitBranch, Minimize2, Keyboard, Palette, X, Camera, Sparkles } from 'lucide-react';

// Workaround for d3 type issues
const d3: any = d3Base;

interface MindMapProps {
  data: MindMapNode;
  onNodeClick: (node: MindMapNode) => void;
  onEditNode: (node: MindMapNode) => void;
  onAddNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onExpandNode?: (nodeId: string) => void;
  onMoveNode?: (nodeId: string, newParentId: string) => void;
  onColorChange?: (nodeId: string, color: string | undefined) => void;
}

const COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Green', value: '#10b981' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Slate', value: '#64748b' },
];

export const MindMap: React.FC<MindMapProps> = ({ data, onNodeClick, onEditNode, onAddNode, onDeleteNode, onExpandNode, onMoveNode, onColorChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<any>(null);
  const isDraggingRef = useRef(false); 
  const dragTargetRef = useRef<string | null>(null);
  const nodePositions = useRef<Map<string, { x: number; y: number }>>(new Map()); 
  
  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [rootData, setRootData] = useState<MindMapNode>(data);
  const isFirstRender = useRef(true); 
  const currentTransform = useRef<any>(d3.zoomIdentity.translate(0, 0).scale(0.8)); 

  // Sync prop data with local rootData, but preserve collapsed state from local
  useEffect(() => {
    const mergeState = (newD: MindMapNode, oldD: MindMapNode | null): MindMapNode => {
         // If IDs match, keep the old collapsed state
         const collapsed = oldD && oldD.id === newD.id ? oldD.collapsed : newD.collapsed;
         // If color is updated in newD (from props), use it
         const color = newD.color;
         
         const merged: MindMapNode = { ...newD, collapsed, color };
         
         if (newD.children) {
             const oldMap = new Map(oldD?.children?.map(c => [c.id, c]) || []);
             merged.children = newD.children.map(child => {
                 const oldChild = oldMap.get(child.id) || null;
                 return mergeState(child, oldChild);
             });
         }
         return merged;
    };
    setRootData(prev => mergeState(data, prev));
  }, [data]);

  // Handle Layout Switch Animation
  useEffect(() => {
      if (svgRef.current && zoomRef.current && !isFirstRender.current) {
          const svg = d3.select(svgRef.current);
          const width = wrapperRef.current?.clientWidth || 800;
          const height = wrapperRef.current?.clientHeight || 600;
          const t = d3.zoomIdentity.translate(width/2, height/2).scale(0.8);
          svg.transition().duration(750).ease(d3.easeCubicOut).call(zoomRef.current.transform, t);
      }
  }, [isHorizontal]);

  // Center view on a specific node - Fixed Jumping Logic
  const centerOnNode = useCallback((nodeId: string) => {
      const pos = nodePositions.current.get(nodeId);
      if (pos && svgRef.current && zoomRef.current && wrapperRef.current) {
          const width = wrapperRef.current.clientWidth;
          const height = wrapperRef.current.clientHeight;
          const scale = 1.0; 
          
          let targetX = 0;
          let targetY = 0;

          if (isHorizontal) {
             targetX = -pos.y * scale + width / 2;
             targetY = -pos.x * scale + height / 2;
          } else {
             targetX = -pos.x * scale + width / 2;
             targetY = -pos.y * scale + height / 2;
          }

          const t = d3.zoomIdentity.translate(targetX, targetY).scale(scale);

          d3.select(svgRef.current)
              .transition()
              .duration(800)
              .ease(d3.easeCubicOut)
              .call(zoomRef.current.transform, t);
      }
  }, [isHorizontal]);

  const stateRef = useRef({
     selectedNodeId,
     rootData,
     onDeleteNode,
     onEditNode,
     centerOnNode,
     onMoveNode
  });

  // Keep ref synchronized on every render
  useEffect(() => {
     stateRef.current = {
         selectedNodeId,
         rootData,
         onDeleteNode,
         onEditNode,
         centerOnNode,
         onMoveNode
     };
  }, [selectedNodeId, rootData, onDeleteNode, onEditNode, centerOnNode, onMoveNode]);

  // Global Keyboard Event Listener
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Destructure from the REF, not state directly
          const { selectedNodeId, rootData, onDeleteNode, onEditNode, centerOnNode } = stateRef.current;
          
          if (!selectedNodeId) return;

          // Ignore if typing in inputs/modals
          const target = e.target as HTMLElement;
          if (target.matches('input, textarea, [contenteditable]')) return;

          if (e.key === 'Delete' || e.key === 'Backspace') {
              e.preventDefault(); // Prevent browser back
              if (selectedNodeId !== rootData.id) {
                  onDeleteNode(selectedNodeId);
              }
          } else if (e.key === 'F2' || e.key === 'Enter') {
              e.preventDefault();
              const findNode = (n: MindMapNode): MindMapNode | null => {
                  if (n.id === selectedNodeId) return n;
                  if (n.children) {
                      for (const c of n.children) {
                          const found = findNode(c);
                          if (found) return found;
                      }
                  }
                  return null;
              };
              const node = findNode(rootData);
              if (node) onEditNode(node);
          } else if (e.code === 'Space' || e.key === ' ') {
              e.preventDefault(); 
              e.stopPropagation(); // Explicit stop
              centerOnNode(selectedNodeId);
          } else if (e.key === 'Escape') {
              setSelectedNodeId(null);
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); 

  const toggleCollapse = useCallback((nodeId: string) => {
     const toggle = (node: MindMapNode): MindMapNode => {
         if (node.id === nodeId) {
             return { ...node, collapsed: !node.collapsed };
         }
         if (node.children) {
             return { ...node, children: node.children.map(toggle) };
         }
         return node;
     };
     setRootData(prev => toggle(prev));
  }, []);

  // --- ROBUST TEXT WRAPPING ---
  const wrapText = (textSelection: any, width: number) => {
      textSelection.each(function(this: SVGTextElement) {
          const text = d3.select(this);
          const d: any = text.datum();
          const fullLabel = d.data.label || "";
          
          text.text(null);
          
          const words = fullLabel.split(/\s+/).reverse();
          let word;
          let line: string[] = [];
          let lineNumber = 0;
          const lineHeight = 1.3; 
          
          const appendTspan = (dyVal: string | number) => 
            text.append("tspan").attr("x", 0).attr("dy", dyVal);

          let tspan = appendTspan(0);
          
          if (words.length === 0) {
             d.lineCount = 1;
             return;
          }

          while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.node()!.getComputedTextLength() > width && line.length > 1) {
                  line.pop();
                  tspan.text(line.join(" "));
                  line = [word];
                  tspan = appendTspan(lineHeight + "em").text(word);
                  lineNumber++;
              }
          }
          
          d.lineCount = lineNumber + 1;

          const totalLines = lineNumber + 1;
          const startDy = 0.35 - ((totalLines - 1) * lineHeight) / 2;
          
          text.selectAll("tspan").attr("dy", (d: any, i: number) => {
             return i === 0 ? startDy + "em" : lineHeight + "em";
          });
      });
  };

  const updateChart = () => {
    if (!svgRef.current || !wrapperRef.current || !rootData) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background-color", "transparent")
      .style("font-family", "'Inter', sans-serif"); 

    // Define Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 5])
      .on("zoom", (event: any) => {
        currentTransform.current = event.transform;
        d3.select(svgRef.current).select("g.main-group").attr("transform", event.transform);
      });
    zoomRef.current = zoom;

    // Apply zoom behavior to SVG
    svg.call(zoom).on("dblclick.zoom", null);

    // Initial positioning
    if (isFirstRender.current) {
         const initialT = d3.zoomIdentity.translate(width/2, height/2).scale(0.8);
         svg.call(zoom.transform, initialT);
         currentTransform.current = initialT;
         isFirstRender.current = false;
    } else {
        d3.select(svgRef.current).select("g.main-group").attr("transform", currentTransform.current);
    }

    let defs = svg.select("defs");
    if (defs.empty()) {
        defs = svg.append("defs");
        const rootGrad = defs.append("linearGradient").attr("id", "grad-root").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%");
        rootGrad.append("stop").attr("offset", "0%").style("stop-color", "#8b5cf6"); // Brand 500
        rootGrad.append("stop").attr("offset", "100%").style("stop-color", "#6d28d9"); // Brand 700
        
        // Add softer drop shadow filter
        const filter = defs.append("filter").attr("id", "drop-shadow").attr("height", "150%");
        filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 4).attr("result", "blur");
        filter.append("feOffset").attr("in", "blur").attr("dx", 0).attr("dy", 4).attr("result", "offsetBlur");
        // Color matrix for shadow opacity
        const feComponentTransfer = filter.append("feComponentTransfer");
        feComponentTransfer.append("feFuncA").attr("type", "linear").attr("slope", 0.15);
        
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "offsetBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    let g = svg.select("g.main-group");
    if (g.empty()) {
        g = svg.append("g").attr("class", "main-group");
    }

    // Layout
    const BOX_WIDTH = 260; 
    const VERTICAL_SPACING = 140; 
    const HORIZONTAL_SPACING = 380; 

    const hierarchyData = d3.hierarchy(rootData, (d: any) => d.collapsed ? null : d.children);
    
    // Assign Colors
    hierarchyData.each((node: any) => {
        if (node.depth === 0) {
            node.displayColor = node.data.color || null;
            return;
        }
        // Inherit color if not set explicitly
        if (node.data.color) {
            node.displayColor = node.data.color;
        } else if (node.parent && node.parent.displayColor) {
            node.displayColor = node.parent.displayColor;
        } else {
             // Fallback auto colors
             if(node.depth === 1) {
                 const i = node.parent.children.indexOf(node);
                 node.displayColor = COLORS[i % COLORS.length].value;
             } else {
                 node.displayColor = "#94a3b8"; // Slate 400
             }
        }
    });

    const activeNodes = new Set<string>();
    if (selectedNodeId) {
        const selectedHierarchyNode = hierarchyData.descendants().find((d: any) => d.data.id === selectedNodeId);
        if (selectedHierarchyNode) {
            let curr = selectedHierarchyNode;
            while (curr) {
                activeNodes.add(curr.data.id);
                curr = curr.parent;
            }
        }
    }
    
    let treeLayout;
    if (isHorizontal) {
        treeLayout = d3.tree()
            .nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]) 
            .separation((a: any, b: any) => (a.parent === b.parent ? 1.1 : 1.3));
    } else {
        treeLayout = d3.tree()
            .nodeSize([BOX_WIDTH + 60, VERTICAL_SPACING + 60])
            .separation((a: any, b: any) => (a.parent === b.parent ? 1.1 : 1.3));
    }
    
    treeLayout(hierarchyData);

    // Links
    const links = g.selectAll(".link")
      .data(hierarchyData.links(), (d: any) => d.target.data.id);

    links.enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke", "#e2e8f0")
      .attr("opacity", 0)
      .attr("d", (d: any) => {
          const sourceId = d.source.data.id;
          const oldPos = nodePositions.current.get(sourceId);
          const startX = oldPos ? (isHorizontal ? oldPos.y : oldPos.x) : (isHorizontal ? d.source.y : d.source.x);
          const startY = oldPos ? (isHorizontal ? oldPos.x : oldPos.y) : (isHorizontal ? d.source.x : d.source.y);
          const o = { x: startX, y: startY };
          return isHorizontal 
             ? d3.linkHorizontal().x(() => o.x).y(() => o.y)({source: o, target: o} as any)
             : d3.linkVertical().x(() => o.x).y(() => o.y)({source: o, target: o} as any);
      })
      .merge(links)
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr("stroke", (d: any) => {
          if (activeNodes.has(d.target.data.id)) return "#8b5cf6"; // Brand 500
          return "#cbd5e1";
      })
      .attr("stroke-width", (d: any) => activeNodes.has(d.target.data.id) ? 2 : 1.5)
      .attr("opacity", (d: any) => {
          if (!selectedNodeId) return 0.6;
          return activeNodes.has(d.target.data.id) ? 1 : 0.2;
      })
      .attr("d", isHorizontal 
        ? d3.linkHorizontal().x((d: any) => d.y).y((d: any) => d.x) as any
        : d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any
      );

    links.exit().transition().duration(300).attr("opacity", 0).remove();

    // Nodes
    const nodes = g.selectAll(".node")
      .data(hierarchyData.descendants(), (d: any) => d.data.id);

    const nodeEnter = nodes.enter()
      .append("g")
      .attr("class", "node cursor-pointer")
      .attr("transform", (d: any) => {
          const parentId = d.parent?.data.id;
          const oldPos = parentId ? nodePositions.current.get(parentId) : null;
          if (oldPos) {
              return isHorizontal 
                ? `translate(${oldPos.y},${oldPos.x}) scale(0.1)` 
                : `translate(${oldPos.x},${oldPos.y}) scale(0.1)`;
          }
          const p = d.parent || d;
          return isHorizontal 
            ? `translate(${p.y},${p.x}) scale(0.1)` 
            : `translate(${p.x},${p.y}) scale(0.1)`;
      })
      .attr("opacity", 0);

    // Enhanced Drag Behavior
    const drag = d3.drag()
        .filter((event: any) => !event.button) 
        .subject(function(d: any) { return {x: isHorizontal ? d.y : d.x, y: isHorizontal ? d.x : d.y}; })
        .on("start", function(event: any, d: any) {
            if (d.data.id === rootData.id) return;
            isDraggingRef.current = true;
            dragTargetRef.current = null;
            d3.select(this).raise().attr("opacity", 0.9).style("cursor", "grabbing");
            // Visual feedback: Shadow effect
            d3.select(this).select("rect.main-rect")
                .attr("filter", "drop-shadow(0px 10px 20px rgba(139,92,246,0.3))")
                .attr("stroke", "#8b5cf6")
                .attr("stroke-width", 2);
        })
        .on("drag", function(event: any, d: any) {
            if (d.data.id === rootData.id) return;
            
            // Move Group
            d3.select(this).attr("transform", `translate(${event.x},${event.y})`);
            
            // Hit Testing
            const dragX = event.x;
            const dragY = event.y;
            let bestTarget: string | null = null;
            let minDist = Infinity;

            // Reset all node styling
            g.selectAll(".node rect.main-rect").attr("stroke", (n: any) => {
                 if (n.data.id === selectedNodeId) return "#8b5cf6";
                 if (n.data.isRoot) return "#5b21b6";
                 const col = n.displayColor; 
                 return col ? d3.color(col)?.darker(0.1)?.toString() || "#cbd5e1" : "#e2e8f0";
            }).attr("stroke-width", (n: any) => (n.data.id === selectedNodeId) ? 2 : 1);

            g.selectAll(".node").each(function(n: any) {
                 if (n.data.id === d.data.id) return; // Skip self
                 
                 // Check if 'n' is a descendant of dragging node 'd'
                 // d.descendants() returns array of nodes including self and children
                 const isDescendant = d.descendants().some((desc: any) => desc.data.id === n.data.id);
                 if (isDescendant) return;

                 const nX = isHorizontal ? n.y : n.x;
                 const nY = isHorizontal ? n.x : n.y;
                 
                 const dx = dragX - nX;
                 const dy = dragY - nY;
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 
                 if (dist < 120) { // Threshold
                     if (dist < minDist) {
                         minDist = dist;
                         bestTarget = n.data.id;
                     }
                 }
            });

            dragTargetRef.current = bestTarget;

            if (bestTarget) {
                // Highlight Drop Target
                g.selectAll(".node").filter((n: any) => n.data.id === bestTarget)
                  .select("rect.main-rect")
                  .attr("stroke", "#10b981") 
                  .attr("stroke-width", 3);
            }
        })
        .on("end", function(event: any, d: any) {
             if (d.data.id === rootData.id) return;
             isDraggingRef.current = false;
             d3.select(this).style("cursor", "pointer");
             
             const targetId = dragTargetRef.current;
             
             // Check if target exists and is different from current parent
             if (targetId && targetId !== d.parent?.data.id && onMoveNode) {
                 onMoveNode(d.data.id, targetId);
             } else {
                 // Snap back if invalid drop
                 updateChart(); 
             }
             dragTargetRef.current = null;
        });

    nodeEnter.call(drag as any);

    // Main Rect - Softer Pill Shape
    nodeEnter.append("rect")
      .attr("class", "main-rect")
      .attr("rx", 24)
      .attr("ry", 24)
      .attr("filter", "url(#drop-shadow)")
      .attr("fill", "white");

    // Label
    nodeEnter.append("text")
      .attr("class", "node-label")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-family", "'Inter', sans-serif")
      .style("pointer-events", "none");
    
    nodeEnter.append("title").text((d: any) => d.data.label);

    const nodeUpdate = nodeEnter.merge(nodes as any);
    
    nodeUpdate.on("click", (event: any, d: any) => {
        if (isDraggingRef.current) return;
        event.stopPropagation();
        
        if (wrapperRef.current) {
            wrapperRef.current.focus({ preventScroll: true });
        }
        
        setSelectedNodeId(d.data.id);
        onNodeClick(d.data);
    });

    nodeUpdate.transition().duration(600).ease(d3.easeCubicOut)
      .attr("transform", (d: any) => isHorizontal ? `translate(${d.y},${d.x}) scale(1)` : `translate(${d.x},${d.y}) scale(1)`)
      .attr("opacity", (d: any) => {
          if (!selectedNodeId) return 1;
          return (activeNodes.has(d.data.id) || d.data.id === selectedNodeId) ? 1 : 0.5;
      });

    // Update Text First to get size
    nodeUpdate.select("text.node-label")
      .text((d: any) => d.data.label)
      .attr("fill", (d: any) => (d.data.isRoot || d.data.color) ? "white" : "#1e293b")
      .style("font-weight", (d: any) => d.data.isRoot ? "600" : "500")
      .call(wrapText, BOX_WIDTH - 40); 

    // Resize Rects
    nodeUpdate.select("rect.main-rect")
      .attr("width", BOX_WIDTH)
      .attr("height", (d: any) => {
          const lines = d.lineCount || 1;
          return Math.max(56, lines * 22 + 32);
      })
      .attr("x", -BOX_WIDTH / 2)
      .attr("y", (d: any) => {
          const lines = d.lineCount || 1;
          const h = Math.max(56, lines * 22 + 32);
          return -h / 2;
      })
      .attr("fill", (d: any) => {
          if (d.data.isRoot) return "url(#grad-root)";
          if (d.data.color) return d.data.color;
          if (d.data.id === selectedNodeId) return "#f8fafc"; 
          return "white";
      })
      .attr("stroke", (d: any) => {
        if (d.data.id === selectedNodeId) return "#8b5cf6"; // Brand 500
        if (d.data.isRoot) return "#5b21b6";
        const col = d.displayColor;
        return col ? d3.color(col)?.darker(0.1)?.toString() || "#cbd5e1" : "#e2e8f0"; 
      })
      .attr("stroke-width", (d: any) => (d.data.id === selectedNodeId) ? 2.5 : 1);

    // --- FIX COLLAPSE BUTTON ---
    nodeUpdate.selectAll(".collapse-btn").remove();

    const collapseGroup = nodeUpdate.filter((d: any) => !!d.data.children && d.data.children.length > 0)
      .append("g")
      .attr("class", "collapse-btn cursor-pointer")
      // Increase hit area and ensure pointer events are on
      .style("pointer-events", "all")
      .attr("transform", (d: any) => {
          const w = BOX_WIDTH;
          const h = Math.max(56, (d.lineCount || 1) * 22 + 32);
          return isHorizontal 
            ? `translate(${w/2}, 0)` 
            : `translate(0, ${h/2})`;
      });
      
    // Hit area circle (invisible but clickable)
    collapseGroup.append("circle")
        .attr("r", 16)
        .attr("fill", "transparent")
        .attr("stroke", "none");

    // Visible circle
    collapseGroup.append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", (d: any) => "#cbd5e1")
      .attr("stroke-width", 1.5);
    
    collapseGroup.append("text")
      .attr("dy", 3.5)
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.collapsed ? "+" : "-")
      .attr("font-size", "14px")
      .attr("fill", "#64748b")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    // Attach click listener to the group using D3's on
    collapseGroup.on("click", function(event: any, d: any) {
        event.stopPropagation(); // CRITICAL: Stop bubbling to node click
        event.preventDefault();
        toggleCollapse(d.data.id);
    })
    // STOP DRAG INTERFERENCE
    .on("mousedown", (e: any) => e.stopPropagation())
    .on("touchstart", (e: any) => e.stopPropagation());

    // Hover effect
    collapseGroup.on("mouseenter", function() {
           d3.select(this).select("circle:nth-of-type(2)").transition().duration(200).attr("r", 12).attr("stroke", "#8b5cf6");
           d3.select(this).select("text").attr("fill", "#8b5cf6");
    })
    .on("mouseleave", function() {
           d3.select(this).select("circle:nth-of-type(2)").transition().duration(200).attr("r", 10).attr("stroke", "#cbd5e1");
           d3.select(this).select("text").attr("fill", "#64748b");
    });

    nodes.exit().transition().duration(400).ease(d3.easeBackIn)
        .attr("opacity", 0)
        .attr("transform", function(d: any) {
            const t = d3.select(this).attr("transform");
            return t.replace("scale(1)", "scale(0)");
        })
        .remove();

    hierarchyData.descendants().forEach((d: any) => {
        nodePositions.current.set(d.data.id, { x: d.x, y: d.y });
    });
  };

  useEffect(() => {
    updateChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootData, isHorizontal, selectedNodeId]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleFitScreen = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select("g.main-group");
    const bounds = (g.node() as SVGGraphicsElement).getBBox();
    const width = wrapperRef.current?.clientWidth || 0;
    const height = wrapperRef.current?.clientHeight || 0;
    
    if (width === 0 || height === 0 || bounds.width === 0 || bounds.height === 0) return;

    const scale = 0.85 / Math.max(bounds.width / width, bounds.height / height);
    const translate = [width / 2 - scale * (bounds.x + bounds.width/2), height / 2 - scale * (bounds.y + bounds.height/2)];

    svg.transition()
      .duration(750)
      .call(
         // @ts-ignore
         zoomRef.current.transform, 
         d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  };

  const handleExportPNG = () => {
      if (!svgRef.current || !wrapperRef.current) return;
      
      const svg = svgRef.current;
      const g = d3.select(svg).select("g.main-group");
      const bounds = (g.node() as SVGGraphicsElement).getBBox();
      const padding = 50;
      const x = bounds.x - padding;
      const y = bounds.y - padding;
      const width = bounds.width + padding * 2;
      const height = bounds.height + padding * 2;

      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      const cloneGroup = svgClone.querySelector('g.main-group');
      if (cloneGroup) {
          cloneGroup.setAttribute('transform', 'translate(0,0) scale(1)'); 
          cloneGroup.setAttribute('transform', `translate(${-x}, ${-y})`);
      }
      
      svgClone.setAttribute("width", width.toString());
      svgClone.setAttribute("height", height.toString());
      svgClone.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svgClone.style.backgroundColor = "#ffffff"; 

      const style = document.createElement("style");
      style.textContent = `text { font-family: 'Inter', sans-serif; }`;
      svgClone.prepend(style);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);
      const img = new Image();
      const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
      
      img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width * 2; 
          canvas.height = height * 2;
          const ctx = canvas.getContext("2d");
          if(ctx) {
              ctx.scale(2, 2);
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              
              const pngUrl = canvas.toDataURL("image/png");
              const downloadLink = document.createElement("a");
              downloadLink.href = pngUrl;
              downloadLink.download = "focusmind-map.png";
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
          }
      };
      img.src = svgUrl;
  };

  return (
    <div 
        className="relative w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden outline-none" 
        ref={wrapperRef} 
        tabIndex={0} // Allows div to receive keyboard events
        onClick={(e) => {
            // Only deselect if actually clicking the wrapper div, not bubbled from SVG nodes
            if (e.target === wrapperRef.current || e.target === svgRef.current) {
                setSelectedNodeId(null);
            }
        }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none"></div>
      <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing relative z-10" />
      
      {/* Controls Overlay - Moved Up on Mobile to avoid nav overlap */}
      <div className="absolute bottom-24 right-6 md:bottom-8 md:right-8 flex flex-col gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 rounded-2xl shadow-glass border border-white/20 dark:border-slate-700/50 animate-slide-up z-20">
         <div className="flex flex-col gap-1 border-b border-slate-200/50 dark:border-slate-700/50 pb-2 mb-1">
            <button onClick={() => setIsHorizontal(!isHorizontal)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors tooltip" title="Toggle Layout">
                {isHorizontal ? <GitBranch size={20} className="rotate-90" /> : <GitBranch size={20} />}
            </button>
            <button onClick={handleExportPNG} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors tooltip" title="Export as PNG">
                <Camera size={20} />
            </button>
         </div>

        <button onClick={handleZoomIn} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors" title="Zoom In">
          <ZoomIn size={20} />
        </button>
        <button onClick={handleZoomOut} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors" title="Zoom Out">
          <ZoomOut size={20} />
        </button>
        <button onClick={handleFitScreen} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 transition-colors" title="Fit to Screen">
          <Minimize2 size={20} />
        </button>
      </div>
      
      {/* Help Tip */}
      <div className="absolute top-6 right-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-slate-500 border border-white/20 dark:border-slate-800 hidden md:flex items-center gap-2 pointer-events-none z-20 shadow-sm">
          <Keyboard size={12} />
          <span>Space to Center • F2 to Rename • Del to Remove • Drag to Reorder</span>
      </div>

      {/* Context Menu (Action Tab) */}
      {selectedNodeId && (
        <div 
          className="absolute top-6 left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-2 rounded-2xl shadow-glass border border-white/20 dark:border-slate-700/50 flex flex-col gap-1 animate-pop min-w-[240px] z-50 origin-top-left"
          onClick={(e) => e.stopPropagation()} 
        >
           {/* Header with Close Button */}
           <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/50 mb-1 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl">
               <span>Actions</span>
               <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                   <button 
                       onClick={() => setSelectedNodeId(null)}
                       className="p-1 -mr-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500"
                   >
                       <X size={14} />
                   </button>
               </div>
           </div>
           
           <button 
             onClick={() => {
                 const findNode = (n: MindMapNode): MindMapNode | null => {
                     if (n.id === selectedNodeId) return n;
                     if (n.children) {
                         for (const c of n.children) {
                             const found = findNode(c);
                             if (found) return found;
                         }
                     }
                     return null;
                 }
                 const node = findNode(rootData);
                 if(node) onAddNode(node.id);
             }}
             className="flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 rounded-xl text-sm font-medium transition-colors group mx-1"
           >
             <div className="p-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg group-hover:scale-110 transition-transform">
                 <Plus size={16} />
             </div>
             Add Sub-Topic
           </button>
           
           {onExpandNode && (
             <button 
                onClick={() => onExpandNode(selectedNodeId)}
                className="flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 rounded-xl text-sm font-medium transition-colors group mx-1"
             >
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                    <Sparkles size={16} />
                </div>
                Expand with AI
             </button>
           )}

           <button 
             onClick={() => {
                 const findNode = (n: MindMapNode): MindMapNode | null => {
                     if (n.id === selectedNodeId) return n;
                     if (n.children) {
                         for (const c of n.children) {
                             const found = findNode(c);
                             if (found) return found;
                         }
                     }
                     return null;
                 }
                 const node = findNode(rootData);
                 if(node) onEditNode(node);
             }}
             className="flex items-center gap-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl text-sm font-medium transition-colors group mx-1"
           >
             <div className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg group-hover:scale-110 transition-transform">
                 <Edit2 size={16} />
             </div>
             Rename
           </button>

           <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mx-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Palette size={12} /> Topic Color
                </div>
                <div className="grid grid-cols-6 gap-2">
                     {COLORS.map(c => (
                         <button
                            key={c.value}
                            onClick={() => onColorChange && onColorChange(selectedNodeId, c.value)}
                            className="w-6 h-6 rounded-full hover:scale-125 transition-all ring-1 ring-slate-200 shadow-sm"
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                         />
                     ))}
                     <button
                        onClick={() => onColorChange && onColorChange(selectedNodeId, undefined)}
                        className="w-6 h-6 rounded-full hover:scale-125 transition-all ring-1 ring-slate-200 shadow-sm bg-white dark:bg-slate-800 flex items-center justify-center text-red-500"
                        title="Reset to Default"
                    >
                        <X size={12} strokeWidth={3} />
                    </button>
                </div>
           </div>
           
           <button 
             onClick={() => onDeleteNode(selectedNodeId)}
             className="flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors mt-1 group mx-1 mb-1"
           >
             <div className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                 <Trash2 size={16} />
             </div>
             Delete Node
           </button>
        </div>
      )}
    </div>
  );
};