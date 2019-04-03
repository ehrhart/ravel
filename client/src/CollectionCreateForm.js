import React from 'react';
import { Form, Input, Select, AutoComplete, Modal, Radio } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

const CustomizedForm = Form.create({
  mapPropsToFields(props) {
    console.log('mapPropsToFields:', props.mapPropsToFields);
    return {
      propertyName: Form.createFormField({ value: props.mapPropsToFields.propertyName }),
      type: Form.createFormField({ value: props.mapPropsToFields.type || 'text' }),
      label: Form.createFormField({ value: props.mapPropsToFields.label }),
    };
  }
})((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible, mapPropsToFields, addOrEdit } = props;
  const { getFieldDecorator } = props.form;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  };

  function onSelectProperty(value) {
    console.log(`onSelectProperty, selected ${value}`);
  }

  const rdfPropertiesList = props.rdfProperties.map(function(property) {
    return <Option key={property} value={property}>{property}</Option>;
  });

  return (
    <Modal
      visible={modalVisible}
      title={addOrEdit ? "Add a new property" : "Edit property " + mapPropsToFields.propertyName}
      okText={addOrEdit ? "Add" : "Save changes"}
      onCancel={() => handleModalVisible(false)}
      onOk={okHandle}
    >
      <Form layout="vertical">
        <FormItem label="Property">
          {getFieldDecorator('propertyName', {
            rules: [{ required: true, message: 'Please select a property!' }],
          })(
            <AutoComplete
              style={{ width: '100%' }}
              placeholder="Select a property"
              onChange={onSelectProperty}
              dataSource={rdfPropertiesList}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            />
          )}
        </FormItem>
        <FormItem label="Label">
          {getFieldDecorator('label')(<Input placeholder="" />)}
        </FormItem>
        <FormItem label="Display Type" className="collection-create-form_last-form-item">
          {getFieldDecorator('type')(
            <Radio.Group>
              <Radio value="text">Text</Radio>
              <Radio value="image">Image</Radio>
            </Radio.Group>
          )}
        </FormItem>
      </Form>
    </Modal>
  )
});

export default CustomizedForm;