"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Shortcut {
  combo: string
  description: string
}

interface HelpModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  shortcuts: Shortcut[]
}

export default function HelpModal({ open, setOpen, shortcuts }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2">
          {shortcuts.map((s) => (
            <li key={s.description} className="flex items-center justify-between text-sm">
              <span>{s.description}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
                {s.combo}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}