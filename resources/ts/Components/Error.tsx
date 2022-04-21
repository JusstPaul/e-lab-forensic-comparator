import { FC } from "react";

type Props = {
    value: string;
    message?: string;
};

const Error: FC<Props> = ({ value, message }) => (
    <>{value && <div className="error">{message ? message : value}</div>}</>
);

export default Error;
