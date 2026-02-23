'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WhiteboardElement } from '@/lib/db';
import { useTheme } from '@/app/contexts/ThemeContext';
import { 
  Minus, AlignLeft, AlignCenter, AlignRight,
  Maximize, Square as SquareIcon,
  Circle as CircleIcon, ArrowRight, ArrowDownToLine, MoveDown, MoveUp, ArrowUpToLine,
  ChevronDown, ArrowLeftRight
} from 'lucide-react';

interface PropertiesPanelProps {
  activeTool: string;
  selectedElements: WhiteboardElement[];
  updateElements: (updates: Partial<WhiteboardElement>) => void;
  onLayerChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
}

const STROKE_COLORS_LIGHT = ['#000000', '#e03131', '#2f9e41', '#1971c2', '#f08c00'];
const STROKE_COLORS_DARK = ['#ffffff', '#e03131', '#2f9e41', '#1971c2', '#f08c00'];
const BG_COLORS = ['transparent', '#ffec99', '#b2f2bb', '#a5d8ff', '#ffc9c9'];

const ARROWHEAD_STYLES: { id: 'triangle' | 'circle' | 'diamond'; label: string; icon: React.ReactNode }[] = [
  { id: 'triangle', label: 'Triângulo', icon: <ArrowRight size={18} /> },
  { id: 'circle', label: 'Círculo', icon: <CircleIcon size={18} /> },
  { id: 'diamond', label: 'Losango', icon: <SquareIcon size={16} className="rotate-45" /> },
];

function ArrowheadStylePicker({ value, onChange }: { value: 'triangle' | 'circle' | 'diamond'; onChange: (s: 'triangle' | 'circle' | 'diamond') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const current = ARROWHEAD_STYLES.find(s => s.id === value) ?? ARROWHEAD_STYLES[0];
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full rounded-md border border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 px-3 py-2 flex items-center justify-between gap-2 text-left text-sm"
      >
        <span className="flex items-center gap-2">
          {current.icon}
          <span className="text-gray-700 dark:text-neutral-300">{current.label}</span>
        </span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 py-1 bg-white dark:bg-[#1C1C1C] border border-gray-100 dark:border-neutral-700 rounded-lg shadow-lg z-[60]">
          {ARROWHEAD_STYLES.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { onChange(id); setOpen(false); }}
              className={`w-full px-3 py-2 flex items-center gap-2 text-sm rounded-md transition-colors ${value === id ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300'}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_ELEMENT: Partial<WhiteboardElement> = {
  stroke: '#000000',
  fill: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  sloppiness: 1,
  edges: 'sharp',
  opacity: 1,
  arrowType: 'simple',
  arrowheads: true,
  arrowBreakPoints: 3,
  arrowheadTail: false,
  arrowheadStyle: 'triangle',
  fontFamily: 'Sans-serif',
  fontSize: 20,
  textAlign: 'left',
};

export function PropertiesPanel({ 
  activeTool,
  selectedElements, 
  updateElements,
  onLayerChange 
}: PropertiesPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const STROKE_COLORS = isDark ? STROKE_COLORS_DARK : STROKE_COLORS_LIGHT;
  const isDrawingTool = ['rectangle', 'circle', 'triangle', 'line', 'arrow', 'pencil', 'text', 'image'].includes(activeTool);
  
  if (selectedElements.length === 0 && !isDrawingTool) return null;

  const first = selectedElements.length > 0 ? selectedElements[0] : DEFAULT_ELEMENT as WhiteboardElement;
  const type = selectedElements.length > 0 ? first.type : activeTool as any;
  // Cores que invertem com o tema: mostrar no painel a cor que está visível no canvas
  const contrastLight = ['#000000', '#1e1e1e', '#1a1a1a', '#111'];
  const contrastDark = ['#ffffff', '#e5e5e5', '#eee', '#f5f5f5', '#fafafa'];
  const s = (first.stroke || '').toLowerCase().trim();
  const strokeForSwatch =
    isDark && contrastLight.some((c) => c === s)
      ? '#ffffff'
      : !isDark && contrastDark.some((c) => c === s)
        ? '#000000'
        : first.stroke;

  const Section = ({ title, children, className = "" }: { title: string; children: React.ReactNode, className?: string }) => (
    <div className={`mb-5 ${className}`}>
      <h4 className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2.5">{title}</h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );

  const isShape = ['rectangle', 'circle', 'triangle', 'diamond', 'line', 'arrow'].includes(type);
  const isPencil = type === 'pencil';
  const isText = type === 'text';
  const isImage = type === 'image';

  const breakpointOptions: { value: 3 | 5 | 8; icon: React.ReactNode }[] = [
    {
      value: 3,
      icon: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 18l12 -12" />
            <path d="M18 10v-4h-4" />
          </g>
        </svg>
      ),
    },
    {
      value: 5,
      icon: (
        <svg 
          aria-hidden="true" 
          focusable="false" 
          role="img" 
          viewBox="0 0 24 24" 
          className="w-5 h-5"
          fill="none" 
          strokeWidth="2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"

        >
          <g>
            <path d="M16,12L20,9L16,6">
            </path>
            <path d="M6 20c0 -6.075 4.925 -11 11 -11h3">
            </path>
          </g>
        </svg>
      ),
    },
    {
      value: 8,
      icon: (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4,19L10,19C11.097,19 12,18.097 12,17L12,9C12,7.903 12.903,7 14,7L21,7" />
            <path d="M18 4l3 3l-3 3" />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 w-60 bg-white dark:bg-[#1C1C1C] border border-gray-100 dark:border-neutral-800 rounded-lg p-3 z-50 max-h-[80vh] overflow-y-auto custom-scrollbar transition-all duration-300">
      
      {/* STROKE COLORS */}
      {(isShape || isPencil || isText) && (
        <Section title="Stroke">
          <div className="flex items-center gap-1.5 w-full">
            {STROKE_COLORS.map(c => (
              <button
                key={c}
                className={`w-7 h-7 rounded-lg border transition-all ${strokeForSwatch === c ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#1C1C1C] scale-110 shadow-sm' : 'border-gray-100 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'}`}
                style={{ backgroundColor: c }}
                onClick={() => updateElements({ stroke: c })}
              />
            ))}
            <div className="w-[1.5px] h-5 bg-gray-200 dark:bg-neutral-600 mx-1 shrink-0" />
            <div className="relative w-7 h-7 rounded-lg border border-gray-100 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-neutral-600 transition-all shadow-sm">
              <input 
                type="color" 
                value={first.stroke.startsWith('#') ? strokeForSwatch : (isDark ? '#ffffff' : '#000000')} 
                onChange={(e) => updateElements({ stroke: e.target.value })}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none"
              />
            </div>
          </div>
        </Section>
      )}

      {/* BACKGROUND COLORS */}
      {(isShape || isPencil || isText) && (
        <Section title="Background">
          <div className="flex items-center gap-1.5 w-full">
            {BG_COLORS.map((c, i) => (
              <button
                key={c + i}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${first.fill === c ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#1C1C1C] scale-110 shadow-sm' : 'border-gray-100 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'}`}
                style={{ backgroundColor: c === 'transparent' ? 'white' : c }}
                onClick={() => updateElements({ fill: c })}
              >
                {c === 'transparent' && <Minus size={14} className="rotate-45 text-gray-400 dark:text-neutral-500" />}
              </button>
            ))}
            <div className="w-[1.5px] h-5 bg-gray-200 dark:bg-neutral-600 mx-1 flex-shrink-0" />
            <div className="relative w-7 h-7 rounded-lg border border-gray-100 dark:border-neutral-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-neutral-600 transition-all shadow-sm">
              <input 
                type="color" 
                value={first.fill !== 'transparent' && first.fill.startsWith('#') ? first.fill : '#ffffff'} 
                onChange={(e) => updateElements({ fill: e.target.value })}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer border-none"
              />
            </div>
          </div>
        </Section>
      )}

      {/* STROKE WIDTH */}
      {(isShape || isPencil) && (
        <Section title="Stroke Width">
          {[2, 4, 8].map((w, i) => (
            <button
              key={w}
              onClick={() => updateElements({ strokeWidth: w })}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.strokeWidth === w ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
            >
              <div style={{ height: (i + 1) * 1.5, width: '50%', backgroundColor: 'currentColor', borderRadius: 4 }} />
            </button>
          ))}
        </Section>
      )}

      {/* STROKE STYLE */}
      {isShape && (
        <Section title="Stroke Style">
          {(['solid', 'dashed', 'dotted'] as const).map(s => (
            <button
              key={s}
              onClick={() => updateElements({ strokeStyle: s })}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.strokeStyle === s ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
            >
              <div className={`w-2/4 h-0 ${s === 'dashed' ? 'border-t-2 border-dashed' : s === 'dotted' ? 'border-t-2 border-dotted' : 'border-t-2'} border-current`} />
            </button>
          ))}
        </Section>
      )}

      {/* SLOPPINESS — 3 tipos: limpo, mão profissional, rascunho torto */}
      {isShape && (
        <Section title="Sloppiness">
          {[
            { value: 0, title: 'Limpo e acabado' },
            { value: 1, title: 'Traço tipo lápis (bem feito)' },
            { value: 2, title: 'Traço tipo lápis (rascunho)' },
          ].map(({ value, title }) => (
            <button
              key={value}
              title={title}
              onClick={() => updateElements({ sloppiness: value })}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.sloppiness === value ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
            >
              {value === 0 && (
                <svg width="24" height="8" viewBox="0 0 48 8" className="text-current">
                  <line x1="2" y1="4" x2="46" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {value === 1 && (
                <svg width="24" height="8" viewBox="0 0 48 8" className="text-current">
                  <path d="M2 4 Q10 3 18 4 T34 4 T46 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {value === 2 && (
                <svg width="24" height="8" viewBox="0 0 48 8" className="text-current">
                  <path d="M2 4.5 L10 3 L18 5 L26 2.5 L34 4.5 L42 3.5 L46 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </Section>
      )}

      {/* EDGES */}
      {(['rectangle', 'triangle', 'diamond', 'line', 'image'].includes(type)) && (
        <Section title="Edges">
          {(['sharp', 'round'] as const).map(e => (
            <button
              key={e}
              onClick={() => updateElements({ edges: e })}
              className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.edges === e ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
            >
              {e === 'sharp' ? <SquareIcon size={18} /> : <CircleIcon size={18} />}
            </button>
          ))}
        </Section>
      )}

      {/* ARROW OPTIONS */}
      {type === 'arrow' && (
        <>
          <Section title="Pontos de quebra">
            {breakpointOptions.map(({ value, icon }) => (
              <button
                key={value}
                title={`${value} pontos`}
                onClick={() =>
                  updateElements({
                    arrowBreakPoints: value,
                    arrowType: value === 5 ? 'double' : 'simple',
                  })
                }
                className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all text-xs font-semibold ${(first.arrowBreakPoints ?? 3) === value ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
              >
                {icon}
              </button>
            ))}
          </Section>
          <Section title="Arrowheads">
            <div className="flex flex-wrap items-center gap-2 w-full">
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 w-full">Ponta no fim</span>
              {[true, false].map(ah => (
                <button
                  key={String(ah)}
                  onClick={() => updateElements({ arrowheads: ah })}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${(first.arrowheads ?? true) === ah ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
                >
                  {ah ? <ArrowRight size={20} /> : <Minus size={20} />}
                </button>
              ))}
              <span className="text-[11px] text-gray-500 dark:text-neutral-400 w-full mt-1">Ponta no início (duas pontas)</span>
              <button
                onClick={() => updateElements({ arrowheadTail: !(first.arrowheadTail ?? false) })}
                className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.arrowheadTail ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
                title="Cabeça no tail (seta dupla)"
              >
                <ArrowLeftRight size={20} />
              </button>
              <div className="w-full mt-1 relative">
                <span className="text-[11px] text-gray-500 dark:text-neutral-400 block mb-1">Estilo da ponta</span>
                <ArrowheadStylePicker value={first.arrowheadStyle ?? 'triangle'} onChange={(s) => updateElements({ arrowheadStyle: s })} />
              </div>
            </div>
          </Section>
        </>
      )}

      {/* TEXT SPECIFIC */}
      {isText && (
        <>
          <Section title="Font Family">
            {['Sans-serif', 'Serif', 'Monospace'].map(f => (
              <button
                key={f}
                onClick={() => updateElements({ fontFamily: f })}
                className={`px-3 py-2 text-[11px] font-medium rounded-xl border transition-all ${first.fontFamily === f ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
              >
                {f}
              </button>
            ))}
          </Section>
          <Section title="Font Size">
            {[16, 20, 24, 32].map(s => (
              <button
                key={s}
                onClick={() => updateElements({ fontSize: s })}
                className={`w-8 h-8 rounded-md border flex items-center justify-center text-xs font-semibold transition-all ${first.fontSize === s ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
              >
                {s}
              </button>
            ))}
          </Section>
          <Section title="Align">
            {(['left', 'center', 'right'] as const).map(a => (
              <button
                key={a}
                onClick={() => updateElements({ textAlign: a })}
                className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${first.textAlign === a ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-inner' : 'border-gray-50 dark:border-neutral-700 bg-gray-50/30 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-700 hover:border-gray-200 dark:hover:border-neutral-600'}`}
              >
                {a === 'left' ? <AlignLeft size={18} /> : a === 'center' ? <AlignCenter size={18} /> : <AlignRight size={18} />}
              </button>
            ))}
          </Section>
        </>
      )}

      {/* OPACITY */}
      <Section title={`Opacity (${Math.round(first.opacity * 100)}%)`}>
        <input 
          type="range" min="0" max="100" step="1" 
          value={Math.round(first.opacity * 100)} 
          onChange={(e) => updateElements({ opacity: parseInt(e.target.value) / 100 })}
          className="w-full h-2 bg-gray-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </Section>

      {/* LAYERS */}
      <Section title="Layers" className="mb-0">
        <div className="flex items-center gap-2">
          <button onClick={() => onLayerChange('front')} title="To Front" className="w-8 h-8 p-1 bg-[#F1F0FE] dark:bg-[#363541] rounded-md hover:bg-[#363541]/80  flex items-center justify-center text-black dark:text-white transition-all"><ArrowDownToLine size={20} /></button>
          <button onClick={() => onLayerChange('forward')} title="Forward" className="w-8 h-8 p-1 bg-[#F1F0FE] dark:bg-[#363541] rounded-md hover:bg-[#363541]/80  flex items-center justify-center text-black dark:text-white transition-all"><MoveDown size={20} /></button>
          <button onClick={() => onLayerChange('backward')} title="Backward" className="w-8 h-8 p-1 bg-[#F1F0FE] dark:bg-[#363541] rounded-md hover:bg-[#363541]/80  flex items-center justify-center text-black dark:text-white transition-all"><MoveUp size={20} /></button>
          <button onClick={() => onLayerChange('back')} title="To Back" className="w-8 h-8 p-1 bg-[#F1F0FE] dark:bg-[#363541] rounded-md hover:bg-[#363541]/80  flex items-center justify-center text-black dark:text-white transition-all"><ArrowUpToLine size={20} /></button>
        </div>
      </Section>

    </div>
  );
}
