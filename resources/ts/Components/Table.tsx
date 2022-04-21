import React, { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    title: string;
    additionals?: React.ReactNode;
}>;

const Table = ({ title, additionals, children }: Props) => (
    <div className="flex flex-1 flex-col md:flex-row mx-2 mt-4 text-left">
        <div className="border-gray-200 rounded border shadow-sm w-full md:w-4/6 mx-auto">
            <div className="bg-slate-200 px-2 py-3 border-slate-200 border-b">
                {title}
            </div>
            <div className="p-4 bg-slate-100 overflow-auto">
                <table className="bg-slate-100 table-auto border-collapse border border-slate-300 w-full rounded">
                    {children}
                </table>
            </div>
            {additionals ? <div className="p-2">{additionals}</div> : <></>}
        </div>
    </div>
);

export default Table;
