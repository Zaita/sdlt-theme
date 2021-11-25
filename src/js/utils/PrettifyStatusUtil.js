import type {User} from "../../types/User";

export default class PrettifyStatusUtil {
  static prettifyStatus(
    status: string,
    securityArchitectID: string,
    currentUser: User,
    securityArchitectApprover: string,
    CisoApprovalStatus: string,
    businessOwnerApprovalStatus: string
  ) {
    if (status === "awaiting_security_architect_review") {
      return "Awaiting security review";
    }

    if (status === "waiting_for_security_architect_approval") {
      return "Awaiting security approval";
    }

    if (status === "waiting_for_approval") {
      if (CisoApprovalStatus === "pending" && businessOwnerApprovalStatus === "pending") {
        return "Awaiting approval";
      }

      if (CisoApprovalStatus !== "pending" && businessOwnerApprovalStatus === "pending") {
        return "Awaiting business owner approval";
      }
    }

    if (status === "approved" && CisoApprovalStatus === "pending" && businessOwnerApprovalStatus === "approved") {
      return "Approved - Chief Information Security Officer Approval Pending";
    }

    if (status == "awaiting_certification_and_accreditation") {
      return "Awaiting certification and accreditation";
    }

    if (status == "awaiting_accreditation") {
      return "Awaiting accreditation";
    }

    if (status == "awaiting_certification") {
      return "Awaiting certification";
    }

    return status
      .split("_")
      .map((str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
      })
      .join(" ");
  }
}
