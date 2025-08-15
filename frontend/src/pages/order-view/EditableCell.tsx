import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Input, DatePicker, Select } from 'antd';
import InputNumber from 'antd/lib/input-number';
import type { FormInstance } from 'antd/es/form';
import type { InputRef } from 'antd/es/input';
import type { DatePickerProps } from 'antd/es/date-picker';
import type { SelectProps } from 'antd/es/select';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';

export const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const genericRef = useRef<any>(null);
  const form = useContext(EditableContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (editing && form) {
      const isNumberField = ['height', 'weight', 'quantity', 'collar_size', 'shirt_shoulder_width', 
        'shirt_sleeve_length', 'shirt_chest', 'shirt_mid_waist', 
        'shirt_sleeve_circumference', 'shirt_cuff', 'shirt_length', 
        'shirt_hem', 'amount'].includes(dataIndex);
      
      const isSelectField = ['custom_type', 'fabric'].includes(dataIndex);
      const isDateField = ['input_date', 'planned_date', 'finish_date'].includes(dataIndex);
      
      if (isNumberField || isSelectField || isDateField) {
        genericRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
      
      // For date fields, convert string to dayjs object
      if (isDateField && record[dataIndex]) {
        form.setFieldsValue({ [dataIndex]: dayjs(record[dataIndex]) });
      } else {
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
      }
    }
  }, [editing, form, dataIndex, record]);

  const toggleEdit = () => {
    if (!form) return;
    setEditing(!editing);
    
    // For date fields, convert string to dayjs object
    const isDateField = ['input_date', 'planned_date', 'finish_date'].includes(dataIndex);
    if (isDateField && record[dataIndex]) {
      form.setFieldsValue({ [dataIndex]: dayjs(record[dataIndex]) });
    } else {
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    }
  };

  const save = async () => {
    if (!form) return;
    try {
      const values = await form.validateFields();
      
      // Convert dayjs objects to string format for date fields
      const isDateField = ['input_date', 'planned_date', 'finish_date'].includes(dataIndex);
      const updatedValues = { ...values };
      
      if (isDateField && updatedValues[dataIndex] && typeof updatedValues[dataIndex] === 'object' && 'format' in updatedValues[dataIndex]) {
        updatedValues[dataIndex] = updatedValues[dataIndex].format('YYYY-MM-DD');
      }
      
      toggleEdit();
      handleSave({ ...record, ...updatedValues });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  // Handle date change separately to ensure proper conversion
  const handleDateChange = (date: Dayjs | null) => {
    if (date && form) {
      // Store the date value to be used when saving
      form.setFieldsValue({ [dataIndex]: date });
      
      // Auto-save after a short delay to ensure the value is set
      setTimeout(() => {
        save();
      }, 100);
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
            required: ['input_date'].includes(dataIndex), // Only make input_date required
            message: `${title} ${t('general.edit')}`,
          },
        ]}
      >
        {['input_date', 'planned_date', 'finish_date'].includes(dataIndex) ? (
          <DatePicker
            ref={genericRef}
            onChange={handleDateChange}
            format="YYYY-MM-DD"
          />
        ) : dataIndex === 'custom_type' ? (
          <Select
            ref={genericRef}
            onChange={save}
            onBlur={save}
            style={{ width: '100%' }}
          >
            <Select.Option value="半定制">{t('customTypeOptions.semiCustom')}</Select.Option>
            <Select.Option value="全定制">{t('customTypeOptions.fullCustom')}</Select.Option>
          </Select>
        ) : dataIndex === 'fabric' ? (
          <Select
            ref={genericRef}
            onChange={save}
            onBlur={save}
            style={{ width: '100%' }}
          >
            <Select.Option value="Cotton">{t('fabricOptions.cotton')}</Select.Option>
            <Select.Option value="Wool">{t('fabricOptions.wool')}</Select.Option>
            <Select.Option value="Linen">{t('fabricOptions.linen')}</Select.Option>
            <Select.Option value="Polyester">{t('fabricOptions.polyester')}</Select.Option>
            <Select.Option value="Other">{t('fabricOptions.other')}</Select.Option>
          </Select>
        ) : ['height', 'weight', 'quantity', 'collar_size', 'shirt_shoulder_width', 
             'shirt_sleeve_length', 'shirt_chest', 'shirt_mid_waist', 
             'shirt_sleeve_circumference', 'shirt_cuff', 'shirt_length', 
             'shirt_hem', 'amount'].includes(dataIndex) ? (
          <InputNumber
            ref={genericRef}
            onChange={save}
            onBlur={save}
            style={{ width: '100%' }}
            step={dataIndex === 'quantity' ? 1 : 0.1}
            min={0}
          />
        ) : (
          <Input
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children || <span style={{ color: '#bfbfbf' }}>{t('general.clickToEdit')}</span>}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export const EditableRow: React.FC<{ index: number }> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}; 