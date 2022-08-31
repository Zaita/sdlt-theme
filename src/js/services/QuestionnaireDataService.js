// @flow
import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {SubmissionQuestionData, QuestionnaireSubmissionListItem} from "../types/Questionnaire";
import type {TaskSubmissionDisplay} from "../types/Task";
import QuestionParser from "../utils/QuestionParser";
import UserParser from "../utils/UserParser";
import SiteConfigParser from "../utils/SiteConfigParser";
import type {Collaborator} from "../types/User";
import type {PaginationInfo} from "../types/Pagination";
export default class QuestionnaireDataService {

  static async createInProgressSubmission(argument: { questionnaireID: string, csrfToken: string }): Promise<string> {
    const {questionnaireID, csrfToken} = {...argument};
    const query = `
mutation {
 createQuestionnaireSubmission(QuestionnaireID: ${questionnaireID}){
   UUID
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const submissionHash = _.get(json, "data.createQuestionnaireSubmission.UUID", null);
    if (!submissionHash) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return submissionHash;
  }

  static async fetchStartData(questionnaireID: string): Promise<QuestionnaireStartState> {
    const query = `
query {
  readMember(Type: "Current")  {
    ID
    Email
    FirstName
    Surname
    IsSA
    IsCISO
  }
  readQuestionnaire(ID: ${questionnaireID}) {
    ID
    Name
    KeyInformation
  }
  readSiteConfig {
    Title
    FooterCopyrightText
    LogoPath
    HomePageBackgroundImagePath
    PdfHeaderImageLink
    PdfFooterImageLink
  }
}
`;

    const json = await GraphQLRequestHelper.request({query});

    const memberData = _.get(json, "data.readMember.0", null);
    const questionnaireData = _.get(json, "data.readQuestionnaire", null);
    const siteData = _.get(json, "data.readSiteConfig.0", null);

    if (!memberData || !questionnaireData || !siteData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return {
      title: _.get(questionnaireData, "Name", ""),
      siteConfig: SiteConfigParser.parseSiteConfigFromJSON(siteData),
      subtitle: _.get(siteData, "Title", ""),
      questionnaireID: _.get(questionnaireData, "ID", ""),
      keyInformation: _.get(questionnaireData, "KeyInformation", ""),
      user: UserParser.parseUserFromJSON(memberData),
    };

  }

  static async fetchSubmissionData(submissionHash: string, secureToken:string, component:string): Promise<QuestionnaireSubmissionState> {
    const query = `
query {
  readMember(Type: "Current") {
    ID
    Email
    FirstName
    Surname
    IsSA
    IsCISO
    IsCertificationAuthority
    IsAccreditationAuthority
  }
  readQuestionnaireSubmission(UUID: "${submissionHash}", SecureToken: "${secureToken}") {
    ID
    UUID
    ApprovalLinkToken
    BusinessOwnerAcknowledgementText
    CertificationAuthorityAcknowledgementText
    AccreditationAuthorityAcknowledgementText
    IsCertificationAndAccreditationTaskExists
    ProductAspects
    User {
      ID
    }
    SubmitterName
    SubmitterEmail
    QuestionnaireStatus
    BusinessOwnerApproverName
    RiskResultData
    Questionnaire {
      ID
      Name
    }
    QuestionnaireData
    AnswerData
    CisoApprovalStatus
    BusinessOwnerApprovalStatus
    SecurityArchitectApprovalStatus
    IsCurrentUserAnApprover
    ProductName
    IsCurrentUserABusinessOwnerApprover
    TaskSubmissions {
      UUID
      TaskName
      TaskType
      Status
      IsTaskApprovalRequired
      TimeToComplete
      TimeToReview
      CanTaskCreateNewTasks
      CreateOnceInstancePerComponent
      AnswerData
      ResultForCertificationAndAccreditation
      TaskApprover {
        ID
        FirstName
        Surname
      }
    }
    CisoApprover {
      FirstName
      Surname
    }
    SecurityArchitectApprover {
      FirstName
      Surname
    }
    CertificationAuthorityApprover {
      FirstName
      Surname
    }
    AccreditationAuthorityApprover {
      FirstName
      Surname
    }
    CertificationAuthorityApprovalStatus
    AccreditationAuthorityApprovalStatus
    ApprovalOverrideBySecurityArchitect
    CollaboratorList
    Created
    ReleaseDate
    IsBusinessOwner
    TicketLink
  }
  readSiteConfig {
    Title
    FooterCopyrightText
    LogoPath
    HomePageBackgroundImagePath
    PdfHeaderImageLink
    PdfFooterImageLink
    SecurityTeamEmail
  }
}`;
    const json = await GraphQLRequestHelper.request({query});
    const memberData = _.get(json, "data.readMember.0", {});
    const submissionJSON = _.get(json, "data.readQuestionnaireSubmission.0", {});
    const siteData = _.get(json, "data.readSiteConfig.0", null);

    if (!memberData || !submissionJSON || !siteData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: QuestionnaireSubmissionState = {
      title: _.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
      siteConfig: SiteConfigParser.parseSiteConfigFromJSON(siteData),
      user: UserParser.parseUserFromJSON(memberData),
      isCurrentUserApprover: _.get(submissionJSON, "IsCurrentUserAnApprover", "false") === "true",
      isCurrentUserABusinessOwnerApprover: _.get(submissionJSON, "IsCurrentUserABusinessOwnerApprover", "false") === "true",
      submission: {
        isApprovalOverrideBySecurityArchitect: Boolean(_.get(submissionJSON, "ApprovalOverrideBySecurityArchitect", false)),
        questionnaireID: _.toString(_.get(submissionJSON, "Questionnaire.ID", "")),
        questionnaireTitle: _.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
        submissionID: _.toString(_.get(submissionJSON, "ID", "")),
        submissionUUID: _.toString(_.get(submissionJSON, "UUID", "")),
        submissionToken: _.toString(_.get(submissionJSON, "ApprovalLinkToken", "")),
        productName: _.toString(_.get(submissionJSON, "ProductName", "")),
        submitter: {
          id: _.toString(_.get(submissionJSON, "User.ID")),
          name: _.toString(_.get(submissionJSON, "SubmitterName", "")),
          email: _.toString(_.get(submissionJSON, "SubmitterEmail", "")),
          isSA: false,
          isCISO: false,
        },
        status: _.toString(_.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-", "_"),
        approvalStatus: {
          chiefInformationSecurityOfficer: _.toString(_.get(submissionJSON, "CisoApprovalStatus", "")),
          businessOwner: _.toString(_.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
          securityArchitect: _.toString(_.get(submissionJSON, "SecurityArchitectApprovalStatus", "")),
          certificationAuthority: _.toString(_.get(submissionJSON, "CertificationAuthorityApprovalStatus", "")),
          accreditationAuthority: _.toString(_.get(submissionJSON, "AccreditationAuthorityApprovalStatus", ""))
        },
        securityArchitectApprover: {
          firstName: _.toString(_.get(submissionJSON, "SecurityArchitectApprover.FirstName", "")),
          surname: _.toString(_.get(submissionJSON, "SecurityArchitectApprover.Surname", "")),
        },
        cisoApprover: {
          firstName: _.toString(_.get(submissionJSON, "CisoApprover.FirstName", "")),
          surname: _.toString(_.get(submissionJSON, "CisoApprover.Surname", "")),
        },
        certificationAuthorityApprover: {
          firstName: _.toString(_.get(submissionJSON, "CertificationAuthorityApprover.FirstName", "")),
          surname: _.toString(_.get(submissionJSON, "CertificationAuthorityApprover.Surname", "")),
        },
        accreditationAuthorityApprover: {
          firstName: _.toString(_.get(submissionJSON, "AccreditationAuthorityApprover.FirstName", "")),
          surname: _.toString(_.get(submissionJSON, "AccreditationAuthorityApprover.Surname", "")),
        },
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSON, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSON, "AnswerData", "")),
        }),
        businessOwnerApproverName: _.toString(_.get(submissionJSON, "BusinessOwnerApproverName", "")),
        businessOwnerAcknowledgementText: _.toString(_.get(submissionJSON, "BusinessOwnerAcknowledgementText", "")),
        certificationAuthorityAcknowledgementText: _.toString(_.get(submissionJSON, "CertificationAuthorityAcknowledgementText", "")),
        accreditationAuthorityAcknowledgementText: _.toString(_.get(submissionJSON, "AccreditationAuthorityAcknowledgementText", "")),
        isCertificationAndAccreditationTaskExists: _.get(submissionJSON, "IsCertificationAndAccreditationTaskExists", "false") === "true",
        taskSubmissions: _
          .toArray(_.get(submissionJSON, "TaskSubmissions", []))
          .map((item) => {

            const taskSubmission: TaskSubmissionDisplay = {
              uuid: _.toString(_.get(item, "UUID", "")),
              taskName: _.toString(_.get(item, "TaskName", "")),
              taskType: _.toString(_.get(item, "TaskType", "")),
              status: _.toString(_.get(item, "Status", "")),
              approver: UserParser.parseUserFromJSON(_.get(item, "TaskApprover")),
              isTaskApprovalRequired: _.get(item, "IsTaskApprovalRequired", "false") === "true",
              timeToComplete: _.toString(_.get(item, "TimeToComplete", "")),
              timeToReview: _.toString(_.get(item, "TimeToReview", "")),
              answerData: _.toString(_.get(item, "AnswerData", "")),
              canTaskCreateNewTasks: _.get(item, "CanTaskCreateNewTasks", "false") === "true",
              createOnceInstancePerComponent: Boolean(_.get(item, "CreateOnceInstancePerComponent", false)),
              resultForCertificationAndAccreditation: _.get(item, "ResultForCertificationAndAccreditation", "[]"),
            };
            return taskSubmission;
          }),
        collaborators: UserParser.parserCollaboratorsFromJSON(_.get(submissionJSON, "CollaboratorList", [])),
        riskResults: _.has(submissionJSON, 'RiskResultData') ? JSON.parse(_.get(submissionJSON, "RiskResultData", "[]")) : "[]",
        created: _.toString(_.get(submissionJSON, "Created", "")),
        releaseDate: _.toString(_.get(submissionJSON, "ReleaseDate", "")),
        productAspects: _.has(submissionJSON, 'ProductAspects') ? JSON.parse(_.get(submissionJSON, "ProductAspects", "[]")) : "[]",
        isBusinessOwner: _.get(submissionJSON, "IsBusinessOwner", "false") === "true",
        ticketLink: _.toString(_.get(submissionJSON, "TicketLink", ""))
      }
    };

    return data;
  }

  static async updateSubmissionData(argument: {
    submissionID: string,
    questionID: string,
    answerData: SubmissionQuestionData,
    csrfToken: string
  }): Promise<void> {
    const {submissionID, questionID, answerData, csrfToken} = {...argument};
    const answerDataStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(answerData))));

    const query = `
mutation {
  updateQuestionnaireSubmission(ID: "${submissionID}", QuestionID: "${questionID}", AnswerData: "${answerDataStr}") {
    ID
    AnswerData
  }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data.updateQuestionnaireSubmission.AnswerData", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async batchUpdateSubmissionData(argument: {
    submissionID: string,
    questionIDList: Array<string>,
    answerDataList: Array<SubmissionQuestionData>,
    csrfToken: string
  }): Promise<void> {
    const {submissionID, questionIDList, answerDataList, csrfToken} = {...argument};

    if (questionIDList.length !== answerDataList.length) {
      throw DEFAULT_NETWORK_ERROR;
    }

    let mutations = [];
    for (let index = 0; index < questionIDList.length; index++) {
      const questionID = questionIDList[index];
      const answerData = answerDataList[index];
      const answerDataStr = window.btoa(unescape(encodeURIComponent(JSON.stringify(answerData))));
      const singleQuery = `
updateQuestion${questionID}: updateQuestionnaireSubmission(ID: "${submissionID}", QuestionID: "${questionID}", AnswerData: "${answerDataStr}") {
  ID
  AnswerData
}`;
      mutations.push(singleQuery);
    }

    let query = `
mutation {
  ${mutations.join("\n")}
}
`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = _.get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }
  }

  static async submitQuestionnaire(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToSubmitted(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToSubmitted.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToSubmitted.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async submitQuestionnaireForApproval(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToAssignToSecurityArchitect(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToAssignToSecurityArchitect.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToAssignToSecurityArchitect.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async assignQuestionnaireSubmissionToSecurityArchitect(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToWaitingForSecurityArchitectApproval(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async approveQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string, skipBoAndCisoApproval: boolean}): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, skipBoAndCisoApproval} = {...argument};
    const query = `
mutation {
 updateQuestionnaireOnApproveByGroupMember(ID: "${submissionID}", SkipBoAndCisoApproval: ${skipBoAndCisoApproval}) {
   QuestionnaireStatus
   UUID
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireOnApproveByGroupMember.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireOnApproveByGroupMember.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async denyQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string, skipBoAndCisoApproval: boolean}): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, skipBoAndCisoApproval} = {...argument};
    const query = `
mutation {
 updateQuestionnaireOnDenyByGroupMember(ID: "${submissionID}", SkipBoAndCisoApproval: ${skipBoAndCisoApproval}) {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireOnDenyByGroupMember.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireOnDenyByGroupMember.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async editQuestionnaireSubmission(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToInProgress(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireStatusToInProgress.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToInProgress.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }


  static async updateQuestionnaireStatusToSendBackForChanges(argument: { submissionID: string, csrfToken: string }): Promise<{ uuid: string }> {
    const {submissionID, csrfToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToSendBackForChanges(ID: "${submissionID}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireStatusToSendBackForChanges.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToSendBackForChanges.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // load data for Awaiting Approvals, submissions list, product list
  static async fetchQuestionnaireSubmissionList(userID: string, pageType: string, limit: number, offset: number): Promise<Array<QuestionnaireSubmissionListItem>> {
    const query = `query {
      paginatedReadQuestionnaireSubmissions(UserID: "${userID}", PageType: "${pageType}", limit: ${limit}, offset: ${offset}) {
        edges {
          node {
            ID
            UUID
            QuestionnaireStatus
            QuestionnaireName
            Created
            ProductName
            ReleaseDate
            BusinessOwnerApproverName
            SubmitterName
            SecurityArchitectApprover {
              FirstName
              Surname
              ID
            }
            CisoApprovalStatus
            BusinessOwnerApprovalStatus
          }
        }
        pageInfo {
          hasNextPage,
          hasPreviousPage,
          totalCount
        }
      }
    }`;

    const json = await GraphQLRequestHelper.request({query});

    // TODO: parse data
    const data = _.get(json, 'data.paginatedReadQuestionnaireSubmissions.edges', []);
    const pageInfoData = _.get(json, 'data.paginatedReadQuestionnaireSubmissions.pageInfo', []);

    if (!Array.isArray(data)) {
      throw 'error';
    }

    const pageInfo : PaginationInfo = {
      totalCount: _.get(pageInfoData, 'totalCount', 0),
      hasNextPage: Boolean(_.get(pageInfoData, 'hasNextPage', false)),
      hasPreviousPage: Boolean(_.get(pageInfoData, 'hasPreviousPage', false))
    }

    const questionnaireSubmissionList = data.map((item: any) : QuestionnaireSubmissionListItem => {
      let obj = {};
      obj['id'] = _.get(item, 'node.ID', '');
      obj['uuid'] = _.get(item, 'node.UUID', '');
      obj['status'] = _.get(item, 'node.QuestionnaireStatus', '');
      obj['productName'] = _.get(item, 'node.ProductName', '');
      obj['questionnaireName'] = _.get(item, 'node.QuestionnaireName', '');
      obj['created'] = _.get(item, 'node.Created', '');
      obj['releaseDate'] = _.get(item, 'node.ReleaseDate', '');
      obj['businessOwner'] = _.get(item, 'node.BusinessOwnerApproverName', '');
      obj['submitterName'] = _.get(item, 'node.SubmitterName', '');
      obj['SecurityArchitectApprover'] = _.toString(_.get(item, 'node.SecurityArchitectApprover.FirstName', '') + " " + _.get(item, 'node.SecurityArchitectApprover.Surname', ''));
      obj['SecurityArchitectApproverID'] = _.get(item, 'node.SecurityArchitectApprover.ID', '');
      obj['CisoApprovalStatus'] = _.get(item, 'node.CisoApprovalStatus', '');
      obj['BusinessOwnerApprovalStatus'] =  _.get(item, 'node.BusinessOwnerApprovalStatus', '');
      obj['']
      return obj;
    });

    return {
      questionnaireSubmissionList,
      pageInfo
    }
  }

  static async approveQuestionnaireSubmissionAsBusinessOwner(
    argument: { submissionID: string, csrfToken: string, secureToken: string },
  ): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, secureToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToApproved(ID: "${submissionID}", SecureToken: "${secureToken}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToApproved.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToApproved.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // deny by business owner
  static async denyQuestionnaireSubmissionAsBusinessOwner(
    argument: { submissionID: string, csrfToken: string, secureToken: string },
  ): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, secureToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToDenied(ID: "${submissionID}", SecureToken: "${secureToken}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireStatusToDenied.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToDenied.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // add collaborator
  static async addCollaborator(submissionID: string, selectedCollaborators: Array<Collaborator>, csrfToken: string) {
    let selectedCollaboratorIDs = [];
    if (selectedCollaborators && selectedCollaborators.length > 0) {
      selectedCollaboratorIDs = selectedCollaborators.map((collaborator) => {
        return _.get(collaborator, "value", "")
      });
    }

    const selectedCollaboratorStr = window.btoa(JSON.stringify(selectedCollaboratorIDs));
    const query = `mutation {
     addCollaborator(ID: "${submissionID}", SelectedCollaborator: "${selectedCollaboratorStr}") {
       UUID
     }
    }`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});

    const uuid = _.toString(_.get(json, "data.addCollaborator.UUID", null));
    if (!uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // grant certification
  static async grantCertification(submissionID: string, csrfToken: string) {
    const query = `mutation {
     grantCertification(ID: "${submissionID}") {
       UUID
     }
    }`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});

    const uuid = _.toString(_.get(json, "data.grantCertification.UUID", null));
    if (!uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // deny certification
  static async denyCertification(submissionID: string, csrfToken: string) {
    const query = `mutation {
     denyCertification(ID: "${submissionID}") {
       UUID
     }
    }`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});

    const uuid = _.toString(_.get(json, "data.denyCertification.UUID", null));
    if (!uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // issue accreditation
  static async issueAccreditation(submissionID: string, csrfToken: string, accreditationPeriod: string) {
    const query = `mutation {
      issueAccreditation(ID: "${submissionID}", AccreditationPeriod: "${accreditationPeriod}") {
       UUID
     }
    }`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});

    const uuid = _.toString(_.get(json, "data.issueAccreditation.UUID", null));
    if (!uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  // deny accreditation
  static async denyAccreditation(submissionID: string, csrfToken: string) {
    const query = `mutation {
     denyAccreditation(ID: "${submissionID}") {
       UUID
     }
    }`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});

    const uuid = _.toString(_.get(json, "data.denyAccreditation.UUID", null));
    if (!uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }
}
