import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Table, Form, message, DatePicker, Input } from 'antd';
import Menu from 'antd/es/menu';
import Button from 'antd/es/button';
import Dropdown from 'antd/es/dropdown';
import Checkbox from 'antd/es/checkbox';
import Space from 'antd/es/space';
import type { InputRef } from 'antd/lib/input';
import axios, { AxiosError } from 'axios';
import { EditableContext } from './EditableCell';
import './index.less';
import dayjs, { Dayjs } from 'dayjs';
import { DownOutlined, SettingOutlined, CopyOutlined, TableOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { generateAndDownloadTable } from '../../utils/tableGenerator';
import { generateDynamicText, DEFAULT_CONFIG } from '../../utils/textGenerator';

// Updated for Production schema
interface ShirtOrder {
  id: number;
  // Base customer info - section 1
  customer_name: string;  // Maps to 姓名
  height: number;  // Maps to 身高
  weight: number;  // Maps to 体重_KG
  phone: string;  // Maps to 电话
  input_date?: string | Dayjs;  // Maps to 下单日期
  planned_date?: string | Dayjs;  // Maps to 到店交付日期
  finish_date?: string | Dayjs;  // Maps to 实际交付日期
  usage_time?: string | Dayjs;  // Maps to 使用时间
  custom_type: string;  // Maps to 定制工艺
  craft?: string;  // Maps to 工艺
  
  // Suit measurements - section 2
  suit_collar?: number;  // Maps to 西装净体领围
  suit_shoulder_width?: number;  // Maps to 西装肩宽
  suit_sleeve_length?: number;  // Maps to 西装袖长
  suit_sleeve_width?: number;  // Maps to 西装袖肥
  suit_cuff?: number;  // Maps to 西装袖口
  suit_chest?: number;  // Maps to 西装胸围
  suit_waist?: number;  // Maps to 西装中腰
  suit_hip?: number;  // Maps to 西装下摆臀围
  suit_front_length?: number;  // Maps to 西装前衣长
  suit_back_length?: number;  // Maps to 西装后衣长
  suit_front_waist?: number;  // Maps to 西装前腰节
  suit_back_waist?: number;  // Maps to 西装后腰节
  suit_left_shoulder?: number;  // Maps to 西装左肩斜
  suit_right_shoulder?: number;  // Maps to 西装右肩斜
  suit_back_chest_diff?: number;  // Maps to 西装背胸差
  suit_front_chest_width?: number;  // Maps to 西装前胸宽
  suit_back_width?: number;  // Maps to 西装后背宽
  suit_sleeve_diff?: number;  // Maps to 西装袖笼差
  suit_sleeve_depth?: number;  // Maps to 西装袖笼深
  suit_sleeve_circumference?: number;  // Maps to 西装袖笼围
  suit_quantity?: number;  // Maps to 西装数量
  
  // Pants measurements - section 3
  pants_waist?: number;  // Maps to 西裤裤腰围
  pants_hip?: number;  // Maps to 西裤臀围
  pants_thigh?: number;  // Maps to 西裤大腿圈
  pants_knee?: number;  // Maps to 西裤膝围
  pants_calf?: number;  // Maps to 西裤小腿圈
  pants_calf_height?: number;  // Maps to 西裤小腿高
  pants_length?: number;  // Maps to 西裤裤长
  pants_crotch?: number;  // Maps to 西裤遮档
  pants_waist_height?: number;  // Maps to 西裤腰高
  pants_front_pleats?: string;  // Maps to 西裤裤前褶
  pants_belt_loops?: string;  // Maps to 西裤皮带袢
  pants_cuff?: string;  // Maps to 西裤卷边
  pants_adjustment?: string;  // Maps to 西裤调山袢
  suit_fabric?: string;  // Maps to 西装面料
  pants_quantity?: number;  // Maps to 西裤数量
  
  // Vest measurements - section 4
  vest_shoulder_width?: number;  // Maps to 马甲肩宽
  vest_chest?: number;  // Maps to 马甲胸围
  vest_waist?: number;  // Maps to 马甲中腰肚围
  vest_hem?: number;  // Maps to 马甲下摆
  vest_front_length?: number;  // Maps to 马甲前衣长
  vest_back_length?: number;  // Maps to 马甲后衣长
  vest_sleeve_width?: number;  // Maps to 马甲袖肥
  vest_cuff?: number;  // Maps to 马甲袖口
  vest_buttons?: number;  // Maps to 马甲扣数
  vest_rows?: string;  // Maps to 马甲排数
  vest_pocket?: string;  // Maps to 马甲口袋
  vest_back?: string;  // Maps to 马甲背面
  vest_collar?: string;  // Maps to 马甲领子
  vest_side_slit?: string;  // Maps to 马甲侧面开叉
  
  // Shirt and additional info - section 5
  collar_size?: number;  // Maps to 衬衫领围
  shirt_shoulder_width?: number;  // Maps to 衬衫肩宽
  shirt_sleeve_length?: number;  // Maps to 衬衫袖长
  collar_style?: number | string;  // Maps to 衬衫领型
  shirt_cuff?: number;  // Maps to 衬衫袖口
  fabric?: string;  // Maps to 衬衫面料
  remarks?: string;  // Maps to 款式备注
  temperature_notes?: string;  // Maps to 体型备注
  lining?: string;  // Maps to 里布
  customer_source?: string;  // Maps to 客户来源
  reception_staff?: string;  // Maps to 接待人员
  consultant?: string;  // Maps to 定制顾问
  amount?: number;  // Maps to 定制金额
  
  // Additional fields for frontend functionality
  quantity?: number; // Legacy field 
  cuff_style?: string; // Legacy field
  hem_style?: string; // Legacy field
  pocket_style?: string; // Legacy field
  shirt_chest?: number; // Legacy field
  shirt_mid_waist?: number; // Legacy field
  shirt_length?: number; // Legacy field
  shirt_hem?: number; // Legacy field
  accessories?: string; // Legacy field
  source?: string;
  edited?: boolean;
  key?: string;
}

interface ColumnType {
  title: string;
  dataIndex: string;
  key: string;
  editable?: boolean;
  sorter?: (a: any, b: any) => number;
  render?: (text: any, record: any) => React.ReactNode;
}

// Interface for the server response format
interface ShirtOrdersResponse {
  orders: ShirtOrder[];
  count: number;
  message?: string;
  success: boolean;
}

const OrderViewPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ShirtOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editedRows, setEditedRows] = useState<Record<number, ShirtOrder>>({});
  const [deletedRows, setDeletedRows] = useState<number[]>([]);
  const [newRows, setNewRows] = useState<ShirtOrder[]>([]);
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    // Customer info - Section 1
    'customer_name', 'height', 'weight', 'phone', 
    'input_date', 'planned_date', 'finish_date',
    'custom_type',
    
    // Suit measurements - Section 2 (key fields)
    'suit_collar', 'suit_shoulder_width', 'suit_sleeve_length',
    'suit_chest', 'suit_waist', 'suit_quantity',
    
    // Pants measurements - Section 3 (key fields)
    'pants_waist', 'pants_length', 'pants_quantity',
    
    // Vest measurements - Section 4 (key fields)
    'vest_shoulder_width', 'vest_chest',
    
    // Shirt and additional info - Section 5 (key fields)
    'collar_size', 'shirt_shoulder_width', 'shirt_sleeve_length',
    'fabric', 'remarks', 'amount',
    
    // Action column
    'actions'
  ]);

  // Fetch orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Section definitions for dropdown menu grouping
  const columnSections = [
    {
      title: "1. 客户基本信息",
      columns: [
        'customer_name', 'height', 'weight', 'phone', 
        'input_date', 'planned_date', 'finish_date', 'usage_time', 
        'custom_type', 'craft'
      ]
    },
    {
      title: "2. 西装测量",
      columns: [
        'suit_collar', 'suit_shoulder_width', 'suit_sleeve_length', 
        'suit_sleeve_width', 'suit_cuff', 'suit_chest', 'suit_waist', 
        'suit_hip', 'suit_front_length', 'suit_back_length', 
        'suit_front_waist', 'suit_back_waist', 'suit_left_shoulder', 
        'suit_right_shoulder', 'suit_back_chest_diff', 'suit_front_chest_width',
        'suit_back_width', 'suit_sleeve_diff', 'suit_sleeve_depth',
        'suit_sleeve_circumference', 'suit_quantity'
      ]
    },
    {
      title: "3. 西裤测量",
      columns: [
        'pants_waist', 'pants_hip', 'pants_thigh', 'pants_knee',
        'pants_calf', 'pants_calf_height', 'pants_length', 'pants_crotch',
        'pants_waist_height', 'pants_front_pleats', 'pants_belt_loops',
        'pants_cuff', 'pants_adjustment', 'suit_fabric', 'pants_quantity'
      ]
    },
    {
      title: "4. 马甲测量",
      columns: [
        'vest_shoulder_width', 'vest_chest', 'vest_waist', 'vest_hem',
        'vest_front_length', 'vest_back_length', 'vest_sleeve_width',
        'vest_cuff', 'vest_buttons', 'vest_rows', 'vest_pocket',
        'vest_back', 'vest_collar', 'vest_side_slit'
      ]
    },
    {
      title: "5. 衬衫和附加信息",
      columns: [
        'collar_size', 'shirt_shoulder_width', 'shirt_sleeve_length',
        'collar_style', 'shirt_cuff', 'fabric', 'remarks', 'temperature_notes',
        'lining', 'customer_source', 'reception_staff', 'consultant', 'amount'
      ]
    }
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use the correct API endpoint for shirt orders
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
    } catch (error) {
      console.error('Error fetching shirt orders:', error);
      // Create a sample order for testing when API returns empty
      const testOrder: ShirtOrder = {
        id: 1,
        customer_name: 'John Doe (Sample)',
        height: 180,
        weight: 70,
        phone: '123-456-7890',
        input_date: '2025-04-01',
        planned_date: '2025-04-15',
        finish_date: '2025-04-30',
        custom_type: '半定制',
        craft: '标准工艺',
        suit_collar: 40,
        suit_shoulder_width: 45,
        suit_sleeve_length: 60,
        suit_chest: 90,
        suit_waist: 80,
        suit_sleeve_circumference: 40,
        suit_cuff: 20,
        suit_quantity: 1,
        suit_fabric: 'Cotton',
        collar_size: 40,
        collar_style: '温莎领',
        shirt_shoulder_width: 45,
        shirt_sleeve_length: 60,
        shirt_cuff: 20,
        fabric: 'Cotton',
        remarks: '测试样本数据',
        temperature_notes: '',
        customer_source: '网店',
        consultant: '王顾问',
        amount: 899
      };
      setData([testOrder]);
      message.warning(t('general.sampleData'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Function to map backend database field names to frontend field names
  const mapFromBackendFields = (backendOrder: any): ShirtOrder => {
    const reverseFieldMapping: Record<string, string> = {
      // Customer info - Section 1
      "姓名": "customer_name",
      "身高": "height", 
      "体重_KG": "weight",
      "电话": "phone",
      "下单日期": "input_date",
      "到店交付日期": "planned_date", 
      "实际交付日期": "finish_date",
      "使用时间": "usage_time",
      "定制工艺": "custom_type",
      "工艺": "craft",
      
      // Suit measurements - Section 2
      "西装净体领围": "suit_collar",
      "西装肩宽": "suit_shoulder_width",
      "西装袖长": "suit_sleeve_length",
      "西装袖肥": "suit_sleeve_width", 
      "西装袖口": "suit_cuff",
      "西装胸围": "suit_chest",
      "西装中腰": "suit_waist",
      "西装下摆臀围": "suit_hip",
      "西装前衣长": "suit_front_length",
      "西装后衣长": "suit_back_length",
      "西装前腰节": "suit_front_waist",
      "西装后腰节": "suit_back_waist", 
      "西装左肩斜": "suit_left_shoulder",
      "西装右肩斜": "suit_right_shoulder",
      "西装背胸差": "suit_back_chest_diff",
      "西装前胸宽": "suit_front_chest_width",
      "西装后背宽": "suit_back_width",
      "西装袖笼差": "suit_sleeve_diff",
      "西装袖笼深": "suit_sleeve_depth",
      "西装袖笼围": "suit_sleeve_circumference",
      "西装数量": "suit_quantity",
      
      // Pants measurements - Section 3
      "西裤裤腰围": "pants_waist",
      "西裤臀围": "pants_hip",
      "西裤大腿圈": "pants_thigh",
      "西裤膝围": "pants_knee", 
      "西裤小腿圈": "pants_calf",
      "西裤小腿高": "pants_calf_height",
      "西裤裤长": "pants_length",
      "西裤遮档": "pants_crotch",
      "西裤腰高": "pants_waist_height",
      "西裤裤前褶": "pants_front_pleats",
      "西裤皮带袢": "pants_belt_loops",
      "西裤卷边": "pants_cuff",
      "西裤调山袢": "pants_adjustment",
      "西装面料": "suit_fabric",
      "西裤数量": "pants_quantity",
      
      // Vest measurements - Section 4
      "马甲肩宽": "vest_shoulder_width",
      "马甲胸围": "vest_chest",
      "马甲中腰肚围": "vest_waist",
      "马甲下摆": "vest_hem",
      "马甲前衣长": "vest_front_length",
      "马甲后衣长": "vest_back_length",
      "马甲袖肥": "vest_sleeve_width",
      "马甲袖口": "vest_cuff",
      "马甲扣数": "vest_buttons",
      "马甲排数": "vest_rows",
      "马甲口袋": "vest_pocket",
      "马甲背面": "vest_back",
      "马甲领子": "vest_collar",
      "马甲侧面开叉": "vest_side_slit",
      
      // Shirt and additional info - Section 5 
      "衬衫领围": "collar_size",
      "衬衫肩宽": "shirt_shoulder_width",
      "衬衫袖长": "shirt_sleeve_length",
      "衬衫领型": "collar_style",
      "衬衫袖口": "shirt_cuff",
      "衬衫面料": "fabric",
      "款式备注": "remarks",
      "体型备注": "temperature_notes",
      "里布": "lining",
      "客户来源": "customer_source",
      "接待人员": "reception_staff",
      "定制顾问": "consultant",
      "定制金额": "amount"
    };

    const mappedOrder: any = { id: backendOrder.id };
    
    // Map each field from backend names to frontend names
    Object.keys(backendOrder).forEach(key => {
      if (reverseFieldMapping[key] && backendOrder[key] !== undefined && backendOrder[key] !== null) {
        mappedOrder[reverseFieldMapping[key]] = backendOrder[key];
      } else if (key === 'id') {
        mappedOrder[key] = backendOrder[key];
      }
    });
    
    return mappedOrder as ShirtOrder;
  };

  const handleSuccessfulResponse = (response: any) => {
    console.log('Shirt orders data received:', response.data);
    
    if (!response.data || !response.data.success) {
      console.log('No shirt orders found or API returned an error');
      message.warning(
        response.data?.message 
          ? `Error: ${response.data.message}` 
          : t('general.noData')
      );
      // Create a sample order for testing when API returns empty
      const testOrder: ShirtOrder = {
        id: 1,
        customer_name: 'John Doe (Sample)',
        height: 180,
        weight: 70,
        phone: '123-456-7890',
        input_date: '2025-04-01',
        planned_date: '2025-04-15',
        finish_date: '2025-04-30',
        custom_type: '半定制',
        craft: '标准工艺',
        suit_collar: 40,
        suit_shoulder_width: 45,
        suit_sleeve_length: 60,
        suit_chest: 90,
        suit_waist: 80,
        suit_sleeve_circumference: 40,
        suit_cuff: 20,
        suit_quantity: 1,
        suit_fabric: 'Cotton',
        collar_size: 40,
        collar_style: '温莎领',
        shirt_shoulder_width: 45,
        shirt_sleeve_length: 60,
        shirt_cuff: 20,
        fabric: 'Cotton',
        remarks: '测试样本数据',
        temperature_notes: '',
        customer_source: '网店',
        consultant: '王顾问',
        amount: 899
      };
      setData([testOrder]);
      return;
    }
    
    const orders = response.data.orders || [];
    console.log('Number of shirt orders received:', orders.length);
    
    if (orders.length === 0) {
      message.warning(t('general.noData'));
      setData([]);
      return;
    }
    
    // Process the data to handle measurements properly and ensure unique keys
    const processedData = orders.map((order: any, index: number) => {
      // Convert backend field names to frontend field names
      const mappedOrder = mapFromBackendFields(order);
      
      // Ensure each order has a unique key combining ID, timestamp and index for guaranteed uniqueness
      const uniqueKey = `${mappedOrder.id || 0}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`;
      
      return {
        ...mappedOrder,
        key: uniqueKey
      };
    });
    
    setData(processedData);
  };

  const handleAdd = (record: ShirtOrder) => {
    const newId = -Math.floor(Math.random() * 1000000) - 1; // Negative ID to avoid conflicts with server IDs
    const newKey = `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Get current date and one month later date 
    const currentDate = new Date();
    const oneMonthLaterDate = new Date();
    oneMonthLaterDate.setMonth(currentDate.getMonth() + 1);
    
    const newOrder: ShirtOrder = {
      id: newId,
      // Customer info
      customer_name: '',
      height: 0,
      weight: 0,
      phone: '',
      input_date: currentDate.toISOString().split('T')[0],
      planned_date: oneMonthLaterDate.toISOString().split('T')[0],
      finish_date: currentDate.toISOString().split('T')[0],
      usage_time: currentDate.toISOString().split('T')[0],
      custom_type: '半定制',
      craft: '',
      
      // Suit measurements
      suit_collar: 0,
      suit_shoulder_width: 0,
      suit_sleeve_length: 0,
      suit_sleeve_width: 0,
      suit_cuff: 0,
      suit_chest: 0,
      suit_waist: 0,
      suit_hip: 0,
      suit_front_length: 0,
      suit_back_length: 0,
      suit_front_waist: 0,
      suit_back_waist: 0,
      suit_left_shoulder: 0,
      suit_right_shoulder: 0,
      suit_back_chest_diff: 0,
      suit_front_chest_width: 0,
      suit_back_width: 0,
      suit_sleeve_diff: 0,
      suit_sleeve_depth: 0,
      suit_sleeve_circumference: 0,
      suit_quantity: 1,
      suit_fabric: '',
      
      // Pants measurements
      pants_waist: 0,
      pants_hip: 0,
      pants_thigh: 0,
      pants_knee: 0,
      pants_calf: 0,
      pants_calf_height: 0,
      pants_length: 0,
      pants_crotch: 0,
      pants_waist_height: 0,
      pants_front_pleats: '',
      pants_belt_loops: '',
      pants_cuff: '',
      pants_adjustment: '',
      pants_quantity: 0,
      
      // Vest measurements
      vest_shoulder_width: 0,
      vest_chest: 0,
      vest_waist: 0,
      vest_hem: 0,
      vest_front_length: 0,
      vest_back_length: 0,
      vest_sleeve_width: 0,
      vest_cuff: 0,
      vest_buttons: 0,
      vest_rows: '',
      vest_pocket: '',
      vest_back: '',
      vest_collar: '',
      vest_side_slit: '',
      
      // Shirt and additional info
      collar_size: 0,
      collar_style: '',
      shirt_shoulder_width: 0,
      shirt_sleeve_length: 0,
      shirt_cuff: 0,
      fabric: '',
      remarks: '',
      temperature_notes: '',
      lining: '',
      customer_source: '',
      reception_staff: '',
      consultant: '',
      amount: 0,
      source: 'web',
      key: newKey
    };

    // Find the index of the current record
    const currentIndex = data.findIndex(item => item.id === record.id);
    
    if (currentIndex === -1) {
      // If record not found, append to the end
      setData([...data, newOrder]);
    } else {
      // Insert after the current record
      const newData = [...data];
      newData.splice(currentIndex + 1, 0, newOrder);
      setData(newData);
    }
    
    setNewRows([...newRows, newOrder]);
  };

  const handleDelete = (id: number) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    setDeletedRows([...deletedRows, id]);
    // Remove from edited rows if it was being edited
    const { [id]: removed, ...remaining } = editedRows;
    setEditedRows(remaining);
  };

  const handleSave = (row: ShirtOrder) => {
    const newData = [...data];
    const index = newData.findIndex(item => row.id === item.id);
    if (index > -1) {
      // Format date fields if present
      if (row.input_date && typeof row.input_date === 'object' && 'format' in row.input_date) {
        row.input_date = row.input_date.format('YYYY-MM-DD');
      }
      if (row.planned_date && typeof row.planned_date === 'object' && 'format' in row.planned_date) {
        row.planned_date = row.planned_date.format('YYYY-MM-DD');
      }
      if (row.finish_date && typeof row.finish_date === 'object' && 'format' in row.finish_date) {
        row.finish_date = row.finish_date.format('YYYY-MM-DD');
      }
      
      newData.splice(index, 1, {
        ...newData[index],
        ...row,
        edited: true
      });
      setData(newData);
      setEditedRows({
        ...editedRows,
        [row.id]: row
      });
    }
  };

  // Function to map frontend field names to backend database field names
  const mapToBackendFields = (order: ShirtOrder): any => {
    const fieldMapping: Record<string, string> = {
      // Customer info - Section 1
      "customer_name": "姓名",
      "height": "身高", 
      "weight": "体重_KG",
      "phone": "电话",
      "input_date": "下单日期",
      "planned_date": "到店交付日期", 
      "finish_date": "实际交付日期",
      "usage_time": "使用时间",
      "custom_type": "定制工艺",
      "craft": "工艺",
      
      // Suit measurements - Section 2
      "suit_collar": "西装净体领围",
      "suit_shoulder_width": "西装肩宽",
      "suit_sleeve_length": "西装袖长",
      "suit_sleeve_width": "西装袖肥", 
      "suit_cuff": "西装袖口",
      "suit_chest": "西装胸围",
      "suit_waist": "西装中腰",
      "suit_hip": "西装下摆臀围",
      "suit_front_length": "西装前衣长",
      "suit_back_length": "西装后衣长",
      "suit_front_waist": "西装前腰节",
      "suit_back_waist": "西装后腰节", 
      "suit_left_shoulder": "西装左肩斜",
      "suit_right_shoulder": "西装右肩斜",
      "suit_back_chest_diff": "西装背胸差",
      "suit_front_chest_width": "西装前胸宽",
      "suit_back_width": "西装后背宽",
      "suit_sleeve_diff": "西装袖笼差",
      "suit_sleeve_depth": "西装袖笼深",
      "suit_sleeve_circumference": "西装袖笼围",
      "suit_quantity": "西装数量",
      
      // Pants measurements - Section 3
      "pants_waist": "西裤裤腰围",
      "pants_hip": "西裤臀围",
      "pants_thigh": "西裤大腿圈",
      "pants_knee": "西裤膝围", 
      "pants_calf": "西裤小腿圈",
      "pants_calf_height": "西裤小腿高",
      "pants_length": "西裤裤长",
      "pants_crotch": "西裤遮档",
      "pants_waist_height": "西裤腰高",
      "pants_front_pleats": "西裤裤前褶",
      "pants_belt_loops": "西裤皮带袢",
      "pants_cuff": "西裤卷边",
      "pants_adjustment": "西裤调山袢",
      "suit_fabric": "西装面料",
      "pants_quantity": "西裤数量",
      
      // Vest measurements - Section 4
      "vest_shoulder_width": "马甲肩宽",
      "vest_chest": "马甲胸围",
      "vest_waist": "马甲中腰肚围",
      "vest_hem": "马甲下摆",
      "vest_front_length": "马甲前衣长",
      "vest_back_length": "马甲后衣长",
      "vest_sleeve_width": "马甲袖肥",
      "vest_cuff": "马甲袖口",
      "vest_buttons": "马甲扣数",
      "vest_rows": "马甲排数",
      "vest_pocket": "马甲口袋",
      "vest_back": "马甲背面",
      "vest_collar": "马甲领子",
      "vest_side_slit": "马甲侧面开叉",
      
      // Shirt and additional info - Section 5 
      "collar_size": "衬衫领围",
      "shirt_shoulder_width": "衬衫肩宽",
      "shirt_sleeve_length": "衬衫袖长",
      "collar_style": "衬衫领型",
      "shirt_cuff": "衬衫袖口",
      "fabric": "衬衫面料",
      "remarks": "款式备注",
      "temperature_notes": "体型备注",
      "lining": "里布",
      "customer_source": "客户来源",
      "reception_staff": "接待人员",
      "consultant": "定制顾问",
      "amount": "定制金额"
    };

    const mappedOrder: any = { id: order.id };
    
    // Map each field from frontend names to backend names
    Object.keys(order).forEach(key => {
      if (fieldMapping[key] && order[key as keyof ShirtOrder] !== undefined && order[key as keyof ShirtOrder] !== null) {
        mappedOrder[fieldMapping[key]] = order[key as keyof ShirtOrder];
      }
    });
    
    return mappedOrder;
  };

  const handleSaveAll = async () => {
    try {
      // Get the current state of the table
      const currentData = [...data];
      
      // Prepare data for bulk update - map frontend field names to backend field names
      const editedOrders = currentData
        .filter(order => order.edited) // Only include edited orders
        .map(order => {
          // Ensure we have a valid ID
          const orderId = order.id || parseInt(order.key as string);
          if (!orderId) {
            throw new Error('Order is missing ID');
          }

          return mapToBackendFields({
            ...order,
            id: orderId
          });
        });
      
      // Get new orders that haven't been saved yet - map field names
      const newOrders = currentData
        .filter(order => order.source === 'web' && (order.id < 0 || !order.id)) // Include orders with negative IDs or no ID
        .map(order => {
          return mapToBackendFields(order);
        });
      
      // Get deleted orders
      const deletedOrders = deletedRows;
      
      console.log('Current table state:', {
        editedOrders,
        newOrders,
        deletedOrders,
        totalRows: currentData.length
      });
      
      // Define endpoints to try
      const endpoints = [
        `/api/shirt-orders/bulk-update`
      ];

      // Set a longer timeout for more reliable connections
      const config = {
        timeout: 15000,  // 15 seconds should be enough
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      // Try endpoints sequentially
      let response = null;
      let lastError: AxiosError | null = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to submit to ${endpoint}...`);
          const requestData = {
            editedOrders,
            newOrders,
            deletedOrders
          };
          console.log('Request data:', requestData);
          
          response = await axios.post(endpoint, requestData, config);
          
          if (response?.data?.success) {
            console.log('Response received:', response.data);
            message.success(t('general.saveSuccess'));
            // Reset local state
            setEditedRows({});
            setDeletedRows([]);
            setNewRows([]);
            // Refresh data from server
            fetchOrders();
            break; // Successfully got a response, exit the loop
          } else {
            throw new Error(response?.data?.message || t('general.saveError'));
          }
        } catch (err) {
          console.error(`Error with endpoint ${endpoint}:`, err);
          lastError = err as AxiosError;
          // Continue to the next endpoint
        }
      }

      if (!response?.data?.success) {
        // Still failed after trying all endpoints
        console.error('Failed to save changes to all endpoints');
        if (lastError?.response?.data) {
          const errorMessage = typeof lastError.response.data === 'object' 
            ? (lastError.response.data as any).message 
            : t('general.saveError');
          message.error(`${t('general.saveError')}: ${errorMessage}`);
        } else {
          message.error(t('general.apiError'));
        }
      }
    } catch (error: any) {
      console.error('Error saving changes:', error);
      message.error(`${t('general.saveError')}: ${error.message || t('general.saveError')}`);
    }
  };

  // Function to generate formatted text from production record using dynamic template
  const generateFormattedText = (record: ShirtOrder): string => {
    // Use dynamic text generation based on visible columns
    return generateDynamicText(record, visibleColumns, {
      ...DEFAULT_CONFIG,
      emptyValuePlaceholder: '' // Don't show empty values
    });
  };

  // Copy text to clipboard function
  const copyToClipboard = (text: string) => {
    // Check if navigator.clipboard is available (requires HTTPS or localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          message.success('文本已复制到剪贴板');
        })
        .catch(err => {
          console.error('复制失败:', err);
          // Fallback to legacy method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback method directly
      fallbackCopyToClipboard(text);
    }
  };

  // Fallback method for browsers that don't support clipboard API
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        message.success('文本已复制到剪贴板');
      } else {
        message.error('复制失败，请手动复制');
        console.error('execCommand copy failed');
      }
    } catch (err) {
      console.error('复制失败:', err);
      message.error('复制失败，请手动复制');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // Updated columns for production schema with translations
  const allColumns: ColumnType[] = [
    // Customer info - Section 1
    {
      title: t('orders.customerName'),
      dataIndex: 'customer_name',
      key: 'customer_name',
      editable: true,
      sorter: (a, b) => a.customer_name.localeCompare(b.customer_name),
    },
    {
      title: t('orders.height'),
      dataIndex: 'height',
      key: 'height',
      editable: true,
      sorter: (a, b) => a.height - b.height,
    },
    {
      title: t('orders.weight'),
      dataIndex: 'weight',
      key: 'weight',
      editable: true,
      sorter: (a, b) => a.weight - b.weight,
    },
    {
      title: t('orders.phone'),
      dataIndex: 'phone',
      key: 'phone',
      editable: true,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: t('orders.inputDate'),
      dataIndex: 'input_date',
      key: 'input_date',
      editable: true,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '',
    },
    {
      title: t('orders.plannedDate'),
      dataIndex: 'planned_date',
      key: 'planned_date',
      editable: true,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '',
    },
    {
      title: t('orders.finishDate'),
      dataIndex: 'finish_date',
      key: 'finish_date',
      editable: true,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '',
    },
    {
      title: t('orders.usageTime'),
      dataIndex: 'usage_time',
      key: 'usage_time',
      editable: true,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : '',
    },
    {
      title: t('orders.customType'),
      dataIndex: 'custom_type',
      key: 'custom_type',
      editable: true,
      sorter: (a, b) => (a.custom_type || '').localeCompare(b.custom_type || ''),
    },
    {
      title: t('orders.craft'),
      dataIndex: 'craft',
      key: 'craft',
      editable: true,
    },
    
    // Suit measurements - Section 2
    {
      title: t('orders.suitCollar'),
      dataIndex: 'suit_collar',
      key: 'suit_collar',
      editable: true,
    },
    {
      title: t('orders.suitShoulderWidth'),
      dataIndex: 'suit_shoulder_width',
      key: 'suit_shoulder_width',
      editable: true,
    },
    {
      title: t('orders.suitSleeveLength'),
      dataIndex: 'suit_sleeve_length',
      key: 'suit_sleeve_length',
      editable: true,
    },
    {
      title: t('orders.suitSleeveWidth'),
      dataIndex: 'suit_sleeve_width',
      key: 'suit_sleeve_width',
      editable: true,
    },
    {
      title: t('orders.suitCuff'),
      dataIndex: 'suit_cuff',
      key: 'suit_cuff',
      editable: true,
    },
    {
      title: t('orders.suitChest'),
      dataIndex: 'suit_chest',
      key: 'suit_chest',
      editable: true,
    },
    {
      title: t('orders.suitWaist'),
      dataIndex: 'suit_waist',
      key: 'suit_waist',
      editable: true,
    },
    {
      title: t('orders.suitHip'),
      dataIndex: 'suit_hip',
      key: 'suit_hip',
      editable: true,
    },
    {
      title: t('orders.suitFrontLength'),
      dataIndex: 'suit_front_length',
      key: 'suit_front_length',
      editable: true,
    },
    {
      title: t('orders.suitBackLength'),
      dataIndex: 'suit_back_length',
      key: 'suit_back_length',
      editable: true,
    },
    {
      title: t('orders.suitFrontWaist'),
      dataIndex: 'suit_front_waist',
      key: 'suit_front_waist',
      editable: true,
    },
    {
      title: t('orders.suitBackWaist'),
      dataIndex: 'suit_back_waist',
      key: 'suit_back_waist',
      editable: true,
    },
    {
      title: t('orders.suitLeftShoulder'),
      dataIndex: 'suit_left_shoulder',
      key: 'suit_left_shoulder',
      editable: true,
    },
    {
      title: t('orders.suitRightShoulder'),
      dataIndex: 'suit_right_shoulder',
      key: 'suit_right_shoulder',
      editable: true,
    },
    {
      title: t('orders.suitBackChestDiff'),
      dataIndex: 'suit_back_chest_diff',
      key: 'suit_back_chest_diff',
      editable: true,
    },
    {
      title: t('orders.suitFrontChestWidth'),
      dataIndex: 'suit_front_chest_width',
      key: 'suit_front_chest_width',
      editable: true,
    },
    {
      title: t('orders.suitBackWidth'),
      dataIndex: 'suit_back_width',
      key: 'suit_back_width',
      editable: true,
    },
    {
      title: t('orders.suitSleeveDiff'),
      dataIndex: 'suit_sleeve_diff',
      key: 'suit_sleeve_diff',
      editable: true,
    },
    {
      title: t('orders.suitSleeveDepth'),
      dataIndex: 'suit_sleeve_depth',
      key: 'suit_sleeve_depth',
      editable: true,
    },
    {
      title: t('orders.suitSleeveCircumference'),
      dataIndex: 'suit_sleeve_circumference',
      key: 'suit_sleeve_circumference',
      editable: true,
    },
    {
      title: t('orders.suitQuantity'),
      dataIndex: 'suit_quantity',
      key: 'suit_quantity',
      editable: true,
    },
    
    // Pants measurements - Section 3
    {
      title: t('orders.pantsWaist'),
      dataIndex: 'pants_waist',
      key: 'pants_waist',
      editable: true,
    },
    {
      title: t('orders.pantsHip'),
      dataIndex: 'pants_hip',
      key: 'pants_hip',
      editable: true,
    },
    {
      title: t('orders.pantsThigh'),
      dataIndex: 'pants_thigh',
      key: 'pants_thigh',
      editable: true,
    },
    {
      title: t('orders.pantsKnee'),
      dataIndex: 'pants_knee',
      key: 'pants_knee',
      editable: true,
    },
    {
      title: t('orders.pantsCalf'),
      dataIndex: 'pants_calf',
      key: 'pants_calf',
      editable: true,
    },
    {
      title: t('orders.pantsCalfHeight'),
      dataIndex: 'pants_calf_height',
      key: 'pants_calf_height',
      editable: true,
    },
    {
      title: t('orders.pantsLength'),
      dataIndex: 'pants_length',
      key: 'pants_length',
      editable: true,
    },
    {
      title: t('orders.pantsCrotch'),
      dataIndex: 'pants_crotch',
      key: 'pants_crotch',
      editable: true,
    },
    {
      title: t('orders.pantsWaistHeight'),
      dataIndex: 'pants_waist_height',
      key: 'pants_waist_height',
      editable: true,
    },
    {
      title: t('orders.pantsFrontPleats'),
      dataIndex: 'pants_front_pleats',
      key: 'pants_front_pleats',
      editable: true,
    },
    {
      title: t('orders.pantsBeltLoops'),
      dataIndex: 'pants_belt_loops',
      key: 'pants_belt_loops',
      editable: true,
    },
    {
      title: t('orders.pantsCuff'),
      dataIndex: 'pants_cuff',
      key: 'pants_cuff',
      editable: true,
    },
    {
      title: t('orders.pantsAdjustment'),
      dataIndex: 'pants_adjustment',
      key: 'pants_adjustment',
      editable: true,
    },
    {
      title: t('orders.suitFabric'),
      dataIndex: 'suit_fabric',
      key: 'suit_fabric',
      editable: true,
    },
    {
      title: t('orders.pantsQuantity'),
      dataIndex: 'pants_quantity',
      key: 'pants_quantity',
      editable: true,
    },
    
    // Vest measurements - Section 4
    {
      title: t('orders.vestShoulderWidth'),
      dataIndex: 'vest_shoulder_width',
      key: 'vest_shoulder_width',
      editable: true,
    },
    {
      title: t('orders.vestChest'),
      dataIndex: 'vest_chest',
      key: 'vest_chest',
      editable: true,
    },
    {
      title: t('orders.vestWaist'),
      dataIndex: 'vest_waist',
      key: 'vest_waist',
      editable: true,
    },
    {
      title: t('orders.vestHem'),
      dataIndex: 'vest_hem',
      key: 'vest_hem',
      editable: true,
    },
    {
      title: t('orders.vestFrontLength'),
      dataIndex: 'vest_front_length',
      key: 'vest_front_length',
      editable: true,
    },
    {
      title: t('orders.vestBackLength'),
      dataIndex: 'vest_back_length',
      key: 'vest_back_length',
      editable: true,
    },
    {
      title: t('orders.vestSleeveWidth'),
      dataIndex: 'vest_sleeve_width',
      key: 'vest_sleeve_width',
      editable: true,
    },
    {
      title: t('orders.vestCuff'),
      dataIndex: 'vest_cuff',
      key: 'vest_cuff',
      editable: true,
    },
    {
      title: t('orders.vestButtons'),
      dataIndex: 'vest_buttons',
      key: 'vest_buttons',
      editable: true,
    },
    {
      title: t('orders.vestRows'),
      dataIndex: 'vest_rows',
      key: 'vest_rows',
      editable: true,
    },
    {
      title: t('orders.vestPocket'),
      dataIndex: 'vest_pocket',
      key: 'vest_pocket',
      editable: true,
    },
    {
      title: t('orders.vestBack'),
      dataIndex: 'vest_back',
      key: 'vest_back',
      editable: true,
    },
    {
      title: t('orders.vestCollar'),
      dataIndex: 'vest_collar',
      key: 'vest_collar',
      editable: true,
    },
    {
      title: t('orders.vestSideSlit'),
      dataIndex: 'vest_side_slit',
      key: 'vest_side_slit',
      editable: true,
    },
    
    // Shirt measurements - Section 5
    {
      title: t('orders.collarSize'),
      dataIndex: 'collar_size',
      key: 'collar_size',
      editable: true,
    },
    {
      title: t('orders.collarStyle'),
      dataIndex: 'collar_style',
      key: 'collar_style',
      editable: true,
    },
    {
      title: t('orders.shirtShoulderWidth'),
      dataIndex: 'shirt_shoulder_width',
      key: 'shirt_shoulder_width',
      editable: true,
    },
    {
      title: t('orders.shirtSleeveLength'),
      dataIndex: 'shirt_sleeve_length',
      key: 'shirt_sleeve_length',
      editable: true,
    },
    {
      title: t('orders.shirtCuff'),
      dataIndex: 'shirt_cuff',
      key: 'shirt_cuff',
      editable: true,
    },
    {
      title: t('orders.fabric'),
      dataIndex: 'fabric',
      key: 'fabric',
      editable: true,
    },
    
    // Additional information
    {
      title: t('orders.remarks'),
      dataIndex: 'remarks',
      key: 'remarks',
      editable: true,
    },
    {
      title: t('orders.temperatureNotes'),
      dataIndex: 'temperature_notes',
      key: 'temperature_notes',
      editable: true,
    },
    {
      title: t('orders.lining'),
      dataIndex: 'lining',
      key: 'lining',
      editable: true,
    },
    {
      title: t('orders.customerSource'),
      dataIndex: 'customer_source',
      key: 'customer_source',
      editable: true,
    },
    {
      title: t('orders.receptionStaff'),
      dataIndex: 'reception_staff',
      key: 'reception_staff',
      editable: true,
    },
    {
      title: t('orders.consultant'),
      dataIndex: 'consultant',
      key: 'consultant',
      editable: true,
    },
    {
      title: t('orders.amount'),
      dataIndex: 'amount',
      key: 'amount',
      editable: true,
      render: (amount: number) => amount ? `¥ ${amount.toFixed(2)}` : '',
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: t('orders.actions'),
      dataIndex: 'actions',
      key: 'actions',
      render: (_: any, record: ShirtOrder) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            onClick={() => handleAdd(record)}
            style={{ backgroundColor: '#52c41a' }}
          >
            {t('general.add')}
          </Button>
          <Button 
            type="primary" 
            style={{ backgroundColor: '#ff4d4f' }}
            onClick={() => {
              if (window.confirm(t('general.confirmDelete'))) {
                handleDelete(record.id);
              }
            }}
          >
            {t('general.delete')}
          </Button>
          <Button
            type="primary"
            onClick={() => copyToClipboard(generateFormattedText(record))}
            style={{ backgroundColor: '#1890ff' }}
          >
            <CopyOutlined /> 生成文本
          </Button>
          <Button
            type="primary"
            onClick={() => generateAndDownloadTable(record, visibleColumns)}
            style={{ backgroundColor: '#52c41a' }}
          >
            <TableOutlined /> 生成表格
          </Button>
        </div>
      ),
    }
  ];

  // Filter columns based on visibility
  const visibleColumnsData = allColumns.filter(col => 
    visibleColumns.includes(col.dataIndex) || col.dataIndex === 'actions'
  ).map(col => {
    // Add render function for date fields if not already defined
    if (['input_date', 'planned_date', 'finish_date'].includes(col.dataIndex) && !col.render) {
      return {
        ...col,
        render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD') : ''
      };
    }
    return col;
  });

  const handleColumnVisibilityChange = (checkedValues: string[]) => {
    // Always keep 'customer_name' and 'actions' columns visible
    const newVisibleColumns = Array.from(new Set([
      'customer_name',
      ...checkedValues,
      'actions'
    ]));
    setVisibleColumns(newVisibleColumns);
  };

  const columnSelectionMenu = (
    <div style={{ 
      padding: '8px', 
      maxHeight: '400px', 
      overflow: 'auto',
      backgroundColor: '#ffffff',
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
      minWidth: '300px',
      zIndex: 9999
    }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // Get all columns except actions
            const allColumnsExceptActions = allColumns
              .filter(col => col.dataIndex !== 'actions')
              .map(col => col.dataIndex);
            // Set all columns visible plus actions
            setVisibleColumns([...allColumnsExceptActions, 'actions']);
          }}
        >
          显示全部字段
        </Button>
        <Button
          style={{ marginLeft: '8px' }}
          size="small"
          onClick={() => {
            // Reset to default view
            setVisibleColumns([
              'customer_name', 'height', 'weight', 'phone', 
              'input_date', 'planned_date', 'finish_date',
              'custom_type',
              'suit_collar', 'suit_shoulder_width', 'suit_sleeve_length',
              'suit_chest', 'suit_waist', 'suit_quantity',
              'pants_waist', 'pants_length', 'pants_quantity',
              'vest_shoulder_width', 'vest_chest',
              'collar_size', 'shirt_shoulder_width', 'shirt_sleeve_length',
              'fabric', 'remarks', 'amount', 'actions'
            ]);
          }}
        >
          重置默认字段
        </Button>
      </div>
      
      {columnSections.map(section => (
        <div key={section.title} style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            {section.title}
            <Checkbox
              checked={section.columns.every(col => 
                visibleColumns.includes(col) || col === 'customer_name'
              )}
              indeterminate={
                section.columns.some(col => visibleColumns.includes(col)) &&
                !section.columns.every(col => visibleColumns.includes(col) || col === 'customer_name')
              }
              onChange={(e) => {
                const checked = e.target.checked;
                const otherSectionColumns = visibleColumns.filter(col => !section.columns.includes(col));
                if (checked) {
                  // Add all columns from this section
                  setVisibleColumns([...otherSectionColumns, ...section.columns]);
                } else {
                  // Remove all columns from this section except 'customer_name'
                  const newColumns = [...otherSectionColumns];
                  if (section.columns.includes('customer_name')) {
                    newColumns.push('customer_name');
                  }
                  setVisibleColumns(newColumns);
                }
              }}
              style={{ marginLeft: '8px' }}
            >
              全选
            </Checkbox>
          </div>
          <Checkbox.Group
            value={visibleColumns.filter(col => section.columns.includes(col))}
            onChange={(checkedValues) => {
              // Get current visible columns except the ones in this section
              const otherSectionColumns = visibleColumns.filter(col => !section.columns.includes(col));
              // Add the newly checked values
              const newVisibleColumns = [...otherSectionColumns, ...checkedValues];
              setVisibleColumns(newVisibleColumns);
            }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {allColumns
              .filter(col => section.columns.includes(col.dataIndex))
              .map(column => (
                <Checkbox 
                  key={column.dataIndex} 
                  value={column.dataIndex}
                  disabled={column.dataIndex === 'customer_name'}
                >
                  {column.title}
                </Checkbox>
              ))
            }
          </Checkbox.Group>
        </div>
      ))}
    </div>
  );

  const mergedColumns = visibleColumnsData.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ShirtOrder) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const getCellValue = (dataIndex: string, value: any) => {
    // Format dates for display
    return dataIndex === 'input_date' || dataIndex === 'planned_date' || dataIndex === 'finish_date'
      ? value ? dayjs(value).format('YYYY-MM-DD') : ''
      : value;
  };

  return (
    <div className="order-view-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>{t('header.orderManagement')}</h1>
        <Space>
          <Dropdown 
            overlay={columnSelectionMenu} 
            trigger={['click']}
            overlayStyle={{ zIndex: 9999 }}
            getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
          >
            <Button>
              <SettingOutlined /> {t('header.columns')} <DownOutlined />
            </Button>
          </Dropdown>
          <Button type="primary" onClick={handleSaveAll}>
            {t('general.save')}
          </Button>
        </Space>
      </div>
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <div style={{ overflowX: 'auto' }}>
            <Table
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              dataSource={data}
              columns={mergedColumns}
              loading={loading}
              rowKey={(record) => record.key || `${record.id}`}
              pagination={false}
              {...({} as any)}
            />
          </div>
        </EditableContext.Provider>
      </Form>
    </div>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef | any>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    const value = record[dataIndex];
    
    // Convert date strings to dayjs objects for date fields
    if (['input_date', 'planned_date', 'finish_date'].includes(dataIndex)) {
      form.setFieldsValue({ 
        [dataIndex]: value ? dayjs(value) : null
      });
    } else {
      form.setFieldsValue({ [dataIndex]: value });
    }
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert dayjs objects to strings for date fields
      const updatedValues = { ...values };
      if (['input_date', 'planned_date', 'finish_date'].includes(dataIndex) && updatedValues[dataIndex]) {
        updatedValues[dataIndex] = updatedValues[dataIndex].format('YYYY-MM-DD');
      }
      
      toggleEdit();
      handleSave({ ...record, ...updatedValues });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: ['input_date'].includes(dataIndex), // Make input_date required
            message: `${title} is required.`,
          },
        ]}
      >
        {['input_date', 'planned_date', 'finish_date'].includes(dataIndex) ? (
          <DatePicker
            ref={inputRef}
            onChange={(date) => {
              if (date) {
                form.setFieldsValue({ [dataIndex]: date });
                setTimeout(save, 0); // Save after state update
              }
            }}
            format="YYYY-MM-DD"
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24, minHeight: '32px' }}
        onClick={toggleEdit}
      >
        {children || <span style={{ color: '#bfbfbf' }}>Click to edit</span>}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default OrderViewPage; 