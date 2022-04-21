import { PropsWithChildren } from "react";
import { Link } from "@inertiajs/inertia-react";
import Auth, { SideBarSection } from "./Auth";

type Props = PropsWithChildren<{
    role: string;
    mode: 0 | 1 | 2 | 3;
    id: string;
    sidebar?: Array<SideBarSection>;
}>;

const Class = ({ role, children, mode, id, sidebar }: Props) => (
    <Auth role={role} class_id={id} sidebar={sidebar}>
        <div
            className={
                "flex justify-around pt-6 border-b border-dark " +
                (mode != 3 ? "pb-0" : "pb-1")
            }
        >
            <Link
                href={"/class/overview/" + id}
                className={
                    "font-semibold pb-5 " +
                    (mode == 0 && "text-primary border-b-4 border-primary")
                }
            >
                Overview
            </Link>
            <Link
                href={"/class/" + id + "/students/view"}
                className={
                    "font-semibold pb-5 " +
                    (mode == 1 && "text-primary border-b-4 border-primary")
                }
            >
                Students
            </Link>
            <a
                href="#"
                className={
                    "font-semibold pb-5 " +
                    (mode == 2 && "text-primary border-b-4 border-primary")
                }
            >
                Progress
            </a>
        </div>
        <div>{children}</div>
    </Auth>
);

export default Class;
