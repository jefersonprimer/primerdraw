import {
  FolderOpen,
  Save,
  Image as ImageIcon,
  Users,
  Command,
  Search,
  HelpCircle,
  Trash2,
  Github,
  Twitter,
  MessageCircle,
  SlidersHorizontal,
  Monitor,
  Sun,
  Moon,
  LogIn,
} from "lucide-react"

export default function Sidebar() {
  return (
    <div className="w-60 max-h-[calc(100vh-80px)] bg-white border border-neutral-200 rounded-xl p-3 flex flex-col text-sm overflow-y-auto shadow-2xl">
      
      {/* Top Section */}
      <div className="space-y-1">

        <MenuItem icon={<FolderOpen size={16} />} label="Open" shortcut="Ctrl+O" />
        <MenuItem icon={<Save size={16} />} label="Save to..." />
        <MenuItem icon={<ImageIcon size={16} />} label="Export image..." shortcut="Ctrl+Shift+E" />
        <MenuItem icon={<Users size={16} />} label="Live collaboration..." />
        <MenuItem icon={<Command size={16} />} label="Command palette" shortcut="Ctrl+/" highlight />
        <MenuItem icon={<Search size={16} />} label="Find on canvas" shortcut="Ctrl+F" />
        <MenuItem icon={<HelpCircle size={16} />} label="Help" shortcut="?" />
        <MenuItem icon={<Trash2 size={16} />} label="Reset the canvas" isResetCanvas/>

      </div>

      <Divider />

      {/* Links */}
      <div className="space-y-1">
        <MenuItem icon={<ImageIcon size={16} />} label="Excalidraw+" />
        <MenuItem icon={<Github size={16} />} label="GitHub" />
        <MenuItem icon={<Twitter size={16} />} label="Follow us" />
        <MenuItem icon={<MessageCircle size={16} />} label="Discord chat" />
        <MenuItem icon={<LogIn size={16} />} label="Sign up" highlight />
      </div>

      <Divider />

      {/* Preferences */}
      <div className="space-y-3">

        <div className="flex items-center justify-between px-2 py-1 rounded-md text-[#1b1b1f] hover:bg-neutral-100 cursor-pointer">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <span>Preferences</span>
          </div>
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-[#1b1b1f] mb-2">Theme</p>

          <div className="flex rounded-xl p-1 border border-[#f1f0ff]">
            <ThemeButton active icon={<Sun size={16} />} />
            <ThemeButton icon={<Moon size={16} />} />
            <ThemeButton icon={<Monitor size={16} />} />
          </div>
        </div>

        {/* Language */}
        <div className="px-2">
          <select className="w-full bg-neutral-100 rounded-md px-3 py-2 text-sm text-[#1b1b1f] outline-none focus:ring-2 focus:ring-blue-400">
            <option>English</option>
            <option>Português</option>
          </select>
        </div>

        {/* Canvas background */}
        <div className="px-2">
          <p className="text-xs text-[#1b1b1f] mb-2">Canvas background</p>

          <div className="flex gap-2">
            <ColorSwatch color="bg-white" active />
            <ColorSwatch color="bg-neutral-200" />
            <ColorSwatch color="bg-neutral-300" />
            <ColorSwatch color="bg-yellow-100" />
            <ColorSwatch color="bg-neutral-100" />
          </div>
        </div>

      </div>

    </div>
  )
}

/* ------------------ Components ------------------ */

type MenuItemProps = {
  icon: React.ReactNode
  label: string
  shortcut?: string
  highlight?: boolean
  isResetCanvas?: boolean
}

function MenuItem({ icon, label, shortcut, highlight, isResetCanvas }: MenuItemProps) {
  return (
    <div
      className={`
        flex items-center justify-between px-2 py-2 rounded-md cursor-pointer
        hover:bg-neutral-100 text-[#1b1b1f]
        ${highlight ? "text-blue-400 font-medium" : ""}
        ${isResetCanvas ? "hover:text-red-600 font-medium" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>

      {shortcut && (
        <span className="text-xs text-neutral-400">{shortcut}</span>
      )}
    </div>
  )
}

type ThemeButtonProps = {
  icon: React.ReactNode
  active?: boolean
}

function ThemeButton({ icon, active }: ThemeButtonProps) {
  return (
    <button
      className={`
        w-6 h-6 flex items-center justify-center rounded-lg transition
        ${active 
          ? "bg-blue-400 text-white" 
          : "text-neutral-600 hover:bg-neutral-200"
        }
      `}
    >
      {icon}
    </button>
  )
}

function ColorSwatch({ color, active }: { color: string; active?: boolean }) {
  return (
    <div
      className={`
        w-8 h-8 rounded-md border cursor-pointer
        ${color}
        ${active ? "border-purple-600 ring-2 ring-purple-500" : "border-neutral-300 dark:border-neutral-700"}
      `}
    />
  )
}

function Divider() {
  return <div className="my-3 border-t border-neutral-200" />
}