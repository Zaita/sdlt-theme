// @flow
// this file is used on both Risk questionnaire and task
import React, {Component} from "react";
import type {TaskRecommendation} from "../../types/Task";
import AddIcon from "../../../img/icons/add-circle.svg";
import CloseIcon from "../../../img/icons/close.svg";
import EditIcon from "../../../img/icons/edit-icon.svg";
import {Field, Form, Formik, FormikBag, FormikProps} from "formik";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import { connect } from "react-redux";
import { RootState } from "../../store/RootState";
import ActionType from "../../actions/ActionType";
import ReactModal from "react-modal";
import Select from 'react-select';
import tinymce from "tinymce";
import { Editor } from "@tinymce/tinymce-react";
import IconButton from '@material-ui/core/IconButton';

type Props = {
  taskRecommendations: Array<TaskRecommendation> | null,
  handleAddTaskRecommendationButtonClick: () => void,
  viewAs: string | null,
  status: string | null
};

class TaskRecommendationContainer extends Component<Props> {
  state = {
    showModal: false,
    FormType: "Add",
    issueID: "0"
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false, issueID: 0 });
  };

  handleOpenAddRecommendationModal = () => {
    // default next issue id is "1"
    let nextIssueId = 1;

    // if task recommendation already exist then issue id will be max id + 1
    if (this.props.taskRecommendations.length > 0) {
      const maxIdObj = this.props.taskRecommendations.reduce(function(prev, current) {
          return (prev.id > current.id) ? prev : current
      }); //returns object

      if (maxIdObj) {
        nextIssueId = maxIdObj.id + 1;
      }
    }

    this.setState({ showModal: true, issueID: nextIssueId, FormType: "Add" });
  }

  renderRecommendationform = () =>{
    return <Formik
      initialValues={
        {"id":this.state.issueID,"title":"","description":"","recommendation":"","status":""}
      }
      validate={values => {
        let errors = {};

        // Required
        if (!values.title) {
            errors.title = "Please enter the issue title.";
        }

        if (!values.status) {
            errors.status = "Please enter the status.";
        }

        if (!values.description) {
            errors.description = "Please enter the issue description.";
        }

        if (!values.recommendation) {
            errors.recommendation = "Please enter the recommendation.";
        }

        return errors;
      }}
      onSubmit={(values, formik) => {
        if (this.state.FormType == 'Add') {
          this.props.handleAddTaskRecommendationButtonClick(values);
        }
        this.handleCloseModal();
      }}
      validateOnChange= {false}
      validateOnBlur= {false}
    >
    {({isSubmitting, errors, touched, setFieldValue, values, handleChange, handleSubmit}) => {
      return(
        <Form>
          <div className="title-and-status-container">

            <div className="title-field-container">
              <label>
                Issue title
                <Field type="text" name="title" className={errors.title && "input-error"} />
                {errors.title && (<span className="error">{errors.title}</span>)}
              </label>
            </div>

            <div className="status-field-container">
              <label>
                Status
                <select
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  className={errors.status && "input-error"}
                  style={{ display: 'block' }}
                >
                  <option value="" label="Select" />
                  <option value="open" label="Open" />
                  <option value="closed" label="Closed" />
                </select>
                {errors.status && (<span className="error">{errors.status}</span>)}
              </label>
            </div>
          </div>

          <div className="issue-container">
            <label>
              Issue description
              <Field name="description" >
                {({field}) => {
                  return <textarea {...field} className={errors.description && "input-error"} />;
                }}
              </Field>
              {errors.description && (
                <span className="error">{errors.description}</span>
              )}
            </label>
          </div>

          <div>
            <label>
              Recommendation
              <Field name="recommendation" >
                {({field}) => {
                  return <textarea {...field} className={errors.recommendation && "input-error"} />;
                }}
              </Field>
              {errors.recommendation && (<span className="error">{errors.recommendation}</span>)}
            </label>
          </div>

          <div className="buttons">
            <LightButton title="Cancel" onClick={this.handleCloseModal} />
            <DarkButton type="button" title="Add" data-flag="action-add" onClick={handleSubmit} />
          </div>
        </Form>
      )
    }}
    </Formik>
  }

  renderRecommendationModal = () => {
    return (
      <div className="RecommendationModal">
        <ReactModal
          isOpen={this.state.showModal}
          ariaHideApp={false}
          parentSelector={() => {
            return document.querySelector(".TaskSubmissionContainer");
          }}
        >
          <div className="modal-header">
            <span className="header-title">
              {this.state.FormType =="Add" ? "Add Recommendation" : 'Edit Recommendation'}
            </span>
            <div className="close-icon-container" onClick={this.handleCloseModal}>
              <img src={CloseIcon} />
            </div>
          </div>
          <div className="content">
            {this.renderRecommendationform()}
          </div>
        </ReactModal>
      </div>
    );
  }

  render() {
    const {taskRecommendations, viewAs, status} = {...this.props};

    return (
      <div className="recommendation-container">
        {(viewAs === "approver" || (taskRecommendations && taskRecommendations.length > 0)) && (
            <h4>Approver's recommendations</h4>
        )}
        {taskRecommendations && taskRecommendations.length > 0 && (
          <div className="table-responsive table-continer">
            <table className="table">
              <thead className="">
                <tr key="recommendation_table_header">
                  <th className="issue-title-col">Issue title</th>
                  <th>Issue description</th>
                  <th>Recommendation</th>
                  <th>Status</th>
                  {viewAs === "approver" && status === "waiting_for_approval" && (
                    <th className="edit-col"></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {taskRecommendations.map((taskRecommendation, index): TaskRecommendation => {
                  return (
                    <tr key={index+1}>
                      <td>{taskRecommendation.title}</td>
                      <td>{taskRecommendation.description}</td>
                      <td>{taskRecommendation.recommendation}</td>
                      <td>{taskRecommendation.status}</td>
                      {viewAs === "approver" && status === "waiting_for_approval" && (
                        <td className="edit-col"><img src={EditIcon}/></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {
          viewAs === "approver" && status === "waiting_for_approval" && (
          <div
            className="add-recommendation-link"
            onClick={() => this.handleOpenAddRecommendationModal()}
          >
            <img src={AddIcon}/> Add recommendation
          </div>
        )}

        {this.renderRecommendationModal()}
      </div>
    );
  }
}

export default TaskRecommendationContainer;
