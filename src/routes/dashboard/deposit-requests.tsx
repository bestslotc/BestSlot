import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminDepositRequests,
  useReviewDepositRequest,
} from '@/services/admin/deposit';
import { createFileRoute } from '@tanstack/react-router';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/deposit-requests')({
  component: RouteComponent,
});

function RouteComponent() {
  const { isPending, data, isError } = useAdminDepositRequests();
  const reviewMutation = useReviewDepositRequest();

  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    requestId: string | null;
  }>({
    open: false,
    requestId: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    requestId: string | null;
  }>({
    open: false,
    requestId: null,
  });
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async () => {
    if (!approveDialog.requestId) return;

    try {
      await reviewMutation.mutateAsync({
        depositRequestId: approveDialog.requestId,
        action: 'APPROVE',
        adminNotes: approveNotes || undefined,
      });

      // Reset form and close dialog
      setApproveDialog({ open: false, requestId: null });
      setApproveNotes('');
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Approval error:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.requestId || !rejectReason.trim()) return;

    try {
      await reviewMutation.mutateAsync({
        depositRequestId: rejectDialog.requestId,
        action: 'REJECT',
        rejectionReason: rejectReason,
        adminNotes: rejectNotes || undefined,
      });

      // Reset form and close dialog
      setRejectDialog({ open: false, requestId: null });
      setRejectNotes('');
      setRejectReason('');
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Rejection error:', error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-2 h-5 w-96" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: this is fine
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="mt-2 h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Data
            </CardTitle>
            <CardDescription>
              Unable to fetch deposit requests. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { requests = [], summary } = data.data;

  const stats = [
    {
      title: 'Total Requests',
      value: summary.total,
      icon: DollarSign,
      description: 'All time',
      trend: null,
    },
    {
      title: 'Pending',
      value: summary.pending,
      icon: Clock,
      description: `${summary.totalPendingAmount} BDT`,
      trend: null,
      variant: 'warning' as const,
    },
    {
      title: 'Approved',
      value: summary.approved,
      icon: CheckCircle2,
      description: `${summary.totalApprovedAmount} BDT`,
      trend: null,
      variant: 'success' as const,
    },
    {
      title: 'Rejected',
      value: summary.rejected,
      icon: XCircle,
      description: 'This period',
      trend: null,
      variant: 'destructive' as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge
            className="border-warning bg-warning/10 text-warning"
            variant="outline"
          >
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge
            className="border-success bg-success/10 text-success"
            variant="outline"
          >
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge
            className="border-destructive bg-destructive/10 text-destructive"
            variant="outline"
          >
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isProcessing = reviewMutation.isPending;
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Deposit Requests
          </h1>
          <p className="text-muted-foreground">
            Manage and review user deposit requests
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card className="border-border" key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Requests Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Requests</CardTitle>
            <CardDescription>
              {requests.length} request{requests.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex min-h-100 flex-col items-center justify-center text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  No deposit requests
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deposit requests will appear here once users submit them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">
                        User
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Amount
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Method
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Sender
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Transaction ID
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="text-right text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow className="border-border" key={request.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {request.user.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {request.user.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {Number.parseFloat(request.amount).toLocaleString()}{' '}
                          BDT
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {request.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {request.senderNumber}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-xs text-foreground">
                            {request.paymentTransactionId}
                          </code>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'PENDING' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                disabled={isProcessing}
                                onClick={() =>
                                  setApproveDialog({
                                    open: true,
                                    requestId: request.id,
                                  })
                                }
                                size="sm"
                                variant="default"
                              >
                                Approve
                              </Button>
                              <Button
                                disabled={isProcessing}
                                onClick={() =>
                                  setRejectDialog({
                                    open: true,
                                    requestId: request.id,
                                  })
                                }
                                size="sm"
                                variant="outline"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!isProcessing) {
            setApproveDialog({ open, requestId: null });
            if (!open) setApproveNotes('');
          }
        }}
        open={approveDialog.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Deposit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this transaction? This action
              will add the amount to the user's wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Admin Notes (Optional)</Label>
              <Textarea
                disabled={isProcessing}
                id="approve-notes"
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
                value={approveNotes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isProcessing}
              onClick={() => {
                setApproveDialog({ open: false, requestId: null });
                setApproveNotes('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isProcessing} onClick={handleApprove}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Approval'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        onOpenChange={(open) => {
          if (!isProcessing) {
            setRejectDialog({ open, requestId: null });
            if (!open) {
              setRejectReason('');
              setRejectNotes('');
            }
          }
        }}
        open={rejectDialog.open}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this transaction. The user
              will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                disabled={isProcessing}
                id="reject-reason"
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                required
                rows={3}
                value={rejectReason}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Admin Notes (Optional)</Label>
              <Textarea
                disabled={isProcessing}
                id="reject-notes"
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Add any internal notes..."
                rows={3}
                value={rejectNotes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isProcessing}
              onClick={() => {
                setRejectDialog({ open: false, requestId: null });
                setRejectReason('');
                setRejectNotes('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!rejectReason.trim() || isProcessing}
              onClick={handleReject}
              variant="destructive"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
