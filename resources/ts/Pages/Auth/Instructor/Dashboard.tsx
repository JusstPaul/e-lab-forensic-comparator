import { FC } from "react";
import { Link } from "@inertiajs/inertia-react";
import { DotsVerticalIcon } from "@heroicons/react/solid";
import Auth from "@/Layouts/Auth";

type Class = {
    id: string;
    code: string;
    day: string;
    room: string;
    time_start: string;
    time_end: string;
};

type Props = {
    role: string;
    name: string;
    classes?: Array<Class>;
};

const Dashboard: FC<Props> = ({ role, classes, name }) => (
    <Auth role={role}>
        <div className="container-lg p-4 md:p-8">
            <div className="pb-4 border-b border-dark flex justify-between">
                <div className="font-semibold">Classes</div>
                <div>{name}</div>
            </div>
            <div className="py-4 md:grid grid-cols-4 gap-4">
                {classes ? (
                    classes.map((value, index) => (
                        <div
                            key={index}
                            className="bg-primary px-8 py-4 rounded-md shadow-sm"
                        >
                            <Link href={`/class/overview/` + value.id}>
                                <div className="flex items-center">
                                    <span className="text-lg mb-0 flex-grow">
                                        {value.code}
                                    </span>
                                    <button
                                        type="button"
                                        className="flex-grow-0"
                                        onClick={() => console.log("clicked")}
                                    >
                                        <DotsVerticalIcon className="icon" />
                                    </button>
                                </div>
                                <div className="text-xs">
                                    <span>{value.day} </span>
                                    <span>{value.time_start}</span>
                                    <span> to </span>
                                    <span>{value.time_end}</span>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <></>
                )}
            </div>
        </div>
    </Auth>
);

export default Dashboard;
