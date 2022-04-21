import { FC, ChangeEventHandler, ChangeEvent } from "react";

type Props = {
    label: string;
    value: number;
    name: string;
<<<<<<< HEAD
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const CheckBox: FC<Props> = ({
    label,
    value,
    name,
    defaultChecked,
    disabled,
    onChange,
}) => (
=======
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const CheckBox: FC<Props> = ({ label, value, name, onChange }) => (
>>>>>>> 9a441ad (Start working on Profile Edit)
    <div className="mb-4">
        <label>
            <input
                type="checkbox"
                name={name}
                value={value}
                className="rounded"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (onChange) {
                        onChange(event);
                    }
                }}
<<<<<<< HEAD
                defaultChecked={defaultChecked}
                disabled={disabled}
=======
>>>>>>> 9a441ad (Start working on Profile Edit)
            />
            <span className="label ml-1">{label}</span>
        </label>
    </div>
);

export default CheckBox;
