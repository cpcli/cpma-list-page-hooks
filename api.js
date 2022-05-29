import send from '../.././util/request'
import { toLineObj } from '../../util/convert'
import { guid } from '../../util/common'
import { domain } from './config'

import { statusList, typeList, prizeTypeList } from './constant'

export const getListApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/list`,
      method: "GET",
      params: toLineObj(params)
    }).then(res => {
      let { data: { data, error, msg } } = res
      resolve({ data, error, msg })
    })
  })
}
// 发布
export const emitApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/enable`,
      method: "POST",
      data: toLineObj(data)
    }).then(res => {
      const { data: { error, msg } } = res
      resolve({ error, msg })
    })
  })
}
// 停用
export const stopApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/disable`,
      method: "POST",
      data: toLineObj(data)
    }).then(res => {
      const { data: { error, msg } } = res
      resolve({ error, msg })
    })
  })
}
// 删除
export const deleteApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/del`,
      method: "POST",
      data: toLineObj(data)
    }).then(res => {
      const { data: { error, msg } } = res
      resolve({ error, msg })
    })
  })
}

// 拼团明细
export const getListDetailApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/group-buy-detail`,
      method: "POST",
      data: toLineObj(data)
    }).then(res => {
      let { data: { data: { groupbuy_list:list = [], total, act:act_info, groupbuy_statistics } = {}, error, msg } } = res
      if (error === 0) {
        resolve({list,act_info,groupbuy_statistics,error,msg})
      } else {
        resolve({ list,act_info,groupbuy_statistics, error,msg})
      }
    },(e)=>{})
  })
}
// 创建活动
export const actCreateApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/create`,
      method: "POST",
      data
    }).then(res => {
      const { data: { error, msg } } = res
      resolve({ error, msg })
    })
  })
}
// 编辑活动
export const actEditApi = (data = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act/modify`,
      method: "POST",
      data
    }).then(res => {
      const { data: { error, msg } } = res
      resolve({ error, msg })
    })
  })
}

// 获取活动详情
export const getDetailApi = (params = {}) => {
  return new Promise((resolve, reject) => {
    send({
      url: `${domain}/admin/act`,
      method: "GET",
      params: toLineObj(params)
    }).then(res => {
      let { data: { data, error, msg } } = res
      if (data === null) {
        data = {}
      }
      if (error === 0) {

        resolve({ data, error, msg })
      } else {
        resolve({ data, error, msg })
      }
    })
  })
}
