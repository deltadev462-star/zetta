import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Grid,
} from "@mui/material";
import {
  AttachMoney,
  Payment,
  Calculate,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Download,
  Visibility,
  Schedule,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { commissionService } from "../../services/commission";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { useTranslation } from "react-i18next";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SupplierPayments: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user, selectedPeriod]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch commission summary
      const summaryData = await commissionService.getCommissionSummary({
        startDate: selectedPeriod.start.toISOString(),
        endDate: selectedPeriod.end.toISOString(),
      });
      setSummary(summaryData);

      // For admin, we'll need to fetch all commissions - for now just use a dummy ID
      // In production, you'd modify the service to support fetching all when no sellerId is provided
      if (user.role === "admin") {
        // TODO: Implement admin view for all sellers
        setCommissions([]);
        setPayments([]);
      } else {
        // Fetch commissions for specific seller
        const { data: commissionsData } =
          await commissionService.getSellerCommissions(user.id, {
            startDate: selectedPeriod.start.toISOString(),
            endDate: selectedPeriod.end.toISOString(),
          });
        setCommissions(commissionsData || []);

        // Fetch payments
        const { data: paymentsData } =
          await commissionService.getSupplierPayments(user.id);
        setPayments(paymentsData || []);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (sellerId: string) => {
    setSelectedSeller(sellerId);
    setPaymentDialog(true);
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    try {
      const { data: payment } = await commissionService.createSupplierPayment(
        selectedSeller,
        selectedPeriod.start.toISOString(),
        selectedPeriod.end.toISOString()
      );

      if (payment) {
        await commissionService.processSupplierPayment(
          payment.id,
          paymentMethod,
          paymentReference
        );
      }

      setPaymentDialog(false);
      setPaymentReference("");
      fetchData();
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleBulkPayments = async () => {
    if (window.confirm(t("admin.bulkPayment") + "?")) {
      const result = await commissionService.bulkProcessPayments(
        selectedPeriod.start.toISOString(),
        selectedPeriod.end.toISOString()
      );

      alert(
        `${t("admin.processed")}: ${result.processed}, ${t("admin.failed")}: ${
          result.failed
        }`
      );
      fetchData();
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return (
          <Chip
            label={t("admin.paid")}
            color="success"
            size="small"
            icon={<CheckCircle />}
          />
        );
      case "calculated":
      case "pending":
        return (
          <Chip
            label={t("warranty.pending")}
            color="warning"
            size="small"
            icon={<Pending />}
          />
        );
      case "processing":
        return (
          <Chip
            label={t("admin.processing")}
            color="info"
            size="small"
            icon={<Schedule />}
          />
        );
      case "failed":
        return (
          <Chip
            label={t("admin.failed")}
            color="error"
            size="small"
            icon={<ErrorIcon />}
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("admin.supplierPayments")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("admin.manageCommissions")}
        </Typography>
      </Box>

      {/* Summary Cards */}
      {summary && (
        <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(25% - 24px)" } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AttachMoney sx={{ color: "#00d4ff", mr: 1 }} />
                  <Typography variant="h6">{t("admin.totalSales")}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  €{summary.totalSales.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.orderCount} {t("nav.orders").toLowerCase()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(25% - 24px)" } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Calculate sx={{ color: "#ff0080", mr: 1 }} />
                  <Typography variant="h6">
                    {t("admin.totalCommission")}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  €{summary.totalCommission.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(summary.averageCommissionRate * 100).toFixed(0)}%{" "}
                  {t("admin.rate")}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(25% - 24px)" } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Payment sx={{ color: "#00ff88", mr: 1 }} />
                  <Typography variant="h6">
                    {t("admin.pendingPayouts")}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  €{summary.pendingPayouts.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("admin.toSuppliers")}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(25% - 24px)" } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TrendingUp sx={{ color: "#ffaa00", mr: 1 }} />
                  <Typography variant="h6">{t("admin.netRevenue")}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  €{(summary.totalSales - summary.pendingPayouts).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("admin.afterPayouts")}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Period Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            type="date"
            label={t("admin.startDate")}
            value={format(selectedPeriod.start, "yyyy-MM-dd")}
            onChange={(e) =>
              setSelectedPeriod({
                ...selectedPeriod,
                start: new Date(e.target.value),
              })
            }
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label={t("admin.endDate")}
            value={format(selectedPeriod.end, "yyyy-MM-dd")}
            onChange={(e) =>
              setSelectedPeriod({
                ...selectedPeriod,
                end: new Date(e.target.value),
              })
            }
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={() =>
              setSelectedPeriod({
                start: startOfMonth(new Date()),
                end: endOfMonth(new Date()),
              })
            }
          >
            {t("admin.thisMonth")}
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              setSelectedPeriod({
                start: startOfMonth(subMonths(new Date(), 1)),
                end: endOfMonth(subMonths(new Date(), 1)),
              })
            }
          >
            {t("admin.lastMonth")}
          </Button>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={handleBulkPayments}
              sx={{ ml: "auto" }}
            >
              {t("admin.bulkPayment")}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={t("admin.commissionDetails")} />
          <Tab label={t("admin.paymentHistory")} />
          <Tab label={t("admin.sellerOverview")} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("warranty.orderNumber")}</TableCell>
                  <TableCell>{t("logistics.preferredDate")}</TableCell>
                  <TableCell>{t("admin.seller")}</TableCell>
                  <TableCell align="right">{t("admin.orderAmount")}</TableCell>
                  <TableCell align="right">
                    {t("admin.commission")} (15%)
                  </TableCell>
                  <TableCell align="right">{t("admin.sellerPayout")}</TableCell>
                  <TableCell>{t("common.status")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        {t("admin.noCommissionsFound")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {commission.order_id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(new Date(commission.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {commission.seller_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell align="right">
                        €{commission.order_amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#ff0080" }}>
                        €{commission.commission_amount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#00ff88" }}>
                        €{commission.seller_payout.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusChip(commission.status)}</TableCell>
                      <TableCell align="right">
                        {commission.status === "calculated" &&
                          user?.role === "admin" && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleCreatePayment(commission.seller_id)
                              }
                              color="primary"
                            >
                              <Payment />
                            </IconButton>
                          )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>{t("nav.orders")}</TableCell>
                  <TableCell align="right">{t("admin.totalSales")}</TableCell>
                  <TableCell align="right">{t("admin.commission")}</TableCell>
                  <TableCell align="right">Payout</TableCell>
                  <TableCell>{t("common.status")}</TableCell>
                  <TableCell>Paid Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 3 }}
                      >
                        No payment history found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {payment.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(payment.payment_period_start),
                          "dd/MM"
                        )}{" "}
                        -
                        {format(
                          new Date(payment.payment_period_end),
                          "dd/MM/yyyy"
                        )}
                      </TableCell>
                      <TableCell>{payment.order_count}</TableCell>
                      <TableCell align="right">
                        €{payment.total_sales.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#ff0080" }}>
                        €{payment.total_commission.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: "#00ff88" }}>
                        €{payment.payout_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusChip(payment.status)}</TableCell>
                      <TableCell>
                        {payment.paid_at
                          ? format(new Date(payment.paid_at), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Alert severity="info">{t("admin.sellerOverviewInfo")}</Alert>
        </TabPanel>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("admin.processSupplierPayment")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Processing payment for seller: {selectedSeller.substring(0, 8)}...
            </Alert>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{t("admin.paymentMethod")}</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label={t("admin.paymentMethod")}
              >
                <MenuItem value="bank_transfer">
                  {t("admin.bankTransfer")}
                </MenuItem>
                <MenuItem value="paypal">{t("admin.paypal")}</MenuItem>
                <MenuItem value="stripe">{t("admin.stripe")}</MenuItem>
                <MenuItem value="check">{t("admin.check")}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t("admin.paymentReference")}
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder={t("admin.transactionReference")}
              helperText={t("admin.enterPaymentReference")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            disabled={!paymentReference || processingPayment}
          >
            {processingPayment ? (
              <CircularProgress size={20} />
            ) : (
              t("admin.processPayment")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupplierPayments;
