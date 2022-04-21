import { FC } from "react";
import Auth from "@/Layouts/Auth";

type Props = {
    role: string;
};

const EditProfile: FC<Props> = ({ role }) => (
    <Auth role={role}>
        <div className="pt-4 container-lg">
            <p className="font-light text-lg w-fit mx-auto mb-4">
                Edit Profile
            </p>
            <form className="card w-fit mx-auto"></form>
        </div>
    </Auth>
);

export default EditProfile;
