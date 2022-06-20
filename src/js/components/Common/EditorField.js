// @flow
import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

type Props = {
  heading: string,
  helpText: string,
  initialValue: string,
  fieldName: string,
  onBlurUpdate: function,
};

export default function EditorField(props: Props) {
  const { heading, helpText, initialValue, fieldName, onBlurUpdate, setUnsavedChanges } = props;
  const [isTextAreaFocus, setIsTextAreaFocus] = useState(false);

  const handleOnBlur = (event) => {
    setIsTextAreaFocus(false);
    onBlurUpdate(fieldName, event.target.getContent());
  };

  return (
    <div className="editor-container">
      <h5>{heading}</h5>
      <p className="help-text">{helpText}</p>
      <div className={`editor-text-field ${isTextAreaFocus ? "focus" : ""}`}>
        <Editor
          initialValue={initialValue}
          textareaName={fieldName}
          init={{
            selector: "textarea",
            height: "73",
            menubar: false,
            toolbar: false,
            statusbar: false,
            content_style:
              "body { font-size: 11px; line-height: 16px; }" +
              "html { scrollbar-color: #2371A6 #fff; }",
            skin_url:
              "resources/vendor/silverstripe/admin/thirdparty/tinymce/skins/silverstripe",
          }}
          onFocus={() => setIsTextAreaFocus(true)}
          onBlur={(event) => handleOnBlur(event)}
          onChange={() => setUnsavedChanges(true)}
        />
      </div>
    </div>
  );
}
