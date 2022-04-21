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
    className?: string;
    error?: Error;
    isFocused?: boolean;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const Input: FC<Props> = ({
    label,
    value,
    name,
    type,
    className,
    error,
    isFocused,
    onChange,
}) => (
    <div className={`mb-4 ` + className}>
        <label className="w-full">
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
                className="w-full"
            />
        </label>
        {error && <Error value={error?.value} message={error.message} />}
    </div>
);

export default Input;
