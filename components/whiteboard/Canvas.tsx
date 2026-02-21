'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Transformer, RegularPolygon, Arrow, Image as KonvaImage, Ellipse } from 'react-konva';
import { nanoid } from 'nanoid';
import { WhiteboardElement, db } from '@/lib/db';
import { Tool } from './Toolbar';
import Konva from 'konva';
import useImage from 'use-image';

interface CanvasProps {
  activeTool: Tool;
  elements: WhiteboardElement[];
  setElements: React.Dispatch<React.SetStateAction<WhiteboardElement[]>>;
  saveHistory: (newElements: WhiteboardElement[], customPastState?: WhiteboardElement[]) => void;
  undo: () => void;
  redo: () => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  defaultProps: Partial<WhiteboardElement>;
  zoom: number;
  stagePosition: { x: number; y: number };
  setStagePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

const ImageElement = ({ el, activeTool, onDragEnd, onTransformEnd, onClick }: any) => {
  const [img] = useImage(el.src);
  return (
    <KonvaImage
      id={el.id}
      image={img}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity ?? 1}
      cornerRadius={el.edges === 'round' ? 10 : 0}
      draggable={activeTool === 'select'}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onClick={onClick}
    />
  );
};

export const Canvas: React.FC<CanvasProps> = ({
  activeTool,
  elements,
  setElements,
  saveHistory,
  undo,
  redo,
  selectedIds,
  setSelectedIds,
  defaultProps,
  zoom,
  stagePosition,
  setStagePosition
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0, visible: false });
  const [newElement, setNewElement] = useState<WhiteboardElement | null>(null);
  const newElementRef = useRef<WhiteboardElement | null>(null);
  const [eraserSnapshot, setEraserSnapshot] = useState<WhiteboardElement[] | null>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const elementsRef = useRef(elements);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    const handleAddImage = async (e: any) => {
      const { src } = e.detail;
      const id = nanoid();
      const element: WhiteboardElement = {
        id,
        type: 'image',
        x: 100,
        y: 100,
        width: 200,
        height: 200,
        src,
        stroke: 'transparent',
        fill: 'transparent',
        strokeWidth: 0,
        rotation: 0,
        strokeStyle: 'solid',
        sloppiness: 0,
        edges: 'sharp',
        opacity: 1,
        arrowType: 'simple',
        arrowheads: true,
        fontFamily: 'Sans-serif',
        fontSize: 20,
        textAlign: 'left',
        ...defaultProps
      };
      saveHistory([...elementsRef.current, element]);
      setSelectedIds([id]);
    };
    window.addEventListener('add-image', handleAddImage);
    return () => window.removeEventListener('add-image', handleAddImage);
  }, [saveHistory, setSelectedIds, defaultProps]);

  const getRelativePointerPosition = (stage: Konva.Stage) => {
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const pos = stage.getPointerPosition();
    return pos ? transform.point(pos) : { x: 0, y: 0 };
  };

  const handleEraser = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const shape = stage.getIntersection(pos);
    if (shape && shape.id()) {
      const id = shape.id();
      setElements((prev) => prev.filter((el) => el.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  }, [setElements, setSelectedIds]);

  const handleTextInput = useCallback((x: number, y: number, id: string, initialText = '') => {
    const stage = stageRef.current;
    if (!stage) return;

    const existingTextarea = document.getElementById('whiteboard-textarea');
    if (existingTextarea) {
      try {
        // Check if element still has a parent before removing
        if (existingTextarea.parentNode) {
          existingTextarea.remove();
        }
      } catch (error) {
        // Element may have already been removed, ignore error
      }
    }

    const stageBox = stage.container().getBoundingClientRect();
    const textarea = document.createElement('textarea');
    textarea.id = 'whiteboard-textarea';
    document.body.appendChild(textarea);
    
    textarea.value = initialText;
    textarea.style.position = 'absolute';

    const absPos = stage.getAbsoluteTransform().point({ x, y });
    const top = stageBox.top + absPos.y;
    const left = stageBox.left + absPos.x;
    const scale = stage.scaleX();

    textarea.style.top = top + 'px';
    textarea.style.left = left + 'px';
    textarea.style.fontSize = `${(defaultProps.fontSize || 20) * scale}px`;
    textarea.style.fontFamily = defaultProps.fontFamily || 'Sans-serif';
    textarea.style.fontWeight = '400';
    textarea.style.color = defaultProps.stroke || '#1e1e1e';
    textarea.style.webkitFontSmoothing = 'antialiased';
    textarea.style.mozOsxFontSmoothing = 'grayscale';
    
    textarea.style.boxSizing = 'border-box';
    textarea.style.outline = 'none';
    textarea.style.zIndex = '9999';
    textarea.style.background = 'transparent';
    textarea.style.minWidth = '20px';
    textarea.style.minHeight = '1.2em';
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.display = 'block';
    textarea.style.visibility = 'visible';
    textarea.style.opacity = '1';
    textarea.style.overflow = 'hidden';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.2';
    textarea.style.whiteSpace = 'pre';
    textarea.style.transformOrigin = 'top left';
    textarea.style.transform = `scale(${scale})`;

    const autoResize = () => {
      textarea.style.width = '1px';
      // Add 5px buffer to prevent clipping
      textarea.style.width = (textarea.scrollWidth + 5) + 'px';
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    textarea.addEventListener('input', autoResize);
    autoResize();

    setTimeout(() => {
      textarea.focus();
    }, 0);

    let isFinished = false;
    const finishText = async () => {
      if (isFinished) return;
      isFinished = true;
      
      const val = textarea.value;
      // Add 5px buffer before dividing by scale to prevent clipping
      const finalWidth = Math.max((textarea.offsetWidth + 5) / scale, 5);
      const finalHeight = Math.max((textarea.offsetHeight) / scale, 5);

      try {
        if (textarea.parentNode && document.body.contains(textarea)) {
          document.body.removeChild(textarea);
        }
      } catch (error) {
        // Element may have already been removed, ignore error
      }

      if (val.trim()) {
        const element: WhiteboardElement = {
          id,
          type: 'text',
          x,
          y,
          text: val,
          width: finalWidth,
          height: finalHeight,
          stroke: defaultProps.stroke || '#1e1e1e',
          fill: 'transparent',
          strokeWidth: 2,
          rotation: 0,
          strokeStyle: 'solid',
          sloppiness: 1,
          edges: 'sharp',
          opacity: 1,
          fontFamily: defaultProps.fontFamily || 'Sans-serif',
          fontSize: defaultProps.fontSize || 20,
          textAlign: defaultProps.textAlign || 'left',
          ...defaultProps
        } as WhiteboardElement;

        const currentElements = elementsRef.current;
        const existingIndex = currentElements.findIndex(el => el.id === id);
        if (existingIndex !== -1) {
          const newArr = [...currentElements];
          newArr[existingIndex] = element;
          saveHistory(newArr);
        } else {
          saveHistory([...currentElements, element]);
        }
        setSelectedIds([id]);
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finishText();
      }
    });
    textarea.addEventListener('blur', finishText);
  }, [defaultProps, saveHistory, setSelectedIds]);

  const handleMouseDown = useCallback((e: any) => {
    if (activeTool === 'hand') return;

    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    if (activeTool === 'select') {
      const isClickedOnTransformer = e.target.getParent()?.className === 'Transformer';
      if (isClickedOnTransformer) return;

      const isClickedOnEmpty = e.target === stage;
      if (isClickedOnEmpty) {
        setSelectedIds([]);
        setIsSelecting(true);
        setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0, visible: true });
      } else {
        const id = e.target.id();
        if (!id) return;

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        
        setSelectedIds(prev => {
          const isSelected = prev.includes(id);
          if (!metaPressed && !isSelected) return [id];
          if (metaPressed && isSelected) return prev.filter((sid) => sid !== id);
          if (metaPressed && !isSelected) return [...prev, id];
          return prev;
        });
      }
      return;
    }

    if (activeTool === 'text') {
      handleTextInput(pos.x, pos.y, nanoid());
      return;
    }

    if (activeTool === 'eraser') {
      setEraserSnapshot([...elementsRef.current]);
      setIsDrawing(true);
      handleEraser();
      return;
    }

    setIsDrawing(true);
    const id = nanoid();
    const element: WhiteboardElement = {
      id,
      type: activeTool as any,
      x: pos.x,
      y: pos.y,
      stroke: '#1e1e1e',
      fill: 'transparent',
      strokeWidth: 2,
      rotation: 0,
      strokeStyle: 'solid',
      sloppiness: 1,
      edges: 'sharp',
      opacity: 1,
      arrowType: 'simple',
      arrowheads: true,
      fontFamily: 'Sans-serif',
      fontSize: 20,
      textAlign: 'left',
      ...defaultProps,
      ...(activeTool === 'rectangle' && { width: 0, height: 0 }),
      ...(activeTool === 'diamond' && { width: 0, height: 0 }),
      ...(activeTool === 'circle' && { width: 0, height: 0 }),
      ...(activeTool === 'triangle' && { width: 0, height: 0 }),
      ...(activeTool === 'line' && { points: [0, 0, 0, 0] }),
      ...(activeTool === 'arrow' && { points: [0, 0, 0, 0] }),
      ...(activeTool === 'pencil' && { points: [0, 0] }),
    };

    newElementRef.current = element;
    setNewElement(element);
    setSelectedIds([id]);
  }, [activeTool, defaultProps, handleTextInput, handleEraser, setSelectedIds]);

  const handleMouseMove = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);

    if (activeTool === 'eraser' && isDrawing) {
      handleEraser();
      return;
    }

    if (isSelecting) {
      setSelectionBox(prev => ({ ...prev, width: pos.x - prev.x, height: pos.y - prev.y }));
      return;
    }

    if (!isDrawing) return;

    const currentNew = newElementRef.current;
    if (!currentNew) return;

    const updatedElement = { ...currentNew };

    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'triangle' || activeTool === 'diamond') {
      updatedElement.width = pos.x - currentNew.x;
      updatedElement.height = pos.y - currentNew.y;
    } else if (activeTool === 'line' || activeTool === 'arrow') {
      updatedElement.points = [0, 0, pos.x - currentNew.x, pos.y - currentNew.y];
    } else if (activeTool === 'pencil') {
      updatedElement.points = [...(currentNew.points || []), pos.x - currentNew.x, pos.y - currentNew.y];
    }
    
    newElementRef.current = updatedElement;
    setNewElement(updatedElement);
  }, [activeTool, isDrawing, isSelecting, handleEraser]);

  const handleMouseUp = useCallback(async () => {
    if (isSelecting) {
      const box = selectionBox;
      const x1 = Math.min(box.x, box.x + box.width);
      const x2 = Math.max(box.x, box.x + box.width);
      const y1 = Math.min(box.y, box.y + box.height);
      const y2 = Math.max(box.y, box.y + box.height);

      const selected = elementsRef.current.filter((el) => {
        const elX2 = el.x + (el.width || (el.radius || 0) * 2);
        const elY2 = el.y + (el.height || (el.radius || 0) * 2);
        return x1 < elX2 && x2 > el.x && y1 < elY2 && y2 > el.y;
      }).map(el => el.id);

      setSelectedIds(selected);
      setIsSelecting(false);
      setSelectionBox(prev => ({ ...prev, visible: false }));
      return;
    }

    if (activeTool === 'eraser' && isDrawing) {
      setIsDrawing(false);
      // For eraser, we want to save history only if something was deleted
      if (eraserSnapshot && JSON.stringify(eraserSnapshot) !== JSON.stringify(elementsRef.current)) {
        saveHistory(elementsRef.current, eraserSnapshot);
      }
      setEraserSnapshot(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const currentNew = newElementRef.current;
    if (currentNew) {
      const finalElement = { ...currentNew };
      if (['rectangle', 'circle', 'triangle', 'diamond'].includes(finalElement.type)) {
        const width = finalElement.width ?? 0;
        const height = finalElement.height ?? 0;
        if (width < 0) {
          finalElement.x = finalElement.x + width;
          finalElement.width = Math.abs(width);
        }
        if (height < 0) {
          finalElement.y = finalElement.y + height;
          finalElement.height = Math.abs(height);
        }
      }

      saveHistory([...elementsRef.current, finalElement]);
    }
    
    newElementRef.current = null;
    setNewElement(null);
  }, [isSelecting, selectionBox, activeTool, isDrawing, eraserSnapshot, saveHistory, setSelectedIds]);

  const handleTransformEnd = useCallback((e: any) => {
    const nodes = transformerRef.current?.nodes();
    if (!nodes) return;
    const currentElements = elementsRef.current;
    const updatedElements = [...currentElements];
    for (const node of nodes) {
      const id = node.id();
      const index = updatedElements.findIndex((el) => el.id === id);
      if (index === -1) continue;
      const element = updatedElements[index];
      const updatedElement: WhiteboardElement = {
        ...element,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      };

      if (element.type === 'rectangle' || element.type === 'text' || element.type === 'image') {
        const newWidth = node.width() * node.scaleX();
        const newHeight = node.height() * node.scaleY();
        updatedElement.width = newWidth;
        updatedElement.height = newHeight;
        
        // For text, update fontSize proportionally to the scale
        if (element.type === 'text') {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // Use average scale to maintain aspect ratio, or use scaleY for vertical scaling
          const avgScale = (scaleX + scaleY) / 2;
          const currentFontSize = element.fontSize ?? 20;
          updatedElement.fontSize = Math.max(8, Math.round(currentFontSize * avgScale));
        }
        
        // Update node immediately so it doesn't snap back to old size before re-render
        node.width(newWidth);
        node.height(newHeight);
        node.scaleX(1);
        node.scaleY(1);
      } else if (element.type === 'circle') {
        updatedElement.width = (node as any).radiusX() * 2 * node.scaleX();
        updatedElement.height = (node as any).radiusY() * 2 * node.scaleY();
        updatedElement.x = node.x() - (updatedElement.width / 2);
        updatedElement.y = node.y() - (updatedElement.height / 2);
        node.scaleX(1);
        node.scaleY(1);
      } else if (element.type === 'triangle' || element.type === 'diamond') {
        const baseRadius = (node as any).radius();
        updatedElement.width = baseRadius * 2 * node.scaleX();
        updatedElement.height = baseRadius * 2 * node.scaleY();
        updatedElement.x = node.x() - (updatedElement.width / 2);
        updatedElement.y = node.y() - (updatedElement.height / 2);
        node.scaleX(1);
        node.scaleY(1);
      }
      
      updatedElements[index] = updatedElement;
    }
    saveHistory(updatedElements);
  }, [saveHistory]);

  const handleDragEnd = useCallback(async (e: any) => {
    const id = e.target.id();
    const currentElements = elementsRef.current;
    const element = currentElements.find((el) => el.id === id);
    if (element) {
      let nx = e.target.x();
      let ny = e.target.y();

      if (element.type === 'circle' || element.type === 'triangle' || element.type === 'diamond') {
        nx -= (element.width || 0) / 2;
        ny -= (element.height || 0) / 2;
      }

      const updatedElement = { ...element, x: nx, y: ny };
      const updatedElements = currentElements.map((el) => el.id === id ? updatedElement : el);
      saveHistory(updatedElements);
    }
  }, [saveHistory]);

  const [stageSize, setStageSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 1000,
  });

  useEffect(() => {
    const handleResize = () => setStageSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update stage position when stagePosition prop changes (but not during drag)
  // Note: Initial position is set via x/y props on Stage
  const isDraggingRef = useRef(false);
  useEffect(() => {
    if (isDraggingRef.current) return; // Don't update during drag
    const stage = stageRef.current;
    if (stage) {
      const currentPos = stage.position();
      // Only update if position actually changed to avoid unnecessary updates
      if (currentPos.x !== stagePosition.x || currentPos.y !== stagePosition.y) {
        stage.position(stagePosition);
      }
    }
  }, [stagePosition]);

  // Handle stage drag start
  const handleStageDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  // Handle stage drag end to save position
  const handleStageDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    const stage = stageRef.current;
    if (stage) {
      const pos = stage.position();
      setStagePosition({ x: pos.x, y: pos.y });
    }
  }, [setStagePosition]);

  // Also save position during drag
  const handleStageDragMove = useCallback(() => {
    const stage = stageRef.current;
    if (stage) {
      const pos = stage.position();
      setStagePosition({ x: pos.x, y: pos.y });
    }
  }, [setStagePosition]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const stage = stageRef.current;
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const oldScale = stage.scaleX();
        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        const scaleBy = 1.1;
        const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const clampedScale = Math.min(Math.max(0.1, newScale), 5);
        
        // Update zoom state in parent via a custom event since we can't easily call setZoom here
        window.dispatchEvent(new CustomEvent('update-zoom', { detail: { zoom: clampedScale } }));

        const newPos = {
          x: pointer.x - mousePointTo.x * clampedScale,
          y: pointer.y - mousePointTo.y * clampedScale,
        };
        stage.position(newPos);
        // Save position after zoom
        setStagePosition(newPos);
      }
    };

    const container = stageRef.current?.container();
    container?.addEventListener('wheel', handleWheel, { passive: false });
    return () => container?.removeEventListener('wheel', handleWheel);
  }, [zoom, setStagePosition]);

  useEffect(() => {
    if (transformerRef.current) {
      const nodes = selectedIds.map(id => stageRef.current?.findOne('#' + id)).filter(Boolean);
      transformerRef.current.nodes(nodes as Konva.Node[]);
    }
  }, [selectedIds, elements]);

  const [clipboard, setClipboard] = useState<WhiteboardElement[]>([]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isInput = document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT';
      if (isInput) return;

      // DELETE / BACKSPACE
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        const newElements = elements.filter(el => !selectedIds.includes(el.id));
        saveHistory(newElements);
        setSelectedIds([]);
        return;
      }

      // CTRL + C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selected = elements.filter(el => selectedIds.includes(el.id));
        if (selected.length > 0) {
          setClipboard(JSON.parse(JSON.stringify(selected))); // Deep clone
          console.log('Copied', selected.length, 'elements');
        }
        return;
      }

      // CTRL + V (Paste)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (clipboard.length === 0) return;

        const offset = 20;
        const newPastedElements = clipboard.map(el => ({
          ...el,
          id: nanoid(),
          x: el.x + offset,
          y: el.y + offset,
        }));

        saveHistory([...elements, ...newPastedElements]);
        setSelectedIds(newPastedElements.map(el => el.id));
        setClipboard(newPastedElements);
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements, clipboard, saveHistory, setSelectedIds]);

  const getDash = (style: string) => {
    if (style === 'dashed') return [10, 5];
    if (style === 'dotted') return [2, 5];
    return [];
  };

  return (
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      <Stage
        width={stageSize.width} height={stageSize.height}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onDragStart={handleStageDragStart}
        onDragEnd={handleStageDragEnd}
        onDragMove={handleStageDragMove}
        ref={stageRef} draggable={(activeTool as string) === 'hand'}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePosition.x}
        y={stagePosition.y}
        style={{ cursor: activeTool === 'hand' ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair' }}
      >
        <Layer>
          {elements.map((el) => {
            const commonProps: any = {
              id: el.id, x: el.x, y: el.y, stroke: el.stroke, strokeWidth: el.strokeWidth,
              fill: el.fill, rotation: el.rotation, opacity: el.opacity ?? 1,
              dash: getDash(el.strokeStyle),
              lineJoin: el.edges === 'round' ? 'round' : 'miter',
              lineCap: el.edges === 'round' ? 'round' : 'butt',
              hitStrokeWidth: 10,
              draggable: (activeTool as string) === 'select',
              onDragEnd: handleDragEnd,
              onClick: (e: any) => {
                if ((activeTool as string) === 'select') {
                  const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
                  if (!metaPressed && !selectedIds.includes(el.id)) setSelectedIds([el.id]);
                  else if (metaPressed && selectedIds.includes(el.id)) setSelectedIds(selectedIds.filter(sid => sid !== el.id));
                  else if (metaPressed) setSelectedIds([...selectedIds, el.id]);
                }
              }
            };

            if (el.type === 'rectangle') return <Rect key={el.id} {...commonProps} width={el.width ?? 0} height={el.height ?? 0} cornerRadius={el.edges === 'round' ? 10 : 0} />;
            if (el.type === 'circle') {
              const rw = Math.max(Math.abs(el.width ?? 0), 1);
              const rh = Math.max(Math.abs(el.height ?? 0), 1);
              return <Ellipse key={el.id} {...commonProps} radiusX={rw / 2} radiusY={rh / 2} x={el.x + rw / 2} y={el.y + rh / 2} />;
            }
            if (el.type === 'diamond') {
              const rw = Math.max(Math.abs(el.width ?? 0), 1);
              const rh = Math.max(Math.abs(el.height ?? 0), 1);
              return <RegularPolygon key={el.id} {...commonProps} sides={4} radius={rw / 2} scaleY={rh / rw} x={el.x + rw / 2} y={el.y + rh / 2} />;
            }
            if (el.type === 'triangle') {
              const rw = Math.max(Math.abs(el.width ?? 0), 1);
              const rh = Math.max(Math.abs(el.height ?? 0), 1);
              return <RegularPolygon key={el.id} {...commonProps} sides={3} radius={rw / 2} scaleY={rh / rw} x={el.x + rw / 2} y={el.y + rh / 2} />;
            }
            if (el.type === 'line' || el.type === 'pencil') return <Line key={el.id} {...commonProps} points={el.points || []} tension={el.type === 'pencil' ? 0.5 : 0} />;
            if (el.type === 'arrow') return <Arrow key={el.id} {...commonProps} points={el.points || []} fill={el.stroke} pointerAtEnding={el.arrowheads} />;
            if (el.type === 'text') return <Text key={el.id} {...commonProps} strokeWidth={0} fill={el.stroke} text={el.text ?? ''} fontSize={el.fontSize ?? 20} fontFamily={el.fontFamily ?? 'Sans-serif'} fontStyle="normal" lineHeight={1.2} align={el.textAlign ?? 'left'} width={el.width ?? 0} height={el.height ?? 0} onDblClick={(e) => handleTextInput(el.x, el.y, el.id, el.text ?? '')} />;
            if (el.type === 'image') return <ImageElement key={el.id} el={el} activeTool={activeTool} {...commonProps} />;
            return null;
          })}

          {newElement && (
            <>
              {newElement.type === 'rectangle' && (
                <Rect
                  x={newElement.x} y={newElement.y} width={newElement.width ?? 0} height={newElement.height ?? 0}
                  stroke={newElement.stroke} strokeWidth={newElement.strokeWidth}
                  fill={newElement.fill} opacity={newElement.opacity ?? 0.5}
                  dash={getDash(newElement.strokeStyle)}
                  cornerRadius={newElement.edges === 'round' ? 10 : 0}
                />
              )}
              {newElement.type === 'circle' && (
                <Ellipse
                  x={newElement.x + (newElement.width ?? 0) / 2} y={newElement.y + (newElement.height ?? 0) / 2} 
                  radiusX={Math.abs((newElement.width ?? 0) / 2)} radiusY={Math.abs((newElement.height ?? 0) / 2)}
                  stroke={newElement.stroke} strokeWidth={newElement.strokeWidth}
                  fill={newElement.fill} opacity={newElement.opacity ?? 0.5}
                  dash={getDash(newElement.strokeStyle)}
                />
              )}
              {newElement.type === 'triangle' && (
                <RegularPolygon
                  x={newElement.x + (newElement.width ?? 0) / 2} y={newElement.y + (newElement.height ?? 0) / 2} 
                  sides={3} radius={Math.abs(newElement.width ?? 0) / 2} scaleY={Math.abs((newElement.height ?? 0) / (Math.max(Math.abs(newElement.width ?? 0), 1)))}
                  stroke={newElement.stroke} strokeWidth={newElement.strokeWidth}
                  fill={newElement.fill} opacity={newElement.opacity ?? 0.5}
                  dash={getDash(newElement.strokeStyle)}
                />
              )}
              {newElement.type === 'diamond' && (
                <RegularPolygon
                  x={newElement.x + (newElement.width ?? 0) / 2} y={newElement.y + (newElement.height ?? 0) / 2} 
                  sides={4} radius={Math.abs(newElement.width ?? 0) / 2} scaleY={Math.abs((newElement.height ?? 0) / (Math.max(Math.abs(newElement.width ?? 0), 1)))}
                  stroke={newElement.stroke} strokeWidth={newElement.strokeWidth}
                  fill={newElement.fill} opacity={newElement.opacity ?? 0.5}
                  dash={getDash(newElement.strokeStyle)}
                />
              )}
              {(newElement.type === 'line' || newElement.type === 'pencil' || newElement.type === 'arrow') && (
                <Line
                  x={newElement.x} y={newElement.y} points={newElement.points || []}
                  stroke={newElement.stroke} strokeWidth={newElement.strokeWidth}
                  opacity={newElement.opacity ?? 0.5}
                  dash={getDash(newElement.strokeStyle)}
                  tension={newElement.type === 'pencil' ? 0.5 : 0}
                />
              )}
            </>
          )}

          {selectionBox.visible && <Rect x={selectionBox.x} y={selectionBox.y} width={selectionBox.width} height={selectionBox.height} fill="rgba(0, 161, 255, 0.3)" stroke="#00a1ff" strokeWidth={1} />}
          {selectedIds.length > 0 && activeTool === 'select' && (
            <Transformer ref={transformerRef} onTransformEnd={handleTransformEnd} />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

