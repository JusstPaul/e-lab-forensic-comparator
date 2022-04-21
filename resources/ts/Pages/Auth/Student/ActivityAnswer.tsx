import {
    ChangeEventHandler,
    CSSProperties,
    Dispatch,
    FC,
    SetStateAction,
    useState,
} from "react";
import {
    setDataByKeyValuePair,
    setDataByMethod,
    setDataByObject,
    useForm,
} from "@inertiajs/inertia-react";
import {
    ReactCompareSlider,
    ReactCompareSliderImage,
    ReactCompareSliderHandle,
} from "react-compare-slider";
import { SideBarSection } from "@/Layouts/Auth";
import {
    Question,
    Questions,
    Activity,
} from "../Instructor/ClassCreateActivity";
import RadioGroup from "@/Components/RadioGroup";
import CheckBox from "@/Components/CheckBox";
import TextInput from "@/Components/TextInput";
import Class from "@/Layouts/Class";
import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    ZoomInIcon,
    ZoomOutIcon,
} from "@heroicons/react/solid";
import useScreenOrientation from "@/Lib/useScreenOrientation";
import isMobile from "@/Lib/isMobile";
import moment from "moment";

type Comparator = {
    position: number;
    images: Array<string>;
    styles: {
        left: CSSProperties;
        right: CSSProperties;
    };
    scales: {
        left: number;
        right: number;
    };
    location: {
        left: {
            x: number;
            y: number;
        };
        right: {
            x: number;
            y: number;
        };
    };
    current: {
        left: string;
        right: string;
    };
    select_mode: "left" | "right";
    essay: string;
};

type Props = {
    id: string;
    activity_id: string;
    sidebar?: Array<SideBarSection>;
    activity: {
        id: string;
        title: string;
        type: Activity;
        date_end: string;
        time_end: string;
        questions: Questions;
        created_at: string;
    };
    total_points: number;
};

const ActivityAnswer: FC<Props> = ({
    id,
    activity_id,
    sidebar,
    activity,
    total_points,
}) => {
    const date = activity.date_end + " " + activity.time_end;
    const isLate = () => {
        return new Date(date).getTime() <= new Date().getTime();
    };

    const orientation = useScreenOrientation();
    // TODO: For comparator mobile support detection
    const mobile = isMobile();

    const [isComparatorOpen, setComparatorOpen] = useState(false);
    const [comparatorIndex, setComparatorIndex] = useState(0);

    const initializeData = () => {
        const data: Array<string | number | Array<string> | Comparator> = [];

        activity.questions.forEach((element) => {
            if (element.type == "question") {
                if (
                    element.choices?.active &&
                    element.choices?.type == "checkbox"
                ) {
                    data.push([]);
                } else {
                    data.push("");
                }
            } else if (element.type == "comparator") {
                data.push({
                    position: 50,
                    images: element.files as string[],
                    styles: { left: {}, right: {} },
                    scales: { left: 0, right: 0 },
                    current: {
                        left: element.files![0] as string,
                        right: element.files![1] as string,
                    },
                    location: {
                        left: {
                            x: 0,
                            y: 0,
                        },
                        right: {
                            x: 0,
                            y: 0,
                        },
                    },
                    select_mode: "left",
                    essay: "",
                } as Comparator);
            } else {
                data.push("");
            }
        });

        return data;
    };

    const { data, setData, post, processing, errors } = useForm<{
        answers: Array<string | number | Array<string> | Comparator>; // TODO: Add comparator state declaration
    }>("Activity:" + activity_id + "/Class:" + id, {
        answers: initializeData(),
    });

    const renderQuestion = (index: number) => {
        switch (activity.questions[index].type) {
            case "directions":
                return (
                    <div className="prose">
                        <div
                            dangerouslySetInnerHTML={{
                                __html: activity.questions[index].instruction,
                            }}
                        ></div>
                    </div>
                );
            case "question":
                const hasChoices =
                    activity.questions[index].choices?.active ?? 0;
                return (
                    <div>
                        <div className="prose">
                            {activity.questions[index].instruction}
                        </div>
                        <div className="pt-4">
                            {hasChoices == 1 ? (
                                <div>
                                    {activity.questions[index].choices!.type ==
                                    "radio" ? (
                                        <RadioGroup
                                            name={"choice-" + index}
                                            values={
                                                activity.questions[index]
                                                    .choices!.data
                                            }
                                        />
                                    ) : (
                                        // TODO: Checkbox
                                        activity.questions[
                                            index
                                        ].choices!.data.map((value, idx) => (
                                            <CheckBox
                                                label={value}
                                                name="choice-checked"
                                                key={idx}
                                            />
                                        ))
                                    )}
                                </div>
                            ) : (
                                // TODO: Create textbox for no choice question
                                <TextInput
                                    name="question"
                                    value={
                                        data.answers[index] as number | string
                                    }
                                    noLabel={true}
                                />
                            )}
                        </div>
                    </div>
                );
            case "comparator":
                return (
                    <div>
                        <div className="prose">
                            {activity.questions[index].instruction}
                        </div>
                        <div className="pt-4 flex justify-center">
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => {
                                    setComparatorIndex(index);
                                    setComparatorOpen(true);
                                }}
                            >
                                Open Comparator
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div className="error">Invalid question type!</div>;
        }
    };

    return (
        <Class id={id} mode={3} role="student" sidebar={sidebar}>
            <div>
                <div className="text-center py-4">
                    <div>
                        <p className="text-xl">{activity.title}</p>
                    </div>
                    <div>
                        <p
                            className={
                                "text-sm " + (isLate() && "text-red-500")
                            }
                        >
                            {moment(date).format("ddd DD MMMM, h:mm A")}
                        </p>
                    </div>
                </div>
                <div>
                    {isComparatorOpen ? (
                        // TODO: Comparator UI
                        <div>
                            <div className="grid grid-cols-3 items-end px-4 w-full">
                                <div>
                                    <button
                                        type="button"
                                        className="btn-primary w-fit"
                                        onClick={() => setComparatorOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p>Instruction</p>
                                    <p className="prose">
                                        {
                                            activity.questions[comparatorIndex]
                                                .instruction
                                        }
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="btn-primary w-fit"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 mt-4 px-2">
                                <div className="flex flex-col gap-2">
                                    <span className="text-md select-none">
                                        Set Left Image
                                    </span>
                                    <div className="flex flex-col gap-2 w-full px-4">
                                        <div>
                                            <span className="text-left text-sm font-medium mr-2 mb-1">
                                                Zoom
                                            </span>
                                            <div className="px-4">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ZoomInIcon className="icon-sm" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ZoomOutIcon className="icon-sm" />
                                                </button>

                                                <button type="button">
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-left text-sm font-medium mr-2 mb-1">
                                                Adjust
                                            </span>
                                            <div className="px-4">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ArrowUpIcon className="icon-sm" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ArrowDownIcon className="icon-sm" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ArrowLeftIcon className="icon-sm" />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <ArrowRightIcon className="icon-sm" />
                                                </button>

                                                <button type="button">
                                                    Reset
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-left text-sm font-medium mr-2 mb-1">
                                                Filter
                                            </span>
                                            <div className="px-4">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-yellow-200"></div>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                                                </button>

                                                <button type="button">
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    {/* TODO: Comparator Main UI */}
                                    <div className="border border-cyan-300 rounded bg-slate-200 overflow-hidden mb-4">
                                        <ReactCompareSlider
                                            itemOne={
                                                <ReactCompareSliderImage
                                                    src={
                                                        (
                                                            data.answers[
                                                                comparatorIndex
                                                            ] as Comparator
                                                        ).current.left
                                                    }
                                                    style={{
                                                        position: "relative",
                                                        ...(
                                                            data.answers[
                                                                comparatorIndex
                                                            ] as Comparator
                                                        ).styles.left,
                                                    }}
                                                />
                                            }
                                            itemTwo={
                                                <ReactCompareSliderImage
                                                    src={
                                                        (
                                                            data.answers[
                                                                comparatorIndex
                                                            ] as Comparator
                                                        ).current.right
                                                    }
                                                    style={{
                                                        position: "relative",
                                                        ...(
                                                            data.answers[
                                                                comparatorIndex
                                                            ] as Comparator
                                                        ).styles.right,
                                                    }}
                                                />
                                            }
                                            handle={
                                                <ReactCompareSliderHandle
                                                    buttonStyle={{
                                                        display: "none",
                                                    }}
                                                    linesStyle={{
                                                        height: "100%",
                                                        width: 3,
                                                    }}
                                                />
                                            }
                                            position={
                                                (
                                                    data.answers[
                                                        comparatorIndex
                                                    ] as Comparator
                                                ).position
                                            }
                                            onlyHandleDraggable={true}
                                            onPositionChange={(position) => {
                                                const nAnswers = data.answers;
                                                nAnswers[comparatorIndex] = {
                                                    ...(nAnswers[
                                                        comparatorIndex
                                                    ] as Comparator),
                                                    position: position,
                                                };

                                                setData({ answers: nAnswers });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-md select-none">
                                            Set Right Image
                                        </span>
                                        <div className="flex flex-col gap-2 w-full px-4">
                                            <div className="flex justify-end">
                                                <div>
                                                    <span className="text-left text-sm font-medium mr-2 mb-1">
                                                        Zoom
                                                    </span>
                                                    <div className="px-4">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ZoomInIcon className="icon-sm" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ZoomOutIcon className="icon-sm" />
                                                        </button>

                                                        <button type="button">
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <div>
                                                    <span className="text-left text-sm font-medium mr-2 mb-1">
                                                        Adjust
                                                    </span>
                                                    <div className="px-4">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ArrowUpIcon className="icon-sm" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ArrowDownIcon className="icon-sm" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ArrowLeftIcon className="icon-sm" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ArrowRightIcon className="icon-sm" />
                                                        </button>

                                                        <button type="button">
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <div>
                                                    <span className="text-left text-sm font-medium mr-2 mb-1">
                                                        Filter
                                                    </span>
                                                    <div className="px-4">
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-yellow-200"></div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 rounded-full bg-slate-500"></div>
                                                        </button>

                                                        <button type="button">
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <form className="w-full md:w-5/12 mx-auto pb-32 md:pb-16">
                                {activity.questions.map((_, index) => (
                                    <fieldset className="card mb-4" key={index}>
                                        <legend className="card-legend capitalize flex items-end justify-between">
                                            <span>
                                                {index + 1}.{" "}
                                                {activity.questions[index].type}
                                            </span>

                                            {activity.questions[index].points >
                                                0 && (
                                                <span className="text-sm">
                                                    {
                                                        activity.questions[
                                                            index
                                                        ].points
                                                    }{" "}
                                                    pts
                                                </span>
                                            )}
                                        </legend>
                                        <div className="card-legend-body py-2">
                                            {renderQuestion(index)}
                                        </div>
                                    </fieldset>
                                ))}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Class>
    );
};

export default ActivityAnswer;
