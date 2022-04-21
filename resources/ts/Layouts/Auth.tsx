import { useEffect, useState } from "react";
import { PropsWithChildren } from "react";
import { Head, Link, usePage } from "@inertiajs/inertia-react";
import {
    MenuIcon,
    XIcon,
    DocumentAddIcon,
    UserAddIcon,
    ClipboardListIcon,
} from "@heroicons/react/solid";

import {
    PlusIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from "@heroicons/react/outline";
import SidebarElement from "@/Components/SidebarElement";
import isMobile from "@/Lib/isMobile";

type SideBarSectionElements = {
    display: string;
    link: string;
};

export type SideBarSection = {
    title: string;
    elements: Array<SideBarSectionElements>;
};

type Props = PropsWithChildren<{
    title?: string;
    role: string;
    sidebar?: Array<SideBarSection>;
    class_id?: string;
}>;

const Auth = ({ title, role, sidebar, class_id, children }: Props) => {
    const headTitle = "e-Lab Forensic Comparator";

    const [isOpen, setOpen] = useState(false);
    const [isSideOpen, setSideOpen] = useState(false);

    const isMobileCheck = isMobile();

    const { url } = usePage();

    return (
        <>
            <Head title={!title ? headTitle : title + " • " + headTitle} />
            <header className="grid grid-cols-3 items-center bg-primary px-2 md:px-4 py-4">
                {role === "admin" ? (
                    <Link
                        href="/"
                        className="text-lg font-extrabold col-span-2 md:col-span-1 w-fit"
                    >
                        Admin Dashboard
                    </Link>
                ) : (
                    <Link
                        href="/"
                        className="text-lg font-extrabold col-span-2 md:col-span-1 w-fit"
                    >
                        Home
                    </Link>
                )}
                {isMobileCheck ? (
                    <>
                        <div className="text-center font-bold">
                            Data Center College of the Philippines of Laoag,
                            Inc.
                        </div>
                        <div className="ml-auto flex gap-2 items-center text-sm font-semibold">
                            {role === "admin" && (
                                <Link
                                    href="/user/create"
                                    className="font-semibold"
                                    disabled={url === "/user/create"}
                                >
                                    Create User
                                </Link>
                            )}
                            <Link
                                href="/profile/edit"
                                className="font-semibold"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="font-semibold"
                            >
                                Logout
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="ml-auto"
                            onClick={() => setOpen(!isOpen)}
                        >
                            {isOpen ? (
                                <XIcon className="icon" />
                            ) : (
                                <MenuIcon className="icon" />
                            )}
                        </button>
                        {isOpen && (
                            <div className="block shadow-inner mt-2 pt-2 px-4 border-t w-full border-light col-span-3 text-right">
                                {role === "admin" && (
                                    <Link
                                        href="/user/create"
                                        className="font-semibold block"
                                        disabled={url === "/user/create"}
                                    >
                                        Create User
                                    </Link>
                                )}
                                <Link
                                    href="/profile/edit"
                                    className="font-semibold w-fit ml-auto block"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="font-semibold w-fit ml-auto block"
                                >
                                    Logout
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </header>
            <main className="relative container-lg flex h-full overflow-hidden">
                {role == "admin" ? (
                    <></>
                ) : (
                    <aside
                        className={
                            `flex-grow-0 border-r border-dark h-full py-6 px-2 md:px-6 bg-light ` +
                            (isSideOpen &&
                                "absolute md:static z-10 top-0 left-0")
                        }
                        aria-label="sidebar"
                    >
                        <div className="border-b border-dark pb-4 w-full">
                            <button
                                type="button"
                                className="w-fit"
                                onClick={() => {
                                    setSideOpen(!isSideOpen);
                                }}
                            >
                                {isSideOpen ? (
                                    <ChevronDoubleLeftIcon className="icon" />
                                ) : (
                                    <ChevronDoubleRightIcon className="icon" />
                                )}
                            </button>
                        </div>
                        {role == "instructor" ? (
                            <>
                                <div className="border-b border-dark py-8">
                                    <Link
                                        href="/class/create"
                                        className="flex gap-2"
                                    >
                                        <PlusIcon className="icon" />
                                        {isSideOpen ? (
                                            <span>Create Class</span>
                                        ) : (
                                            <></>
                                        )}
                                    </Link>
                                </div>

                                {class_id ? (
                                    <div className="border-b border-dark py-8">
                                        <Link
                                            href={
                                                "/class/" +
                                                class_id +
                                                "/activity/create"
                                            }
                                            className="flex gap-2 mb-4"
                                        >
                                            <DocumentAddIcon className="icon" />
                                            {isSideOpen ? (
                                                <span>Create Task</span>
                                            ) : (
                                                <></>
                                            )}
                                        </Link>
                                        <Link
                                            href={
                                                "/class/" +
                                                class_id +
                                                "/students/add"
                                            }
                                            className="flex gap-2"
                                        >
                                            <UserAddIcon className="icon" />
                                            {isSideOpen ? (
                                                <span>Add Student</span>
                                            ) : (
                                                <></>
                                            )}
                                        </Link>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <>
                                {isSideOpen ? (
                                    <div className="py-8">
                                        {sidebar?.map((value, index) => (
                                            <div key={index}>
                                                <SidebarElement
                                                    sidebar={value}
                                                    hasCounter={true}
                                                    highlight={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                    </aside>
                )}
                <div className="flex-grow h-full overflow-auto">{children}</div>
            </main>
        </>
    );
};

export default Auth;
