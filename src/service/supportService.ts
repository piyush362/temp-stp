import axios from 'axios';
import {BASEURL} from '../../app.env';
import {getAccessTokenFromAsyncStorage} from '../utils/utils';

// -------------------------------------------------------------
// 1. GET CATEGORY LIST
// -------------------------------------------------------------
export const getSupportCategoryListService = async () => {
  const token = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/category-list`,
    headers: {
      'x-access-token': token,
    },
  });

  return response.data;
};
export const getSupportQuestionsByCategoryIdService = async (
  categoryId: number,
) => {
  const token = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/questions-by-category-id`,
    headers: {
      'x-access-token': token,
      'x-category-id': String(categoryId),
    },
  });

  return response.data;
};

export const getSupportSubQuestionsByParentIdService = async (
  parentId: number,
) => {
  const token = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/sub-questions-by-parent-id`,
    headers: {
      'x-access-token': token,
      'x-parent-id': String(parentId),
    },
  });

  return response.data;
};
export const getSupportQuestionDetailsService = async (questionId: number) => {
  const token = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/question-details`,
    headers: {
      'x-access-token': token,
      'x-question-id': String(questionId),
    },
  });

  return response.data;
};
export const getSupportAllQuestionsDetailsService = async (
  categoryId: number,
) => {
  const token = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/all-questions-details`,
    headers: {
      'x-access-token': token,
      'x-category-id': String(categoryId),
    },
  });

  return response.data;
};

export const getSupportChatMessagesViaTicketIdService = async (
  ticketId: number,
) => {
  const token = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/support-chat`,
    headers: {
      'x-access-token': token,
    },
    params: {
      ticket_id: ticketId,
    },
  });
  return response.data;
};

// {
//     "success": true,
//     "message": "Ticket messages fetched successfully",
//     "data": {
//         "ticket_id": 1,
//         "messages": [
//             {
//                 "id": 1,
//                 "ticket_id": 1,
//                 "sender": "admin",
//                 "message_text": "qwe",
//                 "media": null,
//                 "created_at": "2025-11-28T17:23:03.000Z"
//             },
//                 {
//                 "id": 26,
//                 "ticket_id": 1,
//                 "sender": "user",
//                 "message_text": "this is support chat.",
//                 "media": null,
//                 "created_at": "2025-12-03T11:04:41.000Z"
//             },

//         ],
//         "total": 17
//     }
// }

export const createSupportTicketService = async (_payload: {
  document_id?: number;
  name: string;
  email: string;
  phone_number: number | string;
  message: string;
}) => {
  const token = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    url: `${BASEURL}/api/auth/support/create/create-support-ticket`,
    headers: {
      'x-access-token': token,
    },
    data: _payload,
  });
  return response.data;
};

// {
//     "success": true,
//     "message": "Support ticket submitted successfully.",
//     "data": {
//         "support_ticket_no": "support_25_1764830828216",
//         "message": "Your support ticket has been raised successfully & ticket no is support_25_1764830828216"
//     }
// }

export const createSupportTicketMessageReplyService = async (_payload: {
  ticket_id: number;
  message_text: string;
}) => {
  const token = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    url: `${BASEURL}/api/auth/support/create/support-ticket-message`,
    headers: {
      'x-access-token': token,
    },
    data: _payload,
  });
  return response.data;
};

// {
//     "success": true,
//     "message": "Support ticket submitted successfully.",
//     "data": {
//         "support_ticket_no": "support_25_1764831587875",
//         "message": "Your support ticket has been raised successfully & ticket no is support_25_1764831587875"
//     }
// }

export const getAllSupportTicketListService = async () => {
  const token = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/support-ticket-list`,
    headers: {
      'x-access-token': token,
    },
  });
  return response.data;
};

export const getSupportTicketByDocumentService = async (documentId: number) => {
  const token = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/support/read/support-ticket-by-document`,
    headers: {
      'x-access-token': token,
    },
    params: {
      document_id: documentId,
    },
  });
  return response.data;
};
