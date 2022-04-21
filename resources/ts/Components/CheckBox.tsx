import { FC, ChangeEventHandler, ChangeEvent } from "react";

type Props = {
    label: string;
    value: number;
    name: string;
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
                defaultChecked={defaultChecked}
                disabled={disabled}
            />
            <span className="label ml-1">{label}</span>
        </label>
    </div>
);

export default CheckBox;
