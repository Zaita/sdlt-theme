// @flow

export default class URLUtil {

  static redirectToQuestionnaireEditing(uuid: string) {
    window.location.href = `/#/questionnaire/submission/${uuid}`;
  }

  static redirectToQuestionnaireReview(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/questionnaire/review/${uuid}?token=${token}`;
      return;
    }
    window.location.href = `/#/questionnaire/review/${uuid}`;
  }

  static redirectToQuestionnaireSummary(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/questionnaire/summary/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/questionnaire/summary/${uuid}`;
  }

  static redirectToTaskSubmission(uuid: string, token: string = "", returnType: string = "redirect", component: string = '') {
      let url= `/task/submission/${uuid}`;

      if (token && component) {
        url = `/task/submission/${uuid}?token=${token}&component=${component}`;
      } else if (token) {
        url = `/task/submission/${uuid}?token=${token}`;
      } else if (component) {
        url = `/task/submission/${uuid}?component=${component}`;
      }

      if (returnType == "urlString") {
        return url;
      }

      window.location.href = `/#${url}`;
  }

  static redirectToComponentSelectionSubmission(uuid: string, token: string = "", returnType: string = "redirect") {
    let url = `/component-selection/submission/${uuid}`;

    if (token) {
      url = `/component-selection/submission/${uuid}?token=${token}`;
    }

    if (returnType == "urlString") {
      return url;
    }

    window.location.href = `/#${url}`;
  }

  static redirectToSecurityRiskAssessment(uuid: string, token: string = "", returnType: string = "redirect", component: string = '') {
    let url = `/security-risk-assessment/submission/${uuid}`;

    if (token && component) {
      url = `/security-risk-assessment/submission/${uuid}?token=${token}&component=${component}`;
    } else if (token) {
      url = `/security-risk-assessment/submission/${uuid}?token=${token}`;
    } else if (component) {
      url = `/security-risk-assessment/submission/${uuid}?component=${component}`;
    }

    if (returnType == "urlString") {
      return url;
    }

    window.location.href = `/#${url}`;
  }

  static redirectToControlValidationAudit(uuid: string, token: string = "", returnType: string = "redirect", component: string = '') {
    let url = `/control-validation-audit/submission/${uuid}`;

    if (token && component) {
      url = `/control-validation-audit/submission/${uuid}?token=${token}&component=${component}`;
    } else if (token) {
      url = `/control-validation-audit/submission/${uuid}?token=${token}`;
    } else if (component) {
      url = `/control-validation-audit/submission/${uuid}?component=${component}`;
    }

    if (returnType == "urlString") {
      return url;
    }

    window.location.href = `/#${url}`;
  }

  static redirectToLogout() {
    window.location.href = "/Security/Logout";
  }

  static redirectToLogin() {
    window.location.href = "/Security/login?BackURL=%2F";
  }

  static redirectToHome() {
    window.location.href = "/";
  }

  static redirectToApprovals() {
    window.location.href = "#/AwaitingApprovals";
  }

  static redirectToSubmissions() {
    window.location.href = "#/MySubmissions";
  }
}
