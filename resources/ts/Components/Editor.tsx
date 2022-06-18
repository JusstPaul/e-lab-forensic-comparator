import { useMemo, FC } from 'react'
import { RichTextEditor } from '@mantine/rte'
import SunEditor from 'suneditor-react'
import SunEditorCore from 'suneditor/src/lib/core'

type Props = {
  name?: string
  autoFocus?: boolean
  setContents: string
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
  /*   const editor = useRef<SunEditorCore>() */

  const modules = useMemo(
    () => ({
      history: { delay: 2500, userOnly: true },
      syntax: false,
    }),
    []
  )

  return (
    <RichTextEditor
      value={setContents}
      placeholder={placeholder}
      onChange={(value) => {
        if (onChange) {
          onChange(value)
        }
      }}
      modules={modules}
      controls={[
        ['bold', 'underline', 'italic', 'strike', 'sub', 'sup', 'clean'],
        ['unorderedList', 'orderedList'],
        ['alignLeft', 'alignRight', 'alignCenter'],
      ]}
    />
  )

  /*   return (
    <SunEditor
      setDefaultStyle="font-size: 16px;"
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
        if (onChange != undefined) {
          onChange(content)
        }
      }}
      defaultValue={setContents}
      placeholder={placeholder}
    />
  ) */
}

export default Editor
