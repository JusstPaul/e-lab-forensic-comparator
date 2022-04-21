import { FC, ChangeEventHandler, ChangeEvent } from "react";
import Error from "./Error";

type Error = {
    value: string;
    message?: string;
};

type Props = {
    label: string;
    value: string;
    name: string;
    type?: string;
<<<<<<< HEAD
    className?: string;
=======
>>>>>>> 9a441ad (Start working on Profile Edit)
    error?: Error;
    isFocused?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const Input: FC<Props> = ({
    label,
    value,
    name,
    type,
<<<<<<< HEAD
    className,
=======
>>>>>>> 9a441ad (Start working on Profile Edit)
    error,
    isFocused,
    onChange,
}) => (
<<<<<<< HEAD
    <div className={`mb-4 ` + className}>
        <label className="w-full">
=======
    <div className="mb-4">
        <label>
>>>>>>> 9a441ad (Start working on Profile Edit)
            <span className="label block">{label}</span>
            <input
                name={name}
                type={!type ? "text" : type}
                value={value}
                autoFocus={isFocused}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    if (onChange !== undefined) {
                        onChange(event);
                    }
                }}
<<<<<<< HEAD
                className="w-full"
=======
>>>>>>> 9a441ad (Start working on Profile Edit)
            />
        </label>
        {error && <Error value={error?.value} message={error.message} />}
    </div>
);

export default Input;
