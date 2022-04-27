import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  role?: string
  ariaLabel?: string
}>

const Dropdown = ({
  children,
  role = 'menu',
  ariaLabel = 'menu-button',
}: Props) => {
  return (
    <div
      className="origin-top-right absolute right-0 mt-2 w-56 z-10 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y focus:outline-none"
      role={role}
      aria-orientation="vertical"
      aria-labelledby={ariaLabel}
    >
      {children}
    </div>
  )
}

export const DropdownChild = ({ children }: PropsWithChildren<{}>) => (
  <div className="py-1 text-left text-gray-900" role="none">
    {children}
  </div>
)

export const DropdownSelect = ({ children }: PropsWithChildren<{}>) => (
  <div
    className="block px-4 py-2 text-sm hover:bg-gray-200 text-left w-full"
    role="menuitem"
  >
    {children}
  </div>
)

export default Dropdown
