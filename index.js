import React, { Component, useState, useEffect, useCallback } from 'react'
import { Form, Row, Col, Table, Button, Select, message, Divider, Input, Popconfirm } from 'antd'

import CustomerBreadcrumb from '../../components/CustomerBreadcrumb'
import { getListApi, emitApi, deleteApi, stopApi } from './api'
import { statusList } from './constant'
import './index.less'
import moment from 'moment'
const { Option } = Select
const opStyle = { color: '#1890ff', cursor: 'pointer', wordBreak: 'keep-all' }
const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const INITPAGE = {page: 1, size: 10}

const opTypeMap = {
  1: '发布',
  2: '删除',
  3: '查看详情',
  4: '编辑',
  5: '停用',
  6: '查看拼团明细',
}
//  1 禁用 
// 10 新建待审核 
// 30 待生效  
// 40 运行中 
// 50 已结束
const OpsMap = {
  1: [1, 3, 4, 6, 2],
  10: [1, 2, 3, 4],
  30: [3],
  40: [5, 3, 6],
  50: [3, 6, 2],
}

function Index(props) {
  const { getFieldDecorator, resetFields, getFieldsValue } = props.form
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(Object.create(INITPAGE))
  const [search, setSearch] = useState({})

  useEffect(() => {
    const getList = async () => {
      const values = getFieldsValue()
      const sendData = {
        source:1,
        type: 15,
        company_id: 1 * localStorage.getItem('authCompanyId'),
        page: page.page,
        page_size: page.size,
        title: values.title,
        status: values.status,
      }
      let res = await getListApi(sendData)
      if (res.error !== 0) return message.error(res.msg)
      setData(res.data.list)
      setTotal(res.data.total)
    }
    getList()
  }, [page, search])

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
  const onShowSizeChange = useCallback(
    (page, size) => { // current, pageSize
      setPage({ page, size })
    },
    [],
  )

  // 发布
  const emit = async (record) => {
    const data = {
      id: record.id
    }
    const { error, msg } = await emitApi(data)
    if (error === 0) {
      message.success(msg)
      setSearch({})
    } else {
      message.error(msg)
    }
  }

  // 删除
  const del = async (record) => {
    const data = {
      id: record.id
    }
    const { error, msg } = await deleteApi(data)
    if (error === 0) {
      message.success(msg)
      setPage(Object.create(INITPAGE))
    } else {
      message.error(msg)
    }
  }

  // 新增
  const add = () => {
    props.history.push('/marketing/groupbuy/add')
  }
  // 查看详情
  const detail = (record) => {
    props.history.push(`/marketing/groupbuy/view/${record.id}`)
  }
  // 编辑
  const edit = (record) => {
    props.history.push(`/marketing/groupbuy/edit/${record.id}`)
  }
  // 明细
  const groupBuyDetail = (record) => {
    props.history.push(`/marketing/groupbuy/detaillist/${record.id}`)
  }
  // 停用
  const stop = async (record) => {
    const data = {
      id: record.id
    }
    const { error, msg } = await stopApi(data)
    if (error === 0) {
      message.success(msg)
      setSearch({})
    } else {
      message.error(msg)
    }
  }
  const handleOp = (record, opKey) => {
    // const opTypeMap = {
    //   1: '发布',
    //   2: '删除',
    //   3: '查看详情',
    //   4: '编辑',
    //   5: '停用',
    //   6: '查看中奖明细',
    // }
    switch (opKey) {
      case 1:
        emit(record)
        break
      case 2:
        del(record)
        break
      case 3:
        detail(record)
        break
      case 4:
        edit(record)
        break
      case 5:
        stop(record)
        break
      case 6:
        groupBuyDetail(record)
        break
      default:
    }
  }

  const columns = [
    {
      title: '拼团ID',
      dataIndex: 'act_info.id',
      align: 'center',
    },
    {
      title: '拼团活动名称',
      dataIndex: 'act_info.title',
      align: 'center',
    },
    {
      title: '拼团活动描述',
      dataIndex: 'act_info.desc',
      align: 'center',
      render: (text, record) => {
        if (!text) {
          return '-'
        }
        return text
      }
    },
    {
      title: '状态',
      dataIndex: 'act_info.status',
      align: 'center',
      render: (text, record) => {
        const target = statusList.find(item => item.value === 1 * text)
        if (target) {
          return target.label
        }
        return '-'
      }
    },
    {
      title: '开始时间',
      dataIndex: 'act_info.start_time',
      align: 'center',
      render: (text, record) => {
        return moment.unix(text).format(dateFormat)
      }
    },
    {
      title: '结束时间',
      dataIndex: 'act_info.end_time',
      align: 'center',
      render: (text, record) => {
        return moment.unix(text).format(dateFormat)
      }
    },
    {
      title: '操作',
      dataIndex: 'op',
      align: 'center',
      width: 210,
      render: (text, record) => {
        //  1 禁用 
        // 10 新建待审核 
        // 30 待生效  
        // 40 运行中 
        // 50 已结束
        const popConfirmStatus = [1, 2, 5] // 发布 删除 停用 opTypeMap 1、2、5
        const popConfirmStatusText = { 1: '发布', 2: '删除', 5: '停用' } // 发布 删除 停用 opTypeMap 1、2、5
        const { status } = record.act_info
        if (!Object.keys(OpsMap).includes(status + '')) {
          return '-'
        }
        return OpsMap[status].map((key, index) => {
          let op = index === 0 ? null : <Divider type='vertical' />
          if (popConfirmStatus.includes(key)) {
            return <Popconfirm title={`确定${popConfirmStatusText[key]}吗？`} onConfirm={() => { handleOp(record.act_info, key) }} key={key}>
              <span style={opStyle} >{op}{opTypeMap[key]}</span>
            </Popconfirm>
          } else {
            return <span style={opStyle} onClick={() => { handleOp(record.act_info, key) }} key={key}>{op}{opTypeMap[key]}</span>
          }
        })
      }
    },
  ]

  return <>
    <CustomerBreadcrumb className="breadcrumb"></CustomerBreadcrumb>
    <Form style={{ backgroundColor: "#fff" }}  {...formItemLayout}>
      <Row style={{ padding: '24px 24px 0' }}>
        <Col span={8}>
          <Form.Item label='拼团活动名称'>
            {getFieldDecorator("title", {
              initialValue: ''
            })(
              <Input
                style={{ width: "90%" }}
                placeholder="请输入拼团活动名称"
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label='状态'>
            {getFieldDecorator("status", {
              initialValue: undefined
            })(
              <Select
                style={{ width: "90%" }}
                placeholder="请选择状态"
              >
                {statusList.map((item, index) => {
                  return (
                    <Option
                      value={item.value}
                      key={item.value}
                    >
                      {item.label}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col offset={16}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={submit}
            style={{ marginRight: 12, marginLeft: 90 }}
          >
            查询
          </Button>
          <Button onClick={reset} style={{ marginRight: 12 }}>
            重置
          </Button>
        </Col>
      </Row>
    </Form>
    <Row style={{ backgroundColor: '#fff', padding: '24px' }}>
      <Col span={20}>
        <Button
          type='primary'
          onClick={add}
        >
          添加
        </Button>
      </Col>
    </Row>
    <Table
      style={{ marginTop: '10px', backgroundColor: '#fff', padding: '24px' }}
      rowKey={(record) => record.act_info.id}
      bordered
      scroll={{ y: 800 }}
      dataSource={data}
      columns={columns}
      pagination={{
        pageSize: page.size,
        total: total,
        current: page.page,
        onChange: onPageChange,
        showSizeChanger: true,
        onShowSizeChange: onShowSizeChange
      }}
    />
  </>

}
export default Form.create()(Index)
