import React from 'react';
import { Form, Input, Select, AutoComplete, Modal, Radio } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

const CustomizedForm = (props) => {
  const [form] = Form.useForm();
  const { modalVisible, handleAdd, handleModalVisible, mapPropsToFields, addOrEdit } = props;

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    handleAdd(fieldsValue);
  };

  function onSelectProperty(value) {
    console.log(`onSelectProperty, selected ${value}`);
  }

  const rdfPropertiesList = props.rdfProperties.map(function(property) {
    return <Option key={property} value={property}>{property}</Option>;
  });

  if (mapPropsToFields === null) {
    form.resetFields();
  } else {
    form.setFieldsValue(mapPropsToFields);
  }

  return (
    <Modal
      visible={modalVisible}
      title={addOrEdit ? "Add a new property" : "Edit property " + mapPropsToFields.propertyName}
      okText={addOrEdit ? "Add" : "Save changes"}
      onCancel={() => handleModalVisible(false)}
      onOk={okHandle}
    >
      <Form form={form} layout="vertical">
        <FormItem label="Property" name="propertyName" rules={[{ required: true, message: 'Please select a property!' }]}>
          <AutoComplete
            style={{ width: '100%' }}
            placeholder="Select a property"
            onChange={onSelectProperty}
            children={rdfPropertiesList}
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          />
        </FormItem>
        <FormItem label="Label" name="label">
          <Input placeholder="" />
        </FormItem>
        <FormItem label="Display Type" className="collection-create-form_last-form-item" name="type">
          <Radio.Group>
            <Radio value="text">Text</Radio>
            <Radio value="image">Image</Radio>
          </Radio.Group>
        </FormItem>
      </Form>
    </Modal>
  )
};

export default CustomizedForm;