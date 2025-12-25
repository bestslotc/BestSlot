// services/admin/deposit.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner'; // or your toast library
import { QUERY_KEYS } from '@/lib/constant';

// Types
export interface DepositRequest {
  id: string;
  userId: string;
  amount: string;
  paymentMethod: string;
  paymentTransactionId: string;
  senderNumber: string;
  receiverNumber: string | null;
  proofImageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  transaction: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

export interface DepositRequestsResponse {
  success: boolean;
  data: {
    requests: DepositRequest[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    summary: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      totalPendingAmount: string;
      totalApprovedAmount: string;
    };
  };
}

export interface ReviewDepositRequest {
  depositRequestId: string;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ReviewDepositResponse {
  success: boolean;
  message: string;
  data: {
    depositRequest: DepositRequest;
    transaction?: {
      id: string;
      amount: string;
      status: string;
      createdAt: string;
    };
    newWalletBalance?: string;
  };
}

// Fetch deposit requests
export function useAdminDepositRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  paymentMethod?: string;
}) {
  return useQuery<DepositRequestsResponse>({
    queryKey: [
      QUERY_KEYS.ADMIN_DEPOSIT_REQUESTS,
      params?.page,
      params?.status,
      params?.paymentMethod,
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.paymentMethod)
        searchParams.append('paymentMethod', params.paymentMethod);

      const response = await axios.get<DepositRequestsResponse>(
        `/api/admin/deposit/requests?${searchParams.toString()}`,
      );
      return response.data;
    },
  });
}

// Approve or reject deposit request
export function useReviewDepositRequest() {
  const queryClient = useQueryClient();

  return useMutation<ReviewDepositResponse, Error, ReviewDepositRequest>({
    mutationFn: async (data: ReviewDepositRequest) => {
      const response = await axios.post<ReviewDepositResponse>(
        '/api/admin/deposit/requests',
        data,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch deposit requests
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ADMIN_DEPOSIT_REQUESTS],
      });

      // Show success toast
      if (variables.action === 'APPROVE') {
        toast.success('Deposit Approved', {
          description: `Successfully approved deposit of ${data.data.depositRequest.amount} BDT`,
        });
      } else {
        toast.success('Deposit Rejected', {
          description: 'The deposit request has been rejected',
        });
      }
    },
    onError: (error, variables) => {
      // Show error toast
      const errorMessage = error.message || 'Something went wrong';

      if (variables.action === 'APPROVE') {
        toast.error('Approval Failed', {
          description: errorMessage,
        });
      } else {
        toast.error('Rejection Failed', {
          description: errorMessage,
        });
      }
    },
  });
}

// Approve deposit request (convenience hook)
export function useApproveDepositRequest() {
  const reviewMutation = useReviewDepositRequest();

  return useMutation<
    ReviewDepositResponse,
    Error,
    { depositRequestId: string; adminNotes?: string }
  >({
    mutationFn: async ({ depositRequestId, adminNotes }) => {
      return reviewMutation.mutateAsync({
        depositRequestId,
        action: 'APPROVE',
        adminNotes,
      });
    },
  });
}

// Reject deposit request (convenience hook)
export function useRejectDepositRequest() {
  const reviewMutation = useReviewDepositRequest();

  return useMutation<
    ReviewDepositResponse,
    Error,
    { depositRequestId: string; rejectionReason: string; adminNotes?: string }
  >({
    mutationFn: async ({ depositRequestId, rejectionReason, adminNotes }) => {
      return reviewMutation.mutateAsync({
        depositRequestId,
        action: 'REJECT',
        rejectionReason,
        adminNotes,
      });
    },
  });
}
