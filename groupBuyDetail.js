import React, { Component, useState, useEffect, useCallback } from 'react'
import { Form, Row, Col, Table, Input, Select, Button, message, Descriptions } from 'antd'
import moment from 'moment'
import CustomerBreadcrumb from "../../components/CustomerBreadcrumb";
import { groupBuyStatusList, orderStatusMap, groupBuyStatusMap, statusListMap } from './constant'
import { orderStatusList, } from '../../constant'
import { getListDetailApi, } from './api'
import XLSX from 'xlsx'

const dateFormat = 'YYYY-MM-DD HH:mm'
const { Option } = Select
const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const MAXSIZE = 99999
//  1 禁用 
// 10 新建待审核 
// 30 待生效  
// 40 运行中 
// 50 已结束

function List(props) {
  const { getFieldDecorator, resetFields, getFieldsValue } = props.form
  const [exportLoding, setExportLoding] = useState(false)
  const [data, setData] = useState([])
  const [page, setPage] = useState({ page: 1, size: 10 })
  const [total, setTotal] = useState(0)
  const [actInfo, setActInfo] = useState({})

  const columns = [
    {
      title: '拼团ID',
      dataIndex: 'join_group_buy_id',
      align: 'center'
    },
    {
      title: '商品名称',
      dataIndex: 'product_name',
      align: 'center'
    },
    {
      title: '订单编号',
      dataIndex: 'order_no',
      align: 'center'
    },
    {
      title: '拼团用户名称',
      dataIndex: 'customer_name',
      align: 'center'
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      align: 'center',
      render: (text, record) => {
        const target = orderStatusList.find(item => item.value === 1 * text)
        if (target) {
          return target.label
        }
        return '-'
      }
    },
    {
      title: '拼团状态',
      dataIndex: 'group_buy_status',
      align: 'center',
      render: (text, record) => {
        const target = groupBuyStatusList.find(item => item.value === 1 * text)
        if (target) {
          return target.label
        }
        return '-'
      }
    },
    {
      title: '参团人数/成团人数',
      dataIndex: 'group_buy_schedule',
      align: 'center'
    },
    {
      title: '成团时间',
      dataIndex: 'real_group_buy_time',
      align: 'center',
      render: (text, record) => {
        return moment(text).format(dateFormat)
      }
    },
    {
      title: '成团开始时间',
      dataIndex: 'group_buy_start_time',
      align: 'center',
      render: (text, record) => {
        return moment(text).format(dateFormat)
      }
    },
    {
      title: '成团结束时间',
      dataIndex: 'group_buy_end_time',
      align: 'center',
      render: (text, record) => {
        return moment(text).format(dateFormat)
      }
    }
  ]

  useEffect(() => {
    const getList = async () => {
      const values = getFieldsValue()
      const sendData = {
        company_id: localStorage.getItem('authCompanyId'),
        source: 1,
        act_id: props.match.params.id,
        page: page.page,
        page_size: page.size,
        customer_name: values.customer_name,
        product_name: values.product_name,
        group_buy_status: values.group_buy_status,
      }
      let res = await getListDetailApi(sendData)
      if (res.error !== 0) return message.error(res.msg)
      setActInfo(res)
      setData(res.list)
      setTotal(res.list.length)
    }
    getList()
  }, [page])

  const submit = useCallback(
    () => {
      setPage({ page: 1, size: 10 })
    },
    [],
  )
  const reset = useCallback(
    () => {
      setPage({ page: 1, size: 10 })
      resetFields()
    },
    [],
  )
  const onPageChange = useCallback(
    (page, size) => {
      setPage({ page, size })
    },
    [],
  )
  const handleExport = async () => {
    const { id } = props.match.params
    const { getFieldsValue } = props.form
    const params = {
      source: 1,
      company_id: localStorage.getItem('authCompanyId'),
      act_id: id,
      ...getFieldsValue()
    }
    setExportLoding(true)
    const { list: exportList, error, msg } = await getListDetailApi({ page: 1, pageSize: MAXSIZE, ...params })
    if (error !== 0) {
      return message.error(msg)
    }
    if (!exportList.length) {
      setExportLoding(false)
      return message.info('无可导出数据')
    }
    // 同步导出
    try {
      let table = [];
      table.push({
        A: "拼团ID",
        B: "商品名称",
        C: "订单编号",
        D: "拼团用户名称",
        E: "订单状态",
        F: "拼团状态",
        G: "参团人数/成团人数",
        H: "成团时间",
        I: "成团开始时间",
        J: "成团结束时间",
      })
      for (let i = 0; i < exportList.length; i++) {
        let item = exportList[i]
        table.push({
          A: item.join_group_buy_id,
          B: item.product_name,
          C: item.order_no,
          D: item.customer_name,
          E: orderStatusMap[item.order_status],
          F: groupBuyStatusMap[item.group_buy_status],
          G: item.group_buy_schedule,
          H: moment(item.real_group_buy_time).format(dateFormat),
          I: moment(item.group_buy_start_time).format(dateFormat),
          J: moment(item.group_buy_end_time).format(dateFormat),
        });
      }
      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(table, { skipHeader: true });
      var timestamp = moment().format('YYYYMMDDHHmmss')
      XLSX.utils.book_append_sheet(wb, ws, "file");
      XLSX.writeFile(wb, timestamp + ".xlsx");
      setExportLoding(false)
      return message.success('导出完成！')
    } catch (error) {
      setExportLoding(false)
      console.log(error, 'error')
      return message.error('导出失败')
    }
  }

  return (
    <>
      <CustomerBreadcrumb className="breadcrumb"></CustomerBreadcrumb>
      <div>
        <Form {...formItemLayout} style={{ marginBottom: '12px', background: '#fff' }} >
          <Descriptions style={{ padding: '24px 24px 0px', borderBottom: '2px solid #eee' }}>
            <Descriptions.Item>
              拼团活动名称：{actInfo?.act_info?.act_name}
            </Descriptions.Item>
            <Descriptions.Item>
              状态：{statusListMap[actInfo?.act_info?.status]}
            </Descriptions.Item>
            <Descriptions.Item>
              发起拼团人数：{actInfo?.groupbuy_statistics?.open_group_buy_count}
            </Descriptions.Item>
            <Descriptions.Item>
              参与拼团人数：{actInfo?.groupbuy_statistics?.join_group_buy_count}
            </Descriptions.Item>
            <Descriptions.Item>
              真实拼团成功数：{actInfo?.groupbuy_statistics?.real_group_buy_count}
            </Descriptions.Item>
            <Descriptions.Item>
              自动拼团成功数：{actInfo?.groupbuy_statistics?.auto_group_buy_count}
            </Descriptions.Item>
          </Descriptions>

          <Row span={24} style={{ backgroundColor: '#fff', padding: '24px 24px 0' }}>
            <Col span={6}>
              <Form.Item label="拼团用户名称">
                {getFieldDecorator('customer_name')(
                  <Input placeholder="请输入拼团用户名称" />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="商品名称">
                {getFieldDecorator('product_name')(
                  <Input placeholder="请输入商品名称" />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="拼团状态">
                {getFieldDecorator('group_buy_status')(
                  <Select
                    placeholder='请选择拼团状态'
                  >
                    {
                      groupBuyStatusList.map((item, index) => {
                        return <Option value={item.value} key={item.value}>{item.label}</Option>
                      })
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col offset={0} span={6} style={{ lineHeight: '40px' }}>
              <Button type="primary" onClick={submit} style={{ marginLeft: '40px' }}>
                查询结果
              </Button>
              <Button onClick={reset} style={{ marginLeft: '20px' }}>
                重置
              </Button>
            </Col>
          </Row>
        </Form>
        <Row style={{ backgroundColor: '#fff', padding: '24px' }}>
          <Col span={20}>
            <Button
              type='primary'
              loading={exportLoding}
              onClick={() => { handleExport() }}
            >
              拼团明细导出
            </Button>
          </Col>
        </Row>

        <Table
          style={{ padding: '20px', background: '#fff' }}
          rowKey={record => record.id}
          dataSource={data}
          columns={columns}
          bordered
          scroll={{ x: 1600 }}
          pagination={{
            pageSize: page.size,
            total: total,
            current: page.page,
            onChange: onPageChange,
            // showSizeChanger: true,
            // onShowSizeChange: onShowSizeChange
          }}
        />
      </div>
    </>
  )
}
export default Form.create()(List)