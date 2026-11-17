// A neutral hairline between a menu's groups, edge to edge.
export function MenuSeparator() {
  return <div data-ds="menu-separator" className="-mx-1 my-1 h-px bg-edge" role="separator" />
}

/** shadcn's name for it. */
export { MenuSeparator as DropdownMenuSeparator }

export default MenuSeparator
