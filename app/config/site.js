const officialSiteUrl = 'https://yizuw.org'
const officialPhone = '18028231766'
const phoneCallPage = '/call'

export const siteConfig = Object.freeze({
  brand: Object.freeze({
    name: '瞰维智管',
    tagline: '给园区管理装上大脑和翅膀，少操心，赚更多。',
    headerTagline: '告别事务缠身，指尖掌控全局',
  }),
  company: Object.freeze({
    legalName: '东莞市宜租网络科技有限公司',
  }),
  contact: Object.freeze({
    phone: officialPhone,
    phoneHref: `tel:${officialPhone}`,
    callPage: phoneCallPage,
    callUrl: new URL(phoneCallPage, officialSiteUrl).toString(),
    phoneQr: '/assets/contact/kwzg-phone-call-qr.png',
    address: '广东省东莞市高埗镇北王路高埗段5号',
  }),
  wecom: Object.freeze({
    displayName: '瞰维智管官方客服',
    verification: '宜租网络',
    qrImage: '/assets/wecom-qrcode/kwzg-wecom-qr.png',
  }),
  qualification: Object.freeze({
    name: '科技型中小企业',
    company: '东莞市宜租网络科技有限公司',
    registrationNumber: '2026441901A0001155',
    authority: '广东省科学技术厅',
    registrationDate: '2026年8月11日',
    coverImage: '/assets/certifications/tech-sme-2026-cover.webp',
    detailImage: '/assets/certifications/tech-sme-2026-detail.webp',
    coverAlt: '东莞市宜租网络科技有限公司科技型中小企业资质牌匾实拍',
    detailAlt: '东莞市宜租网络科技有限公司科技型中小企业资质牌匾及证书实拍',
  }),
  siteUrl: officialSiteUrl,
  systemUrl: 'https://yz.furong.org',
})
