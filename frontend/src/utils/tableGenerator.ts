import * as XLSX from 'xlsx';

// Mapping for 建议加宽 values
export const ADJUSTMENT_MAPPING: Record<string, string> = {
  '西装袖肥': '6-8',
  '西装袖口': '12',
  '西装胸围': '8-10',
  '西装中腰': '8',
  '西装下摆臀围': '10',
  '西裤臀围': '10',
  '西裤大腿圈': '8',
  '西裤小腿圈': '大腿围成衣尺寸-20'
};

// Complete field mapping from English to Chinese (including all fields)
export const FIELD_MAPPING: Record<string, string> = {
  // Customer basic info
  'customer_name': '客户姓名',
  'height': '身高',
  'weight': '体重/KG',
  'phone': '电话',
  'input_date': '下单日期',
  'planned_date': '计划交期',
  'finish_date': '实际交期',
  'usage_time': '使用时间',
  'custom_type': '定制类型',
  'craft': '工艺',
  
  // Suit measurements
  'suit_collar': '西装净体领围',
  'suit_shoulder_width': '西装肩宽',
  'suit_sleeve_length': '西装袖长',
  'suit_sleeve_width': '西装袖肥',
  'suit_cuff': '西装袖口',
  'suit_chest': '西装胸围',
  'suit_waist': '西装中腰',
  'suit_hip': '西装下摆臀围',
  'suit_front_length': '西装前衣长',
  'suit_back_length': '西装后衣长',
  'suit_front_waist': '西装前腰节',
  'suit_back_waist': '西装后腰节',
  'suit_left_shoulder': '西装左肩斜',
  'suit_right_shoulder': '西装右肩斜',
  'suit_back_chest_diff': '西装背胸差',
  'suit_front_chest_width': '西装前胸宽',
  'suit_back_width': '西装后背宽',
  'suit_sleeve_diff': '西装袖笼差',
  'suit_sleeve_depth': '西装袖笼深',
  'suit_sleeve_circumference': '西装袖笼围',
  'suit_quantity': '西装数量',
  'suit_fabric': '西装面料',
  
  // Pants measurements
  'pants_waist': '西裤裤腰围',
  'pants_hip': '西裤臀围',
  'pants_thigh': '西裤大腿圈',
  'pants_knee': '西裤膝围',
  'pants_calf': '西裤小腿圈',
  'pants_calf_height': '西裤小腿高',
  'pants_length': '西裤裤长',
  'pants_crotch': '西裤遮档',
  'pants_waist_height': '西裤腰高',
  'pants_front_pleats': '西裤裤前褶',
  'pants_belt_loops': '西裤皮带袢',
  'pants_cuff': '西裤卷边',
  'pants_adjustment': '西裤调山袢',
  'pants_quantity': '西裤数量',
  
  // Vest measurements
  'vest_shoulder_width': '马甲肩宽',
  'vest_chest': '马甲胸围',
  'vest_waist': '马甲中腰肚围',
  'vest_hem': '马甲下摆',
  'vest_front_length': '马甲前衣长',
  'vest_back_length': '马甲后衣长',
  'vest_sleeve_width': '马甲袖肥',
  'vest_cuff': '马甲袖口',
  'vest_buttons': '马甲扣数',
  'vest_rows': '马甲排数',
  'vest_pocket': '马甲口袋',
  'vest_back': '马甲背面',
  'vest_collar': '马甲领子',
  'vest_side_slit': '马甲侧面开叉',
  'vest_quantity': '马甲数量',
  
  // Shirt measurements
  'collar_size': '衬衫领围',
  'shirt_shoulder_width': '衬衫肩宽',
  'shirt_sleeve_length': '衬衫袖长',
  'collar_style': '衬衫领型',
  'shirt_cuff': '衬衫袖口',
  'fabric': '衬衫面料',
  'shirt_quantity': '衬衫数量',
  
  // Additional info
  'remarks': '款式备注',
  'temperature_notes': '体型备注',
  'lining': '里布',
  'customer_source': '客户来源',
  'reception_staff': '接待人员',
  'consultant': '定制顾问',
  'amount': '定制金额'
};

// Determine if a field is a measurement field (for 建议加宽 column)
const isMeasurementField = (fieldKey: string): boolean => {
  return fieldKey.includes('suit_') || 
         fieldKey.includes('pants_') || 
         fieldKey.includes('vest_') || 
         fieldKey.includes('collar_size') || 
         fieldKey.includes('shirt_');
};

export interface TableRow {
  选择维度: string;
  净体: string | number;
  成衣: string;
  建议加宽: string;
}

export const generateMeasurementTable = (
  orderData: any,
  visibleColumns: string[]
): TableRow[] => {
  const tableData: TableRow[] = [];

  // Filter visible columns to exclude actions and get all selected fields
  const selectedColumns = visibleColumns.filter(col => 
    col !== 'actions' && FIELD_MAPPING[col]
  );

  selectedColumns.forEach(column => {
    const chineseName = FIELD_MAPPING[column];
    if (chineseName) {
      const value = orderData[column];
      
      // Only show 建议加宽 for measurement fields
      const adjustmentValue = isMeasurementField(column) 
        ? (ADJUSTMENT_MAPPING[chineseName] || '') 
        : '';
      
      // Format the value based on field type
      let formattedValue = value || '';
      if (column.includes('date') && value) {
        // Format dates
        formattedValue = new Date(value).toLocaleDateString('zh-CN');
      } else if (column === 'amount' && value) {
        // Format currency
        formattedValue = `¥${value}`;
      }
      
      tableData.push({
        选择维度: chineseName,
        净体: formattedValue,
        成衣: '', // Always empty as requested
        建议加宽: adjustmentValue
      });
    }
  });

  return tableData;
};

export const exportToExcel = (
  tableData: TableRow[],
  customerName: string
): void => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert table data to worksheet format
  const ws = XLSX.utils.json_to_sheet(tableData);
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // 选择维度
    { wch: 15 }, // 净体
    { wch: 15 }, // 成衣
    { wch: 20 }  // 建议加宽
  ];
  ws['!cols'] = colWidths;
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, '测量表');
  
  // Generate filename with customer name and timestamp
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${customerName}_测量表_${timestamp}.xlsx`;
  
  // Write the file
  XLSX.writeFile(wb, filename);
};

export const generateAndDownloadTable = (
  orderData: any,
  visibleColumns: string[]
): void => {
  const tableData = generateMeasurementTable(orderData, visibleColumns);
  const customerName = orderData.customer_name || '客户';
  
  if (tableData.length === 0) {
    alert('没有可用的数据');
    return;
  }
  
  exportToExcel(tableData, customerName);
}; 