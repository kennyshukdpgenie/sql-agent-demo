declare module 'antd' {
  import { ComponentType, ReactNode, RefObject } from 'react';
  import { FormInstance } from 'antd/es/form';
  import { ColumnsType } from 'antd/es/table';
  import { Dayjs } from 'dayjs';

  interface FormProps {
    form?: FormInstance;
    layout?: 'horizontal' | 'vertical' | 'inline';
    onFinish?: (values: any) => void;
    children?: ReactNode;
    component?: boolean;
    className?: string;
  }

  interface FormItemProps {
    name?: string | string[];
    label?: ReactNode;
    rules?: Array<{ required?: boolean; message?: string }>;
    children?: ReactNode;
    style?: React.CSSProperties;
  }

  interface InputProps {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    ref?: RefObject<any>;
    onPressEnter?: () => void;
    onBlur?: () => void;
    style?: React.CSSProperties;
    addonBefore?: ReactNode;
    type?: string;
  }

  interface TextAreaProps extends Omit<InputProps, 'type'> {
    rows?: number;
  }

  interface InputGroupProps {
    children?: ReactNode;
  }

  interface DatePickerProps {
    value?: Dayjs;
    onChange?: (date: Dayjs | null, dateString: string) => void;
    format?: string;
    disabled?: boolean;
    ref?: RefObject<any>;
    onPressEnter?: () => void;
    onBlur?: () => void;
    style?: React.CSSProperties;
  }

  interface SelectProps {
    value?: any;
    onChange?: (value: any) => void;
    options?: Array<{ label: string; value: any }>;
    mode?: 'multiple' | 'tags';
    disabled?: boolean;
    ref?: RefObject<any>;
    onBlur?: () => void;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface SelectOptionProps {
    value: any;
    children: ReactNode;
  }

  interface TableProps<T> {
    dataSource?: T[];
    columns?: ColumnsType<T>;
    rowKey?: string | ((record: T) => string);
    pagination?: boolean | object;
    components?: {
      body?: {
        cell?: ComponentType<any>;
      };
    };
    loading?: boolean;
  }

  interface ButtonProps {
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
    onClick?: () => void;
    disabled?: boolean;
    children?: ReactNode;
    htmlType?: 'submit' | 'button' | 'reset';
    style?: React.CSSProperties;
  }

  export const Form: ComponentType<FormProps> & {
    Item: ComponentType<FormItemProps>;
    useForm: () => [FormInstance];
  };

  export const Input: ComponentType<InputProps> & {
    TextArea: ComponentType<TextAreaProps>;
    Group: ComponentType<InputGroupProps>;
  };

  export const DatePicker: ComponentType<DatePickerProps>;
  
  export const Select: ComponentType<SelectProps> & {
    Option: ComponentType<SelectOptionProps>;
  };

  export const Table: ComponentType<TableProps<any>>;
  
  export const Button: ComponentType<ButtonProps>;
  
  export const message: {
    success: (content: string) => void;
    error: (content: string) => void;
    warning: (content: string) => void;
  };
  
  export type { FormInstance, ColumnsType };
}

declare module 'antd/es/form' {
  export interface FormInstance<Values = any> {
    getFieldValue: (name: string) => any;
    getFieldsValue: (nameList?: string[]) => Values;
    setFieldsValue: (values: Partial<Values>) => void;
    resetFields: (fields?: string[]) => void;
    submit: () => void;
    validateFields: (nameList?: string[]) => Promise<Values>;
  }
  
  export type { FormInstance };
}

declare module 'antd/es/table' {
  import { ReactNode } from 'react';

  export interface ColumnType<T> {
    title: ReactNode;
    dataIndex?: string;
    key?: string;
    render?: (text: any, record: T, index: number) => ReactNode;
    width?: string | number;
    editable?: boolean;
  }

  export type ColumnsType<T> = ColumnType<T>[];
} 