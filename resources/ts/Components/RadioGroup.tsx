import { FC, ChangeEventHandler, ChangeEvent } from "react";
import Error from "./Error";

type Error = {
    value: string;
    message?: string;
};

type Props = {
    name: string;
    values: Array<string>;
    error?: Error;
    className?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const RadioGroup: FC<Props> = ({
    name,
    values,
    error,
    className,
    onChange,
}) => {
    return (
        <div className="mb-4">
            <div role="group" className={`flex gap-4 ` + className}>
                {values.map((value, index) => (
                    <label key={index}>
                        <input
                            type="radio"
                            value={value}
                            name={name}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                if (onChange) {
                                    onChange(event);
                                }
                            }}
                            defaultChecked={index == 0}
                        />
                        <span className="label ml-1">{value}</span>
                    </label>
                ))}
            </div>
            {error && <Error value={error?.value} message={error.message} />}
        </div>
    );
};

export default RadioGroup;
