import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {QuestionnaireSubmissionListItem} from "../../types/Questionnaire";
import PrettifyStatusUtil from "../../utils/PrettifyStatusUtil";
import type {TaskSubmissionListItem} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import {loadAwaitingApprovalList} from "../../actions/questionnaire";
import {loadAwaitingApprovalTaskList } from "../../actions/task";
import moment from "moment";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";
import chevronRightIcon from "../../../img/icons/chevron-right-link.svg";
import ArrowDownIcon from "../../../img/icons/arrow-down.svg";
import awaitingApprovalIcon from "../../../img/icons/awaiting-approval.svg";
import PaginationContainer from "../Pagination/PaginationContainer";
import {loadPaginationReset} from "../../actions/pagination";
import _ from "lodash";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteConfig: state.siteConfigState.siteConfig,
    awaitingApprovalList: state.questionnaireSubmissionListState.awaitingApprovalList,
    awaitingApprovalTaskList: state.questionnaireSubmissionListState.awaitingApprovalTaskList,
    loadingState: state.loadingState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadAwaitingApprovalList(10, 0));
      await dispatch(loadAwaitingApprovalTaskList(10, 0));
      await dispatch(loadSiteConfig());
    },
    dispatchloadAwaitingApprovalTaskList(limit: number, offset: number) {
      dispatch(loadAwaitingApprovalTaskList(limit, offset));
    },
    dispatchloadAwaitingApprovalList(limit: number, offset: number) {
      dispatch(loadAwaitingApprovalList(limit, offset));
    },
    resetPagination: () => dispatch(loadPaginationReset()),
  };
};

type ownProps = {
  currentUser?: User | null,
  siteConfig?: SiteConfig | null,
  dispatchLoadDataAction?: () => void,
  awaitingApprovalList?: Array<QuestionnaireSubmissionListItem>,
  awaitingApprovalTaskList?: Array<TaskSubmissionListItem>,
  loadingState: object<*>,
};

type reduxProps = {
  dispatchloadAwaitingApprovalList: (limit: number, offset: number) => void,
  dispatchloadAwaitingApprovalTaskList: (limit: number, offset: number) => void,
};

type State = {
  currentApprovalList: string
};

type Props = ownProps & reduxProps;

class AwaitingApprovalList extends Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      currentApprovalList: "QuestionnaireApproval",
    };
  }

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      siteConfig,
      awaitingApprovalList,
      awaitingApprovalTaskList,
      loadingState,
      dispatchloadAwaitingApprovalList,
      dispatchloadAwaitingApprovalTaskList,
    } = { ...this.props };

    if (!currentUser || !awaitingApprovalList || !siteConfig || !awaitingApprovalTaskList) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/FETCH_AWAITING_APPROVAL_LIST']) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <Header pageTitle="Your approvals" logopath={siteConfig.logoPath}/>
        <div className="container tab-container mb-0">
          <button
            className={this.state.currentApprovalList == "QuestionnaireApproval" ? "tab-button active": "tab-button"}
            onClick={() => {
              this.setState({ currentApprovalList: "QuestionnaireApproval" });
              this.props.resetPagination();
              this.props.dispatchloadAwaitingApprovalList(10,0);
            }}
          >
            Submission approvals
          </button>
          <button
            className={this.state.currentApprovalList == "TaskApproval"? "tab-button active": "tab-button"}
            onClick={() => {
              this.setState({ currentApprovalList: "TaskApproval" });
              this.props.resetPagination();
              this.props.dispatchloadAwaitingApprovalTaskList(10,0);
            }}
          >
            Task approvals
          </button>
        </div>
        {this.state.currentApprovalList == "QuestionnaireApproval" &&
          questionnaireList(
            awaitingApprovalList,
            currentUser,
            dispatchloadAwaitingApprovalList
          )}

        {this.state.currentApprovalList == "TaskApproval" &&
          taskList(
            awaitingApprovalTaskList,
            currentUser,
            dispatchloadAwaitingApprovalTaskList
          )}
        <Footer footerCopyrightText={siteConfig.footerCopyrightText} />
      </div>
    );
  }
}

const questionnaireList = (
  awaitingApprovalList: Array<QuestionnaireSubmissionListItem>,
  currentUser: User,
  dispatchloadAwaitingApprovalList
) => {

  const { questionnaireSubmissionList, pageInfo} = awaitingApprovalList;

  if (_.isEmpty(questionnaireSubmissionList)) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Sorry, No data to display for Questionnaire.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-hover table-approval-list">
          <thead>
            <tr key="submission_table_header">
              <th>
                <span className="date-created">Date created</span>
                <img src={ArrowDownIcon} />
              </th>
              <th className="submission-product-name-header">Product Name</th>
              <th>Business Owner</th>
              <th>Submitter</th>
              <th>Release date</th>
              <th className="security-architect-header">Security architect</th>
              <th className="submission-status-header">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {questionnaireSubmissionList.map((awaitingApproval) => {
              const url = "#/questionnaire/summary/" + awaitingApproval.uuid;
              let securityArchitectName = awaitingApproval.SecurityArchitectApprover;

              // SA name parsed as first name + last name
              if (securityArchitectName == "null null") {
                securityArchitectName = "Unassigned";
              }

              return (
                <tr key={awaitingApproval.id}>
                  <td>{moment(awaitingApproval.created).format("DD/MM/YY")}</td>
                  <td>{awaitingApproval.productName}</td>
                  <td>{awaitingApproval.businessOwner}</td>
                  <td>{awaitingApproval.submitterName}</td>
                  <td>
                    {awaitingApproval.releaseDate ? moment(awaitingApproval.releaseDate).format("DD/MM/YY"): ""}
                  </td>
                  <td className={securityArchitectName == "Unassigned" ? "unassigned-approver" : ""}>
                    {securityArchitectName}
                  </td>
                  <td>
                    <img src={awaitingApprovalIcon} />
                    {PrettifyStatusUtil.prettifyStatus(
                      awaitingApproval.status,
                      awaitingApproval.SecurityArchitectApproverID,
                      currentUser,
                      awaitingApproval.SecurityArchitectApprover,
                      awaitingApproval.CisoApprovalStatus,
                      awaitingApproval.BusinessOwnerApprovalStatus
                    )}
                  </td>
                  <td>
                    <a href={url}><img src={chevronRightIcon} /></a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationContainer
        paginationInfo={pageInfo}
        listLength={questionnaireSubmissionList.length}
        dispatchList={dispatchloadAwaitingApprovalList}
      />
    </div>
  );
};

const taskList = (
  awaitingApprovalTaskList: Array<TaskSubmissionListItem>,
  currentUser: User,
  dispatchloadAwaitingApprovalTaskList
) => {

  const { taskSubmissionList, pageInfo } = awaitingApprovalTaskList;

  if (_.isEmpty(taskSubmissionList)) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Sorry, No data to display for Task.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-hover table-approval-list">
          <thead>
            <tr key="submission_table_header">
              <th>
                <span className="date-created">Date created</span>
                <img src={ArrowDownIcon} />
              </th>
              <th className="task-name-header">Task name</th>
              <th className="task-product-name-header">Product Name</th>
              <th className="task-submitter-header">Submitter</th>
              <th className="task-status-header-header">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {taskSubmissionList.map((awaitingTaskApproval) => {
              const url = "#/task/submission/" + awaitingTaskApproval.uuid;
              return (
                <tr key={awaitingTaskApproval.id}>
                  <td>
                    {moment(awaitingTaskApproval.created).format("DD/MM/YY")}
                  </td>
                  <td>{awaitingTaskApproval.taskName}</td>
                  <td>{awaitingTaskApproval.productName}</td>
                  <td>{awaitingTaskApproval.submitterName}</td>
                  <td>
                    <img src={awaitingApprovalIcon} />
                    Awaiting approval
                  </td>
                  <td>
                    <a href={url}><img src={chevronRightIcon} /></a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationContainer
        paginationInfo={pageInfo}
        listLength={taskSubmissionList.length}
        dispatchList={dispatchloadAwaitingApprovalTaskList}
      />
    </div>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AwaitingApprovalList);
