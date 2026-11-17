'use client'
import { Button } from '@/react/components/ui/Button'
import { Input } from '@/react/components/ui/Input'
import { Popover } from '@/react/components/ui/Popover'
// Save a search to a board: a short form in a panel, opened from a button.

export default function Board() {
  return (
    <Popover label="Save to a board" trigger="Save to board">
      {(close) => (
        <form className="flex flex-col gap-4" onSubmit={(event) => { event.preventDefault(); close() }}>
          <div className="flex flex-col gap-1">
            <p className="type-ui-strong text-fg">Save to a board</p>
            <p className="type-caption text-fg-muted">Keep the creatives from this search in one place.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="popover-board" className="type-label text-fg-soft">Board name</label>
            <Input id="popover-board" name="board" size="sm" defaultValue="Acme hooks" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => close()}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      )}
    </Popover>
  )
}
