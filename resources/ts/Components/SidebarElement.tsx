import { FC, useState } from "react";
import { SideBarSection } from "@/Layouts/Auth";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { Link } from "@inertiajs/inertia-react";

type Props = {
    sidebar: SideBarSection;
    hasCounter?: boolean;
    highlight?: boolean;
};

const SidebarElement: FC<Props> = ({ sidebar, hasCounter, highlight }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { title, elements } = sidebar;

    return (
        <div className="mb-4">
            <button
                type="button"
                className={
                    "flex gap items-center font-semibold " +
                    (highlight && elements.length >= 1 && "text-red-500")
                }
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{title}</span>
                {hasCounter && (
                    <span className="text-xs">({elements.length})</span>
                )}
                {isOpen ? (
                    <ChevronUpIcon className="icon" />
                ) : (
                    <ChevronDownIcon className="icon" />
                )}
            </button>
            {isOpen && (
                <div className="text-sm pl-2">
                    {elements.length == 0 ? (
                        <span>Empty</span>
                    ) : (
                        <>
                            {elements.map((val, idx) => (
                                <div key={idx}>
                                    <Link href={val.link}>{val.display}</Link>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SidebarElement;
