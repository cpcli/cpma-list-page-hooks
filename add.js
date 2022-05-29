import React, { Component, Fragment } from "react";
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Col,
  Row,
  Table,
  message,
  Popover,
  InputNumber,
  Upload,
  Icon,
  List,
  Tooltip,
  Switch,
  Spin
} from "antd";
import CustomerBreadcrumb from "@/components/CustomerBreadcrumb";
import ActenterTabelModal from "./components/ActenterTabelModal";
import { actCreateApi, actEditApi, getDetailApi } from './api'
// import _ from 'lodash'
import send from "../../util/request";
import moment from "moment";
import "./add.less";

import { ROOTPATH } from "../../config/config";
const timeFormat = "YYYY-MM-DD HH:mm:ss";
// const { Option } = Select;
const { RangePicker } = DatePicker;
const { Option } = Select
const source = 1 // 来源1 cpmart

class add extends Component {
  constructor(props) {
    super(props);
    this.state = {
      company: {},
      GoodsList: [], //商品列表
      list: [], //页面显示的商品列表
      companyList: [], //公司
      // btnTime: true,
      detailShow: true,
      // timerId: "",
      visible: false,
      page: 0,
      pageSize: 10,
      total: 0,
      limit: 100,
      offset: 0,
      selectedRowKeys: [],
      selectedRows: [],
      selectedRowKeysRemove: [],
      selectedRowsRemove: [],
      // selectedRowProduct: [],
      // storeList: [],
      editSort: false,
      productId: '',
      // isFeiShou: true, // 费用预算是否显示
      // fetching: false,
      // allChecked: false,
      // indeterminate: false,
      // name: '',
      fileList: [],
      submitLoading: false,
      detailLoading: false,
      oldList: [],
      detail: {}
    };
    // this.refChild = React.createRef()
  }
  id = this.props.match.params.id;
  token = window.localStorage.getItem("token");
  getCompany = (callback) => {
    send({
      url: "basics/company",
      method: "POST",
      data: {},
    }).then((res) => {
      if (res.data && res.data.error === 200) {
        const { data: companyList } = res.data || {}
        this.setState({
          companyList
        }, () => {
          callback && callback()
        });
      }
    });
  };
  authCompanyId = window.localStorage.getItem('authCompanyId')
  initCompany = () => {
    let company = {}
    const target = this.state.companyList.find(item => 1 * item.company_id === 1 * this.authCompanyId * 1)
    console.log(target)
    if (target) {
      company = target
    }
    this.setState({
      company
    }, () => {
      console.log(this.state.company)
    })
  }
  async componentDidMount() {
    const { setFieldsValue } = this.props.form
    this.id = this.props.match.params.id
    // this.view = this.props.history.location.pathname === `/marketing/prizewheel/view/${this.id}`
    if (this.props.match.url.indexOf("view") !== -1) {
      this.setState({
        detailShow: false,
      });
    }
    if (!this.id) {
      // 添加
      this.getCompany(() => {
        this.initCompany()
        this.getGoods()
      })
    } else {
      // 编辑
      this.getCompany(() => {
        this.initCompany()
        this.getGoods()
        this.editInit()
      })
    }
  }
  editInit = async() => {
    const { setFieldsValue } = this.props.form
    const params = {
      act_id: this.id,
      company_id: this.authCompanyId,
      source
    }
    this.setState({
      detailLoading: true
    })
    const { data: detail, error, msg } = await getDetailApi(params)
    if (error !== 0) {
      return message.error(msg)
    }
    const { act_info, act_limit_list, act_rule_list, act_detail_list,product_list } = detail
    this.setState({
      detail
    }, () => {
      // 规则设置
      const formData = {
        title: act_info.title,
        desc: act_info.desc,
        time: [moment.unix(act_info.start_time), moment.unix(act_info.end_time)],
        auto_group: act_rule_list.auto_group_buy_rule.auto_group_buy_rule*1 ? true : false,//自动成团
        spell_group: act_rule_list.group_buy_number_rule.group_buy_people_number_rule,//拼团人数
        group_time: act_rule_list.group_buy_time_rule.group_buy_time_rule,//成团时间
        spell_num: act_limit_list.join_group_buy_limit.limit_value,
        coupons:act_limit_list.coupon_use_limit.limit_value*1 ? true : false ,
        open_num:act_limit_list.open_group_buy_limit.limit_value
      }
      console.log(formData)
      console.log([moment.unix(act_info.start_time), moment.unix(act_info.end_time)], 'moment.unix(act_info.start_time)')
      setFieldsValue(formData, () => {
        this.setState({
          detailLoading: false
        })
      })
      
      let detailList = []
      let oldList = []
      product_list.forEach((item, index) => {
        detailList.push({
          detail: act_detail_list[index],
          id: this.id,
          product_id: item.product_id,
          product_sn: item.product_sn,
          product_name: item.product_name,// 
          barcode: item.barcode,
          product_attr_name: item.name,
          product_attr_value: item.value,
          is_on_sale: item.is_on_sale,
          groupPrice: item?.detail_rule_list?.group_buy_price_rule?.group_buy_price ? (item.detail_rule_list?.group_buy_price_rule?.group_buy_price/100): '' ,
          limit_number: item?.detail_limit_list?.once_buy_limit?.once_buy_value,
          min_sale_count: item?.detail_limit_list?.lowest_buy_limit?.lowest_buy_value,
          sort: item.sort,
          uni_key: item.product_sn +'-'+ item.barcode +'-'+ item.value
        })
        oldList.push(item.product_id)
      })

      this.setState({
        list: [...detailList],
        oldList
      })
    })

  }
  getGoods = () => {
    const val = this.props.form.getFieldsValue();
    return send({
      url: "basics/get-by-company-id",
      method: "GET",
      params: {
        product_name: val.product_name ? val.product_name : "",
        product_sn: val.product_sn ? val.product_sn : "",
        company_id: window.localStorage.getItem("authCompanyId"),
        page_size: this.state.pageSize,
        page: this.state.page,
      },
    }).then((res) => {
      if (res.data && res.data.error === 0) {
        const { list, total } = res.data.data;
        this.setState({
          GoodsList: list.map(item => ({
            ...item,
            uni_key: item.product_sn + '-' + item.barcode + '-' + item.product_attr_value
          })),
          total: total,
        });
        return list;
      }
    });
  }

  handleClickSearch = () => {
    this.getGoods();
  };
  handleClickReset = (e) => {
    this.props.form.resetFields(['product_name', 'product_sn']);
    this.setState({
      pageSize: 10,
      page: 0,
      selectedRowKeys: [],
      selectedRows: []
    }, () => {
      this.getGoods()
    })
  }
  handleAddGoods = () => {
    this.setState({
      visible: true,
      selectedRowKeys: []
    }); //全部客户list
  };

  closeModal = () => {
    this.setState({
      visible: false,
      selectedRows: [],
      selectedRowKeys: [],

    });
  };
  handleSubmit = () => {
    const { selectedRows, list } = this.state
    let item, temp;
    for (let i = 0; i < list.length; i++) {
      item = list[i];
      for (let j = 0; j < selectedRows.length; j++) {
        temp = selectedRows[j]
        if (item.product_id === temp.product_id) {
          message.info("该商品已存在!");
          return;
        }
      }
    }
    let arr = selectedRows.map(item => {
      item.min_sale_count = 1
      return item
    })
    // list.unshift(...selectedRows)
    list.push(...arr)
    this.setState({
      visible: false,
      list,
      selectedRowKeys: []
    });

  };

  // 批量导入
  handleChangeUpload = (info) => {
    const { list } = this.state // 现存商品list
    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    if (info.file.status === "done") {
      fileList = fileList.map((file) => {
        if (file.response && file.response.error !== 200) {
          message.error(file.response.msg)
        } else {
          let productCover = file.response.data
          if (productCover.length <= 1000) {
            let transProductCover = productCover.map(item => ({
              product_id: item.product_id,
              product_sn: item.product_sn,
              product_name: item.product_name,
              barcode: item.barcode,
              product_attr_name: item.product_attr_name, // 规格
              product_attr_value: item.product_attr_value, // 单位
              is_on_sale: item.is_on_sale,
              sort: item.sort,
              err_msg: item.msg,
              groupPrice: item.group_buy_price,
              min_sale_count: item.min_sale_count,
              discount: item.discount,
              uni_key: item.uniq_key,
              limit_number: item.max_buy_number,
              min_sale_count: item.min_sale_count
            }))
            // 批量导入表格数据去重
            let resoucsData = [];
            for (let i = 0, len = transProductCover.length; i < len; i++) {
              let flag = true;
              for (let j = 0, jen = resoucsData.length; j < jen; j++) {
                if (transProductCover[i].uni_key === resoucsData[j].uni_key) {
                  resoucsData[j] = transProductCover[i]// ②	在导入商品时，若存在两个或者多个商品重复，则系统自动选取最后一行数据
                  flag = false;
                }
              }
              if (flag) {
                resoucsData.push(transProductCover[i]);
              }
            }

            // 与 table list 里的数据比较，若导入商品与列表商品重复，则覆盖，若是新增的，则追加
            let importedNewData = []
            let cache = new Map(list.map(item => ([item.uni_key, item])))
            for (let i = 0; i < resoucsData.length; i++) {
              let item = resoucsData[i]
              if (cache.has(item.uni_key)) {
                cache.set(item.uni_key, item) // 更新
                // let proId = cache.values().product_id
                // this.props.form.resetFields(['groupPrice'+proId, 'limit_number'+proId, 'min_sale_count'+proId]);
                // // console.log(cache.values(), '111')
              } else {
                importedNewData.push(item)
              }
            }
            
            // 结果拼接
            let resList = [...cache.values(), ...importedNewData]
            let newList = []
            resList.forEach(item=> {
              if (item.err_msg) {
                newList.unshift(item)
              } else {
                newList.push(item)
              }
            })
            this.setState({
              list: newList
            })


            // const list = resoucsData.map(item => ({ err_msg: '', ...item })).sort((a, b) => {
            //   const c = a?.err_msg?.length ? 1 : 0;
            //   const d = b?.err_msg?.length ? 1 : 0;
            //   return d - c;
            // });
          } else {
            message.error("单次导入数量不超过1000条!");
          }
        }
        return file;
      });
    }
    this.setState({ fileList });
  };
  // 移除文件
  handleRemoveUpload = (file) => {
    this.setState({
      fileList: [],
      selectedRowKeys: [],
    });
  };
  // 单个删除
  handleDetele = (index, obj) => {
    let { list } = this.state;
    // if (obj.detail) {
    //   delId.push (obj.product_id)
    // }
    list.splice(index, 1);
    this.setState({ list });
  };
  // 编辑排序
  toggleEdit = (record) => {
    const editSort = !this.state.editSort;
    this.setState({ editSort, productId: record.product_id }, () => {
      if (editSort) {
        this.input.focus();
      }
    });
  };
  // 拼团价,商品限购,起订量失去焦点
  editTable = (value, record, index, type) => {
    console.log(value)
    const { list } = this.state;
    if (type === 'sort') {
      list[index][type] = value.target.value
    } else {
      list[index][type] = value // form.getFieldValue(`${type}${record.product_id}`)
    }
    this.setState({
      list
    })

  }
  submit = async() => {
    // e.preventDefault();
    const { form } = this.props;
    const { list, detail, oldList } = this.state;
    form.validateFields(async(err, val) => {
      if (!err) {
        if (list.length === 0) {
          message.info("请添加商品!");
          return;
        }

        let flag;
        let flagNum;
        let flagPrice;
        let productId;
        let productlist = [];
        console.log(list)
        // return
        let newProductId = [];
         list.forEach(item => {
          productlist.push ({
            product_id: item.product_id,
            min_sale_count: item.min_sale_count*1 || 1,
            limit_number: item.limit_number*1 || 0,
            sort: item.sort || 0,
            groupPrice: item.groupPrice,
            detail: item.detail,
            msg: item.err_msg || ''
          })
          newProductId.push(item.product_id)
        })
        // return
        for (let i = 0; i < productlist.length; i++) {
          let item = productlist[i]
          if (item?.msg) {
            flag = true;
            break
          }
          if (!item.groupPrice) {
            flagPrice = true
            productId = item.product_id
            break
          }
          if (item.min_sale_count>=0 && item.limit_number !== null && item.limit_number !== 0  && (item.limit_number <item.min_sale_count)) {
            flagNum = true
            break
          } else if (item.min_sale_count!==0 && !item.min_sale_count) {
            flagNum = true
            break
          }
        }
        if (flag) {
          message.error("请先移除错误商品");
          return;
        }
        if (flagPrice) {
          message.error('商品ID为'+productId+"的商品拼团价格为空，请填写") 
          return;
        }
        if (flagNum) {
          message.error("商品限购数量必须大于等于商品起订量，请重新设置") 
          return;
        }
        // 2自动成团,3成团时间,4成团人数
        let rule = [],ruleKeys = { 2: 'auto_group', 3: 'group_time', 4: 'spell_group' }
        rule=[2,3,4].map(type => {
          // let value = ''
          let rule = {
            type,
            "supply": "",
            "desc": "",
            "ext": "",
          }
          rule.value = +val[ruleKeys[type]]+''
          if (type === 2) {
            if(this.id){
              rule.id=detail?.act_rule_list?.auto_group_buy_rule?.auto_group_buy_rule_id
            }
          } else if(type === 3) {
            if(this.id){
              rule.id=detail?.act_rule_list?.group_buy_time_rule?.group_buy_time_rule_id
            }
          }else if (type === 4) {
            if(this.id){
              rule.id=detail?.act_rule_list?.group_buy_number_rule?.group_buy_people_number_rule_id
            }
          }
          return rule
        })
        // 4 开团次数 5 开团人数 6优惠券
        let limit = [],limitKeys = {4: 'open_num', 5: 'spell_num', 6: 'coupons'}
        limit = [4,5,6].map(type => {
          let limit = {
            type,
            "supply": "",
            "desc": "",
            "ext": "",
          }
          limit.value = +val[limitKeys[type]]+ ''
          if (type === 4) {
            if(this.id){
            limit.id = detail?.act_limit_list?.open_group_buy_limit?.id
            }
          } else if (type === 5) {
            if(this.id){
              limit.id = detail?.act_limit_list?.join_group_buy_limit?.id
            }
          } else if (type === 6) {
            if(this.id){
              limit.id = detail?.act_limit_list?.coupon_use_limit?.id
            }
          }
          return limit
        })
        console.log(this.state.detail)
        if (Object.keys(this.state.detail).length > 0) {
          this.state.detail.act_detail_list.forEach((item, index) => {
            productlist.forEach(obj => {
              if (item.detail.value*1 === obj.product_id) {
                obj.detail = item
              }
            })
          })

        }
        console.log(productlist)
        // detail 组装
        let groupDetail = []
        groupDetail = productlist.map((item, index)=> {
          let limit = []
          let rule = [{
            "type":3,
            "value": item.groupPrice ? item.groupPrice * 100 + '' : '',
            "supply":"",
            "desc":"拼团价格，单位分",
            "ext":"",
          }] // 拼团价格
          if (this.id && item.detail) {
            rule[0].id = item?.detail?.detail_rule_list?.group_buy_price_rule?.detail_rule_id
          }
          limit.push(
            {
              "type": 3,
              "value": item.limit_number+'',
              "supply": "",
              "desc": "单次限购",
              "ext": "",
            },
            {
              "type": 5,
              "value": item.min_sale_count+'',
              "supply": "",
              "desc": "起订量",
              "ext": "",
            })
            if (this.id && typeof item.detail !== 'undefined') {
              limit[0].id = item?.detail?.detail_limit_list?.once_buy_limit?.detail_limit_id || ''
              limit[1].id = item?.detail?.detail_limit_list?.lowest_buy_limit?.detail_limit_id||''
            }
           //单次限购,起订量
          let detail = {
            type: 1,
            value:item.product_id+'',
            // id: item.detail?.detail.id || '',
            supply: '',
            desc: '',
            ext: '',
            sort: item.sort ? item.sort+ '' : '0'
          }
          if (typeof item.detail !== 'undefined') {
            detail.id= item.detail?.detail.id || ''
          }
          return {
            ...detail,
            rule,
            limit,
          }
        })
      const data = {
        "company_id": this.authCompanyId * 1 === 0 ? this.props.form.getFieldValue('company_id') : this.state.company.company_id,
        source, // 来源 1cpmart
        "platform": 1,  // 
        "pid": 0, // 父活动id 默认0 当前不用
        "title": val.title,
        start_time: val.time ?
          +val.time[0].format('X')
          : "",
        end_time: val.time ?
          +val.time[1].format('X')
          : "",
        "type": 15,//
        "status": 10, // 状态 0 拒绝 1 禁用 2 结束 10 待审核 20 审核通过
        "plan_cost": 0, //活动预算 单位 分 暂无
        "weight": 1, // 
        "desc": val.desc,// 描述
        "ext": "",
        remark: '', // 抽奖活动说明
        rule,
        limit,
        detail: groupDetail
      }
      let ids = []
      oldList.forEach(item => {
        if (!newProductId.includes(item)) {
          this.state.detail.act_detail_list.forEach((obj, index) => {
            if (obj.detail.value*1 === item) {
              ids.push(obj.detail.id)
            }
          })
        } 
      })
      if(ids.length) {
        data.del_ids = ids.join(',')
      }
      // return
      var msg, error
      this.setState({
        submitLoading: true
      })
      if (!this.id) {
        var { msg, error, } = await actCreateApi(data)
      } else {
        var { msg, error, } = await actEditApi({ ...data, id: +this.id })
      }
      if (error !== 0) {
        if(Array.isArray(msg)) {
          console.log(msg)
          let str = []
          str = msg.map(item=> {
            return item.goods_id
          })
          let newList = list.map(item => {
            msg.forEach(obj => {
              if (item.product_id === obj.goods_id){
                item.err_msg = obj.title
              }
            })
            return item
          })
          this.setState({
            list: newList
          }
          // ,()=>{
          //   console.log(this.state.list)
          //   return message.error(str.join(',') + '商品已经参加了拼团活动，请移除后再选择')
          // }
          )
        } else {
          return message.error(msg)
        }
      } else {
        message.success(
          msg,
          1.5,
          this.props.history.push('/marketing/groupBuy')
        );
      }
      this.setState({
        submitLoading: false
      })
      }
    });
  };
  reset = () => {
    this.props.history.push("/marketing/groupBuy");
  };
  // 移除
  batchRemove = () => {
    const { selectedRowKeysRemove, list } = this.state
    // let ids = selectedRowProduct.map(item=> {
    //   if (item.detail) {
    //     return item.product_id
    //   }
    // })
    // delId.push(...ids)
    this.setState({
      selectedRowKeysRemove: [],
      // selectedRowProduct:[],
      // delId,
      list: list.filter(item => !selectedRowKeysRemove.includes(item.uni_key))
    })
  }
  // 表格错误背景色
  setClassName = (record, index) => {
    let className = "red";
    return record?.err_msg ? className : "";
  };
  productColumns = [
    {
      title: "商品图片",
      align: "center",
      render: (text, record) => (
        <div style={{ height: 60, width: 60, margin: "0 auto" }}>
          <img
            alt=""
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
            src={text.product_thumb_img}
            onClick={() =>
              this.handleGoodsJump(
                "/goods/edit/" + record.product_id + "/detail/"
              )
            }
          />
        </div>
      ),
    },
    {
      title: "商品编码",
      dataIndex: "product_sn",
      align: "center",
    },
    {
      title: "商品名称",
      dataIndex: "product_name",
      align: "center",
      width: 150,
      onCell: () => {
        return {
          style: {
            maxWidth: 150,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            cursor: "pointer",
          },
        };
      },
      render: (text, record) => (
        <Popover content={text}>
          <a style={{ color: "rgba(0, 0, 0, 0.65)" }}>{text}</a>
        </Popover>
      ),
    },
    {
      title: "产品标准价",
      dataIndex: "price",
      align: "center",
    },
    {
      title: "输入码",
      align: "center",
      dataIndex: "barcode",
    },
    {
      title: "商品规格",
      align: "center",
      dataIndex: "product_attr_name",
    },
    {
      title: "商品单位",
      align: "center",
      dataIndex: "product_attr_value",
    },
    {
      title: "商品状态",
      align: "center",
      render: (text) => <span>{text.is_on_sale === 1 ? "上架" : "下架"}</span>,
    },
  ];
  columns = [
    {
      title: "商品ID",
      dataIndex: "product_id",
      align: "center",
    },
    {
      title: "商品编码",
      dataIndex: "product_sn",
      align: "center",
    },
    {
      title: "商品名称",
      dataIndex: "product_name",
      align: "center",
    },
    {
      title: "输入码",
      dataIndex: "barcode",
      align: "center",
    },
    {
      title: "商品规格",
      align: "center",
      dataIndex: "product_attr_name",
    },
    {
      title: "商品单位",
      align: "center",
      dataIndex: "product_attr_value",
    },
    {
      title: "商品状态",
      dataIndex: "is_on_sale",
      align: "center",
      render: (val) => {
        if (val === 1) {
          return "上架";
        } else if (val === 0) {
          return "下架";
        }
      },
    },
    {
      title: "拼团价",
      dataIndex: "groupPrice",
      align: "center",
      width: 120,
      render: (record, row, index) => {
        return <InputNumber
          value={+record === 0 ? 0 : record}
          placeholder="拼团价"
          min={0}
          style={{ width: "100px" }}
          disabled={!this.state.detailShow}
          onChange={(value) => this.editTable(value,row, index, 'groupPrice')}
        />
      },
    },
    {
      title: <span>
        商品限购&nbsp;
        <Tooltip title="客户每次购买拼团商品限购数量">
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>,
      align: "center",
      dataIndex: "limit_number",
      width: 120,
      render: (record, row, index) => {
        return <InputNumber
          value={+record === 0 ? 0 : record}
          min={0}
          // max={max}
          style={{ width: "100px" }}
          disabled={!this.state.detailShow}
          onChange={(value) => this.editTable(value, row, index, 'limit_number')}
        />
      },
    },
    {
      title: "商品起订量",
      align: "center",
      dataIndex: "min_sale_count",
      width: 120,
      render: (record, row, index) => {
        return <InputNumber
          value={record === 0 ? 0 : record}
          min={0}
          // max={max}
          style={{ width: "100px" }}
          disabled={!this.state.detailShow}
          onChange={(value) => this.editTable(value,row, index, 'min_sale_count')}
        />
      },
    },
    {
      title: "商品排序",
      dataIndex: "sort",
      align: "center",
      width: 120,
      render: (record, row, index) => {
        const { editSort, productId } = this.state
        if (editSort && productId === +row.product_id) {
          return  <InputNumber
            value={record === 0 ? 0 : record}
            min={0}
            max={999}
            style={{ width: "88px" }}
            ref={node => (this.input = node)}
            disabled={!this.state.detailShow}
            onBlur={(e) => this.editTable(e, row, index, 'sort')}
          />
        } else {
          return (
            <div
              className="editable-cell-value-wrap"
              style={{ paddingRight: 24 }}
              onClick={() => this.toggleEdit(row)}
            >
              {record ? record : 0}
            </div>
          )
        }
      },
    },
    {
      title: "操作",
      dataIndex: "options",
      align: "center",
      width: 100,
      render: (val, record, index) => (
        <Fragment>
          <a
            onClick={() => this.handleDetele(index, record)}
            disabled={!this.state.detailShow}
          >
            删除
          </a>
        </Fragment>
      ),
    },
    {
      title: "错误原因",
      key: "err_msg",
      dataIndex: "err_msg",
      align: "center",
      render: (text, record) => {
        return text ? text : '--'
      }
    },
  ];
  formList = [
    {
      field: "title",
      label: "拼团活动名称",
      rules: [{ required: true, message: "请输入拼团活动名称" }],
      Component: () => <Input placeholder="拼团活动名称" maxLength={8} disabled={!this.state.detailShow} />,
    },
    {
      field: "desc",
      label: "拼团活动描述",
      rules: [{ required: true, message: "请输入拼团活动描述" }],
      Component: () => (
        <Input placeholder="拼团活动描述" disabled={!this.state.detailShow} />
      ),
    },
    {
      field: "time",
      label: "活动时间",
      rules: [{ required: true, message: "请输入活动时间" }],
      Component: () => (
        <RangePicker
          disabled={!this.state.detailShow}
          format={timeFormat}
          showTime={true}
          style={{ width: "100%" }}
          allowClear={false}
        />
      ),
    },
    {
      field: "spell_group",
      label: "拼团人数",
      rules: [{ required: true, message: "请输入拼团人数" }],
      Component: () => (
          <InputNumber style={{ width: '150px' }} placeholder="拼团人数" min={2} max={100000} precision={0} disabled={!this.state.detailShow} />
      ),
      beforeLabel: <span>&nbsp;&nbsp;人</span>
    },
    {
      field: "group_time",
      label: "成团时间",
      rules: [{ required: true, message: "请输入成团时间" }],
      Component: () => (
          <InputNumber style={{ width: '150px' }} min={1} max={100000} precision={0} disabled={!this.state.detailShow} />
      ),
      beforeLabel: <span>&nbsp;&nbsp;小时</span>
    },
    {
      field: "open_num",
      label: "客户开团限制次数",
      rules: [{ required: true, message: "请输入客户开团限制次数" }],
      Component: () => (
        <InputNumber style={{ width: '150px' }} placeholder="0表示无限制" min={0} max={100000} precision={0} disabled={!this.state.detailShow} />
      ),
    },
    {
      field: "spell_num",
      label: "客户拼团限制次数",
      rules: [{ required: true, message: "请输入客户拼团限制次数" }],
      Component: () => (
        <InputNumber style={{ width: '150px' }} placeholder="0表示无限制" min={0} max={100000} precision={0} disabled={!this.state.detailShow} />
      ),
    },
    {
      field: "coupons",
      label: "是否可以使用优惠券",
      type: 'switch',
      rules: [{ required: true, message: "" }],
      Component: () => (
        <Switch checkedChildren="开" unCheckedChildren="关" />
      ),
    },
    {
      field: "auto_group",
      rules: [{ required: true, message: "" }],
      type: 'switch',
      label: <span>
        自动成团&nbsp;
        <Tooltip title={
          <span>开启自动成团后,拼团有效期人数内人数未满的团,系统将会模拟"匿名买家凑满人数使该团成团",你只需要对已付款参团的真实客户发货,建议合理开启</span>
        }>
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
      ,
      Component: () => (
        <Switch checkedChildren="开" unCheckedChildren="关" />
      ),
    },
    {
      field: "company",
      rules: [],
      label: '公司',
      Component: () => (
        this.state.company.company_id ? <span>{this.state.company.name}</span> : <Select
          disabled={this.view}
        >
          {
            this.state.companyList.map(item => (
              <Option value={item.company_id} key={item.company_id}>{item.name}</Option>
            ))
          }
        </Select>

      ),
    },
  ]
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { selectedRowKeys, selectedRowKeysRemove } = this.state;
    const formItemLayout = {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 14,
      },
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        let tmpSelectedRows = this.state.selectedRows
          .concat(selectedRows)
          .filter((item) => item !== undefined);
        let totalSelectedRows = selectedRowKeys.map(
          (key) => tmpSelectedRows.filter((item) => item.uni_key === key)[0]
        );
        this.setState({
          selectedRowKeys,
          selectedRows: totalSelectedRows
        });
      },
    };
    const rowSelectionRemove = {
      selectedRowKeys: selectedRowKeysRemove,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeysRemove: selectedRowKeys,
          // selectedRowProduct: selectedRows
        });
      },
    };
    const props = {
      name: "file",
      // action: `${ROOTPATH}import-data/get-insert-data-from-excel`,
      action: `${ROOTPATH}common/import-show?task_type=7`,
      headers: {
        token: this.token,
        appid: 1,
      },
      showUploadList: {
        showPreviewIcon: false,
        showRemoveIcon: false,
        showDownloadIcon: false,
      },
      onChange: this.handleChangeUpload,
      onRemove: this.handleRemoveUpload,
    };
    return (
      <Fragment>
        <CustomerBreadcrumb className="breadcrumb"></CustomerBreadcrumb>
        <Spin spinning={this.state.detailLoading} delay={500}>
        <div style={{ backgroundColor: "#fff", padding: '12px 24px' }}>
          <List>
            <List.Item style={{ color: '#001529', fontWeight: 'bold', marginBottom: '24px' }}>
              规则设置:
            </List.Item>
            <Form
              style={{ backgroundColor: "#fff", minHeight: "830px" }}
              {...formItemLayout}>
              {this.formList.map((form) => {
                return form.type === 'switch' ? (
                  <Form.Item label={form.label} key={form.field}>
                    {getFieldDecorator(form.field, {
                      rules: form.rules,
                      valuePropName: 'checked',
                      initialValue: false
                    })(form.Component(form))}
                  </Form.Item>
                ) : <Form.Item label={form.label} key={form.field}>
                  {getFieldDecorator(form.field, {
                    rules: form.rules
                  })(form.Component(form))}
                  {form.beforeLabel?form.beforeLabel: ''}
                </Form.Item>
              })}

              <Form.Item label="添加商品">
                <Row gutter={10}>
                  <Col >
                    <Button
                      disabled={(!getFieldValue("company")&& window.localStorage.getItem('authCompanyId')*1 ===0) || (getFieldValue("company")&&window.localStorage.getItem('authCompanyId')*1 !==0) || !this.state.detailShow}
                      onClick={this.handleAddGoods}
                    >
                      添加
                    </Button>
                    <ActenterTabelModal
                      visible={this.state.visible}
                      title="添加商品"
                      width={1000}
                      negative_button_text="取消"
                      positive_button_text="确定"
                      hideModal={this.closeModal}
                      handleSubmit={this.handleSubmit}
                    >
                      <Row>
                        <Col span={9}>
                          <Form.Item
                            label="商品名称"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 14 }}
                          >
                            {getFieldDecorator("product_name", {
                              initialValue: "",
                            })(<Input autoComplete="off" />)}
                          </Form.Item>
                        </Col>
                        <Col span={9}>
                          <Form.Item
                            label="商品编码"
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 14 }}
                          >
                            {getFieldDecorator("product_sn", {
                              initialValue: "",
                            })(<Input autoComplete="off" />)}
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item>
                            <Button type="primary" onClick={this.handleClickSearch}>
                              查询结果
                            </Button>
                            <Button
                              style={{ marginLeft: 8 }}
                              onClick={this.handleClickReset}
                            >
                              重置
                            </Button>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Table
                        rowKey={(record) => record.uni_key}
                        dataSource={this.state.GoodsList || []}
                        columns={this.productColumns}
                        style={{ margin: "32px 0" }}
                        bordered
                        scroll={{ x: 950 }}
                        rowSelection={{
                          ...rowSelection,
                        }}
                        pagination={{
                          pageSize: this.state.pageSize,
                          total: this.state.total,
                          current: this.state.page + 1,
                          showSizeChanger: true,
                          onShowSizeChange: (current, pageSize) => {
                            this.setState(
                              {
                                page: current - 1,
                                pageSize,
                              },
                              () => {
                                this.getGoods();
                              }
                            );
                          },
                          onChange: (currentPage, pageSize) => {
                            this.setState(
                              {
                                page: currentPage - 1,
                                pageSize,
                              },
                              () => {
                                this.getGoods();
                              }
                            );
                          },
                        }}
                      />
                    </ActenterTabelModal>
                  </Col>
                </Row>
              </Form.Item>
              <div style={{ marginLeft: '18%' }}>
                <Row gutter={12} style={{ marginBottom: 0 }}>
                  <Col span={10} style={{ paddingTop: '14px' }}>
                    <h3 style={{ marginBottom: "10px", fontWeight: "bold" }}>
                      1.将商品数据导入模板中，点击下载
                    </h3>
                  </Col>
                  <Col span={12}>
                    <Form.Item style={{ marginTop: 6, marginBottom: 0 }}>
                      <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => {
                          window.open(
                            `${ROOTPATH}export-task/download-temp?type=29`,
                            "_self"
                          );
                        }}
                        disabled={!this.state.detailShow}
                      >
                        商品导入模板
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
                <div style={{ margin: "16px 0" }}>注意事项：</div>
                <p>（1）模板中的表头不可更改，表头行不可增加 和 删除；</p>
                <p>（2）单次导入数量不超过1000条；</p>
                <p>
                  （3）商品编码,商品单位为必填，为空时数据将在列表中标红，请移除后再确定导入；
                </p>
                <Row gutter={12} style={{ marginTop: 0 }}>
                  <Col span={12}>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <h3 style={{ fontWeight: "bold" }}>
                        2.选择要导入的商品文件{" "}
                      </h3>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item style={{ marginBottom: 0 }}>
                      <Upload {...props} fileList={this.state.fileList}>
                        <Button type="primary"
                          disabled={!this.state.detailShow}
                        >
                          <Icon type="upload" /> 导入商品
                        </Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Row style={{ padding: '20px' }}>
                <Button type="primary" onClick={this.batchRemove} disabled={!this.state.detailShow || !this.state.selectedRowKeysRemove.length}>移除</Button>
              </Row>
              <Table
                rowKey={(record) => record.uni_key}
                dataSource={this.state.list || []}
                columns={this.columns}
                pagination={false}
                style={{ padding: "0 20px" }}
                bordered
                scroll={{ x: 1500, y: 600 }}
                rowClassName={this.setClassName}
                rowSelection={rowSelectionRemove}
              />

              {this.state.detailShow === true ? (
                <Form.Item wrapperCol={{ span: 24, offset: 6 }}>
                  <Button onClick={this.reset} style={{ marginRight: 20, marginTop: 20 }}>
                    取消
                  </Button>
                  <Button type="primary" onClick={this.submit}
                  loading={this.state.submitLoading}>
                    保存
                  </Button>
                </Form.Item>
              ) : (
                <Form.Item wrapperCol={{ span: 24, offset: 6 }}>
                  <Button onClick={this.reset} style={{ marginRight: 20 }}>
                    返回
                  </Button>
                </Form.Item>
              )}
            </Form>
          </List>
        </div>
        </Spin>
      </Fragment>
    )
  }
}
const myForm = Form.create()(add);
export default myForm;
