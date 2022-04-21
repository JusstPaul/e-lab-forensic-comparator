import { FC, ChangeEvent } from "react";
import { useForm } from "@inertiajs/inertia-react";
import TextInput from "@/Components/TextInput";
import CheckBox from "@/Components/CheckBox";
import Auth from "@/Layouts/Auth";

type Profile = {
    last_name: string;
    first_name: string;
    middle_name: string;
    contact: string;
};

type Props = {
    role: string;
    first: boolean;
    profile?: Profile;
};

const EditProfile: FC<Props> = ({ role, first, profile }) => {
    const { data, setData, post, processing, errors } = useForm(
        profile
            ? {
                  last_name: profile.last_name,
                  first_name: profile.first_name,
                  middle_name: profile.middle_name,
                  contact: profile.contact,
                  password_change: 0,
                  password_current: "",
                  password_new: "",
                  password_new_confirmation: "",
              }
            : {
                  last_name: "",
                  first_name: "",
                  middle_name: "",
                  contact: "",
                  password_change: first ? 1 : 0,
                  password_current: "",
                  password_new: "",
                  password_new_confirmation: "",
              }
    );

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = event.target;

        switch (name) {
            case "last_name":
                setData({ ...data, last_name: value });
                break;
            case "first_name":
                setData({ ...data, first_name: value });
                break;
            case "middle_name":
                setData({ ...data, middle_name: value });
                break;
            case "contact":
                setData({ ...data, contact: value });
                break;
            case "password_change":
                if (!first) {
                    setData({ ...data, password_change: checked ? 1 : 0 });
                }
                break;
            case "password_current":
                setData({ ...data, password_current: value });
                break;
            case "password_new":
                setData({ ...data, password_new: value });
                break;
            case "password_new_confirmation":
                setData({ ...data, password_new_confirmation: value });
                break;
            default:
                console.error("Invalid input name!");
        }
    };

    return (
        <Auth role={role}>
            <div className="pt-4 container-lg">
                <p className="font-light text-lg w-fit mx-auto mb-4">
                    Edit Profile
                </p>
                <form
                    className="card w-fit mx-auto md:w-6/12"
                    onSubmit={(event) => {
                        event.preventDefault();
                        post("/profile/edit");
                    }}
                >
                    <fieldset className="px-2 md:flex gap-2">
                        <TextInput
                            label="Last Name"
                            name="last_name"
                            value={data.last_name}
                            isFocused={true}
                            error={{
                                value: errors.last_name,
                                message: "Please enter a last name",
                            }}
                            className="mb-2 md:mb-4"
                            onChange={handleInputChange}
                        />
                        <TextInput
                            label="First Name"
                            name="first_name"
                            value={data.first_name}
                            error={{
                                value: errors.first_name,
                                message: "Please enter a first name",
                            }}
                            className="mb-2 md:mb-4"
                            onChange={handleInputChange}
                        />
                        <TextInput
                            label="Middle Name"
                            name="middle_name"
                            value={data.middle_name}
                            error={{
                                value: errors.middle_name,
                                message: "Please enter a middle name",
                            }}
                            onChange={handleInputChange}
                        />
                    </fieldset>
                    <TextInput
                        label="Cellphone Number"
                        name="contact"
                        value={data.contact}
                        error={{
                            value: errors.contact,
                            message: "Please enter a valid contact number",
                        }}
                        className="w-fit px-2"
                        onChange={handleInputChange}
                    />
                    <div className="px-2 w-full">
                        <div className="w-full">
                            <div className="w-fit ml-auto">
                                <CheckBox
                                    label="Change Password"
                                    name="password_change"
                                    value={data.password_change}
                                    defaultChecked={first}
                                    disabled={first}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {data.password_change ? (
                                <fieldset>
                                    <TextInput
                                        type="password"
                                        label="Current Password"
                                        name="password_current"
                                        value={data.password_current}
                                        error={{
                                            value: errors.password_current,
                                            message:
                                                "Please enter the current password",
                                        }}
                                        className="w-fit"
                                        onChange={handleInputChange}
                                    />
                                    <div className="md:flex gap-2">
                                        <TextInput
                                            type="password"
                                            label="New Password"
                                            name="password_new"
                                            value={data.password_new}
                                            error={{
                                                value: errors.password_new,
                                                message:
                                                    "Please enter a new password and confirm it",
                                            }}
                                            onChange={handleInputChange}
                                        />
                                        <TextInput
                                            type="password"
                                            label="Confirm New Password"
                                            name="password_new_confirmation"
                                            value={
                                                data.password_new_confirmation
                                            }
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </fieldset>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="w-full md:w-fit md:ml-auto">
                            <button
                                className="btn-primary w-full"
                                disabled={processing}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Auth>
    );
};

export default EditProfile;
