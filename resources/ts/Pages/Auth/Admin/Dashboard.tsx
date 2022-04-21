import { FC } from "react";
import { PencilAltIcon, TrashIcon } from "@heroicons/react/solid";
import Table from "@/Components/Table";
import Auth from "@/Layouts/Auth";

type User = {
    id: string;
    username: string;
    role: string;
};

type Props = {
    role: string;
    users: Array<User>;
};

const Dashboard: FC<Props> = ({ role, users }) => (
    <Auth title="Admin Dashboard" role={role}>
        <div className="flex flex-1 flex-col md:flex-row mx-2 mt-4 text-left">
            <Table title="Users">
                <thead>
                    <tr>
                        <th className="table-header">User ID</th>
                        <th className="table-header">Username</th>
                        <th className="table-header">Role</th>
                        <th className="table-header">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((value, index) => (
                        <tr key={index}>
                            <td className="table-data">{value.id}</td>
                            <td className="table-data">{value.username}</td>
                            <td className="table-data">{value.role}</td>
                            <td className="table-data">
                                <div className="flex gap-2">
                                    <PencilAltIcon className="icon text-teal-400" />
                                    <TrashIcon className="icon text-rose-400" />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    </Auth>
);

export default Dashboard;
