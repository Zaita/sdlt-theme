// @flow
import React, {Component} from "react";
import { Icon } from 'react-fa';
import tinymce from "tinymce";
import 'tinymce/themes/modern';
import { Editor } from "@tinymce/tinymce-react";

type Props = {
  id: string,
  name: string,
  description: string,
  implementationGuidance: string,
  implementationEvidence: string,
  showImplementationEvidence: boolean,
  isCVATaskEditable: boolean,
  className: string,
  updateEvidenceTextareaData: (value: string) => void
};

type State = {
  isExpaned: boolean,
  isImplementationEvidenceExpaned: boolean
};

export default class ControlInfo extends React.Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      isExpanded: false,
      isImplementationEvidenceExpaned: !this.props.isCVATaskEditable
  };
}

  handleOnBlurForImplementationEvidence(event) {
    if (this.props.isCVATaskEditable) {
      this.props.updateEvidenceTextareaData(event.target.getContent());
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.isCVATaskEditable !== this.props.isCVATaskEditable) {
      this.setState({
        isImplementationEvidenceExpaned: !this.props.isCVATaskEditable
      })
    }
  }

  render() {
    const {
      id,
      name,
      description,
      implementationGuidance,
      implementationEvidence,
      className,
      showImplementationEvidence,
      updateEvidenceTextareaData,
      implementationEvidenceUserInput,
      isCVATaskEditable
    } = {...this.props};

    const {isExpanded, isImplementationEvidenceExpaned} = {...this.state};
    return (
      <div className={"ControlInfo " + className}>
        {name && (<h5>{name}</h5>)}
        {
          description && (
            <div className="control-description">
              <span><b>Description: </b></span>
              <span
                className="control-description-cs"
                dangerouslySetInnerHTML={{
                  __html: description
                }}
              >
              </span>
            </div>
          )
        }
        {
          implementationGuidance && (
            <div className="implementation-Guidance">
              <div
                className="implementation-Guidance-title"
                onClick={() => this.setState({ isExpanded: !isExpanded })}
              >
                <span>
                  <b>Implementation Guidance </b>
                  <Icon name={`${isExpanded ? "caret-up" : "caret-down"}`} />
                </span>
              </div>

              {isExpanded && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: implementationGuidance
                  }}
                >
                </div>
              )}
            </div>
          )
        }
        {
          showImplementationEvidence && (
            <div className="implementation-Guidance">
              <div
                className="implementation-Guidance-title"
                onClick={() => this.setState({ isImplementationEvidenceExpaned: !isImplementationEvidenceExpaned })}
              >
                <span>
                  <b>Evidence of Implementation / Rationale of Not Applicable</b>
                  <Icon name={`${isImplementationEvidenceExpaned ? "caret-up" : "caret-down"}`} />
                </span>
              </div>

              {
                isImplementationEvidenceExpaned && (
                <div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: implementationEvidence
                  }}
                >
                </div>
                {
                  isCVATaskEditable ? (
                    <div>
                      <Editor
                        className="implementation-evidence"
                        initialValue={implementationEvidenceUserInput}
                        init={{
                          selector: 'textarea',
                          menubar: false,
                          toolbar: false,
                          statusbar: false,
                          skin_url: 'resources/vendor/silverstripe/admin/thirdparty/tinymce/skins/silverstripe'
                        }}
                        onBlur={(event) => this.handleOnBlurForImplementationEvidence(event)}
                      />
                    </div>
                    ) : (
                    <div className="implementation-evidence">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: implementationEvidenceUserInput.replace(/ href=/gi, " target='_blank' href=")
                        }}
                      >
                      </span>
                    </div>
                  )
                }
                </div>
              )}
            </div>
          )
        }
      </div>
    );
  }
}
