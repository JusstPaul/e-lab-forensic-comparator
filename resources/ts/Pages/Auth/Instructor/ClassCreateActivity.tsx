import { FC, ChangeEvent } from "react";
import { useForm } from "@inertiajs/inertia-react";
import {
    PlusCircleIcon,
    TemplateIcon,
    PaperClipIcon,
    PencilAltIcon,
} from "@heroicons/react/outline";
import TextInput from "@/Components/TextInput";
import Class from "@/Layouts/Class";
import RadioGroup from "@/Components/RadioGroup";

type Activity = "assignment" | "exam";

type Props = {
    role: string;
    id: string;
};

const ClassCreateActivity: FC<Props> = ({ role, id }) => {
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        type: Activity;
        date_end: string;
        time_end: string;
    }>({
        title: "",
        type: "assignment",
        date_end: new Date().toISOString().split("T")[0],
        time_end: "23:59",
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        switch (name) {
            case "title":
                setData({ ...data, title: value });
                break;
            case "type":
                setData({ ...data, type: value as Activity });
                break;
            case "date_end":
                setData({ ...data, date_end: value });
                break;
            default:
                console.error("Invalid input name!");
        }
    };

    return (
        <Class role={role} id={id} mode={3}>
            <div className="container-lg p-4 md:p-8">
                <p className="font-light text-lg w-fit mx-auto mb-4">
                    Create Activity
                </p>
                <form className="relative w-full md:w-5/12 mx-auto pb-32 md:pb-16">
                    <fieldset className="card mb-4">
                        <legend className="card-legend">
                            General Settings
                        </legend>
                        <div className="card-legend-body py-2">
                            <TextInput
                                name="title"
                                label="Activity Title"
                                value={data.title}
                                error={{ value: errors.title }}
                                onChange={handleInputChange}
                            />
                            <div className="label">Activity Type</div>
                            <RadioGroup
                                name="type"
                                values={["assignment", "exam"]}
                                error={{ value: errors.type }}
                                onChange={handleInputChange}
                                className="capitalize"
                            />
                            <div className="md:flex gap-4">
                                {data.type == "assignment" ? (
                                    <>
                                        <TextInput
                                            label="Date End (mm/dd/yyyy)"
                                            type="date"
                                            name="date_end"
                                            value={data.date_end}
                                            error={{ value: errors.date_end }}
                                            onChange={handleInputChange}
                                            className="mb-2 md:mb-4 flex-grow"
                                        />
                                    </>
                                ) : (
                                    <></>
                                )}
                                <TextInput
                                    label="Time End"
                                    type="time"
                                    name="time_end"
                                    value={data.time_end}
                                    error={{ value: errors.date_end }}
                                    onChange={handleInputChange}
                                    className={
                                        data.type == "assignment"
                                            ? "flex-grow"
                                            : ""
                                    }
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="fixed z-10 card-sm rounded-b-none pb-4 bottom-0 w-fit">
                        <div className="flex gap-4">
                            <a href="#" className="flex gap-2 items-center">
                                <PlusCircleIcon className="icon" />
                            </a>
                            <a href="#" className="flex gap-2 items-center">
                                <PaperClipIcon className="icon" />
                            </a>
                            <a href="#" className="flex gap-2 items-center">
                                <TemplateIcon className="icon" />
                            </a>

                            <a href="#" className="flex gap-2 items-center">
                                <PencilAltIcon className="icon" />
                            </a>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="btn-primary w-full md:w-fit">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Class>
    );
};

export default ClassCreateActivity;
