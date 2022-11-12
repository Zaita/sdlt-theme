import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import type {User} from "../../types/User";
import type {QuestionnaireSubmissionListItem} from "../../types/Questionnaire";
import PrettifyStatusUtil from "../../utils/PrettifyStatusUtil";
import {loadCurrentUser} from "../../actions/user";
import {loadMySubmissionList} from "../../actions/questionnaire";
import moment from "moment";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";
import _ from "lodash";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteConfig: state.siteConfigState.siteConfig,
    mySubmissionList: state.questionnaireSubmissionListState.mySubmissionList,
    loadingState: state.loadingState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadMySubmissionList(5));
      await dispatch(loadSiteConfig());
    }
  };
};

type Props = {
  currentUser?: User | null,
  siteConfig?: SiteConfig | null,
  dispatchLoadDataAction?: () => void,
  mySubmissionList?: Array<QuestionnaireSubmissionListItem>,
  loadingState: object<*>
};

const list = (mySubmissionList: QuestionnaireSubmissionListItem, currentUser: User) => {

  const {questionnaireSubmissionList} = mySubmissionList;

  if (_.isEmpty(questionnaireSubmissionList))
  {
    return (
      <div className="container px-0">
        <div className="alert alert-danger">
          Sorry, No data to display.
        </div>
      </div>
    );
  }
  return (
    <div className="container px-0">
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr key="submission_table_header">
              <th>Date Created</th>
              <th>Pillar</th>
              <th>Product Name</th>
              <th>Tasks Completed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questionnaireSubmissionList.map((mySubmission) => {
              let url = "";
              if (mySubmission.status === "in_progress") {
                url = "#/questionnaire/submission/" + mySubmission.uuid;
              } else {
                url = "#/questionnaire/summary/" + mySubmission.uuid;
              }
              return (
                <tr key={mySubmission.id}>
                  <td>
                    {moment(mySubmission.created).format("DD MMM YYYY")}
                  </td>
                  <td>
                    {mySubmission.questionnaireName}
                  </td>
                  <td>
                    {mySubmission.productName}
                  </td>
                  <td>
                    placeholder
                  </td>
                  <td>
                    {PrettifyStatusUtil.prettifyStatus(
                      mySubmission.status,
                      mySubmission.SecurityArchitectApproverID,
                      currentUser,
                      mySubmission.SecurityArchitectApprover,
                      mySubmission.CisoApprovalStatus,
                      mySubmission.BusinessOwnerApprovalStatus)}
                  </td>
                  <td>
                      <a href={url}><NavigateNextIcon/></a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

class MySubmissionList extends Component<Props> {
  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      mySubmissionList,
      siteConfig,
      loadingState,
    } = {...this.props};

    if (!currentUser || !mySubmissionList || !siteConfig) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/FETCH_MY_SUBMISSION_LIST']) {
      return null;
    }

    return (
      <div className="submission-list">        
        {list(mySubmissionList, currentUser)}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MySubmissionList);
