import {arrToMap} from '../../util/common'
import {orderStatusList} from '../../constant/index'
// export const statusList = [
//   {value:'',label:'全部'},
//   {value:1,label:'新建'},
//   {value:8,label:'待生效'},
//   {value:4,label:'禁用'},
//   {value:9,label:'运行中'},
//   {value:10,label:'已结束'},
// ]
export const statusList = [
  //  1 禁用 
  // 10 新建待审核 
  // 20 审核通过  [不需要管]
  // 30 待生效  
  // 40 运行中 
  // 50 已结束
  { value: 10, label: '新建' },
  { value: 40, label: '运行中' },
  { value: 1, label: '禁用' },
  { value: 30, label: '待生效' },
  { value: 50, label: '已结束' }
]
export const groupBuyStatusList = [
  { value: 30, label: '成功' },
  { value: 10, label: '失败' },
  { value: 20, label: '拼团中' },
]

export const statusListMap = arrToMap(statusList)
export const orderStatusMap = arrToMap(orderStatusList)
export const groupBuyStatusMap = arrToMap(groupBuyStatusList)
