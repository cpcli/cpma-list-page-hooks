import React, { Component } from "react";
import { Tabel, Modal, Button } from "antd";
import PropTypes from "prop-types";
class ActenterTabelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageSize: 10,
      page: 0,
      total: 0,
    };
  }
  hideModal = () => {
    //hide modal
    const { hideModal } = this.props;
    hideModal();
  };
  handleSubmit = () => {
    //submit
    const { handleSubmit } = this.props;
    handleSubmit();
  };
  
  render() {
    const {
      visible,
      title,
      negative_button_text,
      positive_button_text,
      width,
      children
    } = this.props;
    return (
      <div>
        <Modal
          visible={visible}
          maskClosable={false}
          title={title}
          width={width}
          onCancel={this.hideModal}
          footer={[
            <Button key="back" onClick={this.hideModal}>
              {negative_button_text}
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleSubmit}>
              {positive_button_text}
            </Button>,
          ]}
        >
          {children}
        </Modal>
      </div>
    );
  }
}
ActenterTabelModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  negative_button_text: PropTypes.string.isRequired,
  positive_button_text: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  companyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children:PropTypes.node
};
ActenterTabelModal.defaultProps = {
  visible: false,
  title: "标题",
  negative_button_text: "取消",
  positive_button_text: "确定",
  width: 520,
};
export default ActenterTabelModal;
