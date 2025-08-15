import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Typography, Paper, Box,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress,
  Card, CardContent, Alert,
  Stack
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define interfaces for shirt orders
interface ShirtOrder {
  id: number;
  customer_name: string;
  height: number;
  weight: number;
  phone: string;
  input_date?: string;
  planned_date?: string;
  finish_date?: string;
  custom_type: string;
  fabric: string;
  quantity: number;
  // other fields omitted for brevity
}

interface DailyCount {
  date: string;
  inputCount: number;
  finishCount: number;
}

// Interface for the server response format
interface ShirtOrdersResponse {
  orders: ShirtOrder[];
  count: number;
  message?: string;
  success: boolean;
}

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<ShirtOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use window.location.origin for API requests
  const origin = window.location.origin;

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use relative API path
      try {
        console.log(`Attempting to fetch shirt orders from /api/shirt-orders`);
        const response = await axios.get<ShirtOrdersResponse>(`/api/shirt-orders`, { 
          timeout: 8000,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        handleSuccessfulResponse(response);
      } catch (error) {
        console.error('Error fetching shirt orders:', error);
          throw error;
      }
    } catch (error: any) {
      console.error('Error fetching shirt orders:', error);
      // Create sample data for testing when API fails
      const sampleData: ShirtOrder[] = generateSampleData();
      setOrders(sampleData);
      
      if (error.message) {
        setError(t('analytics.fetchError', { error: error.message }));
      } else {
        setError(t('analytics.fetchError', { error: '' }));
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleSuccessfulResponse = (response: any) => {
    console.log('Shirt orders data received:', response.data);
    
    if (!response.data || !response.data.success) {
      console.log('No shirt orders found or API returned an error');
      
      if (response.data?.message) {
        setError(t('analytics.apiError', { message: response.data.message }));
      } else {
        setError(t('analytics.invalidDataFormat'));
      }
      
      // Use sample data for testing
      const sampleData: ShirtOrder[] = generateSampleData();
      setOrders(sampleData);
      return;
    }
    
    const orders = response.data.orders || [];
    console.log('Number of shirt orders received:', orders.length);
    
    if (orders.length === 0) {
      setError(t('analytics.noOrdersFound'));
      setOrders([]);
      return;
    }
    
    // Successfully got order data
    setError(null);
    setOrders(orders);
  };

  // Generate sample data for testing when API fails
  const generateSampleData = (): ShirtOrder[] => {
    const currentDate = new Date();
    const result: ShirtOrder[] = [];
    
    // Create samples across the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      const dateStr = formatDate(date);
      
      // More orders in recent days, fewer in past days
      const numInput = Math.max(1, Math.floor(Math.random() * 10 - i/5));
      const numFinish = Math.max(0, Math.floor(Math.random() * 8 - i/4));
      
      // Create input orders
      for (let j = 0; j < numInput; j++) {
        result.push({
          id: -1000 - result.length,
          customer_name: `${t('analytics.testCustomer')} ${result.length + 1}`,
          height: 175,
          weight: 70,
          phone: '123-456-7890',
          input_date: dateStr,
          planned_date: formatDate(new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000)), // 14 days later
          finish_date: Math.random() > 0.3 ? dateStr : undefined, // 70% have finish date = input date
          custom_type: '半定制',
          fabric: 'Cotton',
          quantity: 1,
        });
      }
      
      // Create finish-only orders
      for (let j = 0; j < numFinish; j++) {
        const inputDate = new Date(date);
        inputDate.setDate(inputDate.getDate() - Math.floor(Math.random() * 10) - 5); // Input 5-15 days before
        
        result.push({
          id: -2000 - result.length,
          customer_name: `${t('analytics.completedCustomer')} ${result.length + 1}`,
          height: 180,
          weight: 75,
          phone: '123-456-7890',
          input_date: formatDate(inputDate),
          planned_date: dateStr,
          finish_date: dateStr,
          custom_type: '全定制',
          fabric: 'Wool',
          quantity: 1,
        });
      }
    }
    
    return result;
  };

  // 快到期订单: 计划交期在7天内
  const upcomingDueOrders = useMemo(() => {
    const today = new Date();
    return orders.filter(order => {
      if (!order.planned_date) return false;
      
      const plannedDate = new Date(order.planned_date);
      const diffTime = plannedDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 && diffDays <= 7; // Due within next 7 days
    });
  }, [orders]);

  // 历史订单: 按日期的录入数量和完成数量
  const ordersByDay = useMemo(() => {
    if (orders.length === 0) {
      console.log('No orders available for ordersByDay calculation');
      return [];
    }
    
    console.log(`Calculating ordersByDay from ${orders.length} orders`);
    
    // Get date range for last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    console.log(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`);
    
    // Create a map to store counts by date
    const dayMap = new Map<string, {inputCount: number, finishCount: number}>();
    
    // Initialize all days with zero count
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      dayMap.set(dateStr, {inputCount: 0, finishCount: 0});
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count input orders per day
    orders.forEach(order => {
      // Process input dates
      if (order.input_date) {
        // Handle various date formats
        const dateStr = order.input_date.split('T')[0]; // Handle ISO format
        
        if (dayMap.has(dateStr)) {
          const current = dayMap.get(dateStr)!;
          dayMap.set(dateStr, {...current, inputCount: current.inputCount + 1});
          console.log(`Counted input date: ${dateStr}`);
        }
      }
      
      // Process finish dates
      if (order.finish_date) {
        // Handle various date formats
        const dateStr = order.finish_date.split('T')[0]; // Handle ISO format
        
        if (dayMap.has(dateStr)) {
          const current = dayMap.get(dateStr)!;
          dayMap.set(dateStr, {...current, finishCount: current.finishCount + 1});
          console.log(`Counted finish date: ${dateStr}`);
        }
      }
    });
    
    // Convert map to array of objects for charting
    return Array.from(dayMap).map(([date, counts]) => ({ 
      date, 
      inputCount: counts.inputCount,
      finishCount: counts.finishCount
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('header.analytics')}
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
      )}
      
      <Stack spacing={3}>
        {/* 快到期订单 section */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('analytics.upcomingOrders')}
              <Typography variant="subtitle1" component="span" color="error" sx={{ ml: 2 }}>
                ({upcomingDueOrders.length}{t('analytics.items')})
              </Typography>
            </Typography>
            
            {upcomingDueOrders.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('orders.customerName')}</TableCell>
                      <TableCell>{t('orders.phone')}</TableCell>
                      <TableCell>{t('orders.plannedDate')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingDueOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>{order.planned_date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {t('analytics.noUpcomingOrders')}
              </Typography>
            )}
          </CardContent>
        </Card>
        
        {/* 历史订单 section */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('analytics.historicalOrders')}
            </Typography>
            
            {ordersByDay.length > 0 ? (
              <Paper elevation={2} sx={{ p: 2, height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ordersByDay}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12}}
                      tickFormatter={(value: string) => {
                        // Show only day and month
                        const parts = value.split('-');
                        return `${parts[1]}-${parts[2]}`;
                      }}
                      interval={2} // Show every 3rd tick for readability
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'inputCount') return [`${value}`, t('analytics.inputCount')];
                        if (name === 'finishCount') return [`${value}`, t('analytics.finishCount')];
                        return [value, name];
                      }}
                      labelFormatter={(label: string) => `${t('analytics.date')}: ${label}`}
                    />
                    <Legend 
                      formatter={(value: string) => {
                        if (value === 'inputCount') return t('analytics.inputCount');
                        if (value === 'finishCount') return t('analytics.finishCount');
                        return value;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inputCount"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="inputCount"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="finishCount" 
                      stroke="#82ca9d" 
                      name="finishCount"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {t('analytics.noHistoricalData')}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};

export default Analytics; 