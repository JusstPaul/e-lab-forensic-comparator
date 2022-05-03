import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title: string
  additionals?: React.ReactNode
  className?: string
}>

const Table = ({ title, additionals, className, children }: Props) => (
  <div
    className={
      'flex flex-1 flex-col md:flex-row mx-2 mt-4 text-left overflow-auto ' +
      className
    }
  >
    <div className="border-gray-200 rounded border shadow-sm w-full overflow-auto">
      <div className="bg-slate-200 px-2 py-3 border-slate-200 border-b flex justify-between">
        <span>{title}</span>
        {additionals ? <div className="px-2">{additionals}</div> : <></>}
      </div>
      <div className="p-4 bg-slate-100 overflow-auto">
        <table className="bg-slate-100 table-fixed border-collapse border border-slate-300 w-full rounded overflow-auto">
          {children}
        </table>
      </div>
    </div>
  </div>
)

export default Table
