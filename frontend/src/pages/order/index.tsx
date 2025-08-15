import React from 'react';
import Form from 'antd/lib/form';
import type { FormProps } from 'antd/lib/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Card from 'antd/es/card';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Space from 'antd/es/space';
import Typography from 'antd/es/typography';
import InputNumber from 'antd/es/input-number';
import Divider from 'antd/es/divider';
import DatePicker from 'antd/es/date-picker';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ShirtOrder {
  姓名: string;
  身高?: number;
  体重_KG?: number;
  电话?: string;
  使用时间?: string | Dayjs;
  下单日期?: string | Dayjs;
  到店交付日期?: string | Dayjs;
  实际交付日期?: string | Dayjs;
  定制工艺?: string;
  工艺?: string;
  西装净体领围?: number;
  西装肩宽?: number;
  西装袖长?: number;
  西装袖肥?: number;
  西装袖口?: number;
  西装胸围?: number;
  西装中腰?: number;
  西装下摆臀围?: number;
  西装前衣长?: number;
  西装后衣长?: number;
  西装前腰节?: number;
  西装后腰节?: number;
  西装左肩斜?: number;
  西装右肩斜?: number;
  西装背胸差?: number;
  西装前胸宽?: number;
  西装后背宽?: number;
  西装袖笼差?: number;
  西装袖笼深?: number;
  西装袖笼围?: number;
  西装数量?: number;
  西裤裤腰围?: number;
  西裤臀围?: number;
  西裤大腿圈?: number;
  西裤膝围?: number;
  西裤小腿圈?: number;
  西裤小腿高?: number;
  西裤裤长?: number;
  西裤遮档?: number;
  西裤腰高?: number;
  西裤裤前褶?: string;
  西裤皮带袢?: string;
  西裤卷边?: string;
  西裤调山袢?: string;
  西装面料?: string;
  西裤数量?: number;
  马甲肩宽?: number;
  马甲胸围?: number;
  马甲中腰肚围?: number;
  马甲下摆?: number;
  马甲前衣长?: number;
  马甲后衣长?: number;
  马甲袖肥?: number;
  马甲袖口?: number;
  马甲扣数?: number;
  马甲排数?: string;
  马甲口袋?: string;
  马甲背面?: string;
  马甲领子?: string;
  马甲侧面开叉?: string;
  马甲数量?: number;
  衬衫领围?: number;
  衬衫肩宽?: number;
  衬衫袖长?: number;
  衬衫领型?: number;
  衬衫袖口?: number;
  衬衫面料?: string;
  衬衫数量?: number;
  款式备注?: string;
  体型备注?: string;
  里布?: string;
  客户来源?: string;
  接待人员?: string;
  定制顾问?: string;
  定制金额?: number;
}

const OrderPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);
  const { t } = useTranslation();

  // Current date and one month later for default dates
  const today = dayjs();
  const oneMonthLater = today.add(1, 'month');

  const onFinish = async (values: ShirtOrder) => {
    try {
      setSubmitting(true);
      console.log('Submitting form with values:', values);
      
      // Format date fields if they exist
      const formattedValues = { ...values };
      
      if (formattedValues.使用时间 && dayjs.isDayjs(formattedValues.使用时间)) {
        formattedValues.使用时间 = formattedValues.使用时间.format('YYYY-MM-DD');
      }
      
      if (formattedValues.下单日期 && dayjs.isDayjs(formattedValues.下单日期)) {
        formattedValues.下单日期 = formattedValues.下单日期.format('YYYY-MM-DD');
      } else {
        // Set default to today if not provided
        formattedValues.下单日期 = dayjs().format('YYYY-MM-DD');
      }
      
      if (formattedValues.到店交付日期 && dayjs.isDayjs(formattedValues.到店交付日期)) {
        formattedValues.到店交付日期 = formattedValues.到店交付日期.format('YYYY-MM-DD');
      }
      
      if (formattedValues.实际交付日期 && dayjs.isDayjs(formattedValues.实际交付日期)) {
        formattedValues.实际交付日期 = formattedValues.实际交付日期.format('YYYY-MM-DD');
      }
      
      // Ensure required fields are present
      if (!formattedValues.定制工艺) {
        formattedValues.定制工艺 = '半定制'; // Default value
      }
      
      if (!formattedValues.西装面料) {
        formattedValues.西装面料 = '标准面料'; // Default value
      }
      
      if (!formattedValues.西装数量) {
        formattedValues.西装数量 = 1; // Default value
      }
      
      // Use relative API path with consistent timeout and headers
      const response = await axios.post('/api/shirt-orders', formattedValues, {
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Server response:', response);
      
      if (response.status === 200 && response.data.success) {
        message.success(t('general.saveSuccess'));
        navigate('/order-view');
      } else {
        message.error(response.data.message || t('general.saveError'));
        console.error('Failed to submit order:', response.data);
      }
    } catch (error: unknown) {
      console.error('Error submitting order:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          message.error(`${t('general.saveError')}: ${error.response.data?.message || error.message}`);
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        } else if (error.request) {
          message.error(t('general.apiError'));
          console.error('Error request:', error.request);
        } else {
          message.error(`${t('general.saveError')}: ${error.message}`);
        }
      } else if (error instanceof Error) {
        message.error(`${t('general.saveError')}: ${error.message}`);
      } else {
        message.error(t('general.saveError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (typeof value === 'undefined') {
      return '';
    }
    return `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCurrency = (displayValue: string | undefined): number => {
    if (!displayValue) {
      return 0;
    }
    return Number(displayValue.replace(/\¥\s?|(,*)/g, '')) || 0;
  };

  return (
    <Card title={t('header.newOrder')}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          定制工艺: '半定制',
          西装数量: 1,
          下单日期: today,
          到店交付日期: oneMonthLater
        }}
      >
        <Row gutter={24}>
          {/* 客户基本信息 */}
          <Col span={24}>
            <Title level={5}>客户基本信息</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="姓名" label="姓名" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="身高" label="身高(cm)">
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="体重_KG" label="体重(KG)">
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="电话" label="电话">
              <Input />
            </Form.Item>
          </Col>

          {/* 订单信息 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>订单信息</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="使用时间" label="使用时间">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="下单日期" label="下单日期" rules={[{ required: true }]}>
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="到店交付日期" label="到店交付日期">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="实际交付日期" label="实际交付日期">
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="定制工艺" label="定制工艺">
              <Select>
                <Option value="半定制">半定制</Option>
                <Option value="全定制">全定制</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="工艺" label="工艺">
              <Select placeholder="请选择工艺">
                <Option value="毛样">毛样</Option>
                <Option value="光样">光样</Option>
                <Option value="成衣">成衣</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* 西装尺寸 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>西装尺寸</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="西装净体领围" label="西装净体领围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装肩宽" label="西装肩宽">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖长" label="西装袖长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖肥" label="西装袖肥">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖口" label="西装袖口">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装胸围" label="西装胸围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装中腰" label="西装中腰">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装下摆臀围" label="西装下摆臀围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装前衣长" label="西装前衣长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装后衣长" label="西装后衣长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装前腰节" label="西装前腰节">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装后腰节" label="西装后腰节">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装左肩斜" label="西装左肩斜">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装右肩斜" label="西装右肩斜">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装背胸差" label="西装背胸差">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装前胸宽" label="西装前胸宽">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装后背宽" label="西装后背宽">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖笼差" label="西装袖笼差">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖笼深" label="西装袖笼深">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装袖笼围" label="西装袖笼围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装面料" label="西装面料">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西装数量" label="西装数量">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* 西裤尺寸 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>西裤尺寸</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤裤腰围" label="西裤裤腰围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤臀围" label="西裤臀围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤大腿圈" label="西裤大腿圈">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤膝围" label="西裤膝围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤小腿圈" label="西裤小腿圈">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤小腿高" label="西裤小腿高">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤裤长" label="西裤裤长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤遮档" label="西裤遮档">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤腰高" label="西裤腰高">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤裤前褶" label="西裤裤前褶">
              <Select placeholder="请选择裤前褶">
                <Option value="单">单</Option>
                <Option value="双">双</Option>
                <Option value="无">无</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤皮带袢" label="西裤皮带袢">
              <Select placeholder="请选择皮带袢">
                <Option value="有">有</Option>
                <Option value="无">无</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤卷边" label="西裤卷边">
              <Select placeholder="请选择卷边">
                <Option value="有">有</Option>
                <Option value="无">无</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤调山袢" label="西裤调山袢">
              <Select placeholder="请选择调山袢">
                <Option value="无">无</Option>
                <Option value="松紧">松紧</Option>
                <Option value="宝剑头">宝剑头</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="西裤数量" label="西裤数量">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* 马甲尺寸 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>马甲尺寸</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲肩宽" label="马甲肩宽">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲胸围" label="马甲胸围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲中腰肚围" label="马甲中腰肚围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲下摆" label="马甲下摆">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲前衣长" label="马甲前衣长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲后衣长" label="马甲后衣长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲袖肥" label="马甲袖肥">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲袖口" label="马甲袖口">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲扣数" label="马甲扣数">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲排数" label="马甲排数">
              <Select placeholder="请选择排数">
                <Option value="单">单</Option>
                <Option value="双">双</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲口袋" label="马甲口袋">
              <Select placeholder="请选择口袋">
                <Option value="盖">盖</Option>
                <Option value="双线">双线</Option>
                <Option value="贴">贴</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲背面" label="马甲背面">
              <Select placeholder="请选择背面">
                <Option value="里布">里布</Option>
                <Option value="面料">面料</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲领子" label="马甲领子">
              <Select placeholder="请选择领子">
                <Option value="无">无</Option>
                <Option value="平">平</Option>
                <Option value="戗">戗</Option>
                <Option value="青">青</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲侧面开叉" label="马甲侧面开叉">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="马甲数量" label="马甲数量">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* 衬衫尺寸 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>衬衫尺寸</Title>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫领围" label="衬衫领围">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫肩宽" label="衬衫肩宽">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫袖长" label="衬衫袖长">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫领型" label="衬衫领型">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫袖口" label="衬衫袖口">
              <InputNumber step={0.1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫面料" label="衬衫面料">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="衬衫数量" label="衬衫数量">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          {/* 其他信息 */}
          <Col span={24}>
            <Divider />
            <Title level={5}>其他信息</Title>
          </Col>
          <Col span={12}>
            <Form.Item name="款式备注" label="款式备注">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="体型备注" label="体型备注">
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="里布" label="里布">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="客户来源" label="客户来源">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="接待人员" label="接待人员">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="定制顾问" label="定制顾问">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="定制金额" label="定制金额">
              <InputNumber
                step={0.01}
                min={0}
                formatter={formatCurrency}
                parser={parseCurrency}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('general.save')}
            </Button>
            <Button onClick={() => navigate('/order-view')} disabled={submitting}>
              {t('general.back')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default OrderPage; 