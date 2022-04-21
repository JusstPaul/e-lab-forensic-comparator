import { useRef, FC } from "react";
import SunEditor from "suneditor-react";

type Props = {
    name?: string;
    autoFocus?: boolean;
    setContents?: string;
    placeholder?: string;
    onChange?: (content: string) => void;
};

const Editor: FC<Props> = ({
    name,
    autoFocus,
    setContents,
    placeholder,
    onChange,
}) => {
    const editor = useRef();

    return (
        <SunEditor
            getSunEditorInstance={(sunEditor) => {
                editor.current = sunEditor as any;
            }}
            setOptions={{
                charCounter: true,
                buttonList: [
                    ["undo", "redo"],
                    ["fontSize", "formatBlock", "removeFormat"],
                    [
                        "bold",
                        "underline",
                        "italic",
                        "strike",
                        "subscript",
                        "superscript",
                    ],
                    ["table"],
                    ["outdent", "indent"],
                    ["showBlocks"],
                ],
            }}
            name={name}
            autoFocus={autoFocus}
            onChange={(content) => {
                if (onChange) {
                    onChange(content);
                }
            }}
            setContents={setContents}
            placeholder={placeholder}
        />
    );
};

export default Editor;
