import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ReceiptLong,
  Inventory2,
  Download,
  PictureAsPdf,
  Payments,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { invoiceService, Invoice } from '../services/invoice';
import { Order, OrderItem, Payment } from '../types';

type OrderRow = Order & {
  order_items: Array<OrderItem & { product: any }>;
  payments: Payment[];
  invoices: Invoice[];
};

const statusColor = (status?: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'paid':
      return 'success';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'shipped':
    case 'delivered':
      return 'info';
    default:
      return 'default';
  }
};

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string>(''); // id while acting

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    setError('');
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          payments (*),
          invoices:invoices!invoices_order_id_fkey (*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as OrderRow[]) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fmt = (n?: number) => `€${Number(n || 0).toFixed(2)}`;
  const short = (id?: string) => (id ? id.slice(0, 8) : '');

  const handleGenerateInvoice = async (order: OrderRow) => {
    if (!order?.id) return;
    setActionLoading(order.id);
    try {
      const { data: inv, error } = await invoiceService.createInvoice(order.id);
      if (error) throw error;
      // Best-effort email to the buyer
      const email = user?.email || '';
      if (inv && email) {
        await invoiceService.sendInvoiceEmail(inv.id, email);
      }
      await fetchOrders();
    } catch (e: any) {
      setError(e.message || 'Failed to generate invoice');
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    setActionLoading(invoiceId);
    try {
      await invoiceService.downloadInvoice(invoiceId);
    } catch (e: any) {
      setError(e.message || 'Failed to download invoice');
    } finally {
      setActionLoading('');
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReceiptLong sx={{ color: 'var(--primary-color)' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('orders.title')}
          </Typography>
        </Box>
        <Tooltip title={t('orders.refresh')}>
          <span>
            <Button
              onClick={fetchOrders}
              startIcon={refreshing ? <CircularProgress size={18} /> : <Refresh />}
              disabled={refreshing}
              variant="outlined"
              sx={{
                borderColor: `rgba(var(--primary-rgb), 0.5)`,
                color: 'var(--primary-color)',
                '&:hover': { borderColor: 'var(--primary-color)', bgcolor: 'var(--bg-active)' },
              }}
            >
              {t('orders.refresh')}
            </Button>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            bgcolor: `rgba(var(--danger-rgb), 0.08)`,
            color: 'var(--danger-color)',
            border: `1px solid rgba(var(--danger-rgb), 0.2)`,
            '& .MuiAlert-icon': {
              color: 'var(--danger-color)',
            },
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Card sx={{
          p: 4,
          bgcolor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            {t('orders.noOrders')}
          </Typography>
        </Card>
      ) : (
        orders.map((order: OrderRow) => {
          const hasInvoice = (order.invoices || []).length > 0;
          const firstInvoice = hasInvoice ? order.invoices[0] : undefined;
          return (
            <Card
              key={order.id}
              sx={{
                mb: 3,
                bgcolor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {t('orders.orderNumber', { id: short(order.id) })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {t('orders.placedOn', { date: new Date(order.created_at).toLocaleString() })}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={t('orders.orderStatus', { status: t(`orders.${order.status}`) })}
                      color={statusColor(order.status) as any}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={t('orders.paymentStatus', { status: t(`orders.${order.payment_status}`) })}
                      color={statusColor(order.payment_status) as any}
                      variant="outlined"
                      size="small"
                      icon={<Payments sx={{ fontSize: 16 }} />}
                    />
                    <Chip
                      label={t('orders.totalAmount', { amount: fmt(order.total_amount) })}
                      color="primary"
                      size="small"
                    />
                  </Stack>
                </Box>

                <Divider sx={{ my: 2, borderColor: 'var(--border-primary)' }} />

                {/* Items */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    {t('orders.items')}
                  </Typography>
                  <List dense>
                    {(order.order_items || []).map((item: OrderItem & { product: any }) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            variant="rounded"
                            src={item.product?.images?.[0]}
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: 'rgba(0,0,0,0.05)',
                              color: 'var(--text-disabled)',
                            }}
                          >
                            <Inventory2 />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.product?.title || t('orders.product')}
                          secondary={t('orders.quantity', { quantity: item.quantity })}
                          sx={{ ml: 1.5 }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {fmt(item.total_price)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Payments */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    {t('orders.payments')}
                  </Typography>
                  {(order.payments || []).length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {t('orders.noPayments')}
                    </Typography>
                  ) : (
                    <List dense>
                      {order.payments.map((p: Payment) => (
                        <ListItem key={p.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `rgba(var(--primary-rgb), 0.15)`, color: 'var(--info-color)' }}>
                              <Payments />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${fmt(p.amount)} • ${p.status.toUpperCase()}`}
                            secondary={`${new Date(p.created_at).toLocaleString()} • ${
                              (p as any).payment_method || 'N/A'
                            }`}
                            sx={{ ml: 1.5 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Invoices */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    {t('orders.invoices')}
                  </Typography>
                  {(order.invoices || []).length === 0 ? (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        {t('orders.noInvoices')}
                      </Typography>
                      <Tooltip title={order.payment_status !== 'paid' ? t('orders.invoiceAvailableAfterPayment') : ''}>
                        <span>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PictureAsPdf />}
                            onClick={() => handleGenerateInvoice(order)}
                            disabled={order.payment_status !== 'paid' || actionLoading === order.id}
                            sx={{
                              background: `linear-gradient(135deg, var(--primary-color) 0%, #0099cc 100%)`,
                            }}
                          >
                            {actionLoading === order.id ? t('orders.generating') : t('orders.generateInvoice')}
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  ) : (
                    <List dense>
                      {order.invoices.map((inv: Invoice) => (
                        <ListItem key={inv.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `rgba(var(--secondary-rgb), 0.15)`, color: 'var(--secondary-color)' }}>
                              <ReceiptLong />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${t('orders.invoiceNumber', { number: inv.invoice_number })} • ${fmt(inv.total_amount)}`}
                            secondary={`${t('orders.issued', { date: new Date(inv.issue_date).toLocaleDateString() })} • ${t('orders.invoiceStatus', { status: inv.status })}`}
                            sx={{ ml: 1.5 }}
                          />
                          <Tooltip title={inv.pdf_url ? t('orders.downloadPDF') : t('orders.pdfNotAvailable')}>
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleDownloadInvoice(inv.id)}
                                disabled={!inv.pdf_url || actionLoading === inv.id}
                                sx={{
                                  borderColor: `rgba(var(--primary-rgb), 0.5)`,
                                  color: 'var(--primary-color)',
                                  '&:hover': { borderColor: 'var(--primary-color)', bgcolor: 'var(--bg-active)' },
                                }}
                              >
                                {actionLoading === inv.id ? t('orders.opening') : t('orders.download')}
                              </Button>
                            </span>
                          </Tooltip>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}
    </Container>
  );
};

export default Orders;