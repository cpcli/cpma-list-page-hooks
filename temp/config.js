const NODE_ENV = process.env.PRODUCT_ENV;
const config = {
  development: {
    ROOTPATH: 'https://cpmart-market-dev.cpgroupcloud.com'
  },
  stg: {
    ROOTPATH: 'https://cpmart-market-dev.cpgroupcloud.com'
  },
  production: {
    ROOTPATH: 'https://cpmart-market-i.cpgroupcloud.com',
  },
}

export const domain = config[NODE_ENV].ROOTPATH
