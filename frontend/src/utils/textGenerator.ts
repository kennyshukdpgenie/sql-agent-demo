import { FIELD_MAPPING } from './tableGenerator';
import dayjs from 'dayjs';

// Default text template - can be easily modified
export const DEFAULT_TEXT_TEMPLATE = `客户姓名是{customer_name}，电话是{phone}，身高{height}cm，体重{weight}kg。
定制类型：{custom_type}
下单日期：{input_date}
计划交期：{planned_date}
实际交期：{finish_date}
西装信息：{suit_quantity}件，面料{suit_fabric}，领围{suit_collar}，肩宽{suit_shoulder_width}，袖长{suit_sleeve_length}，胸围{suit_chest}，中腰{suit_waist}
西裤信息：{pants_quantity}件，腰围{pants_waist}，裤长{pants_length}
衬衫信息：领围{collar_size}，肩宽{shirt_shoulder_width}，袖长{shirt_sleeve_length}，袖口{shirt_cuff}，面料{fabric}
备注：{remarks}
顾问：{consultant}`;

// Alternative simple template
export const SIMPLE_TEXT_TEMPLATE = `客户姓名是{customer_name}，电话是{phone}`;

// Alternative detailed template
export const DETAILED_TEXT_TEMPLATE = `{finish_date}寄出
客户: {customer_name} (身高:{height}cm, 体重:{weight}kg, 电话:{phone})
西装: {suit_quantity}件, 面料:{suit_fabric}, 领围:{suit_collar}, 肩宽:{suit_shoulder_width}, 袖长:{suit_sleeve_length}, 胸围:{suit_chest}, 中腰:{suit_waist}
西裤: {pants_quantity}件, 腰围:{pants_waist}, 裤长:{pants_length}
衬衫: 领围:{collar_size}, 肩宽:{shirt_shoulder_width}, 袖长:{shirt_sleeve_length}, 袖口:{shirt_cuff}, 面料:{fabric}
款式: {custom_type}, 备注:{remarks}, 顾问:{consultant}`;

export interface TextGeneratorConfig {
  template: string;
  dateFormat?: string;
  currencySymbol?: string;
  emptyValuePlaceholder?: string;
}

export const DEFAULT_CONFIG: TextGeneratorConfig = {
  template: DEFAULT_TEXT_TEMPLATE,
  dateFormat: 'YYYY-MM-DD',
  currencySymbol: '¥',
  emptyValuePlaceholder: ''
};

/**
 * Format a value based on its type and field name
 */
const formatValue = (
  fieldKey: string, 
  value: any, 
  config: TextGeneratorConfig
): string => {
  if (value === null || value === undefined || value === '') {
    return config.emptyValuePlaceholder || '';
  }

  // Format dates
  if (fieldKey.includes('date') && value) {
    try {
      return dayjs(value).format(config.dateFormat || 'YYYY-MM-DD');
    } catch {
      return String(value);
    }
  }

  // Format currency
  if (fieldKey === 'amount' && typeof value === 'number') {
    return `${config.currencySymbol || '¥'}${value}`;
  }

  // Format numbers with units for measurements
  if (typeof value === 'number' && (
    fieldKey.includes('suit_') || 
    fieldKey.includes('pants_') || 
    fieldKey.includes('vest_') || 
    fieldKey.includes('collar_') ||
    fieldKey.includes('shirt_') ||
    fieldKey === 'height' ||
    fieldKey === 'weight'
  )) {
    return String(value);
  }

  return String(value);
};

/**
 * Generate formatted text from a record using a template
 */
export const generateFormattedText = (
  record: any,
  config: TextGeneratorConfig = DEFAULT_CONFIG
): string => {
  let formattedText = config.template;

  // Find all placeholders in the template (format: {field_name})
  const placeholderRegex = /\{([^}]+)\}/g;
  const placeholders = Array.from(formattedText.matchAll(placeholderRegex));

  // Replace each placeholder with the corresponding value
  placeholders.forEach(([placeholder, fieldKey]) => {
    const value = record[fieldKey];
    const formattedValue = formatValue(fieldKey, value, config);
    formattedText = formattedText.replace(placeholder, formattedValue);
  });

  return formattedText;
};

/**
 * Generate text based on visible columns (dynamic template)
 */
export const generateDynamicText = (
  record: any,
  visibleColumns: string[],
  config: Partial<TextGeneratorConfig> = {}
): string => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Filter visible columns to exclude actions
  const dataColumns = visibleColumns.filter(col => 
    col !== 'actions' && record[col] !== undefined && record[col] !== null && record[col] !== ''
  );

  // Create dynamic template based on visible columns
  const dynamicTemplate = dataColumns
    .map(col => {
      const chineseName = FIELD_MAPPING[col] || col;
      return `${chineseName}：{${col}}`;
    })
    .join('\n');

  return generateFormattedText(record, {
    ...finalConfig,
    template: dynamicTemplate
  });
};

/**
 * Get available template options
 */
export const getTemplateOptions = () => [
  { label: '默认模板', value: 'default', template: DEFAULT_TEXT_TEMPLATE },
  { label: '简单模板', value: 'simple', template: SIMPLE_TEXT_TEMPLATE },
  { label: '详细模板', value: 'detailed', template: DETAILED_TEXT_TEMPLATE },
  { label: '动态模板', value: 'dynamic', template: '' } // Dynamic based on visible columns
]; 