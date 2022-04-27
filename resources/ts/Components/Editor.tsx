import { useRef, FC } from 'react'
import SunEditor from 'suneditor-react'
import SunEditorCore from 'suneditor/src/lib/core'

type Props = {
  name?: string
  autoFocus?: boolean
  setContents?: string
  placeholder?: string
  onChange?: (content: string) => void
}

const Editor: FC<Props> = ({
  name,
  autoFocus,
  setContents,
  placeholder,
  onChange,
}) => {
  const editor = useRef<SunEditorCore>()

  return (
    <SunEditor
      getSunEditorInstance={(sunEditor) => {
        editor.current = sunEditor
      }}
      setOptions={{
        charCounter: false,
        buttonList: [
          ['undo', 'redo'],
          ['fontSize', 'formatBlock', 'removeFormat'],
          ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
          ['table'],
          ['outdent', 'indent'],
          ['showBlocks'],
        ],
      }}
      name={name}
      autoFocus={autoFocus}
      onChange={(content) => {
        if (onChange) {
          onChange(content)
        }
      }}
      setContents={setContents}
      placeholder={placeholder}
    />
  )
}

export default Editor
