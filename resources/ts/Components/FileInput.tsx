import { FC, ChangeEventHandler } from "react";

type Props = {
    label?: string;
    name?: string;
    multiple?: boolean;
    accepts?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
};

const FileInput: FC<Props> = ({ label, name, multiple, accepts, onChange }) => (
    <label className="block">
        <span className="sr-only">{label}</span>
        <input
            type="file"
            name={name}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
            accept={accepts}
            onChange={(event) => {
                if (onChange) {
                    onChange(event);
                }
            }}
            multiple={multiple}
        />
    </label>
);

export default FileInput;
