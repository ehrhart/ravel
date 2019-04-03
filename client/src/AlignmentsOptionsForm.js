import React from 'react';
import { Button, Form, Input, Select, Modal, Upload, Icon, Tabs, Typography } from 'antd';

import Api from './Api';

const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { Paragraph, Text } = Typography;

class AlignmentsOptionsForm extends React.Component {
  state = {
    loading: false,
    isSaving: false,
    fileList: [],
    modalVisible: false,
  };

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  beforeUpload(file) {
    console.log('file = ', file);
    return true;
  }

  handleUploadChange = (info) => {
    const { setFieldsValue } = this.props.form;
    console.log('handleUploadChange', info);
    let fileList = info.fileList;

    // 1. Limit the number of uploaded files
    // Only to show the most recent uploaded file, and old ones will be replaced by the new
    fileList = fileList.slice(-1);

    // 2. Read from response and show file link
    fileList = fileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    // 3. Filter successfully uploaded files according to response from server
    // fileList = fileList.filter((file) => {
    //   if (file.response) {
    //     return file.response.status === 'success';
    //   }
    //   return true;
    // });

    //this.setState({ fileList });
    setFieldsValue({'upload': fileList});
  }

  normFile = (e) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }

    let fileList = e.fileList || [];

    // 1. Limit the number of uploaded files
    // Only to show the most recent uploaded file, and old ones will be replaced by the new
    fileList = fileList.slice(-1);

    // 2. Read from response and show file link
    fileList = fileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      return file;
    });

    // 3. Filter successfully uploaded files according to response from server
    // fileList = fileList.filter((file) => {
    //   if (file.response) {
    //     return file.response.status === 'success';
    //   }
    //   return true;
    // });

    return fileList;
  }

  useSampleAlignments = () => {
    const { form } = this.props;
    form.setFieldsValue({
      upload: null,
      url: './cotedazur_alignments.ttl',
      format: 'turtle',
    });
    this.okHandle();
  }

  okHandle = async () => {
    const { form } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      this.props.onSave(fieldsValue, () => {
        this.handleModalVisible(false);
      });
    });
  }

  render() {
    const { alignments } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { modalVisible } = this.state;

    function displayAlignmentsName(alignments) {
      if (alignments) {
        if (alignments.upload && alignments.upload.length > 0 && alignments.upload[0].name && alignments.upload[0].name.length > 0) {
          return alignments.upload[0].name;
        }
        if (alignments.url && alignments.url.length > 0) {
          return alignments.url;
        }
      }
      return '';
    }

    return (
      <div>
        <div>
          <Text strong>{this.props.label}</Text>
          <Paragraph>
            {displayAlignmentsName(alignments)}
          </Paragraph>
          <Button type="primary" onClick={() => this.handleModalVisible(true)}>Edit</Button>
        </div>
        <Modal
          visible={modalVisible}
          title="Edit alignments"
          onCancel={() => this.handleModalVisible(false)}
          onOk={this.okHandle}
          footer={[
            <Button key="back" onClick={() => this.handleModalVisible(false)}>Cancel</Button>,
            <Button key="submit" type="primary" loading={this.props.isSaving} onClick={this.okHandle}>
              Save changes
            </Button>,
          ]}
        >
          <Form layout="vertical">
            <Tabs defaultActiveKey="1" size="small" tabPosition="left">
              <TabPane tab="Files" key="1">
                <Paragraph>
                  <Button onClick={this.useSampleAlignments}>Use sample alignments</Button>
                </Paragraph>
                <FormItem label="Alignments Upload">
                  {getFieldDecorator('upload', {
                    valuePropName: 'fileList',
                    getValueFromEvent: this.normFile,
                  })(
                    <Upload.Dragger
                      name="file"
                      showUploadList={true}
                      action={`${Api.defaults.baseURL}projects/upload`}
                      beforeUpload={this.beforeUpload}
                      //onChange={this.handleUploadChange}
                    >
                      <Paragraph className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                      </Paragraph>
                      <Paragraph className="ant-upload-text">
                        Click or drag file to this area to upload
                      </Paragraph>
                    </Upload.Dragger>
                  )}
                </FormItem>
                <FormItem label="URL">
                  {getFieldDecorator('url')(<Input style={{ width: 200 }} placeholder="Enter an URL" />)}
                </FormItem>
              </TabPane>
              <TabPane tab="Options" key="2">
                <FormItem label="Alignments format">
                  {getFieldDecorator('format', {
                    initialValue: alignments.format
                  })(
                    <Select
                      showSearch
                      style={{ width: '100%' }}
                      placeholder="Select an alignments format"
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      <Option key="auto" value="auto">Automatic Detection</Option>
                      <Option key="turtle" value="turtle">Turtle</Option>
                      <Option key="trig" value="trig">TriG</Option>
                      <Option key="triple" value="triple">N-Triples</Option>
                      <Option key="quad" value="quad">N-Quads</Option>
                      <Option key="n3" value="n3">Notation3 (N3)</Option>
                    </Select>
                  )}
                </FormItem>
              </TabPane>
            </Tabs>
          </Form>
        </Modal>
      </div>
    )
  }
}

AlignmentsOptionsForm = Form.create({
  mapPropsToFields(props) {
    console.log('mapPropsToFields:', props.alignments);
    return {
      url: Form.createFormField({ value: props.alignments.url }),
      upload: Form.createFormField({ value: props.alignments.upload }),
      format: Form.createFormField({ value: props.alignments.format }),
    };
  }
})(AlignmentsOptionsForm);

export default AlignmentsOptionsForm;