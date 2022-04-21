import { ChangeEvent, FC } from "react";
import { useForm } from "@inertiajs/inertia-react";
import Table from "@/Components/Table";
import Class from "@/Layouts/Class";

type Student = {
    id: string;
    student_id: string;
    name: string;
    contact: string;
};

type Props = {
    role: string;
    id: string;
    students: Array<Student>;
};

const ClassAddStudent: FC<Props> = ({ role, id, students }) => {
    const { data, setData, post, processing, errors } = useForm<{
        selected: Array<string>;
    }>({
        selected: [],
    });

    return (
        <Class role={role} id={id} mode={3}>
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    post("/class/" + id + "/students/add");
                }}
            >
                <Table
                    title="Add Student"
                    additionals={
                        <div className="md:flex items-center gap-4 justify-end">
                            {errors.selected ? (
                                <div className="error">
                                    Please select at least one student
                                </div>
                            ) : (
                                <></>
                            )}
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={processing}
                            >
                                Add Students
                            </button>
                        </div>
                    }
                >
                    <thead>
                        <tr>
                            <th className="table-header w-fit"></th>
                            <th className="table-header">User ID</th>
                            <th className="table-header">Student ID</th>
                            <th className="table-header">Name</th>
                            <th className="table-header">Contact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((value, index) => (
                            <tr key={index}>
                                <td className="table-data w-fit">
                                    <input
                                        type="checkbox"
                                        name={value.id}
                                        className="rounded"
                                        onChange={(
                                            event: ChangeEvent<HTMLInputElement>
                                        ) => {
                                            const idx = data.selected.indexOf(
                                                event.target.name,
                                                0
                                            );
                                            const nSelected = data.selected;
                                            if (idx > -1) {
                                                nSelected.splice(idx, 1);
                                            } else {
                                                nSelected.push(
                                                    event.target.name
                                                );
                                            }
                                            setData({ selected: nSelected });
                                        }}
                                    />
                                </td>
                                <td className="table-data">{value.id}</td>
                                <td className="table-data">
                                    {value.student_id}
                                </td>
                                <td className="table-data">{value.name}</td>
                                <td className="table-data">{value.contact}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </form>
        </Class>
    );
};

export default ClassAddStudent;
